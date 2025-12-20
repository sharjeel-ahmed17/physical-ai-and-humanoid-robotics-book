# Deployment Guide for Hugging Face Spaces

## Quick Deploy to Hugging Face

### 1. Environment Variables (Hugging Face Secrets)

Set these in your Hugging Face Space Settings > Repository secrets:

```bash
# Required
GEMINI_API_KEY=your-gemini-api-key
QDRANT_URL=your-qdrant-cloud-url
QDRANT_API_KEY=your-qdrant-api-key

# Optional
USE_DATABASE=False
EMBEDDING_MODEL=models/text-embedding-004
CHAT_MODEL=models/gemini-1.5-flash
QDRANT_COLLECTION_NAME=humanoid_ai_book
DEBUG=False
```

### 2. Dockerfile for Hugging Face

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 7860

# Run the application
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 3. Key Configuration for Cloud Deployment

**Database:** Set `USE_DATABASE=False` to run without PostgreSQL (stateless mode)

**Features in Stateless Mode:**
- ✅ Chat completions work
- ✅ RAG (Retrieval-Augmented Generation) works
- ✅ Vector search works
- ✅ Citations work
- ❌ Conversation history is NOT persisted between restarts
- ❌ User sessions are temporary

**To Enable Database (Optional):**
1. Use a cloud PostgreSQL service (like Neon, Supabase, or Railway)
2. Set `USE_DATABASE=True`
3. Set `DATABASE_URL=postgresql://user:pass@host:port/dbname`

### 4. Testing Locally Without Database

```bash
# Set environment variable
export USE_DATABASE=False

# Or in .env file
USE_DATABASE=False

# Start the server
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

### 5. Verify Deployment

After deployment, check:
- Health endpoint: `https://your-space.hf.space/health`
- API docs: `https://your-space.hf.space/docs`
- Root endpoint: `https://your-space.hf.space/`

### 6. Common Issues

**Issue:** Database connection error on startup
**Solution:** Ensure `USE_DATABASE=False` is set in environment variables

**Issue:** CORS errors from frontend
**Solution:** Update CORS settings in `main.py` to include your frontend URL

**Issue:** Timeout errors
**Solution:** Increase `TIMEOUT` value in environment variables

### 7. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `USE_DATABASE` | No | True | Enable/disable database |
| `DATABASE_URL` | No | None | PostgreSQL connection string |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `QDRANT_URL` | Yes | - | Qdrant vector DB URL |
| `QDRANT_API_KEY` | Yes | - | Qdrant API key |
| `QDRANT_COLLECTION_NAME` | No | book_content | Collection name |
| `EMBEDDING_MODEL` | No | models/text-embedding-004 | Embedding model |
| `CHAT_MODEL` | No | models/gemini-1.5-flash | Chat model |
| `DEBUG` | No | False | Enable debug logging |

### 8. Performance Optimization for Hugging Face

```bash
# Recommended settings for free tier
API_WORKERS=1
MAX_TOKENS=1000
TIMEOUT=30
MAX_RETRIES=3
```

### 9. Monitoring

Check logs in Hugging Face Space:
- Click on "Logs" tab
- Look for startup messages
- Verify "Database disabled - running in stateless mode" appears
