# ml_api/app.py
import io
import os
import json
import re
import requests
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai

import joblib
import numpy as np
import pdfplumber
from docx import Document as DocxDocument

# Load environment variables from .env file
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Optional OCR imports (only used if available)
try:
    from pdf2image import convert_from_bytes
    import pytesseract
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

# Gensim
import gensim

# TensorFlow / Keras
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import tokenizer_from_json

# NLTK for tokenization & stopwords (download if necessary)
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

try:
    nltk.data.find("tokenizers/punkt")
except Exception:
    nltk.download("punkt")
try:
    nltk.data.find("corpora/stopwords")
except Exception:
    nltk.download("stopwords")
STOP_WORDS = set(stopwords.words("english"))

# -----------------------------
# Configuration
# -----------------------------
MODELS_DIR = os.getenv("MODEL_DIR", "models")  # relative to ml_api/
TFIDF_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
CLF_CAT_PATH = os.path.join(MODELS_DIR, "resume_category_classifier.joblib")
CLF_TYPE_PATH = os.path.join(MODELS_DIR, "resume_skill_type_classifier.joblib")
W2V_PATH = os.path.join(MODELS_DIR, "resume_w2v.model")
LSTM_CAT_PATH = os.path.join(MODELS_DIR, "resume_category_lstm.h5")
LSTM_TYPE_PATH = os.path.join(MODELS_DIR, "resume_skilltype_lstm.h5")
TOKENIZER_PATH = os.path.join(MODELS_DIR, "tokenizer.json")
CONFIG_PATH = os.path.join(MODELS_DIR, "config.json")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

def analyze_resume_with_openai(resume_text: str, job_description: str = "") -> Dict[str, Any]:
    """
    Use OpenAI to analyze resume and provide intelligent insights
    """
    if not OPENAI_API_KEY:
        return {"error": "OpenAI API key not configured"}
    
    try:
        job_context = f"\n\nJob Description:\n{job_description}" if job_description else ""
        
        prompt = f"""Analyze this resume and provide detailed insights in JSON format.

Resume:
{resume_text}{job_context}

Provide a JSON response with:
1. summary: Brief overview of the candidate
2. strengths: List of top 3-5 strengths
3. weaknesses: List of 2-3 areas for improvement
4. recommendations: List of 3-4 recommendations
5. experience_level: "Entry", "Mid", or "Senior"
6. soft_skills: List of detected soft skills
7. technical_skills: List of detected technical skills
8. job_match_analysis: If job description provided, detailed match analysis
9. match_percentage: If job description provided, percentage match score (0-100)

Return ONLY valid JSON, no markdown or extra text."""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert resume analyst. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        response_text = response.choices[0].message.content
        
        # Try to parse JSON response
        try:
            analysis = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, extract JSON from markdown code blocks
            json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group(1))
            else:
                analysis = {"raw_response": response_text}
        
        return analysis
    
    except Exception as e:
        return {"error": f"OpenAI analysis failed: {str(e)}"}

def extract_resume_text_with_openai(raw_text: str) -> Dict[str, Any]:
    """
    Use OpenAI to extract structured information from resume
    """
    if not OPENAI_API_KEY:
        return {"error": "OpenAI API key not configured", "raw_text": raw_text}
    
    try:
        prompt = f"""Extract structured information from this resume and return as JSON.

Resume:
{raw_text}

Extract and return JSON with:
1. name: Full name of candidate
2. email: Email address if found
3. phone: Phone number if found
4. summary: Professional summary or objective
5. experience: List of job titles and companies
6. education: List of degrees and institutions
7. skills: List of all technical and soft skills
8. certifications: Any certifications or credentials
9. languages: Languages spoken
10. years_of_experience: Estimated total years

Return ONLY valid JSON, no markdown or extra text."""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert at extracting structured data from resumes. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )
        
        response_text = response.choices[0].message.content
        
        # Try to parse JSON response
        try:
            extracted = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, extract JSON from markdown code blocks
            json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                extracted = json.loads(json_match.group(1))
            else:
                extracted = {"raw_text": raw_text}
        
        return extracted
    
    except Exception as e:
        return {"error": f"OpenAI extraction failed: {str(e)}", "raw_text": raw_text}

