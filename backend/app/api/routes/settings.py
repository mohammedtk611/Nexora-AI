from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.models.user import User
from app.core.config import settings
from app.schemas.settings import SettingsResponse, SettingsUpdateRequest

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsResponse)
def get_settings(current_user: User = Depends(get_current_user)):
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here")
    return SettingsResponse(
        app_name=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        llm_provider=settings.LLM_PROVIDER,
        gemini_model=settings.GEMINI_MODEL,
        gemini_fast_model=settings.GEMINI_FAST_MODEL,
        ollama_base_url=settings.OLLAMA_BASE_URL,
        ollama_model=settings.OLLAMA_MODEL,
        qdrant_url=settings.QDRANT_URL,
        qdrant_collection=settings.QDRANT_COLLECTION,
        has_gemini_api_key=has_key
    )

@router.patch("", response_model=SettingsResponse)
def update_settings(
    request: SettingsUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    if request.llm_provider is not None:
        settings.LLM_PROVIDER = request.llm_provider
    if request.gemini_model is not None:
        settings.GEMINI_MODEL = request.gemini_model
    if request.gemini_fast_model is not None:
        settings.GEMINI_FAST_MODEL = request.gemini_fast_model
    if request.ollama_base_url is not None:
        settings.OLLAMA_BASE_URL = request.ollama_base_url
    if request.ollama_model is not None:
        settings.OLLAMA_MODEL = request.ollama_model

    return get_settings(current_user=current_user)
