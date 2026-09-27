from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class AgentProgressStatus(BaseModel):
    name: str
    status: str  # pending, running, completed, failed
    error: Optional[str] = None

class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # queued, running, completed, failed, cancelled
    current_stage: str
    agents: List[AgentProgressStatus] = []
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = {}