# Keyword list (adapt to your training)
SKILL_KEYWORDS = [
    'python','java','c++','javascript','sql','excel','communication',
    'teamwork','leadership','management','deep learning','machine learning',
    'nlp','tensorflow','pytorch','react','node','django','flask','problem solving'
]

# Preprocessing helpers (must match training)
def clean_text(text: str) -> str:
    if not text:
        return ""
    text = str(text).lower()
    # remove emails and urls
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'http\S+|www\.\S+', ' ', text)
    # keep only letters and spaces
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    # remove stopwords
    tokens = [w for w in text.split() if w not in STOP_WORDS and len(w) > 1]
    return " ".join(tokens)

def extract_skills_from_text(cleaned_text: str) -> List[str]:
    found = []
    for k in SKILL_KEYWORDS:
        if k in cleaned_text:
            found.append(k)
    return found

# -----------------------------
# Text extraction utilities
# -----------------------------
def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """
    Primary method: pdfplumber for text-based PDFs.
    If pdfplumber returns empty text and OCR is available, use OCR fallback.
    """
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = []
            for p in pdf.pages:
                page_text = p.extract_text()
                if page_text:
                    pages_text.append(page_text)
            text = "\n".join(pages_text).strip()
    except Exception:
        text = ""

    # If pdfplumber returned no text and OCR tools are installed, try OCR
    if (not text) and OCR_AVAILABLE:
        try:
            images = convert_from_bytes(file_bytes)
            ocr_texts = []
            for img in images:
                ocr_text = pytesseract.image_to_string(img)
                ocr_texts.append(ocr_text)
            text = "\n".join(ocr_texts).strip()
        except Exception:
            text = ""
    return text

def extract_text_from_docx_bytes(file_bytes: bytes) -> str:
    try:
        bio = io.BytesIO(file_bytes)
        doc = DocxDocument(bio)
        paragraphs = [p.text for p in doc.paragraphs if p.text]
        return "\n".join(paragraphs)
    except Exception:
        return ""

# -----------------------------
# Model loading (at startup)
# -----------------------------
def safe_load_joblib(path: str):
    if os.path.exists(path):
        return joblib.load(path)
    return None

def safe_load_keras(path: str):
    if os.path.exists(path):
        return load_model(path)
    return None

def safe_load_gensim(path: str):
    if os.path.exists(path):
        return gensim.models.Word2Vec.load(path)
    return None

# Initialize model variables (global)
tfidf = None
clf_cat = None
clf_type = None
w2v = None
lstm_cat = None
lstm_type = None
tokenizer = None
max_len = None

def load_all_models():
    global tfidf, clf_cat, clf_type, w2v, lstm_cat, lstm_type, tokenizer, max_len

    # sklearn artifacts
    tfidf = safe_load_joblib(TFIDF_PATH)
    clf_cat = safe_load_joblib(CLF_CAT_PATH)
    clf_type = safe_load_joblib(CLF_TYPE_PATH)

    # gensim
    w2v = safe_load_gensim(W2V_PATH)

    # keras lstm models
    lstm_cat = safe_load_keras(LSTM_CAT_PATH)
    lstm_type = safe_load_keras(LSTM_TYPE_PATH)

    # tokenizer + config for LSTM
    if os.path.exists(TOKENIZER_PATH):
        try:
            with open(TOKENIZER_PATH, "r", encoding="utf-8") as f:
                tokenizer_json = f.read()
            tokenizer = tokenizer_from_json(tokenizer_json)
        except Exception:
            tokenizer = None
    else:
        tokenizer = None

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            max_len = int(cfg.get("max_len", 100))
        except Exception:
            max_len = 100
    else:
        max_len = 100

# Load on import
load_all_models()

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Resume Analyzer API")

# Configure CORS - tune allow_origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class AnalyzeTextRequest(BaseModel):
    text: str

