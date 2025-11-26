# 🚀 Quick Start - 5 Minutes

## What You Have
A complete resume analyzer with **Ollama AI** integration!

---

## Step 1: Install Ollama (2 min)

Visit: https://ollama.com/download

Download for your OS (Windows/Mac/Linux)

Run the installer

---

## Step 2: Start Ollama (1 min)

Open terminal/command prompt and run:

```bash
ollama serve
```

Wait for message:
```
Listening on 127.0.0.1:11434
```

---

## Step 3: Get a Model (1 min)

Open another terminal and run:

```bash
ollama pull phi3
```

Wait for download to complete (~3GB)

---

## Step 4: Start Backend (30 sec)

```bash
cd ml_api
pip install -r requirements.txt  # Only needed once
python app.py
```

See message:
```
INFO: Uvicorn running on http://0.0.0.0:8000
```

---

## Step 5: Start Frontend (30 sec)

Open another terminal:

```bash
cd client
npm install  # Only needed once
npm start
```

Browser opens at http://localhost:3000

---

## ✅ Done! 

### To Use:

1. **Upload** your resume (PDF, DOCX, or TXT)
2. **(Optional)** Paste a job description
3. **Choose** "AI Analysis (Ollama)" button
4. **Wait** 30-120 seconds
5. **See** results!

---

## 🆘 If Something Breaks

| Problem | Fix |
|---------|-----|
| "Ollama not running" | Run `ollama serve` in terminal |
| "Model not found" | Run `ollama pull phi3` |
| Port already in use | Kill other process on that port |
| "Connection refused" | Wait for services to start |

---

## 📊 Two Analysis Methods

### 🤖 Traditional ML (Fast)
- Instant results
- No AI required
- Good for quick checks

**Button:** "Traditional ML"

### ✨ Ollama AI (Smart)
- Context-aware analysis
- Better understanding
- Improvement suggestions
- Takes 30-120 seconds

**Button:** "AI Analysis (Ollama)"

---

## 📁 What Each Terminal Does

**Terminal 1**: `ollama serve`
- Runs local AI model server
- Keep running while using app
- Port 11434

**Terminal 2**: `python app.py`
- Backend API server
- Keep running while using app
- Port 8000

**Terminal 3**: `npm start`
- React frontend
- Opens browser automatically
- Port 3000

---

## 🎯 Verify It Works

Open browser console (F12) and check:

```javascript
// Check backend
fetch('http://localhost:8000/ollama/status')
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "status": "connected",
  "available": true,
  "models": ["phi3:latest"]
}
```

---

## 💡 Model Options

```bash
ollama pull phi3      # Fast, good quality (RECOMMENDED)
ollama pull qwen2     # Fast, multilingual
ollama pull llama3.1  # Powerful, slower
ollama pull mistral   # Creative, good quality
```

Change model in `ml_api/app.py` line 656:
```python
OLLAMA_MODEL = "phi3"  # Change here
```

---

## 📖 More Details

- `OLLAMA_SETUP.md` - Complete setup & troubleshooting
- `IMPLEMENTATION_COMPLETE.md` - What was built

---

## 🎉 You're Ready!

Upload a resume and get started! 🚀

