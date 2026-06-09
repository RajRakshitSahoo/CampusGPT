from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Resume
class ResumeOut(BaseModel):
    id: int
    filename: str
    resume_score: float
    ats_score: float
    branch: Optional[str]
    skills: Optional[List[str]]
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    suggestions: Optional[List[str]]
    extracted_data: Optional[Dict[str, Any]]
    uploaded_at: datetime
    class Config:
        from_attributes = True

# Interview
class InterviewStartRequest(BaseModel):
    mode: str  # easy, hard, the_interview
    stream: str
    resume_id: Optional[int] = None

class AnswerSubmit(BaseModel):
    session_id: int
    question_index: int
    answer: str
    time_taken: Optional[float] = None

class SessionOut(BaseModel):
    id: int
    mode: str
    stream: str
    technical_score: float
    communication_score: float
    confidence_score: float
    focus_score: float
    tab_switches: int
    placement_readiness: Optional[str]
    final_result: Optional[str]
    recruiter_comments: Optional[str]
    completed: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Question Vault
class QuestionVaultRequest(BaseModel):
    stream: str
    categories: Optional[List[str]] = None
    count: Optional[int] = 50