# -----------------------------
# Helper inference utilities
# -----------------------------
def sklearn_predict_with_confidence(clf, tfidf_vec, classes_map=None) -> Dict[str, Any]:
    """
    Returns {'label': label, 'confidence': prob}
    Uses predict_proba if available; otherwise returns deterministic label and confidence=1.0
    """
    if clf is None:
        return {"label": None, "confidence": None}
    try:
        if hasattr(clf, "predict_proba"):
            probs = clf.predict_proba(tfidf_vec)[0]
            idx = int(np.argmax(probs))
            label = clf.classes_[idx]
            return {"label": str(label), "confidence": float(probs[idx])}
        else:
            label = clf.predict(tfidf_vec)[0]
            return {"label": str(label), "confidence": None}
    except Exception:
        # fallback
        try:
            label = clf.predict(tfidf_vec)[0]
            return {"label": str(label), "confidence": None}
        except Exception:
            return {"label": None, "confidence": None}

def lstm_predict_with_confidence(model, tokenizer_obj, text: str, max_len_val: int):
    """
    Returns {'label': decoded_label, 'confidence': prob, 'raw': logits}
    Requires tokenizer_obj and model to be loaded; label decoding is not saved here,
    so we return predicted class index. If you have label encoders, load and decode them similarly.
    """
    if model is None or tokenizer_obj is None:
        return {"label_index": None, "confidence": None}
    try:
        seq = tokenizer_obj.texts_to_sequences([text])
        pad = pad_sequences(seq, maxlen=max_len_val, padding="post")
        preds = model.predict(pad)
        if preds.ndim == 2:
            idx = int(np.argmax(preds[0]))
            confidence = float(np.max(preds[0]))
            return {"label_index": idx, "confidence": confidence}
        else:
            # regression style (unlikely here)
            return {"label_index": None, "confidence": None}
    except Exception:
        return {"label_index": None, "confidence": None}

# If you have saved label encoders, load them and use inverse_transform to map LSTM index to label.
# For simplicity we return index (user can map on client or add encoders to models folder).

# -----------------------------
# Endpoints
# -----------------------------
@app.get("/health")
def health():
    loaded = {
        "tfidf": bool(tfidf),
        "clf_cat": bool(clf_cat),
        "clf_type": bool(clf_type),
        "w2v": bool(w2v),
        "lstm_cat": bool(lstm_cat),
        "lstm_type": bool(lstm_type),
        "tokenizer": bool(tokenizer),
        "ocr_available": OCR_AVAILABLE
    }
    return {"status": "ok", "models": loaded, "max_len": max_len}

@app.post("/analyze/text")
async def analyze_text(payload: AnalyzeTextRequest):
    text = payload.text or ""
    cleaned = clean_text(text)
    skills_found = extract_skills_from_text(cleaned)
    skills_text = " ".join(skills_found) if skills_found else cleaned[:1000]

    # TF-IDF + sklearn
    tfidf_vec = None
    cat_res = {"label": None, "confidence": None}
    type_res = {"label": None, "confidence": None}
    if tfidf is not None:
        try:
            tfidf_vec = tfidf.transform([skills_text])
            cat_res = sklearn_predict_with_confidence(clf_cat, tfidf_vec)
            type_res = sklearn_predict_with_confidence(clf_type, tfidf_vec)
        except Exception:
            pass

    # LSTM (if tokenizer + model loaded)
    lstm_cat_res = lstm_predict_with_confidence(lstm_cat, tokenizer, cleaned, max_len) if (lstm_cat and tokenizer) else {"label_index": None, "confidence": None}
    lstm_type_res = lstm_predict_with_confidence(lstm_type, tokenizer, cleaned, max_len) if (lstm_type and tokenizer) else {"label_index": None, "confidence": None}

    return {
        "category_tfidf": cat_res["label"],
        "category_tfidf_conf": cat_res["confidence"],
        "skill_type_tfidf": type_res["label"],
        "skill_type_tfidf_conf": type_res["confidence"],
        "category_lstm_index": lstm_cat_res.get("label_index"),
        "category_lstm_conf": lstm_cat_res.get("confidence"),
        "skill_type_lstm_index": lstm_type_res.get("label_index"),
        "skill_type_lstm_conf": lstm_type_res.get("confidence"),
        "skills_found": skills_found,
        "text_snippet": cleaned[:2000]
    }

