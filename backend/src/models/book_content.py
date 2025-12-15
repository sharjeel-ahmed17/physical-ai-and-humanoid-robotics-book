from sqlalchemy import Column, String, DateTime, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class BookContent(Base):
    __tablename__ = "book_content"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_type = Column(SQLEnum("chapter", "section", "subsection", "paragraph", name="content_type_enum"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # the actual content
    chunk_text = Column(String, nullable=False)  # processed chunk for embedding
    source_url = Column(String, nullable=False)  # URL in the book
    page_number = Column(Integer)  # optional
    hierarchy_path = Column(String)  # e.g., "Chapter 3/Section 2.1"
    embedding_id = Column(String, unique=True, nullable=False)  # reference to vector database
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)