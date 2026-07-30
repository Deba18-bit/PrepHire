from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import os

# Import your existing database setup & helper models
from database import get_db
from models import User
from auth import create_access_token # Ensure this points to your JWT helper function

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    credential: str

@router.post("/auth/google")
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    
    try:
        # 1. Verify token with Google's servers
        id_info = id_token.verify_oauth2_token(data.credential, requests.Request(), client_id)
        
        email = id_info.get("email")
        name = id_info.get("name", "Google User")
        
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token: missing email")
            
        # 2. Check if user already exists in database
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # 3. Create a brand new verified user automatically!
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
            # Auto-verify them if they were unverified
            user.is_verified = True
            db.commit()

        # 4. Generate your app's JWT access token
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