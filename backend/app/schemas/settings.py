from typing import Optional
from pydantic import BaseModel

class SettingsResponse(BaseModel):
    app_name: str
    environment: str
    llm_provider: str
    gemini_model: str
    gemini_fast_model: str
    ollama_base_url: str
    ollama_model: str
    qdrant_url: str
    qdrant_collection: str
    has_gemini_api_key: bool

class SettingsUpdateRequest(BaseModel):
    llm_provider: Optional[str] = None
    gemini_model: Optional[str] = None
    gemini_fast_model: Optional[str] = None
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None
