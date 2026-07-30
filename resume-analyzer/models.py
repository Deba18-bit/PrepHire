from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    plan = Column(String, default="free")
    scan_count = Column(Integer, default=0)
    interview_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    is_verified = Column(Boolean, default=False)


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String)
    target_role = Column(String)
    overall_score = Column(Integer)
    grade = Column(String)
    full_analysis = Column(JSON)
    created_at = Column(DateTime, default=func.now())

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    target_role = Column(String)
    experience_level = Column(String)
    interview_focus = Column(String)
    chat_history = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="in_progress")
    score = Column(Integer, nullable=True)
    grade = Column(String, nullable=True)
    report_data = Column(JSON, nullable=True) # Stores the full pillar breakdown
    created_at = Column(DateTime, default=datetime.datetime.utcnow)