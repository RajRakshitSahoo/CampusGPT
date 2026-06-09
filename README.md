# 🚀 CampusGPT — AI Career & Interview Coach

A full-stack, AI-powered career preparation platform for students across all academic streams.

---

## ✅ Quick Start (Windows + VS Code)

### Prerequisites
| Tool | Min Version | Download |
|------|-------------|----------|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Git (optional) | any | https://git-scm.com |

### One-Click Setup

**Step 1:** Double-click `SETUP.bat` — installs all Python and Node dependencies.

**Step 2:** Double-click `START.bat` — launches both backend and frontend.

**Step 3:** Browser opens at `http://localhost:5173` — register and start!

---

## 🗂️ Project Structure

```
CampusGPT/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # App entry point
│   ├── config.py               # Settings & env config
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables
│   ├── models/
│   │   ├── database.py         # SQLAlchemy ORM models
│   │   ├── db.py               # DB connection & session
│   │   └── schemas.py          # Pydantic request/response schemas
│   ├── routers/
│   │   ├── auth.py             # Register / Login / JWT
│   │   ├── resume.py           # Upload & analyze resume
│   │   ├── interview.py        # Interview sessions & answers
│   │   ├── vault.py            # Question vault
│   │   └── tts.py              # Text-to-speech
│   ├── services/
│   │   ├── resume_parser.py    # PDF/DOCX parser, scoring
│   │   └── ai_service.py       # Question generation, evaluation
│   └── utils/
│       └── auth.py             # JWT & password hashing
│
├── frontend/                   # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── App.jsx             # Routes & layout
│   │   ├── main.jsx            # Entry point
│   │   ├── api.js              # Axios API client
│   │   ├── store.js            # Zustand global state
│   │   ├── index.css           # Global cyberpunk styles
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Layout wrapper
│   │   │   └── dashboard/      # ScoreRing component
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   ├── TrainingPage.jsx
│   │   │   ├── VaultPage.jsx
│   │   │   ├── InterviewSelectionPage.jsx
│   │   │   ├── InterviewSessionPage.jsx
│   │   │   ├── InterviewReportPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── RoadmapPage.jsx
│   │   └── hooks/
│   │       ├── useSpeech.js    # TTS + STT hooks
│   │       └── useWebcam.js    # Webcam + tab-focus hooks
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── SETUP.bat                   # One-click installer
├── START.bat                   # One-click launcher
├── CampusGPT.code-workspace    # VS Code workspace file
└── README.md
```

---

## 🎯 Features

### Phase 1 — Resume Analysis
- Upload PDF or DOCX resume
- Extracts: Name, Email, Phone, Degree, Branch, Skills, Projects, Internships, Certifications
- **Resume Score** (0–100) + **ATS Score** (0–100)
- Strengths, Weaknesses, AI Suggestions

### Phase 2 — Career Training Dashboard
- Auto-detects stream from resume
- Recommended + Optional interview tracks per stream
- 21 streams supported

### Phase 3 — Question Vault
- 500+ questions across all streams
- Categories: HR, Technical, Resume, Project, Internship, Stream
- No answers shown — pure practice mode
- Randomized every session

### Phase 4 — AI Interview (3 Modes)

| Mode | Duration | Questions | Voice | Special |
|------|----------|-----------|-------|---------|
| Easy | 5–7 min | 5 | Female (Sarah) | Bonus Qs if struggling |
| Hard | 15–20 min | 20 | Female (Ms. Priya) | "THE CANDIDATE" award |
| THE INTERVIEW | 30–45 min | 40+ | Male (Mr. Sharma) | HR + Tech + Pressure rounds |

### Additional Features
- 🎙️ **Voice Interaction** — Browser Web Speech API (STT + TTS), no installs needed
- 📷 **Webcam Monitoring** — Optional face presence tracking, Focus Score
- 🔁 **Tab Switch Detection** — Focus Integrity Score
- 📊 **Progress Dashboard** — Radar chart, score history, placement readiness
- 🗺️ **Learning Roadmap** — 6-week personalized plan with checkable topics
- 📋 **Interview Replay** — Full Q&A review in every report
- 🤖 **Ollama Integration** — Uses local LLM if running, falls back to built-in questions

---

## 🔧 Manual Setup (VS Code Terminal)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🤖 Optional: Ollama AI (Better Questions & Evaluation)

1. Download from https://ollama.ai
2. Run: `ollama pull llama3`
3. Ollama starts automatically on port 11434
4. CampusGPT detects it and uses it for richer AI responses

Without Ollama, the built-in question bank (500+ questions) and heuristic evaluation are used automatically.

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login + get token |
| POST | `/resume/upload` | Upload & analyze resume |
| GET | `/resume/my-resumes` | List all resumes |
| POST | `/interview/start` | Start interview session |
| POST | `/interview/answer` | Submit answer for evaluation |
| POST | `/interview/complete/{id}` | Complete & generate report |
| GET | `/interview/sessions/history` | Past sessions |
| POST | `/vault/questions` | Get question vault |
| GET | `/tts/speak?text=...` | Text-to-speech audio |
| GET | `/docs` | Interactive Swagger API docs |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic, Python-Jose |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Ollama (optional), Built-in question bank |
| Voice | Web Speech API (STT + TTS, browser-native) |
| Auth | JWT Bearer tokens + bcrypt |

---

## 🛠️ Troubleshooting

**Port already in use:**
```bash
# Backend: change port in START.bat → --port 8001
# Frontend: vite.config.js → server: { port: 5174 }
```

**npm install fails:**
```bash
cd frontend
npm install --force
```

**Python packages fail:**
```bash
cd backend
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy aiosqlite pydantic pydantic-settings python-jose passlib httpx aiofiles python-dotenv
```

**Speech recognition not working:**
- Use Google Chrome or Microsoft Edge (best Web Speech API support)
- Allow microphone permission when prompted
- Firefox has limited support

**Resume parsing returns minimal data:**
- PyMuPDF needs to install correctly: `pip install PyMuPDF`
- For DOCX: `pip install python-docx`
- The app works even without these — it shows demo data

---

## 📝 License
MIT — Free for personal and educational use.
