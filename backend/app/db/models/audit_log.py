import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # login, create_project, upload_document, etc.
    resource = Column(String(100), nullable=False)
    resource_id = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    status = Column(String(50), default="success")  # success, failure
    log_metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
