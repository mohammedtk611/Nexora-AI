from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.transformation import CentralContextSchema

class AgentProgress(BaseModel):
    name: str
    status: str  # pending, running, completed, failed
    error: Optional[str] = None

class TransformationState(BaseModel):
    transformation_id: str
    project_id: str
    source_document_ids: List[str] = []
    source_texts: List[str] = []
    raw_text: Optional[str] = None
    
    # Transformation parameters
    target_audience: str = "executive"
    tone: str = "formal"
    objective: str = "action_required"
    urgency_level: str = "high"
    language: str = "English"
    output_formats: List[str] = []

    # Shared authoritative source of truth
    central_context: Optional[CentralContextSchema] = None
    rag_passages: List[Dict[str, Any]] = []

    # Generated output artifacts content
    executive_brief: Optional[Dict[str, Any]] = None
    advisory: Optional[Dict[str, Any]] = None
    social: Optional[Dict[str, Any]] = None
    presentation: Optional[Dict[str, Any]] = None
    infographic: Optional[Dict[str, Any]] = None
    video_script: Optional[Dict[str, Any]] = None

    # Compliance validation result
    compliance_report: Optional[Dict[str, Any]] = None

    # Rendered artifact file paths
    rendered_files: Dict[str, str] = {}

    # Tracking
    current_stage: str = "queued"
    agent_progress: Dict[str, AgentProgress] = {}
    error: Optional[str] = None
