from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    resource: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    status: str
    log_metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True
