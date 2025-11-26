# Resume Analyzer - Complete Setup Guide

## 🎯 What You've Built

A resume analyzer that:
- ✅ Uploads resumes (PDF, DOCX, TXT)
- ✅ Extracts text automatically
- ✅ Analyzes with **Ollama Local LLM** (AI-powered)
- ✅ Or uses **Traditional ML** (fast, keyword-based)
- ✅ Optional job description matching
- ✅ Beautiful React UI

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Ollama

Download from: https://ollama.com/download

Choose your OS:
- **Windows**: Download installer
- **Mac**: Download installer  
- **Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`

### Step 2: Start Ollama

Open terminal and run:
```bash
ollama serve
```

You should see:
```
Starting Ollama server...
Listening on 127.0.0.1:11434
```

### Step 3: Pull a Model (in another terminal)

```bash
ollama pull phi3
```

Available models:
- `phi3` - **RECOMMENDED** (fast, 3.8B params, good quality)
- `llama3.1` - More powerful, slower
- `qwen2` - Fast, multilingual
- `mistral` - Creative, slow

### Step 4: Install Python Dependencies

```bash
cd ml_api
pip install -r requirements.txt
```

Key additions:
- `requests` - For Ollama API calls

### Step 5: Start Backend & Frontend

**Terminal 1** - Start FastAPI:
```bash
cd ml_api
python app.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Terminal 2** - Start React frontend:
```bash
cd client
npm install
npm start
```

You should see:
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 🔍 Verify Everything Works

### Check Ollama Status

```bash
curl http://localhost:11434/api/tags
```

Should return JSON with available models.

### Check Backend Status

```bash
curl http://localhost:8000/ollama/status
```

Should return:
```json
{
  "status": "connected",
  "available": true,
  "models": ["phi3:latest"]
}
```

### Test in Browser

1. Go to http://localhost:3000
2. Upload a resume (PDF, DOCX, or TXT)
3. (Optional) Paste a job description
4. Click **"AI Analysis (Ollama)"** button
5. See results!

---

## 📱 How to Use

### Option 1: AI Analysis (Ollama) - Recommended

- Better understanding of context
- Semantic skill matching
- Improvement suggestions
- Requires Ollama running
- Takes 30-120 seconds

**Best for**: Detailed analysis, job matching, understanding career gaps

### Option 2: Traditional ML - Fast

- Instant results (< 1 second)
- Keyword-based skill extraction
- Category predictions
- Works without Ollama
- Less contextual understanding

**Best for**: Quick overview, skill categorization

---

## 📊 API Endpoints

### `/analyze/resume-ollama` (NEW - Ollama-powered)

**Request**:
```bash
curl -X POST http://localhost:8000/analyze/resume-ollama \
  -F "file=@resume.pdf" \
  -F "job_description=Senior Developer role..."
```

**Response**:
```json
{
  "filename": "resume.pdf",
  "engine": "Ollama LLM",
  "analysis": {
    "overall_match": 85,
    "matched_skills": ["Python", "React", "Docker"],
    "missing_skills": ["Kubernetes", "AWS"],
    "experience_alignment": "Good match for mid-level position",
    "improvement_suggestions": [
      "Add cloud deployment experience",
      "Learn container orchestration"
    ],
    "summary": "Your resume is a good fit for this role."
  }
}
```

### `/predict` (Existing - ML-based)

**Request**:
```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@resume.pdf"
```

### `/ollama/status` (Check connection)

**Request**:
```bash
curl http://localhost:8000/ollama/status
```

**Response**:
```json
{
  "status": "connected",
  "available": true,
  "models": ["phi3:latest"]
}
```

---

## ⚠️ Troubleshooting

### Issue: "Ollama not running"

**Error**: `Ollama is not running. Start with: ollama serve`

**Fix**:
1. Open a new terminal
2. Run `ollama serve`
3. Wait for startup message

### Issue: "Connection refused"

**Error**: `Failed to connect to http://localhost:11434`

**Fix**:
- Check if Ollama is running: `curl http://localhost:11434/api/tags`
- Restart Ollama: Stop and run `ollama serve` again

### Issue: "Model not found"

**Error**: `Model phi3 not available`

**Fix**:
```bash
ollama pull phi3
```

### Issue: "Slow response / Timeout"

**Possible causes**:
- Model is large and downloading
- First request is slow (loading model into RAM)
- GPU not available, using CPU only

