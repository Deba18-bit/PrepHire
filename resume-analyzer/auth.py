import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import bcrypt  # Direct import
from fastapi import HTTPException, Security, status, Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel

from database import get_db
from models import User

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
router = APIRouter()

def hash_password(password: str):
    # Hash using bcrypt directly (utf-8 encoded, truncated to 72 bytes safely)
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password, hashed_password):
    pwd_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(token: str = Security(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    
    email = payload.get("sub") or payload.get("email")
    user_id = payload.get("user_id")
    
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    elif email:
        user = db.query(User).filter(User.email == email).first()
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Google OAuth Route ---
class GoogleAuthRequest(BaseModel):
    credential: str

@router.post("/auth/google")
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    
    try:
        id_info = id_token.verify_oauth2_token(data.credential, requests.Request(), client_id)
        
        email = id_info.get("email")
        name = id_info.get("name", "Google User")
        
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token: missing email")
            
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            user = User(
                full_name=name,
                email=email,
                hashed_password="OAUTH_USER_NO_PASSWORD",
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.is_verified:
            user.is_verified = True
            db.commit()

        access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "full_name": user.full_name,
            "plan": getattr(user, "plan", "free")
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential token"
        )