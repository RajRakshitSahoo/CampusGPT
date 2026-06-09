import httpx
import json
import random
from typing import List, Dict, Optional
from config import settings

# ────────────────────────────────────────────────────────────
# LARGE built-in question bank (used when Ollama is offline)
# ────────────────────────────────────────────────────────────
QUESTION_BANK = {
    "HR": [
        "Tell me about yourself.",
        "Why should we hire you?",
        "What are your greatest strengths?",
        "What are your biggest weaknesses?",
        "Where do you see yourself in 5 years?",
        "Why do you want to work here?",
        "Describe a challenge you faced and how you overcame it.",
        "How do you handle pressure and stressful situations?",
        "What motivates you?",
        "Describe your ideal work environment.",
        "What are your salary expectations?",
        "Do you prefer working independently or in a team?",
        "Tell me about a time you showed leadership.",
        "What is your biggest professional achievement?",
        "How do you prioritize tasks when you have multiple deadlines?",
        "Where did you hear about this position?",
        "Why are you leaving your current job?",
        "What do you know about our company?",
        "Do you have any questions for us?",
        "Tell me about a time you failed and what you learned.",
    ],
    "Computer Science Engineering": {
        "basic": [
            "What is the difference between a stack and a queue?",
            "Explain the concept of recursion with an example.",
            "What is Big O notation? Why is it important?",
            "What is the difference between a process and a thread?",
            "Explain what OOP (Object-Oriented Programming) is.",
            "What is the difference between TCP and UDP?",
            "What is normalization in databases? Name its forms.",
            "Explain the concept of a hash table.",
            "What is the difference between HTTP and HTTPS?",
            "What is a binary search tree (BST)?",
            "Explain SOLID principles.",
            "What is a deadlock? How do you prevent it?",
            "What is a RESTful API?",
            "Explain the MVC architecture pattern.",
            "What is the difference between compiled and interpreted languages?",
        ],
        "intermediate": [
            "Explain the difference between breadth-first search and depth-first search.",
            "What is dynamic programming? Give an example.",
            "Explain how a garbage collector works in Java/Python.",
            "What are design patterns? Name and explain 3.",
            "How does indexing work in databases? When should you use it?",
            "Explain the CAP theorem in distributed systems.",
            "What is the difference between SQL and NoSQL databases?",
            "Explain how HTTPS works using SSL/TLS.",
            "What is a microservices architecture? Pros and cons.",
            "Explain how virtual memory works.",
            "What is the difference between synchronous and asynchronous programming?",
            "Explain the concept of thread safety and race conditions.",
            "What is load balancing? Name different algorithms.",
            "Explain Docker and containerization concepts.",
            "What are WebSockets? How do they differ from HTTP?",
        ],
        "advanced": [
            "Explain the internals of a B+ tree and why databases use them.",
            "How would you design a URL shortener system like bit.ly?",
            "Explain the RAFT consensus algorithm.",
            "How would you implement a distributed cache?",
            "Explain optimistic vs pessimistic locking.",
            "Design a real-time notification system for 10 million users.",
            "Explain how Kubernetes orchestrates containers.",
            "What are the trade-offs between consistency and availability in distributed systems?",
            "How would you design Twitter's timeline feature?",
            "Explain memory management in operating systems.",
        ],
    },
    "Artificial Intelligence & Machine Learning": {
        "basic": [
            "What is the difference between supervised and unsupervised learning?",
            "Explain overfitting and underfitting. How do you handle them?",
            "What is gradient descent? Explain with a simple example.",
            "What is a confusion matrix and what metrics can you derive from it?",
            "Explain the bias-variance tradeoff.",
            "What is cross-validation? Why is it used?",
            "Explain the difference between classification and regression.",
            "What is a neural network? Explain its basic structure.",
            "What is feature engineering? Give examples.",
            "What is regularization? What are L1 and L2 regularization?",
            "Explain the K-Nearest Neighbors algorithm.",
            "What is a decision tree? How does it make decisions?",
            "What is Random Forest? How is it better than a single decision tree?",
            "What is the difference between bagging and boosting?",
            "What is Principal Component Analysis (PCA)?",
        ],
        "intermediate": [
            "Explain backpropagation in neural networks.",
            "What is the vanishing gradient problem? How do you solve it?",
            "Explain the attention mechanism in transformers.",
            "What is transfer learning? When would you use it?",
            "Explain the difference between CNN and RNN architectures.",
            "What is an autoencoder? What are its applications?",
            "Explain the concept of reinforcement learning.",
            "What is a GAN (Generative Adversarial Network)?",
            "Explain BERT and how it works.",
            "What is the ROC-AUC curve?",
            "Explain word2vec and word embeddings.",
            "What is batch normalization and why is it used?",
            "Explain the differences between Adam, SGD, and RMSProp optimizers.",
            "What is k-means clustering? What are its limitations?",
            "Explain SVM (Support Vector Machine) intuitively.",
        ],
        "advanced": [
            "How would you handle a severely imbalanced dataset?",
            "Explain the architecture of GPT models.",
            "How do you detect and mitigate bias in ML models?",
            "Explain the RLHF (Reinforcement Learning from Human Feedback) technique.",
            "How would you design an ML pipeline for production?",
            "Explain model interpretability techniques: SHAP, LIME.",
            "What are the challenges in deploying ML models at scale?",
            "Explain diffusion models and how they generate images.",
        ],
    },
    "Data Science": {
        "basic": [
            "What is the difference between mean, median, and mode?",
            "What is standard deviation and variance?",
            "Explain what a p-value is.",
            "What is hypothesis testing?",
            "What is correlation vs causation?",
            "Explain the Central Limit Theorem.",
            "What is data wrangling?",
            "What are outliers? How do you handle them?",
            "What is a box plot and what does it show?",
            "Explain the difference between a data analyst and a data scientist.",
        ],
        "intermediate": [
            "Explain time series analysis and its components.",
            "What is A/B testing? How do you design one?",
            "Explain Bayesian statistics vs Frequentist statistics.",
            "What is feature selection? Name different techniques.",
            "How do you handle missing data?",
            "What is the curse of dimensionality?",
            "Explain the chi-square test.",
            "What is SQL window functions? Give an example.",
        ],
    },
    "Electronics & Communication Engineering": {
        "basic": [
            "What is the difference between analog and digital signals?",
            "Explain Ohm's Law.",
            "What is a transistor? How does it work?",
            "What is amplitude modulation (AM)?",
            "What is frequency modulation (FM)? How does it differ from AM?",
            "What is a microcontroller? How does it differ from a microprocessor?",
            "Explain Kirchhoff's Voltage Law (KVL) and Current Law (KCL).",
            "What is VLSI design?",
            "What is the difference between RISC and CISC architectures?",
            "Explain what an operational amplifier (Op-Amp) is.",
        ],
        "intermediate": [
            "Explain OFDM (Orthogonal Frequency Division Multiplexing).",
            "What is MIMO technology in wireless communications?",
            "Explain the working of a PLL (Phase-Locked Loop).",
            "What is signal-to-noise ratio (SNR)?",
            "Explain the difference between half-duplex and full-duplex communication.",
        ],
    },
    "Mechanical Engineering": {
        "basic": [
            "What is the difference between stress and strain?",
            "Explain the laws of thermodynamics.",
            "What is Bernoulli's principle?",
            "What is the difference between static and dynamic loading?",
            "Explain what CAD (Computer-Aided Design) is.",
            "What is a heat exchanger?",
            "Explain the concept of fatigue in materials.",
            "What is the difference between laminar and turbulent flow?",
            "What is CNC machining?",
            "Explain the Otto cycle.",
        ],
    },
    "MBA": {
        "basic": [
            "What is Porter's Five Forces model?",
            "Explain SWOT analysis.",
            "What is ROI and how is it calculated?",
            "What is the difference between marketing and sales?",
            "Explain supply chain management.",
            "What is working capital?",
            "Explain the difference between equity and debt financing.",
            "What is BCG Matrix?",
            "What is CRM? Why is it important?",
            "Explain the concept of economies of scale.",
        ],
        "intermediate": [
            "How would you analyze a company's financial health?",
            "Explain the concept of value chain analysis.",
            "What is market segmentation? How do you segment a market?",
            "Explain the difference between B2B and B2C marketing strategies.",
            "What is change management? Why is it challenging?",
        ],
    },
}

