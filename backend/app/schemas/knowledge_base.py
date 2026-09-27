from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel

class KnowledgeDocumentResponse(BaseModel):
    id: str
    project_id: Optional[str] = None
    title: str
    source_type: str
    chunk_count: int
    meta_info: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class KnowledgeIndexRequest(BaseModel):
    project_id: Optional[str] = None
    title: str
    content: str
    source_type: str = "text"
    metadata: Optional[Dict[str, Any]] = None

class KnowledgeSearchRequest(BaseModel):
    query: str
    project_id: Optional[str] = None
    top_k: int = 5
    score_threshold: float = 0.3

class KnowledgeSearchResult(BaseModel):
    score: float
    chunk_text: str
    metadata: Dict[str, Any]
