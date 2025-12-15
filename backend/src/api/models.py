from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class UserQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=2000, description="The user's question or query")
    session_id: str = Field(..., description="Unique identifier for the user session")
    query_mode: str = Field("book-wide", description="Query mode: 'book-wide' or 'selected-text'")
    selected_text: Optional[str] = Field(None, max_length=5000, description="Text selected by user (for selected-text mode)")


class Citation(BaseModel):
    source_url: str
    title: str
    text: str
    relevance_score: float
    formatted: str


class ChatResponse(BaseModel):
    id: str
    response: str
    citations: List[Citation]
    confidence_score: Optional[float] = None
    created_at: datetime


class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]
    citations: List[Citation] = []


class ConversationHistoryResponse(BaseModel):
    session_id: str
    messages: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class ContentSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="Search query")
    limit: int = Field(10, ge=1, le=50, description="Number of results to return")
    filters: Optional[Dict[str, Any]] = Field(None, description="Additional filters for search")


class ContentSearchResponse(BaseModel):
    query: str
    results: List[Dict[str, Any]]
    total_count: int


class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    timestamp: datetime
    version: str = "1.0.0"