from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import aiofiles
from pathlib import Path

from models.db import get_db
from models.database import Resume, User
from models.schemas import ResumeOut
from services.resume_parser import parse_resume
from routers.auth import get_current_user
from config import settings

router = APIRouter(prefix="/resume", tags=["resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}

@router.post("/upload", response_model=ResumeOut)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    # Create upload directory
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    
    # Save file
    file_path = upload_dir / f"user_{current_user.id}_{file.filename}"
    content = await file.read()
    async with aiofiles.open(str(file_path), 'wb') as f:
        await f.write(content)
    
    # Parse resume
    parsed = parse_resume(str(file_path))
    
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(file_path),
        extracted_data=parsed,
        resume_score=parsed.get("resume_score", 0),
        ats_score=parsed.get("ats_score", 0),
        branch=parsed.get("branch", ""),
        skills=parsed.get("skills", []),
        strengths=parsed.get("strengths", []),
        weaknesses=parsed.get("weaknesses", []),
        suggestions=parsed.get("suggestions", []),
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume

@router.get("/my-resumes", response_model=list[ResumeOut])
async def get_my_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc())
    )
    return result.scalars().all()

@router.get("/{resume_id}", response_model=ResumeOut)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
