from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

from ..config.settings import settings
from ..database.database import init_db
from ..utils.logging import setup_logging
from ..utils.gemini_agents_provider import validate_no_openai_key, configure_global_gemini_provider
from .endpoints import chat, content, conversations
from .models import HealthCheckResponse
from datetime import datetime


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI lifespan event handler
    """
    # Startup
    setup_logging()

    # Validate that no OpenAI API key is present
    validate_no_openai_key()
    logging.info("Validated no OpenAI API key is present")

    # Configure the global Gemini provider to monkey-patch the OpenAI client
    configure_global_gemini_provider()
    logging.info("Configured global Gemini provider")

    logging.info("Initializing database...")
    init_db()
    logging.info("Database initialized successfully")

    yield

    # Shutdown
    logging.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Integrated RAG Chatbot API",
    description="API for the Physical AI & Humanoid Robotics book Q&A system",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
# Allow requests from Vercel frontend and local development
allowed_origins = [
    "https://physical-ai-and-humanoid-robotics-b-six.vercel.app",  # Vercel production
    "http://localhost:3000",  # Local development
    "http://localhost:3001",  # Local development (alternate port)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(content.router, prefix="/content", tags=["content"])
app.include_router(conversations.router, prefix="/conversations", tags=["conversations"])


@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint
    """
    return {"message": "Integrated RAG Chatbot API", "version": "1.0.0"}


@app.get("/health", response_model=HealthCheckResponse, tags=["health"])
async def health_check():
    """
    Health check endpoint
    """
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.utcnow()
    )


# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)