async def call_ollama(prompt: str, system: str = "") -> str:
    """Call Ollama API for AI-powered responses."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            }
            if system:
                payload["system"] = system
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json=payload
            )
            if response.status_code == 200:
                return response.json().get("response", "")
    except Exception:
        pass
    return ""

async def is_ollama_available() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False

def get_questions_for_stream(stream: str, count: int = 15, difficulty: str = "mixed") -> List[str]:
    """Get questions for a given stream from built-in bank."""
    questions = []
    
    # Get stream-specific questions
    stream_data = QUESTION_BANK.get(stream, QUESTION_BANK.get("Computer Science Engineering", {}))
    
    if isinstance(stream_data, dict):
        if difficulty == "mixed":
            for level in ["basic", "intermediate", "advanced"]:
                questions.extend(stream_data.get(level, []))
        else:
            questions.extend(stream_data.get(difficulty, stream_data.get("basic", [])))
    
    # Add HR questions
    hr_questions = QUESTION_BANK.get("HR", [])
    
    random.shuffle(questions)
    return questions[:count] if questions else hr_questions[:count]

async def generate_questions_for_interview(
    stream: str,
    mode: str,
    resume_data: Optional[Dict] = None,
    count: int = 10
) -> List[Dict]:
    """Generate interview questions - tries Ollama first, falls back to built-in bank."""
    
    questions = []
    ollama_ok = await is_ollama_available()
    
    if ollama_ok:
        prompt = f"""Generate {count} realistic interview questions for a {stream} student in {mode} interview mode.
