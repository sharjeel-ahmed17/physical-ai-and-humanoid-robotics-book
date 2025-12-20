# Hugging Face Deployment - Quick Setup Guide

## 🎯 Problem Solved

Your backend was failing on Hugging Face with:
```
psycopg2.OperationalError: connection to server at "localhost" (127.0.0.1), port 5432 failed
```

**Root Cause**: PostgreSQL was required but not available on Hugging Face Spaces.

**Solution**: Made database optional - backend can now run in stateless mode.

## ✅ Changes Made

### 1. **Database Made Optional** (backend/src/database/database.py)
- Database connection is now optional
- Graceful fallback if PostgreSQL is unavailable
- Logs warnings instead of crashing
- Application continues in stateless mode

### 2. **Configuration Updated** (backend/src/config/settings.py)
- Added `USE_DATABASE` flag (default: True for local, False for cloud)
- Made `DATABASE_URL` optional
- Backward compatible with existing setups

### 3. **Environment Variables** (backend/.env.example)
```bash
USE_DATABASE=False  # New flag for Hugging Face
DATABASE_URL=       # Optional
```

### 4. **Docker Configuration** (backend/Dockerfile)
- **Fixed port to 7860** (Hugging Face requirement)
- Added health check on port 7860
- Non-root user for security
- Optimized for Hugging Face Spaces

### 5. **Documentation Created**
- `DEPLOYMENT.md` - Detailed deployment guide
- `README_HUGGINGFACE.md` - Hugging Face specific README
- `HUGGINGFACE_SETUP.md` - This quick setup guide

## 🚀 Deploy to Hugging Face NOW

### Step 1: Set Environment Variables

In your Hugging Face Space > Settings > Repository secrets, add:

```bash
# Required
USE_DATABASE=False
GEMINI_API_KEY=AIzaSyDgR-nNnU-63kzHMHL8nqX_emKpsrtM8cs
QDRANT_URL=https://e55cfc43-4305-404e-9902-943e27319128.europe-west3-0.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.WiC3WupqiKbu_zXytQ5kzAQAj-0r05LVoiiZQEjUjRg

# Optional (with your values above as defaults)
QDRANT_COLLECTION_NAME=humanoid_ai_book
EMBEDDING_MODEL=models/text-embedding-004
CHAT_MODEL=models/gemini-1.5-flash
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-3.5-turbo
DEBUG=False
```

### Step 2: Push to Hugging Face

```bash
cd backend
git add .
git commit -m "feat: add stateless mode support for Hugging Face"
git push
```

### Step 3: Verify Deployment

After deployment:
1. Check logs - should see: "Database disabled - running in stateless mode"
2. **Important**: Backend will be available on port **7860** (Hugging Face default)
3. Visit: `https://your-space.hf.space/health`
4. Test: `https://your-space.hf.space/docs`

**Note**: Hugging Face automatically exposes port 7860. Your Dockerfile is configured correctly!

## 🎮 Features Available in Stateless Mode

| Feature | Status | Notes |
|---------|--------|-------|
| Chat Completions | ✅ Working | Full RAG support |
| Vector Search | ✅ Working | Via Qdrant Cloud |
| Citations | ✅ Working | Source references included |
| Health Check | ✅ Working | /health endpoint |
| API Documentation | ✅ Working | /docs and /redoc |
| Conversation History | ❌ Not Persisted | In-memory only, lost on restart |
| User Sessions | ⚠️ Temporary | Not persisted between restarts |

## 🔄 What Changed vs Local

### Local Development (With Database)
```bash
USE_DATABASE=True
DATABASE_URL=postgresql://...
```
- Conversations persisted in PostgreSQL
- Session history maintained
- Full database features

### Hugging Face (Stateless)
```bash
USE_DATABASE=False
# No DATABASE_URL needed
```
- No PostgreSQL required
- Conversations work but not saved
- Lower resource usage
- Faster startup

## 🧪 Test Locally Without Database

```bash
# Terminal 1: Start backend in stateless mode
cd backend
export USE_DATABASE=False
uvicorn src.api.main:app --reload

# Terminal 2: Test
curl http://localhost:8000/health
curl -X POST http://localhost:8000/chat/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Physical AI?", "session_id": "test", "query_mode": "book-wide"}'
```

## ⚠️ Important Notes

1. **API Keys Security**
   - Never commit API keys to git
   - Use Hugging Face Secrets only
   - Rotate keys if exposed

2. **CORS Settings**
   - Currently allows all origins (`*`)
   - Update in `src/api/main.py` for production
   - Add your frontend URL to allowed origins

3. **Qdrant Collection**
   - Must exist before deployment
   - Collection name: `humanoid_ai_book`
   - Should contain your book embeddings

4. **Resource Limits**
   - Free tier has 2 CPU, 16GB RAM
   - Recommended: 1 worker, timeout 30s
   - Monitor usage in Hugging Face dashboard

## 🐛 Common Errors & Solutions

### Error: "Database connection failed"
✅ **Solution**: Set `USE_DATABASE=False`

### Error: "Qdrant connection timeout"
✅ **Solution**: Check `QDRANT_URL` and `QDRANT_API_KEY`

### Error: "Collection not found"
✅ **Solution**: Create collection in Qdrant first, or update `QDRANT_COLLECTION_NAME`

### Error: "API key leaked"
✅ **Solution**: Generate new Gemini API key

## 📊 Monitoring

Check these in Hugging Face:
- **Logs**: Watch for "Database disabled - running in stateless mode"
- **Health**: Visit `/health` endpoint
- **Metrics**: CPU and memory usage in dashboard

## 🎉 Success Checklist

- [ ] Environment variables set in Hugging Face Secrets
- [ ] `USE_DATABASE=False` configured
- [ ] Backend deployed and running
- [ ] Logs show "stateless mode"
- [ ] `/health` endpoint returns healthy status
- [ ] `/docs` shows API documentation
- [ ] Chat endpoint responds correctly
- [ ] Citations are returned

## 🔗 Next Steps

1. Update frontend to use Hugging Face backend URL
2. Configure CORS for your frontend domain
3. Monitor logs and usage
4. (Optional) Add PostgreSQL cloud database if you need persistence

## 📚 Documentation Files

- `DEPLOYMENT.md` - Full deployment guide
- `README_HUGGINGFACE.md` - Hugging Face README
- `backend/.env.example` - Environment variable template
- `backend/Dockerfile` - Container configuration
