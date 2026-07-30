import os
import smtplib
import jwt
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def create_verification_token(email: str):
    # This creates a token that expires in 24 hours
    expiration = datetime.utcnow() + timedelta(hours=24)
    payload = {"sub": email, "exp": expiration}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def send_verification_email(receiver_email: str, token: str):
    # This is the link the user will click. It goes to your React app.
    magic_link = f"https://prep-hire-pink.vercel.app/verify-email?token={token}"
    
    # Print the link loudly to the Render console
    print("\n" + "="*60)
    print(f"🚨 NEW SIGNUP: {receiver_email} 🚨")
    print(f"🔗 CLICK TO VERIFY: {magic_link}")
    print("="*60 + "\n")

    # --- COMMENTED OUT TO PREVENT RENDER FIREWALL CRASH ---
    # msg = MIMEText(f"Welcome to PrepHire! Click here to verify your account: {magic_link}")
    # msg['Subject'] = 'Verify your PrepHire Account'
    # msg['From'] = SMTP_EMAIL
    # msg['To'] = receiver_email
    #
    # try:
    #     # Connect to Gmail and send!
    #     server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    #     server.login(SMTP_EMAIL, SMTP_PASSWORD)
    #     server.send_message(msg)
    #     server.quit()
    #     print("✅ Email sent successfully!")
    # except Exception as e:
    #     print(f"❌ Error sending email: {e}")