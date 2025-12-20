# Frontend-Backend Deployment Guide

## 🎯 Current Configuration

### Backend (Hugging Face)
- **URL**: https://sharjeel17-chatbot.hf.space
- **Port**: 7860
- **Status**: ✅ Deployed and Running

### Frontend (Vercel)
- **URL**: https://physical-ai-and-humanoid-robotics-b-six.vercel.app
- **Status**: Ready for deployment

---

## 🔗 Connection Setup Complete

### 1. Frontend Configuration Updated
**File**: `book/src/services/apiClient.js`
- Default API URL changed to Hugging Face backend
- Production: `https://sharjeel17-chatbot.hf.space`
- Local dev: `http://localhost:8000` (via .env.local)

### 2. Backend CORS Updated
**File**: `backend/src/api/main.py`
- Added Vercel domain to allowed origins
- Allows requests from:
  - `https://physical-ai-and-humanoid-robotics-b-six.vercel.app`
  - `http://localhost:3000`
  - `http://localhost:3001`

### 3. Environment Files Created
- `.env.production` - Production config (Vercel)
- `.env.local` - Local development config
- `.env` - Default config

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Hugging Face

```bash
cd backend
git add .
git commit -m "feat: add CORS for Vercel frontend"
git push
```

**Wait for Hugging Face to rebuild** (1-2 minutes)

### Step 2: Deploy Frontend to Vercel

**Option A: Via Git Push (Recommended)**
```bash
cd book
git add .
git commit -m "feat: connect to Hugging Face backend"
git push
```
Vercel will auto-deploy from your GitHub repository.

**Option B: Via Vercel CLI**
```bash
cd book
npm run build
vercel --prod
```

### Step 3: Verify Deployment

1. Visit: https://physical-ai-and-humanoid-robotics-b-six.vercel.app
2. Open browser console (F12)
3. Check for successful API connection
4. Test the chatbot

---

## 🧪 Testing the Connection

### Test 1: Health Check
```javascript
// In browser console
fetch('https://sharjeel17-chatbot.hf.space/health')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-20T...",
  "version": "1.0.0"
}
```

### Test 2: From Frontend
1. Open your Vercel site
2. Click on AI Assistant button
3. Ask: "What is Physical AI?"
4. Should get response with citations

---

## 🔧 Vercel Environment Variables (Optional)

If you want to override in Vercel dashboard:

1. Go to Vercel Project Settings
2. Navigate to Environment Variables
3. Add:
   - **Name**: `REACT_APP_API_BASE_URL`
   - **Value**: `https://sharjeel17-chatbot.hf.space`
   - **Environment**: Production

---

## 🐛 Troubleshooting

### Issue 1: CORS Error
**Error**: "Access-Control-Allow-Origin"

**Solution**:
1. Verify backend CORS includes your Vercel domain
2. Redeploy backend to Hugging Face
3. Clear browser cache

### Issue 2: 404 Not Found
**Error**: "Cannot POST /chat/chat"

**Solution**:
1. Check API base URL in browser console
2. Verify it points to: `https://sharjeel17-chatbot.hf.space`
3. Check .env.production file

### Issue 3: Connection Timeout
**Error**: "Network error: Unable to reach the server"

**Solution**:
1. Check Hugging Face Space is running
2. Visit: https://sharjeel17-chatbot.hf.space/health
3. If down, restart Hugging Face Space

### Issue 4: Chat Not Working
**Check these**:
- Browser console for errors
- Network tab for failed requests
- Backend logs in Hugging Face

---

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│                                             │
│  Vercel Frontend (React/Docusaurus)        │
│  https://physical-ai-and-humanoid...       │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTPS Requests
                   │
┌──────────────────▼──────────────────────────┐
│                                             │
│  Hugging Face Backend (FastAPI)            │
│  https://sharjeel17-chatbot.hf.space       │
│                                             │
├─────────────────────────────────────────────┤
│  ┌──────────────┐    ┌─────────────────┐  │
│  │  Gemini API  │    │  Qdrant Cloud   │  │
│  │   (Chat)     │    │  (Vector Store) │  │
│  └──────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## ✅ Pre-Deployment Checklist

### Backend (Hugging Face)
- [ ] CORS includes Vercel domain
- [ ] Port 7860 configured
- [ ] Database set to stateless mode (`USE_DATABASE=False`)
- [ ] All environment variables set
- [ ] Health endpoint accessible

### Frontend (Vercel)
- [ ] API base URL points to Hugging Face
- [ ] .env.production file exists
- [ ] Build completes without errors
- [ ] Dependencies installed

---

## 🎉 Success Indicators

After deployment, you should see:

1. ✅ Frontend loads on Vercel
2. ✅ AI Assistant button visible
3. ✅ Chat opens without errors
4. ✅ Health check succeeds in console
5. ✅ Questions get responses with citations
6. ✅ No CORS errors in console

---

## 📝 Important Notes

1. **Cold Starts**: Hugging Face Spaces may have 1-2 second cold start delay
2. **Rate Limits**: Gemini API has rate limits, manage accordingly
3. **Timeout**: Frontend has 30s timeout for API requests
4. **Stateless**: No conversation history persists (by design)

---

## 🔗 Useful Links

- Backend: https://sharjeel17-chatbot.hf.space
- Backend Docs: https://sharjeel17-chatbot.hf.space/docs
- Frontend: https://physical-ai-and-humanoid-robotics-b-six.vercel.app
- Health Check: https://sharjeel17-chatbot.hf.space/health