@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    content = await file.read()
    filename = file.filename or ""

    # Determine type by extension
    ext = (filename.split(".")[-1] if "." in filename else "").lower()
    raw_text = ""

    if ext in ["pdf"]:
        raw_text = extract_text_from_pdf_bytes(content)
    elif ext in ["docx"]:
        raw_text = extract_text_from_docx_bytes(content)
    elif ext in ["txt"]:
        try:
            raw_text = content.decode("utf-8", errors="ignore")
        except Exception:
            raw_text = ""
    else:
        # try pdfplumber first
        raw_text = extract_text_from_pdf_bytes(content)
        if not raw_text:
            # try docx
            raw_text = extract_text_from_docx_bytes(content)

    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from file. If it's a scanned PDF ensure OCR (pytesseract + pdf2image) is installed.")

    # Reuse analyze_text logic
    cleaned = clean_text(raw_text)
    skills_found = extract_skills_from_text(cleaned)
    skills_text = " ".join(skills_found) if skills_found else cleaned[:1000]

    # TF-IDF predictions
    tfidf_vec = None
    cat_res = {"label": None, "confidence": None}
    type_res = {"label": None, "confidence": None}
    if tfidf is not None:
        try:
            tfidf_vec = tfidf.transform([skills_text])
            cat_res = sklearn_predict_with_confidence(clf_cat, tfidf_vec)
            type_res = sklearn_predict_with_confidence(clf_type, tfidf_vec)
        except Exception:
            pass

    # LSTM predictions
    lstm_cat_res = lstm_predict_with_confidence(lstm_cat, tokenizer, cleaned, max_len) if (lstm_cat and tokenizer) else {"label_index": None, "confidence": None}
    lstm_type_res = lstm_predict_with_confidence(lstm_type, tokenizer, cleaned, max_len) if (lstm_type and tokenizer) else {"label_index": None, "confidence": None}

    return {
        "filename": filename,
        "category_tfidf": cat_res["label"],
        "category_tfidf_conf": cat_res["confidence"],
        "skill_type_tfidf": type_res["label"],
        "skill_type_tfidf_conf": type_res["confidence"],
        "category_lstm_index": lstm_cat_res.get("label_index"),
        "category_lstm_conf": lstm_cat_res.get("confidence"),
        "skill_type_lstm_index": lstm_type_res.get("label_index"),
        "skill_type_lstm_conf": lstm_type_res.get("confidence"),
        "skills_found": skills_found,
        "text_snippet": cleaned[:2000]
    }

