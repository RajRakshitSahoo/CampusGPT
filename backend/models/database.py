from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    resumes = relationship("Resume", back_populates="user")
    sessions = relationship("InterviewSession", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_path = Column(String)
    extracted_data = Column(JSON)
    resume_score = Column(Float, default=0)
    ats_score = Column(Float, default=0)
    branch = Column(String)
    skills = Column(JSON)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    suggestions = Column(JSON)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="resumes")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    mode = Column(String)  # easy, hard, the_interview
    stream = Column(String)
    questions = Column(JSON)
    answers = Column(JSON)
    scores = Column(JSON)
    technical_score = Column(Float, default=0)
    communication_score = Column(Float, default=0)
    confidence_score = Column(Float, default=0)
    focus_score = Column(Float, default=0)
    tab_switches = Column(Integer, default=0)
    placement_readiness = Column(String)
    recruiter_comments = Column(Text)
    final_result = Column(String)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="sessions")

class QuestionVault(Base):
    __tablename__ = "question_vault"
    id = Column(Integer, primary_key=True, index=True)
    stream = Column(String)
    category = Column(String)
    question = Column(Text)
    difficulty = Column(String)
    tags = Column(JSON)
