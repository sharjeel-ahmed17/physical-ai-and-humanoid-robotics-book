# Physical AI & Humanoid Robotics RAG Chatbot Backend

A FastAPI-based backend for a Retrieval-Augmented Generation (RAG) chatbot focused on Physical AI and Humanoid Robotics content.

## 🚀 Features

- **RAG (Retrieval-Augmented Generation)**: Semantic search with Qdrant vector database
- **Google Gemini Integration**: Powered by Gemini 1.5 Flash for chat completions
- **Stateless Mode**: Can run without PostgreSQL database (perfect for Hugging Face Spaces)
- **Citations**: Provides source references for all answers
- **CORS Enabled**: Ready for frontend integration
- **Health Monitoring**: Built-in health check endpoint

## 📋 Prerequisites

### Required Services
1. **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Qdrant Vector Database**: Use [Qdrant Cloud](https://cloud.qdrant.io/) or self-hosted
3. **PostgreSQL** (Optional): Only needed if you want to persist conversation history

### Environment Variables

Set these in Hugging Face Space Settings > Repository secrets:

```bash
# Required
GEMINI_API_KEY=your-gemini-api-key
QDRANT_URL=https://your-qdrant-instance.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

# Optional
USE_DATABASE=False  # Set to False for stateless mode
QDRANT_COLLECTION_NAME=humanoid_ai_book
EMBEDDING_MODEL=models/text-embedding-004
CHAT_MODEL=models/gemini-1.5-flash
DEBUG=False
```

## 🛠️ Deployment to Hugging Face Spaces

### Option 1: Direct Deploy (Recommended)

1. Create a new Space on Hugging Face
2. Select "Docker" as the SDK
3. Upload this backend directory
4. Configure secrets in Settings > Repository secrets
5. Deploy!

### Option 2: From GitHub

1. Connect your GitHub repository to Hugging Face Space
2. Point to the `backend` directory
3. Configure secrets
4. Auto-deploy on push

## 🔧 Local Development

### With Database (Full Features)

```bash
# Install dependencies
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env and set:
# USE_DATABASE=True
# DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Run
uvicorn src.api.main:app --reload
```

### Without Database (Stateless Mode)

```bash
# Install dependencies
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env and set:
# USE_DATABASE=False

# Run
uvicorn src.api.main:app --reload
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Chat
```
POST /chat/chat
Body: {
  "query": "What is Physical AI?",
  "session_id": "unique-session-id",
  "query_mode": "book-wide"
}
```

### Content Search
```
POST /content/search
Body: {
  "query": "humanoid robots",
  "limit": 5
}
```

### Content Stats
```
GET /content/stats
```

### Conversations
```
GET /conversations/{session_id}
DELETE /conversations/{session_id}
```

## 🎯 Features Comparison

| Feature | With Database | Without Database |
|---------|--------------|------------------|
| Chat Completions | ✅ | ✅ |
| RAG Search | ✅ | ✅ |
| Citations | ✅ | ✅ |
| Conversation History | ✅ | ❌ |
| Session Persistence | ✅ | ❌ (In-memory only) |

## 🐛 Troubleshooting

### Error: Database Connection Failed

**Solution**: Set `USE_DATABASE=False` in environment variables

### Error: Qdrant Connection Failed

**Solution**: Verify your `QDRANT_URL` and `QDRANT_API_KEY` are correct

### Error: 403 API Key Reported as Leaked

**Solution**: Generate a new Gemini API key from Google AI Studio

### Error: CORS Issues

**Solution**: Update CORS settings in `src/api/main.py` to include your frontend URL

## 📚 Documentation

- Full API documentation available at: `/docs` (Swagger UI)
- Alternative docs: `/redoc` (ReDoc)
- Deployment guide: See `DEPLOYMENT.md`

## 🔒 Security Notes

- Never commit API keys to the repository
- Use environment variables for all sensitive data
- CORS is set to allow all origins (`*`) - restrict in production
- No OpenAI API keys are used (Gemini-only)

## 🌟 Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (Optional) with SQLAlchemy
- **Vector DB**: Qdrant
- **AI Model**: Google Gemini 1.5 Flash
- **Embeddings**: Google text-embedding-004
- **Python**: 3.11

## 📄 License

Part of the Physical AI & Humanoid Robotics educational content.

## 🤝 Support

For issues or questions:
1. Check the deployment guide: `DEPLOYMENT.md`
2. Review logs in Hugging Face Space
3. Verify all environment variables are set correctly
