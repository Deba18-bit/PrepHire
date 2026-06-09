from pydantic import BaseModel

class ResumeData(BaseModel):
    candidate_name: str
    target_role: str
    email: str
    years_experience: int