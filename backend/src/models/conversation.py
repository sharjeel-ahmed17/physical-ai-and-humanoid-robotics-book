from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(PostgresUUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    turn_number = Column(Integer, nullable=False)  # sequence in conversation
    user_query_id = Column(PostgresUUID(as_uuid=True), ForeignKey("user_queries.id"), nullable=False)
    chat_response_id = Column(PostgresUUID(as_uuid=True), ForeignKey("chat_responses.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)