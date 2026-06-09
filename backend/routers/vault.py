from fastapi import APIRouter, Depends
from models.schemas import QuestionVaultRequest
from services.ai_service import get_question_vault
from routers.auth import get_current_user
from models.database import User

router = APIRouter(prefix="/vault", tags=["vault"])

@router.post("/questions")
async def get_questions(
    req: QuestionVaultRequest,
    current_user: User = Depends(get_current_user)
):
    questions = await get_question_vault(req.stream, req.categories, req.count or 50)
    return {"questions": questions, "total": len(questions), "stream": req.stream}

@router.get("/streams")
async def get_streams():
    return {"streams": [
        "Computer Science Engineering", "Information Technology",
        "Artificial Intelligence & Machine Learning", "Data Science",
        "Electronics & Communication Engineering", "Electrical Engineering",
        "Mechanical Engineering", "Civil Engineering", "Chemical Engineering",
        "Aerospace Engineering", "Biotechnology", "BCA", "MCA",
        "BBA", "MBA", "Commerce", "Law", "Medical", "Nursing",
        "Pharmacy", "Diploma Courses",
    ]}
