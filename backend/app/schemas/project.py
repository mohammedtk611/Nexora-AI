from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