Include mix of: HR questions, technical questions from {stream}, resume-based questions.
Return ONLY a JSON array of objects with keys: "question", "category" (HR/Technical/Resume), "difficulty" (easy/medium/hard).
No explanation, just JSON array."""
        
        response = await call_ollama(prompt)
        try:
            # Clean response
            response = response.strip()
            if response.startswith("```"):
                response = response.split("```")[1]
                if response.startswith("json"):
                    response = response[4:]
            data = json.loads(response)
            if isinstance(data, list) and len(data) > 0:
                return data
        except Exception:
            pass
    
    # Fallback to built-in bank
    stream_qs = get_questions_for_stream(stream, count * 2)
    hr_qs = random.sample(QUESTION_BANK.get("HR", []), min(5, count // 3))
    
    all_qs = hr_qs + stream_qs
    random.shuffle(all_qs)
    selected = all_qs[:count]
    
    result = []
    for q in selected:
        cat = "HR" if q in QUESTION_BANK.get("HR", []) else "Technical"
        result.append({
            "question": q,
            "category": cat,
            "difficulty": "medium"
        })
    return result

async def evaluate_answer(question: str, answer: str, stream: str) -> Dict:
    """Evaluate a user's answer using AI or heuristics."""
    
    if not answer or len(answer.strip()) < 10:
        return {
            "score": 0,
            "technical_accuracy": 0,
            "communication": 0,
            "completeness": 0,
            "feedback": "No answer provided.",
            "improvement": "Please attempt to answer the question.",
        }
    
    ollama_ok = await is_ollama_available()
    
    if ollama_ok:
        prompt = f"""Evaluate this interview answer for a {stream} student.
Question: {question}
Answer: {answer}

Return ONLY JSON with these keys:
- score (0-100)
- technical_accuracy (0-100)
- communication (0-100)  
- completeness (0-100)
- feedback (string, 1-2 sentences)
- improvement (string, 1 sentence suggestion)
- covered_points (list of strings)
- missing_points (list of strings)"""
        
        response = await call_ollama(prompt)
        try:
            response = response.strip()
            if response.startswith("```"):
                response = response.split("```")[1]
                if response.startswith("json"):
                    response = response[4:]
            return json.loads(response)
        except Exception:
            pass
    
    # Heuristic evaluation
    word_count = len(answer.split())
    score = min(100, max(20, word_count * 3))
    
    # Check for keywords
    keywords_in_question = [w.lower() for w in question.split() if len(w) > 4]
    answer_lower = answer.lower()
    keyword_hits = sum(1 for kw in keywords_in_question if kw in answer_lower)
    relevance_boost = min(30, keyword_hits * 5)
    score = min(100, score + relevance_boost)
    
    return {
        "score": score,
        "technical_accuracy": score,
        "communication": min(100, 50 + word_count),
        "completeness": min(100, 40 + word_count * 2),
        "feedback": f"Answer reviewed. {'Good attempt with relevant content.' if score > 60 else 'Try to be more specific and detailed.'}",
        "improvement": "Provide more specific technical details and examples.",
        "covered_points": [],
        "missing_points": [],
    }

