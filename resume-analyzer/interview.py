from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import InterviewSession, User
from auth import get_current_user
from google import genai
from google.genai import types
import os
import uuid
import traceback
from dotenv import load_dotenv
import json
from pydantic import BaseModel
from typing import List

# Force load environment variables
load_dotenv()

# Initialize your router and Gemini client
router = APIRouter()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# ─── Pydantic Models for Validation and Structured Output ───
class ReplyRequest(BaseModel):
    session_id: str
    answer_text: str

class PillarResult(BaseModel):
    name: str
    score: int
    max_score: int
    comment: str

class InterviewEvaluation(BaseModel):
    score: int
    grade: str
    top_priority_fix: str
    pillars: List[PillarResult]


# ─── 1. Start the Interview Session ───
@router.post("/interview/start")
async def start_interview(
    target_role: str = Form(...),
    experience_level: str = Form(...),
    interview_focus: str = Form(...),
    resume_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # ─── CHECK SUBSCRIPTION LIMITS ───
        past_interviews_count = db.query(InterviewSession).filter(
            InterviewSession.user_id == current_user.id
        ).count()

        user_plan = getattr(current_user, 'plan', 'free').lower()

        if user_plan == 'free' and past_interviews_count >= 2:
            raise HTTPException(
                status_code=403, 
                detail="Free plan limit reached (2 mock interviews). Please upgrade to Pro or Max to continue practicing."
            )
        
        if user_plan == 'pro' and past_interviews_count >= 15:
            raise HTTPException(
                status_code=403, 
                detail="Pro plan limit reached (15 mock interviews). Please upgrade to Max for unlimited practice."
            )

        # Handle Optional Resume Parsing
        resume_context = ""
        if resume_file:
            resume_context = f"\n\nHere is the candidate's resume for context. Tailor your questions to their past projects and experience if relevant."

        system_instruction = f"""You are a strict, professional Senior Engineering Manager at a top-tier tech company. 
        You are conducting a {interview_focus} interview for a {experience_level} {target_role} position.
        
        CRITICAL RULES:
        1. You must act like a real human interviewer. Do not act like an AI assistant.
        2. Ask EXACTLY ONE question at a time. Never give a list of questions.
        3. Wait for the candidate's response before moving on.
        4. If their answer is vague, ask a probing follow-up question. 
        5. Start the interview immediately by introducing yourself briefly and asking the very first question.
        6. This interview must consist of roughly 10 to 12 questions total, moving logically from project deep-dives.
        7. On your 12th and final question, conclude the interview naturally and include the exact text [INTERVIEW_COMPLETE] at the very end of your response.
        {resume_context}"""
    
        chat = client.chats.create(
            model="gemini-3.1-flash-lite",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7, 
            )
        )

        response = chat.send_message("The candidate has entered the room. Start the interview.")

        session_id = str(uuid.uuid4())
        
        initial_history = [
            {"role": "model", "parts": [{"text": response.text}]}
        ]

        new_session = InterviewSession(
            id=session_id,
            user_id=current_user.id,
            target_role=target_role,
            experience_level=experience_level,
            interview_focus=interview_focus,
            chat_history=initial_history
        )
        db.add(new_session)
        db.commit()

        return {
            "session_id": session_id,
            "ai_message": response.text,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        print("\n❌ ❌ ❌ INTERVIEW START ERROR ❌ ❌ ❌")
        traceback.print_exc()
        print("------------------------------------------\n")
        raise HTTPException(status_code=500, detail=str(e))


# ─── 2. Handle the Back-and-Forth Conversation ───
@router.post("/interview/reply")
async def reply_interview(
    data: ReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session = db.query(InterviewSession).filter(
            InterviewSession.id == data.session_id,
            InterviewSession.user_id == current_user.id
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found.")
        
        ai_message_count = sum(1 for msg in session.chat_history if msg["role"] == "model")

        if ai_message_count >= 12:
            completion_msg = "Thank you for your time today. We have covered all the core areas for this evaluation. We will review your performance and get back to you shortly. [INTERVIEW_COMPLETE]"
            
            updated_history = session.chat_history.copy()
            updated_history.append({"role": "user", "parts": [{"text": data.answer_text}]})
            updated_history.append({"role": "model", "parts": [{"text": completion_msg}]})
            session.chat_history = updated_history
            db.commit()

            return {
                "ai_message": completion_msg,
                "status": "success"
            }

        formatted_history = []
        for msg in session.chat_history:
            formatted_history.append(
                types.Content(role=msg["role"], parts=[types.Part.from_text(text=msg["parts"][0]["text"])])
            )

        system_instruction = f"""You are a strict, professional Senior Engineering Manager at a top-tier tech company. 
        You are conducting a {session.interview_focus} interview for a {session.experience_level} {session.target_role} position.
        Ask EXACTLY ONE question at a time. Wait for the candidate's response. Do not break character."""

        chat = client.chats.create(
            model="gemini-3.1-flash-lite",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        chat._history = formatted_history 

        response = chat.send_message(data.answer_text)

        updated_history = session.chat_history.copy()
        updated_history.append({"role": "user", "parts": [{"text": data.answer_text}]})
        updated_history.append({"role": "model", "parts": [{"text": response.text}]})
        
        session.chat_history = updated_history
        db.commit()

        return {
            "ai_message": response.text,
            "status": "success"
        }

    except Exception as e:
        print("\n❌ ❌ ❌ INTERVIEW REPLY ERROR ❌ ❌ ❌")
        traceback.print_exc()
        print("------------------------------------------\n")
        raise HTTPException(status_code=500, detail=str(e))


# ─── 3. Get History for Dashboard ───
@router.get("/interviews/history")
async def get_interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    history = []
    for s in sessions:
        history.append({
            "id": s.id,
            "target_role": s.target_role,
            "interview_focus": s.interview_focus,
            "date": s.created_at.strftime("%d %b %Y"),
            "score": s.score or 0,
            "grade": s.grade or "N/A"
        })

    return {"interviews": history}


# ─── 4. Generate or Fetch Detailed Report ───
@router.get("/interviews/report/{session_id}")
async def get_interview_report(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview not found")

    if session.report_data:
        report = session.report_data
        report["target_role"] = session.target_role
        report["interview_focus"] = session.interview_focus
        report["experience_level"] = session.experience_level
        return report

    transcript = ""
    for msg in session.chat_history:
        role_label = "Interviewer" if msg["role"] == "model" else "Candidate"
        text = msg["parts"][0]["text"]
        transcript += f"{role_label}: {text}\n\n"

    system_prompt = f"""
    You are an extremely strict, bar-raising Principal Engineer and Hiring Manager evaluating an interview transcript.
    Review the following chat history for a {session.experience_level} {session.target_role} position.
    
    CRITICAL GRADING RULES:
    1. ZERO TOLERANCE FOR FLUFF: If the candidate gives vague, short, or non-technical answers, you MUST fail them severely (Score: 10-35).
    2. DO NOT GIVE THE BENEFIT OF THE DOUBT. If they didn't explicitly say it, they don't know it.
    3. Evaluate on a strict scale of 0 to 100.
    4. Assign a strict letter grade (A+, A, B+, B, C, D, F). An 'F' is anything below 20.
    
    REQUIRED OUTPUT:
    - score: integer
    - grade: string
    - top_priority_fix: A single, punchy, actionable sentence on what they must fix immediately.
    - key_strengths: An array of 2-3 specific things they did well (If none, state "None demonstrated").
    - key_weaknesses: An array of 2-3 specific critical failures.
    - pillars: Break the evaluation down into 3-4 specific pillars (e.g., 'Technical Depth', 'Communication', 'Problem Solving'). Give each a score, max_score (usually 25), and a harsh constructive comment.
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=transcript,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=InterviewEvaluation,
                temperature=0.2,
            ),
        )

        evaluation = json.loads(response.text)

        session.score = evaluation["score"]
        session.grade = evaluation["grade"]
        session.report_data = evaluation
        db.commit()

        evaluation["target_role"] = session.target_role
        evaluation["interview_focus"] = session.interview_focus
        evaluation["experience_level"] = session.experience_level

        return evaluation

    except Exception as e:
        print("Evaluation Generation Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to generate evaluation report.")