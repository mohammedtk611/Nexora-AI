from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ProvenanceItem(BaseModel):
    fact: str
    source_file: str = "source_doc"
    source_document_id: str = "doc_source"
    source_type: str = "document"  # pdf, docx, txt, ocr, audio, url
    quote_snippet: Optional[str] = None
    raw_text_snippet: Optional[str] = None
    confidence: float = 1.0
    confidence_score: float = 1.0

class FactConflict(BaseModel):
    field_name: str = "fact"
    fact_a: str = ""
    fact_b: str = ""
    source_a: str = "Doc 1"
    source_b: str = "Doc 2"
    conflicting_values: List[str] = []
    description: str
    resolution_status: str = "unresolved"  # unresolved, user_resolved

class ICOSchema(BaseModel):
    version: int = 1
    status: str = "draft"  # draft, review, approved
    detected_intent: str = "incident_report"  # incident_report, disaster_management, vulnerability_advisory, etc.
    user_intent: Optional[str] = None
    
    # Core Extraction Fields
    core_topic: str = ""
    executive_summary: str = ""
    key_findings: List[Any] = []
    key_facts: List[Any] = []
    entities: List[Any] = []
    threat_indicators: List[Any] = []
    affected_systems: List[Any] = []
    timeline: List[Any] = []
    technical_details: List[Any] = []
    urgency_level: str = "high"  # critical, high, medium, low
    severity: str = "HIGH"
    business_impact: str = ""
    operational_risk: str = ""
    recommended_actions: List[Any] = []
    recommendations: List[Any] = []
    references: List[Any] = []
    
    # Provenance & RAG Knowledge
    provenance: List[ProvenanceItem] = []
    conflicts: List[FactConflict] = []
    retrieved_knowledge: List[Dict[str, Any]] = []  # Separate RAG knowledge facts
    confidence: Dict[str, Any] = {"overall": 0.95, "grounding": 0.98}
    confidence_score: float = 0.95

# Backwards compatibility alias
CentralContextSchema = ICOSchema

class TransformationCreateRequest(BaseModel):
    project_id: str
    source_document_ids: List[str]
    user_intent: Optional[str] = None
    target_audience: str = Field(default="executive", description="technical, executive, general_public, defense")
    tone: str = Field(default="formal", description="urgent, formal, educational, neutral, threat_alert")
    objective: str = Field(default="action_required", description="action_required, information_dissemination, policy_compliance")
    urgency_level: str = Field(default="high", description="critical, high, medium, low")
    language: str = Field(default="English")
    output_formats: List[str] = Field(
        default=["executive_brief", "advisory", "social", "presentation", "infographic", "video"],
        description="executive_brief, advisory, social, presentation, infographic, video"
    )

class TransformationCreateResponse(BaseModel):
    transformation_id: str
    job_id: str
    status: str = "queued"

class ICOUpdateRequest(BaseModel):
    user_intent: Optional[str] = None
    core_topic: Optional[str] = None
    executive_summary: Optional[str] = None
    key_findings: Optional[List[str]] = None
    entities: Optional[List[str]] = None
    threat_indicators: Optional[List[str]] = None
    affected_systems: Optional[List[str]] = None
    timeline: Optional[List[str]] = None
    technical_details: Optional[List[str]] = None
    urgency_level: Optional[str] = None
    business_impact: Optional[str] = None
    operational_risk: Optional[str] = None
    recommended_actions: Optional[List[str]] = None
    references: Optional[List[str]] = None
    conflicts: Optional[List[FactConflict]] = None

class ICOApproveRequest(BaseModel):
    approved_by: Optional[str] = "analyst"

class TransformationResponse(BaseModel):
    id: str
    project_id: str
    status: str
    current_stage: str
    detected_intent: Optional[str] = "security_alert"
    user_intent: Optional[str] = None
    ico_status: Optional[str] = "approved"
    ico_version: Optional[int] = 1
    target_audience: str
    tone: str
    objective: str
    urgency_level: str
    language: str
    output_formats: List[str]
    source_document_ids: List[str]
    central_context: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

