from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.db.models.audit_log import AuditLog

class AuditService:
    def log_action(
        self,
        db: Session,
        action: str,
        resource: str,
        user_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        status: str = "success",
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            ip_address=ip_address,
            status=status,
            log_metadata=metadata or {}
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    def list_logs(self, db: Session, limit: int = 50, skip: int = 0) -> List[AuditLog]:
        return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

audit_service = AuditService()