async def generate_final_report(session_data: Dict) -> Dict:
    """Generate comprehensive interview report."""
    mode = session_data.get("mode", "easy")
    scores = session_data.get("scores", [])
    stream = session_data.get("stream", "")
    
    if not scores:
        avg_score = 50
    else:
        numeric_scores = [s.get("score", 50) for s in scores if isinstance(s, dict)]
        avg_score = sum(numeric_scores) / len(numeric_scores) if numeric_scores else 50
    
    # Determine result
    if avg_score >= 80:
        final_result = "Placement Ready"
        readiness = "HIGH"
        recruiter_comment = "Exceptional candidate with strong technical knowledge and communication skills. Ready for placements."
    elif avg_score >= 60:
        final_result = "Interview Ready"
        readiness = "MEDIUM"
        recruiter_comment = "Good candidate with solid fundamentals. Minor improvements needed for top-tier placements."
    else:
        final_result = "Needs Improvement"
        readiness = "LOW"
        recruiter_comment = "Candidate shows potential but needs focused preparation in technical areas and communication."
    
    return {
        "technical_score": avg_score,
        "communication_score": min(100, avg_score + random.randint(-10, 15)),
        "confidence_score": min(100, avg_score + random.randint(-5, 20)),
        "placement_readiness": readiness,
        "final_result": final_result,
        "recruiter_comments": recruiter_comment,
    }

async def get_question_vault(stream: str, categories: List[str] = None, count: int = 50) -> List[Dict]:
    """Get a vault of questions for practice."""
    questions = []
    
    # HR questions
    hr_qs = random.sample(QUESTION_BANK.get("HR", []), min(10, len(QUESTION_BANK.get("HR", []))))
    for q in hr_qs:
        questions.append({"question": q, "category": "HR", "stream": stream})
    
    # Technical questions
    stream_data = QUESTION_BANK.get(stream, QUESTION_BANK.get("Computer Science Engineering", {}))
    if isinstance(stream_data, dict):
        for level, qs in stream_data.items():
            for q in qs:
                questions.append({"question": q, "category": "Technical", "difficulty": level, "stream": stream})
    
    # Add generic questions
    generic = [
        {"question": "Explain your most significant project in detail.", "category": "Resume"},
        {"question": "What technologies did you use in your major project and why?", "category": "Resume"},
        {"question": "What was the biggest challenge in your project?", "category": "Resume"},
        {"question": "How would you improve your project if given more time?", "category": "Project"},
        {"question": "What was your role in the team project?", "category": "Project"},
        {"question": "Describe your internship experience.", "category": "Internship"},
        {"question": "What did you learn from your internship?", "category": "Internship"},
        {"question": f"What are the latest trends in {stream}?", "category": "Stream"},
        {"question": f"Where do you see {stream} heading in the next 5 years?", "category": "Stream"},
        {"question": "What companies are you targeting for placement?", "category": "HR"},
        {"question": "Are you willing to relocate?", "category": "HR"},
        {"question": "What is your expected CTC?", "category": "HR"},
    ]
    for q in generic:
        questions.append({**q, "stream": stream})
    
    random.shuffle(questions)
    return questions[:count]
