from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import asyncio

from models.db import init_db
from routers import auth, resume, interview, vault, tts

app = FastAPI(
    title="CampusGPT API",
    description="AI-Powered Career & Interview Coaching Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(vault.router)
app.include_router(tts.router)

# Serve uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    await init_db()
    print("✅ CampusGPT API started - Database initialized")

@app.get("/")
async def root():
    return {"message": "CampusGPT API is running 🚀", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
