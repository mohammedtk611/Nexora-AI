import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "Revamp AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # gemini or ollama
    GEMINI_API_KEY: Optional[str] = Field(default=None)
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_FAST_MODEL: str = "gemini-1.5-flash"


    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    # Vector Database
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "revamp_kb"

    # Database
    DATABASE_URL: str = "sqlite:///./storage/revamp_ai.db"
    # Can also be PostgreSQL URL e.g. postgresql://postgres:postgres@localhost:5432/revamp_ai

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security & Auth
    SECRET_KEY: str = "super-secret-key-change-in-production-min-32-chars-long"
    JWT_SECRET_KEY: str = "super-jwt-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Storage
    STORAGE_PATH: str = "./storage"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def origins_list(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return [self.FRONTEND_URL]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
