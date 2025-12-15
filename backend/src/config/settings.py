from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import Field


class Settings(BaseSettings):
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 1
    debug: bool = False

    # Database Settings
    database_url: str

    # Qdrant Settings
    qdrant_url: str
    qdrant_api_key: Optional[str] = None
    qdrant_collection_name: str = "book_content"

    # Google AI Settings - using alias for GEMINI_API_KEY
    google_api_key: str = Field(alias="GEMINI_API_KEY")
    google_embedding_model: str = Field(default="models/text-embedding-004", alias="EMBEDDING_MODEL")
    google_chat_model: str = Field(default="models/gemini-1.5-flash", alias="CHAT_MODEL")

    # Google Generative Language API Settings
    google_api_base_url: Optional[str] = "https://generativelanguage.googleapis.com/v1beta/"
    # These also use aliases for the environment variables
    embedding_model: str = Field(default="models/text-embedding-004", alias="EMBEDDING_MODEL")
    chat_model: str = Field(default="models/gemini-1.5-flash", alias="CHAT_MODEL")

    # OpenRouter Settings
    openrouter_api_key: Optional[str] = Field(default=None, alias="OPENROUTER_API_KEY")
    openrouter_model: Optional[str] = Field(default="google/gemini-pro", alias="OPENROUTER_MODEL")

    # Application Settings
    max_tokens: int = 1000
    temperature: float = 0.1
    timeout: int = 30
    max_retries: int = 3

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()