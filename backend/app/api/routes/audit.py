from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["Audit Log"])

@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return audit_service.list_logs(db, limit=limit, skip=skip)
