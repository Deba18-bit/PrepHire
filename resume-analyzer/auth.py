from fastapi import FastAPI, UploadFile, HTTPException, Depends, status, Request
import requests
from email_validator import validate_email, EmailNotValidError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db, engine
from models import ResumeAnalysis, User, Base
from schemas import UserSignup, UserLogin, TokenResponse
from pdf_extractor import extract_text_from_pdf
from ai_analyzer import analyze_resume
import jwt
import os
from utils import create_verification_token, send_verification_email
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import BackgroundTasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PrepHire API")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 🚨 THE CORS FIX 🚨
# Explicitly listing your allowed domains so allow_credentials=True doesn't crash the browser
origins = [
    "https://prep-hire-pink.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ─── Sign Up ───
@app.post("/signup")
@limiter.limit("3/minute")
def signup(request: Request, data: UserSignup, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Strict Email Validation
    try:
        valid = validate_email(data.email, check_deliverability=True)
        data.email = valid.normalized
    except EmailNotValidError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Database Check
    existing = db.query(User).filter(User.email == data.email).first()
    
    if existing:
        if existing.is_verified:
            # If they are fully verified, block them.
            raise HTTPException(status_code=400, detail="Email already registered. Please log in.")
        else:
            # If they exist but ARE NOT verified, they probably lost their link or it expired.
            # We overwrite their old password with the new one they just typed, and send a new link!
            existing.hashed_password = hash_password(data.password)
            existing.full_name = data.full_name
            db.commit()

            token = create_verification_token(existing.email)
            background_tasks.add_task(send_verification_email, existing.email, token)
            return {"message": "New verification link sent! Check your email.", "user_id": existing.id}

    # 3. Create Brand New User
    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_verification_token(user.email)
    background_tasks.add_task(send_verification_email, user.email, token)
    
    return {"message": "Account created. Check your email to verify.", "user_id": user.id}

@app.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        # 1. Decode the token using your secret key
        secret = os.getenv("JWT_SECRET_KEY")
        
        # If the token was tampered with, or expired, this line will throw an error
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        
        # Grab the email we stored inside the token payload
        email = payload.get("sub")
        
        # 2. Look up the user in the database
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        if user.is_verified:
            # Idempotency: If they click the link twice, just tell them they are already verified
            return {"message": "Email is already verified!"}
            
        # 3. Upgrade their account status!
        user.is_verified = True
        db.commit()
        
        return {"message": "Email successfully verified. You can now log in."}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="This magic link has expired. Please request a new one.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid magic link.")

# ─── Login ───
@app.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    # 1. Check if the email exists first
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account does not exist. Please sign up.")
        
    # 2. Check if the password matches
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password. Please try again.")
        
    # 3. THE BOUNCER CHECK
    if not user.is_verified:
        raise HTTPException(
            status_code=403, 
            detail="Account does not exist. Please sign up."
        )
        
    # 4. Check if the account is banned
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account banned.")

    # 5. Generate Token and let them in!
    token = create_access_token({"user_id": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        full_name=user.full_name,
        plan=user.plan
    )
    
# ─── Get current user profile ───
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "plan": current_user.plan,
        "scan_count": current_user.scan_count,
        "is_admin": current_user.is_admin
    }

# ─── Upload Resume — protected ───
@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile,
    target_role: str = "Software Engineer",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_active:
        raise HTTPException(403, "Account banned")

    # Scan limit check
    if current_user.plan == "free" and current_user.scan_count >= 3:
        raise HTTPException(
            403,
            "Free plan limit reached. Upgrade to continue."
        )

    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files allowed")

    contents = await file.read()
    extracted_text = extract_text_from_pdf(contents)
    analysis = analyze_resume(extracted_text, target_role)

    # Save to database
    db_analysis = ResumeAnalysis(
        user_id=current_user.id,
        filename=file.filename,
        target_role=target_role,
        overall_score=analysis["overall_score"],
        grade=analysis["grade"],
        full_analysis=analysis
    )
    db.add(db_analysis)

    # Increment scan count
    current_user.scan_count += 1
    db.commit()
    db.refresh(db_analysis)

    analysis["id"] = db_analysis.id
    analysis["saved_at"] = str(db_analysis.created_at)
    return analysis

# ─── Get user's past analyses ───
@app.get("/my-analyses")
def get_my_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.user_id == current_user.id
    ).all()
    return analyses

@app.put("/admin/change-plan/{user_id}")
def change_plan(
    user_id: int,
    plan: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin only")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    
    if plan not in ["free", "pro", "max"]:
        raise HTTPException(400, "Plan must be free, pro or max")
    
    user.plan = plan
    user.scan_count = 0
    db.commit()
    
    return {
        "message": f"User {user_id} switched to {plan} plan",
        "user_id": user_id,
        "new_plan": plan
    }

# ─── Admin — get all users ───
@app.get("/admin/users")
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin access required")
    return db.query(User).all()

# ─── Admin — ban user ───
@app.put("/admin/ban/{user_id}")
def ban_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin access required")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = False
    db.commit()
    return {"message": f"User {user_id} banned"}

# ─── Admin — all analyses ───
@app.get("/admin/analyses")
def get_all_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin access required")
    return db.query(ResumeAnalysis).all()