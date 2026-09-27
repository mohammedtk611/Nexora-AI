from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel

class ArtifactResponse(BaseModel):
    id: str
    transformation_id: str
    type: str
    status: str
    title: str
    content: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None
    mime_type: Optional[str] = None
    size: int = 0
    validation_status: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ArtifactRegenerateRequest(BaseModel):
    custom_instructions: Optional[str] = None
