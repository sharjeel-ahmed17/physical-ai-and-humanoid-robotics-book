from sqlalchemy import Column, String, DateTime, Integer, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class ChatResponse(Base):
    __tablename__ = "chat_responses"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    response_text = Column(Text, nullable=False)
    citations = Column(JSON)  # JSON array of citation objects
    confidence_score = Column(Float)  # 0.0-1.0
    response_time_ms = Column(Integer)  # response time in milliseconds
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON)  # JSON for model used, tokens, etc.