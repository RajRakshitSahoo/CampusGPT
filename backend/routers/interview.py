from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from models.db import get_db
from models.database import InterviewSession, Resume, User
from models.schemas import InterviewStartRequest, AnswerSubmit, SessionOut
from services.ai_service import generate_questions_for_interview, evaluate_answer, generate_final_report
from routers.auth import get_current_user

router = APIRouter(prefix="/interview", tags=["interview"])

MODE_QUESTION_COUNT = {"easy": 5, "hard": 20, "the_interview": 40}

@router.post("/start")
async def start_interview(
    req: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    count = MODE_QUESTION_COUNT.get(req.mode, 10)
    resume_data = None

    if req.resume_id:
        res = await db.execute(select(Resume).where(Resume.id == req.resume_id, Resume.user_id == current_user.id))
        resume = res.scalar_one_or_none()
        if resume:
            resume_data = resume.extracted_data

    questions = await generate_questions_for_interview(req.stream, req.mode, resume_data, count)

    session = InterviewSession(
        user_id=current_user.id,
        resume_id=req.resume_id,
        mode=req.mode,
        stream=req.stream,
        questions=questions,
        answers=[],
        scores=[],
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {
        "session_id": session.id,
        "mode": session.mode,
        "stream": session.stream,
        "questions": questions,
        "total_questions": len(questions),
    }

@router.post("/answer")
async def submit_answer(
    req: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == req.session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.completed:
        raise HTTPException(status_code=400, detail="Session already completed")

    questions = session.questions or []
    if req.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index")

    question_text = questions[req.question_index].get("question", "")
    evaluation = await evaluate_answer(question_text, req.answer, session.stream)

    answers = list(session.answers or [])
    scores = list(session.scores or [])

    answers.append({"index": req.question_index, "answer": req.answer, "time_taken": req.time_taken})
    scores.append({"index": req.question_index, **evaluation})

    session.answers = answers
    session.scores = scores
    await db.commit()

    return {"evaluation": evaluation, "question_index": req.question_index}

@router.post("/complete/{session_id}")
async def complete_interview(
    session_id: int,
    tab_switches: int = 0,
    focus_score: float = 100.0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    report = await generate_final_report({
        "mode": session.mode,
        "stream": session.stream,
        "scores": session.scores,
    })

    session.technical_score = report["technical_score"]
    session.communication_score = report["communication_score"]
    session.confidence_score = report["confidence_score"]
    session.focus_score = focus_score
    session.tab_switches = tab_switches
    session.placement_readiness = report["placement_readiness"]
    session.final_result = report["final_result"]
    session.recruiter_comments = report["recruiter_comments"]
    session.completed = True

    await db.commit()
    await db.refresh(session)
    return {
        "session_id": session.id,
        "report": report,
        "focus_score": focus_score,
        "tab_switches": tab_switches,
        "questions": session.questions,
        "answers": session.answers,
        "scores": session.scores,
    }

@router.get("/sessions/history", response_model=list[SessionOut])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id, InterviewSession.completed == True)
        .order_by(InterviewSession.created_at.desc())
        .limit(20)
    )
    return res.scalars().all()

@router.get("/session/{session_id}")
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": session.id, "mode": session.mode, "stream": session.stream,
        "questions": session.questions, "answers": session.answers,
        "scores": session.scores, "technical_score": session.technical_score,
        "communication_score": session.communication_score,
        "confidence_score": session.confidence_score,
        "focus_score": session.focus_score, "tab_switches": session.tab_switches,
        "placement_readiness": session.placement_readiness,
        "final_result": session.final_result,
        "recruiter_comments": session.recruiter_comments,
        "completed": session.completed, "created_at": str(session.created_at),
    }
