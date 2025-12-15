# Quickstart Guide: Integrated RAG Chatbot

## Overview
This guide provides a quick setup for the Integrated RAG Chatbot system that enables Q&A functionality for the Physical AI & Humanoid Robotics book.

## Prerequisites
- Python 3.11+
- Node.js 18+ (for Docusaurus)
- Docker (for local development)
- OpenAI API key
- Qdrant Cloud account
- Neon Postgres account

## Local Development Setup

### 1. Backend Setup
```bash
# Clone the repository
git clone <repo-url>
cd <repo-name>

# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-key"
export QDRANT_URL="your-qdrant-url"
export QDRANT_API_KEY="your-qdrant-api-key"
export DATABASE_URL="your-neon-postgres-url"

# Run the backend
uvicorn src.api.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set environment variables in .env
REACT_APP_API_BASE_URL="http://localhost:8000"

# Start the development server
npm start
```

### 3. Content Ingestion
```bash
# Run the content ingestion pipeline
cd backend
python -m src.services.content_ingestion_service --source-path "../book/docs"
```

## API Usage Examples

### Basic Q&A
```bash
curl -X POST http://localhost:8000/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the main principles of humanoid robotics?",
    "session_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "query_mode": "book-wide"
  }'
```

### Selected-Text Q&A
```bash
curl -X POST http://localhost:8000/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain this concept further",
    "session_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "query_mode": "selected-text",
    "selected_text": "The main principles of humanoid robotics include..."
  }'
```

## Docusaurus Integration

To integrate the chatbot widget into your Docusaurus site:

1. Install the chatbot plugin:
```bash
npm install @physical-ai/chatbot-widget
```

2. Add to your Docusaurus config:
```javascript
// docusaurus.config.js
module.exports = {
  plugins: [
    [
      '@physical-ai/chatbot-widget',
      {
        apiUrl: 'http://localhost:8000',
        // Additional configuration options
      },
    ],
  ],
};
```

3. The widget will appear on all documentation pages automatically.

## Testing
```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd frontend
npm test
```

## Key Endpoints

- `POST /chat/completions` - Main chat endpoint
- `GET /chat/conversations?session_id=xxx` - Get conversation history
- `POST /content/search` - Search book content
- `GET /health` - Health check

## Configuration

Environment variables for the backend:
- `OPENAI_API_KEY` - OpenAI API key
- `QDRANT_URL` - Qdrant vector database URL
- `QDRANT_API_KEY` - Qdrant API key
- `DATABASE_URL` - Neon Postgres connection string
- `EMBEDDING_MODEL` - Embedding model to use (default: text-embedding-3-small)
- `MAX_TOKENS` - Maximum tokens for responses (default: 1000)
- `TEMPERATURE` - OpenAI temperature setting (default: 0.1)