import httpx
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.core.config import settings

router = APIRouter(tags=["Health"])

def check_health(db: Session = None) -> Dict[str, Any]:
    status_dict = {
        "status": "healthy",
        "services": {
            "postgres": "unknown",
            "redis": "unknown",
            "qdrant": "unknown",
            "gemini": "configured" if (settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here") else "unconfigured",
            "ollama": "unknown"
        }
    }

    # DB check
    if db:
        try:
            db.execute(text("SELECT 1"))
            status_dict["services"]["postgres"] = "healthy"
        except Exception as e:
            status_dict["services"]["postgres"] = f"unhealthy ({str(e)})"
            status_dict["status"] = "degraded"

    # Redis check
    try:
        import redis
        r = redis.from_url(settings.REDIS_URL, socket_timeout=2.0)
        if r.ping():
            status_dict["services"]["redis"] = "healthy"
    except Exception:
        status_dict["services"]["redis"] = "offline (fallback in-memory mode active)"

    # Qdrant check
    try:
        with httpx.Client(timeout=2.0) as client:
            res = client.get(f"{settings.QDRANT_URL.rstrip('/')}/healthz")
            if res.status_code == 200:
                status_dict["services"]["qdrant"] = "healthy"
            else:
                status_dict["services"]["qdrant"] = "unhealthy"
    except Exception:
        status_dict["services"]["qdrant"] = "offline (in-memory vector store active)"

    # Ollama check
    try:
        with httpx.Client(timeout=2.0) as client:
            res = client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            if res.status_code == 200:
                status_dict["services"]["ollama"] = "healthy"
            else:
                status_dict["services"]["ollama"] = "unresponsive"
    except Exception:
        status_dict["services"]["ollama"] = "offline"

    return status_dict

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    return check_health(db)

@router.get("/api/v1/health")
def api_v1_health_check(db: Session = Depends(get_db)):
    return check_health(db)
