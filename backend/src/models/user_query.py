from sqlalchemy import Column, String, DateTime, Text, JSON, UUID, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class UserQuery(Base):
    __tablename__ = "user_queries"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_text = Column(String, nullable=False)  # 2-2000 characters will be validated at application level
    query_mode = Column(SQLEnum("book-wide", "selected-text", name="query_mode_enum"), nullable=False)
    selected_text = Column(Text)  # Optional, 0-5000 characters will be validated at application level
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(PostgresUUID(as_uuid=True), nullable=False)  # Foreign key to Session
    metadata_json = Column(JSON)  # JSON for source page, user context, etc.