@app.post("/batch/analyze")
async def batch_analyze(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        try:
            res = await analyze_file(file)  # reuses analyze_file logic
            results.append(res)
        except HTTPException as e:
            results.append({"filename": getattr(file, "filename", None), "error": str(e.detail)})
        except Exception as e:
            results.append({"filename": getattr(file, "filename", None), "error": str(e)})
    return {"results": results}


@app.post("/predict")
async def predict(file: UploadFile = File(...), job_description: str = ""):
    """
    Analyze resume and match it against job description using OpenAI.
    Returns skills analysis, category predictions, and AI-powered job match score.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    
    content = await file.read()
    filename = file.filename or ""

    # Determine type by extension
    ext = (filename.split(".")[-1] if "." in filename else "").lower()
    raw_text = ""

    if ext in ["pdf"]:
        raw_text = extract_text_from_pdf_bytes(content)
    elif ext in ["docx"]:
        raw_text = extract_text_from_docx_bytes(content)
    elif ext in ["txt"]:
        try:
            raw_text = content.decode("utf-8", errors="ignore")
        except Exception:
            raw_text = ""
    else:
        # try pdfplumber first
        raw_text = extract_text_from_pdf_bytes(content)
        if not raw_text:
            # try docx
            raw_text = extract_text_from_docx_bytes(content)

    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from file.")

    # Clean and extract skills
    cleaned = clean_text(raw_text)
    skills_found = extract_skills_from_text(cleaned)
    skills_text = " ".join(skills_found) if skills_found else cleaned[:1000]

    # TF-IDF predictions
    tfidf_vec = None
    cat_res = {"label": None, "confidence": None}
    type_res = {"label": None, "confidence": None}
    if tfidf is not None:
        try:
            tfidf_vec = tfidf.transform([skills_text])
            cat_res = sklearn_predict_with_confidence(clf_cat, tfidf_vec)
            type_res = sklearn_predict_with_confidence(clf_type, tfidf_vec)
        except Exception:
            pass

    # LSTM predictions
    lstm_cat_res = lstm_predict_with_confidence(lstm_cat, tokenizer, cleaned, max_len) if (lstm_cat and tokenizer) else {"label_index": None, "confidence": None}
    lstm_type_res = lstm_predict_with_confidence(lstm_type, tokenizer, cleaned, max_len) if (lstm_type and tokenizer) else {"label_index": None, "confidence": None}

    # Calculate basic job match score from keyword matching
    job_match_score = 0
    matched_skills = []
    
    if job_description:
        job_desc_lower = job_description.lower()
        for skill in skills_found:
            if skill.lower() in job_desc_lower:
                matched_skills.append(skill)
        
        # Match score: (matched skills / total skills) * 100
        if skills_found:
            job_match_score = round((len(matched_skills) / len(skills_found)) * 100, 2)
    
    # Get OpenAI analysis for enhanced insights and AI-powered matching
    openai_analysis = analyze_resume_with_openai(raw_text, job_description)
    
    # Extract OpenAI match percentage if available
    ai_match_score = openai_analysis.get("match_percentage", job_match_score)
    if isinstance(ai_match_score, str):
        try:
            ai_match_score = float(ai_match_score.replace('%', ''))
        except:
            ai_match_score = job_match_score
    
    # Use AI match score if available, otherwise use basic keyword matching
    final_match_score = ai_match_score if ai_match_score != job_match_score else job_match_score
    
    # Also extract structured resume data using OpenAI
    resume_extraction = extract_resume_text_with_openai(raw_text)
    
    return {
        "filename": filename,
        "category_tfidf": cat_res["label"],
        "category_tfidf_conf": round(cat_res["confidence"] * 100, 2) if cat_res["confidence"] else None,
        "skill_type_tfidf": type_res["label"],
        "skill_type_tfidf_conf": round(type_res["confidence"] * 100, 2) if type_res["confidence"] else None,
        "category_lstm_index": lstm_cat_res.get("label_index"),
        "category_lstm_conf": round(lstm_cat_res.get("confidence", 0) * 100, 2) if lstm_cat_res.get("confidence") else None,
        "skill_type_lstm_index": lstm_type_res.get("label_index"),
        "skill_type_lstm_conf": round(lstm_type_res.get("confidence", 0) * 100, 2) if lstm_type_res.get("confidence") else None,
        "skills_found": skills_found,
        "matched_skills": matched_skills,
        "job_match_score": final_match_score,
        "keyword_match_score": job_match_score,
        "ai_match_score": ai_match_score,
        "total_skills": len(skills_found),
        "matched_skills_count": len(matched_skills),
        "text_snippet": cleaned[:2000],
        "resume_extraction": resume_extraction,
        "openai_analysis": openai_analysis,
        "chart_data": {
            "skillsDistribution": {
                "matched": len(matched_skills),
                "unmatched": len(skills_found) - len(matched_skills)
            },
            "confidenceScores": {
                "category_tfidf": cat_res["confidence"],
                "skill_type_tfidf": type_res["confidence"],
                "category_lstm": lstm_cat_res.get("confidence"),
                "skill_type_lstm": lstm_type_res.get("confidence")
            },
            "jobMatchPercentage": final_match_score
        }
    }


# ==============================
# OLLAMA INTEGRATION
# ==============================

def call_ollama(resume_text: str, job_description: str = "") -> Dict[str, Any]:
    """
    Call Ollama LLM for intelligent resume analysis.
    Falls back gracefully if Ollama is not available.
    """
    try:
        OLLAMA_API_URL = "http://localhost:11434/api/generate"
        OLLAMA_MODEL = "tinyllama"  # Lightweight model (637MB) - works with limited RAM. Alternatives: orca-mini, neural-chat
        OLLAMA_TIMEOUT = 120  # Reduced timeout to 2 minutes - tinyllama is too slow
        
        print(f"[Ollama] Calling {OLLAMA_MODEL} with {OLLAMA_TIMEOUT}s timeout...")
        
        # Create intelligent prompt - simplified for better JSON parsing
        if job_description:
            prompt = f"""Analyze this resume against the job description. Calculate a skill match score (0-100) based on how many job requirements the resume fulfills.

RESUME: {resume_text[:600]}

JOB DESCRIPTION: {job_description[:400]}

Return ONLY a valid JSON object (no markdown, no extra text):
{{"skill_match_score": 75, "project_skills_implemented": ["Python", "JavaScript"], "future_skills_required": ["Kubernetes"], "experience_alignment": "Good", "summary": "Matches job well"}}"""
        else:
            prompt = f"""Analyze this resume and extract skills.

RESUME: {resume_text[:600]}

Return ONLY a valid JSON object:
{{"skill_match_score": 0, "project_skills_implemented": ["skill1", "skill2"], "future_skills_required": [], "experience_level": "Mid-level", "summary": "Analysis"}}"""
        
        # Call Ollama with shorter timeout
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.1,
                "top_k": 40,
                "top_p": 0.9
            },
            timeout=OLLAMA_TIMEOUT
        )
        
        if response.status_code != 200:
            return {"error": f"Ollama error: {response.status_code}"}
        
        # Parse response
        data = response.json()
        response_text = data.get("response", "").strip()
        
        print(f"[Ollama] Response received: {response_text[:100]}")
        
        # Extract JSON from response - handle multiple approaches
        try:
            # First, try direct JSON parsing
            try:
                result = json.loads(response_text)
                return {"success": True, "analysis": result}
            except json.JSONDecodeError:
                pass
            
            # Second, try to find JSON object in response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}')
            
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx+1]
                result = json.loads(json_str)
                return {"success": True, "analysis": result}
            
        except Exception as parse_error:
            print(f"[Ollama] Parse error: {parse_error}")
            print(f"[Ollama] Response text: {response_text[:200]}")
        
        return {"error": f"Could not parse Ollama response"}
        
    except requests.exceptions.Timeout:
        print(f"[Ollama] Timeout after {OLLAMA_TIMEOUT}s - Ollama is too slow")
        return {"error": f"Ollama timeout - model is processing too slowly"}
    except requests.exceptions.ConnectionError:
        print(f"[Ollama] Connection error - Ollama not running")
        return {"error": "Ollama not running. Start with: ollama serve"}
    except Exception as e:
        print(f"[Ollama] Unexpected error: {str(e)}")
        return {"error": f"Unexpected error: {str(e)}"}


def generate_ml_fallback_analysis(resume_text: str, job_description: str = "") -> Dict[str, Any]:
    """
    Fast fallback analysis using regex and keyword matching if Ollama fails.
    """
    try:
        # Common skills keywords
        common_skills = {
            "Python": ["python", "py"],
            "JavaScript": ["javascript", "js", "node"],
            "React": ["react", "reactjs"],
            "Java": ["java"],
            "C++": ["c++", "cpp"],
            "SQL": ["sql", "mysql", "postgres"],
            "AWS": ["aws", "amazon"],
            "Docker": ["docker"],
            "Kubernetes": ["kubernetes", "k8s"],
            "Git": ["git", "github", "gitlab"],
            "REST API": ["rest", "api"],
            "HTML": ["html"],
            "CSS": ["css"],
            "TypeScript": ["typescript", "ts"],
        }
        
        # Extract skills from resume
        resume_lower = resume_text.lower()
        found_skills = []
        for skill, keywords in common_skills.items():
            for keyword in keywords:
                if keyword in resume_lower:
                    if skill not in found_skills:
                        found_skills.append(skill)
                    break
        
        # Extract job skills if job description provided
        job_skills = []
        if job_description:
            job_lower = job_description.lower()
            for skill, keywords in common_skills.items():
                for keyword in keywords:
                    if keyword in job_lower:
                        if skill not in job_skills:
                            job_skills.append(skill)
                        break
        
        # Calculate match score
        match_score = 0
        if job_skills:
            matched = len([s for s in found_skills if s in job_skills])
            match_score = int((matched / len(job_skills)) * 100) if job_skills else 0
        else:
            match_score = min(len(found_skills) * 10, 100)  # Base score on number of skills
        
        # Determine future skills (in job but not in resume)
        future_skills = [s for s in job_skills if s not in found_skills] if job_skills else []
        
        return {
            "success": True,
            "analysis": {
                "skill_match_score": match_score,
                "project_skills_implemented": found_skills,
                "future_skills_required": future_skills,
                "experience_alignment": "Match based on skills" if match_score >= 60 else "Partial match",
                "experience_level": "Mid-level" if len(found_skills) >= 5 else "Junior",
                "summary": f"Found {len(found_skills)} skills in resume. {len(future_skills)} skills needed for job."
            }
        }
    except Exception as e:
        print(f"[Fallback] Error: {str(e)}")
        return {"error": f"Fallback analysis failed: {str(e)}"}


@app.post("/analyze/resume-ollama")
async def analyze_resume_with_ollama(
    file: UploadFile = File(...),
    job_description: str = ""
):
    """
    Upload resume and optionally job description.
    Extracts text and analyzes with Ollama LLM.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    
    content = await file.read()
    filename = file.filename or ""
    
    # Extract text from file
    ext = (filename.split(".")[-1] if "." in filename else "").lower()
    raw_text = ""
    
    if ext == "pdf":
        raw_text = extract_text_from_pdf_bytes(content)
    elif ext == "docx":
        raw_text = extract_text_from_docx_bytes(content)
    elif ext == "txt":
        try:
            raw_text = content.decode("utf-8", errors="ignore")
        except:
            raw_text = ""
    else:
        # Try all methods
        raw_text = extract_text_from_pdf_bytes(content)
        if not raw_text:
            raw_text = extract_text_from_docx_bytes(content)
    
    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from resume file.")
    
    # Clean text
    cleaned_text = clean_text(raw_text)
    
    # Call Ollama with 2-minute timeout
    print(f"[/analyze/resume-ollama] Starting Ollama analysis for {filename}")
    result = call_ollama(cleaned_text, job_description)
    print(f"[/analyze/resume-ollama] Ollama result: {result}")
    
    # If Ollama failed, use fast ML fallback instead
    if "error" in result:
        print(f"[/analyze/resume-ollama] Ollama failed, using ML fallback")
        result = generate_ml_fallback_analysis(cleaned_text, job_description)
        engine = "Fallback ML"
    else:
        engine = "Ollama LLM"
    
    # Extract analysis data
    analysis = result.get("analysis", {})
    
    # Format response with all required fields
    return {
        "filename": filename,
        "resume_text": cleaned_text[:1000],
        "engine": engine,
        "model": "tinyllama" if engine == "Ollama LLM" else "ml-fallback",
        "job_match_score": analysis.get("skill_match_score", 0),
        "matched_skills_count": len(analysis.get("project_skills_implemented", [])),
        "total_skills": len(analysis.get("project_skills_implemented", [])) + len(analysis.get("future_skills_required", [])),
        "analysis": {
            "skill_match_score": analysis.get("skill_match_score", 0),
            "project_skills_implemented": analysis.get("project_skills_implemented", []),
            "future_skills_required": analysis.get("future_skills_required", []),
            "experience_alignment": analysis.get("experience_alignment", ""),
            "experience_level": analysis.get("experience_level", ""),
            "summary": analysis.get("summary", "")
        }
    }





@app.get("/test/ollama")
async def test_ollama():
    """
    Test endpoint - simulates Ollama response for debugging
    """
    return {
        "status": "test",
        "message": "Ollama integration working!",
        "analysis": {
            "overall_match": 82,
            "matched_skills": ["Python", "JavaScript", "React"],
            "missing_skills": ["Kubernetes", "Docker"],
            "experience_alignment": "Good match for mid-level role",
            "improvement_suggestions": [
                "Learn container orchestration",
                "Gain AWS deployment experience"
            ],
            "summary": "Your resume is well-suited for this position with strong fundamentals."
        }
    }


@app.get("/ollama/status")
async def check_ollama_status():
    """
    Check if Ollama is running and list available models.
    """
    try:
        import requests
        
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            return {
                "status": "connected",
                "available": True,
                "models": models,
                "message": "Ollama is running and ready!"
            }
        else:
            return {
                "status": "error",
                "available": False,
                "message": f"Ollama returned status {response.status_code}"
            }
    except:
        return {
            "status": "disconnected",
            "available": False,
            "message": "Ollama is not running. Start with: ollama serve"
        }


# ------------------------------ 
# If run directly (for local dev)
# ------------------------------ 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=False)
