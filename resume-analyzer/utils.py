import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import resend

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
resend.api_key = os.getenv("RESEND_API_KEY")

def create_verification_token(email: str):
    # This creates a token that expires in 24 hours
    expiration = datetime.utcnow() + timedelta(hours=24)
    payload = {"sub": email, "exp": expiration}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def send_verification_email(receiver_email: str, token: str):
    magic_link = f"https://prep-hire-pink.vercel.app/verify-email?token={token}"
    
    # Resend requires a 'from' address. On the free tier, they provide a testing domain.
    # Note: On the free tier, you can only send emails to the email address you signed up to Resend with!
    try:
        params = {
            "from": "onboarding@resend.dev",
            "to": receiver_email,
            "subject": "Verify your PrepHire Account",
            "html": f"<h3>Welcome to PrepHire!</h3><p>Click <a href='{magic_link}'>here</a> to verify your account.</p>"
        }
        
        email_response = resend.Emails.send(params)
        print(f"✅ Email successfully sent via Resend API: {email_response}")
        
    except Exception as e:
        print(f"❌ Error sending email via Resend: {e}")