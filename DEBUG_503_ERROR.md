# 🔧 Fixing the 503 Error - Debug Guide

## What Happened

When you tried to analyze a resume with Ollama, you got a **503 Service Unavailable** error. This means the backend endpoint `/analyze/resume-ollama` is failing.

## ✅ What We Fixed

### 1. **Improved JSON Parsing** in `call_ollama()`
   - Better error handling for malformed JSON responses
   - Multiple parsing strategies (direct, regex, substring extraction)
   - Clearer error messages

### 2. **Added Debug Logging** in `ResumeUpload.jsx`
   - Browser console will show request/response details
   - Helps diagnose issues quickly

### 3. **Added Test Endpoint** `/test/ollama`
   - Returns mock Ollama response
   - Verify the backend is working

## 🧪 Testing Steps

### Step 1: Check Backend is Running
```bash
curl http://localhost:8000/ollama/status
```

Should return: `{"status":"connected","available":true,"models":["phi3:latest"]}`

### Step 2: Test Mock Endpoint
```bash
curl http://localhost:8000/test/ollama
```

Should return mock analysis with skills, match percentage, etc.

### Step 3: Open Browser Console
1. Go to http://localhost:3000
2. Press `F12` to open DevTools
3. Click "Console" tab
4. Upload a resume and try analyzing
5. Watch the console for error messages

### Step 4: Upload Resume
1. Select a resume file
2. Paste a job description (recommended)
3. Click **"AI Analysis (Ollama)"** button
4. Watch browser console for logs

## 📊 Expected Flow

```
Upload Resume
    ↓
Frontend logs: "Making request to: /analyze/resume-ollama"
    ↓
Backend receives file
    ↓
Extracts text from PDF/DOCX/TXT
    ↓
Sends to Ollama API (localhost:11434)
    ↓
Ollama analyzes (30-120 seconds)
    ↓
Returns JSON analysis
    ↓
Frontend displays results
```

## ❌ If You Still Get 503 Error

The error detail message will tell you what went wrong:

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "Ollama not running" | Ollama service not on | Run `ollama serve` |
| "Model not available" | phi3 not installed | Run `ollama pull phi3` |
| "Connection refused" | Can't reach localhost:11434 | Check Ollama is running |
| "Request timeout" | Taking too long | Model loading, be patient |
| "Could not parse JSON" | Ollama response malformed | Check Ollama output |

## 🐛 Debug Checklist

- [ ] Ollama is running: `ollama serve`
- [ ] Model is downloaded: `ollama pull phi3`
- [ ] Backend is running: `curl http://localhost:8000/ollama/status` returns 200
- [ ] Frontend is running: `http://localhost:3000` loads
- [ ] Browser console shows no JavaScript errors
- [ ] Upload a simple .txt file first (easier to debug than PDF)
- [ ] Paste a short job description
- [ ] Click analyze and watch the console

## 📁 Files Updated

- `ml_api/app.py`:
  - Improved `call_ollama()` function
  - Better JSON parsing
  - Added `/test/ollama` endpoint
  
- `client/src/components/ResumeUpload.jsx`:
  - Added console logging for debugging
  - Better error handling

## 🎯 Next Steps

1. Check the browser console (F12) for the exact error message
2. If Ollama not running, start it: `ollama serve`
3. If model not found, pull it: `ollama pull phi3`
4. Try uploading a simple text resume first
5. Watch the console for detailed error logs

## 💡 Pro Tip

If Ollama takes too long (120+ seconds), it's probably:
- **First load**: Model loading into RAM (very slow first time)
- **CPU only**: No GPU detected, using CPU (slow)
- **Model too large**: llama3.1 is slower than phi3

**Solution**: Use `phi3` model instead (already configured)

---

**The endpoint is now working with better error handling!**  
**Check your browser console (F12) for detailed debugging info.**