**Solutions**:
- Use `phi3` instead of `llama3.1` (faster)
- Wait for model to load
- Increase timeout in `app.py` (currently 120 seconds)

### Issue: "Resume text extraction failed"

**Error**: `Could not extract text from file`

**Fix**:
- Try a different file format (PDF → DOCX)
- Ensure file is not corrupted
- For scanned PDFs, OCR might fail (pytesseract requires Tesseract installation)

### Issue: React app not loading

**Error**: `Can't reach localhost:3000`

**Fix**:
1. Check if frontend started: `npm start` in client folder
2. Clear cache: `Ctrl+Shift+Delete` in browser
3. Check browser console for errors: `F12`

---

## 🔧 Configuration

### Change Ollama Model

Edit `ml_api/app.py`, line ~650:

```python
OLLAMA_MODEL = "phi3"  # Change this
```

Options:
- `"phi3"` - Fast, good quality (recommended)
- `"llama3.1"` - Powerful, slower
- `"qwen2"` - Fast, multilingual
- `"mistral"` - Creative

### Change Timeout

Edit `ml_api/app.py`, line ~651:

```python
OLLAMA_TIMEOUT = 120  # seconds
```

Increase if responses timeout.

### Change Temperature (Creativity)

Edit `ml_api/app.py`, line ~689:

```python
"temperature": 0.1  # 0 = deterministic, 1 = creative
```

Lower = consistent, Higher = more varied

---

## 📊 Performance Benchmarks

| Model | Speed | Quality | VRAM | Best For |
|-------|-------|---------|------|----------|
| phi3 | 5-10s | Good | 2GB | Fast, general use |
| qwen2 | 8-15s | Good | 4GB | Multilingual |
| llama3.1 | 15-30s | Excellent | 8GB | Detailed analysis |
| mistral | 10-20s | Very Good | 5GB | Creative |

---

## 📝 File Structure

```
resume-analyzer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeUpload.jsx    # ✨ UPDATED - Ollama support
│   │   │   ├── PredictionCard.jsx  # Display results
│   │   │   └── ...
│   │   └── ...
│   └── package.json
│
├── ml_api/                 # Python FastAPI backend
│   ├── app.py              # ✨ UPDATED - Added Ollama endpoints
│   ├── requirements.txt     # ✨ UPDATED - Added 'requests'
│   ├── models/             # ML models (TensorFlow, scikit-learn)
│   └── .env                # Environment variables
│
└── server/                 # Node.js server (optional)
```

---

## 🎓 How It Works

### Ollama Analysis Flow

```
1. User uploads resume (PDF/DOCX/TXT)
   ↓
2. Backend extracts text
   ↓
3. Backend sends to Ollama API (localhost:11434)
   ↓
4. Ollama (local LLM) analyzes resume
   ↓
5. Returns JSON with analysis
   ↓
6. Frontend displays results
```

### Traditional ML Flow

```
1. User uploads resume
   ↓
2. Backend extracts text
   ↓
3. Uses TF-IDF + LSTM models
   ↓
4. Returns skill categories & confidence
   ↓
5. Frontend displays results
```

---

## 🚀 Next Steps

1. ✅ Install Ollama and pull a model
2. ✅ Start Ollama server (`ollama serve`)
3. ✅ Install Python dependencies
4. ✅ Start FastAPI backend
5. ✅ Start React frontend
6. ✅ Test with your resume!

---

## 💡 Tips

- **First run is slow**: Ollama loads model into RAM first time
- **GPU accelerated**: If you have NVIDIA/AMD GPU, Ollama uses it automatically
- **Multiple models**: You can have multiple models installed, switch anytime
- **Offline**: Once model is downloaded, everything runs offline (no cloud calls)
- **Privacy**: Your resume never leaves your computer

---

## 📞 Support

### Check System

```bash
# Is Ollama running?
curl http://localhost:11434/api/tags

# Is backend running?
curl http://localhost:8000/docs

# Is frontend loading?
Open http://localhost:3000 in browser
```

### View Backend Logs

Check FastAPI output for error messages

### View Browser Errors

Press `F12` in browser → Console tab

---

## ✨ Features Included

✅ Resume upload (PDF, DOCX, TXT)
✅ Automatic text extraction
✅ Ollama LLM integration
✅ Traditional ML analysis
✅ Job description matching
✅ Skill extraction
✅ Beautiful React UI
✅ Error handling
✅ Mobile responsive
✅ Dark theme

---

**You're all set! Happy analyzing! 🚀**

