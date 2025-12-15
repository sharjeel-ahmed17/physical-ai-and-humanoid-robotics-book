from sqlalchemy import Column, String, DateTime, Integer, Float, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class Citation(Base):
    __tablename__ = "citations"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_response_id = Column(PostgresUUID(as_uuid=True), ForeignKey("chat_responses.id"), nullable=False)
    book_content_id = Column(PostgresUUID(as_uuid=True), ForeignKey("book_content.id"), nullable=False)
    citation_text = Column(String, nullable=False)  # the cited text
    source_url = Column(String, nullable=False)  # link to source
    relevance_score = Column(Float)  # 0.0-1.0
    created_at = Column(DateTime, default=datetime.utcnow)