import re
import json
from typing import Dict, Any, List
from pathlib import Path

# Try imports with graceful fallbacks
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    from docx import Document as DocxDocument
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

SKILLS_DB = {
    "programming": ["python", "java", "javascript", "c++", "c#", "typescript", "go", "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "c"],
    "web": ["react", "angular", "vue", "node.js", "express", "django", "flask", "fastapi", "html", "css", "bootstrap", "tailwind", "next.js", "nuxt"],
    "data": ["machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "opencv", "nlp", "computer vision", "data analysis"],
    "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "devops", "terraform", "jenkins", "git", "github", "gitlab"],
    "database": ["mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "firebase", "cassandra", "elasticsearch"],
    "mobile": ["android", "ios", "react native", "flutter", "xamarin"],
    "tools": ["linux", "bash", "postman", "jira", "confluence", "figma", "adobe xd", "photoshop"],
}

STREAM_KEYWORDS = {
    "Computer Science Engineering": ["computer science", "cse", "cs", "software engineering", "information technology"],
    "Artificial Intelligence & Machine Learning": ["artificial intelligence", "machine learning", "aiml", "ai/ml", "ai & ml"],
    "Data Science": ["data science", "data analytics", "business analytics"],
    "Electronics & Communication Engineering": ["electronics", "ece", "communication engineering", "vlsi", "embedded"],
    "Electrical Engineering": ["electrical engineering", "ee", "power systems", "electrical"],
    "Mechanical Engineering": ["mechanical", "mechatronics", "production engineering"],
    "Civil Engineering": ["civil engineering", "structural", "construction"],
    "Information Technology": ["information technology", "it", "btech it"],
    "BCA": ["bca", "bachelor of computer applications"],
    "MCA": ["mca", "master of computer applications"],
    "BBA": ["bba", "bachelor of business administration"],
    "MBA": ["mba", "master of business administration"],
    "Chemical Engineering": ["chemical engineering", "biochemical"],
    "Biotechnology": ["biotechnology", "biotech", "bioinformatics"],
    "Aerospace Engineering": ["aerospace", "aeronautical", "avionics"],
}

def extract_text_from_pdf(file_path: str) -> str:
    if not HAS_PYMUPDF:
        return "PDF parsing requires PyMuPDF. Please install it."
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def extract_text_from_docx(file_path: str) -> str:
    if not HAS_DOCX:
        return "DOCX parsing requires python-docx. Please install it."
    try:
        doc = DocxDocument(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"

def extract_name(text: str) -> str:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:5]:
        if (len(line.split()) >= 2 and len(line.split()) <= 5
                and not any(kw in line.lower() for kw in ["resume", "curriculum", "vitae", "email", "phone", "@"])):
            return line.title()
    return "Not Found"

def extract_email(text: str) -> str:
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else "Not Found"

def extract_phone(text: str) -> str:
    match = re.search(r'(\+91[\s-]?)?[6-9]\d{9}|(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', text)
    return match.group(0) if match else "Not Found"

def detect_stream(text: str) -> str:
    text_lower = text.lower()
    for stream, keywords in STREAM_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return stream
    return "Computer Science Engineering"

def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found = []
    for category, skills in SKILLS_DB.items():
        for skill in skills:
            if skill in text_lower:
                found.append(skill.title())
    return list(set(found))

def extract_section(text: str, section_names: List[str]) -> str:
    text_lower = text.lower()
    for section in section_names:
        pattern = rf'(?i){section}[:\s]*\n(.*?)(?=\n[A-Z][A-Z\s]{{3,}}:|$)'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
    return ""

def extract_projects(text: str) -> List[str]:
    section = extract_section(text, ["projects", "academic projects", "personal projects"])
    if not section:
        return []
    projects = [line.strip() for line in section.split('\n') if len(line.strip()) > 20]
    return projects[:5]

def extract_experience(text: str) -> List[str]:
    section = extract_section(text, ["work experience", "experience", "employment"])
    if not section:
        return []
    exp = [line.strip() for line in section.split('\n') if len(line.strip()) > 15]
    return exp[:5]

def extract_internships(text: str) -> List[str]:
    section = extract_section(text, ["internships", "internship", "industrial training"])
    if not section:
        return []
    intern = [line.strip() for line in section.split('\n') if len(line.strip()) > 15]
    return intern[:3]

def extract_certifications(text: str) -> List[str]:
    section = extract_section(text, ["certifications", "certificates", "courses"])
    if not section:
        return []
    certs = [line.strip() for line in section.split('\n') if len(line.strip()) > 10]
    return certs[:6]

def extract_education(text: str) -> Dict:
    education = {"degree": "Not Found", "institution": "Not Found", "year": "Not Found"}
    degree_patterns = [
        r'(B\.?Tech|M\.?Tech|B\.?E|B\.?Sc|M\.?Sc|BCA|MCA|BBA|MBA|Ph\.?D|Diploma|B\.?Com|LLB|MBBS|B\.?Pharm)',
    ]
    for pattern in degree_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            education["degree"] = match.group(0)
            break
    year_match = re.search(r'20[12]\d', text)
    if year_match:
        education["year"] = year_match.group(0)
    return education

def calculate_resume_score(data: Dict) -> Dict:
    score = 0
    ats_score = 0
    breakdown = {}

    # Contact info
    if data.get("email") != "Not Found":
        score += 5; ats_score += 5
    if data.get("phone") != "Not Found":
        score += 5; ats_score += 5

    # Skills
    skills_count = len(data.get("skills", []))
    skill_pts = min(25, skills_count * 2)
    score += skill_pts; ats_score += min(20, skills_count * 2)
    breakdown["skills"] = skill_pts

    # Projects
    proj_count = len(data.get("projects", []))
    proj_pts = min(20, proj_count * 5)
    score += proj_pts; ats_score += min(15, proj_count * 4)
    breakdown["projects"] = proj_pts

    # Experience
    exp_pts = min(15, len(data.get("experience", [])) * 8)
    score += exp_pts; ats_score += min(15, len(data.get("experience", [])) * 8)

    # Internships
    intern_pts = min(15, len(data.get("internships", [])) * 8)
    score += intern_pts; ats_score += min(15, len(data.get("internships", [])) * 7)

    # Certifications
    cert_pts = min(10, len(data.get("certifications", [])) * 3)
    score += cert_pts; ats_score += min(10, len(data.get("certifications", [])) * 3)

    # Education
    if data.get("education", {}).get("degree") != "Not Found":
        score += 5; ats_score += 10

    return {
        "resume_score": min(100, score),
        "ats_score": min(100, ats_score),
    }

def generate_strengths_weaknesses(data: Dict) -> Dict:
    strengths = []
    weaknesses = []
    suggestions = []

    skills = data.get("skills", [])
    projects = data.get("projects", [])
    internships = data.get("internships", [])
    experience = data.get("experience", [])
    certifications = data.get("certifications", [])

    if len(skills) >= 8:
        strengths.append("Strong Technical Skill Set")
    elif len(skills) < 4:
        weaknesses.append("Limited Technical Skills Listed")
        suggestions.append("Add more technical skills relevant to your target role")

    if len(projects) >= 3:
        strengths.append("Good Project Portfolio")
    elif len(projects) == 0:
        weaknesses.append("No Projects Listed")
        suggestions.append("Add at least 2-3 projects with descriptions and technologies used")
    elif len(projects) < 2:
        weaknesses.append("Insufficient Projects")
        suggestions.append("Add more projects to strengthen your portfolio")

    if len(internships) >= 1:
        strengths.append("Has Internship Experience")
    else:
        weaknesses.append("Missing Internship Experience")
        suggestions.append("Pursue internships or add freelance/part-time work experience")

    if len(experience) >= 1:
        strengths.append("Professional Work Experience")

    if len(certifications) >= 2:
        strengths.append("Well-Certified Professional")
    else:
        suggestions.append("Add industry certifications (AWS, Google, Microsoft, Coursera, etc.)")

    # General suggestions
    suggestions.extend([
        "Add a professional GitHub profile link",
        "Add LinkedIn profile URL",
        "Include a concise career objective/summary (3-4 lines)",
        "Use action verbs in project and experience descriptions",
        "Quantify achievements where possible (e.g., 'Improved performance by 30%')",
    ])

    return {
        "strengths": strengths[:5],
        "weaknesses": weaknesses[:5],
        "suggestions": suggestions[:8],
    }

def parse_resume(file_path: str) -> Dict[str, Any]:
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        text = extract_text_from_docx(file_path)
    else:
        return {"error": "Unsupported file format"}

    if not text or len(text) < 50:
        # Return demo data if parsing fails
        text = "John Doe\njohn@email.com\nB.Tech Computer Science\nPython Java React"

    data = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "branch": detect_stream(text),
        "education": extract_education(text),
        "skills": extract_skills(text),
        "projects": extract_projects(text),
        "internships": extract_internships(text),
        "experience": extract_experience(text),
        "certifications": extract_certifications(text),
        "raw_text_length": len(text),
    }

    scores = calculate_resume_score(data)
    sw = generate_strengths_weaknesses(data)
    data.update(scores)
    data.update(sw)

    return data
