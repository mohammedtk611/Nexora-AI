import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base

class Transformation(Base):
    __tablename__ = "transformations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    status = Column(String(50), default="queued")  # queued, running, completed, failed, cancelled
    current_stage = Column(String(100), default="queued")
    
    # Configurations
    detected_intent = Column(String(100), default="security_alert")
    user_intent = Column(String(100), nullable=True)
    ico_status = Column(String(50), default="approved")  # draft, review, approved
    ico_version = Column(Integer, default=1)
    target_audience = Column(String(100), default="executive")
    tone = Column(String(100), default="formal")
    objective = Column(String(100), default="action_required")
    urgency_level = Column(String(50), default="high")
    language = Column(String(50), default="English")
    output_formats = Column(JSON, default=list)  # list of requested formats
    source_document_ids = Column(JSON, default=list)

    central_context = Column(JSON, nullable=True)  # Formal Intent Context Object (ICO)
    ico_data = Column(JSON, nullable=True)  # Versioned ICO payload
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="transformations")
    agent_runs = relationship("AgentRun", back_populates="transformation", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="transformation", cascade="all, delete-orphan")
    ico_versions = relationship("ICOVersion", back_populates="transformation", cascade="all, delete-orphan")


class ICOVersion(Base):
    __tablename__ = "ico_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transformation_id = Column(String(36), ForeignKey("transformations.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    status = Column(String(50), default="draft")  # draft, review, approved
    ico_data = Column(JSON, nullable=False)
    edited_by = Column(String(100), default="system")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    transformation = relationship("Transformation", back_populates="ico_versions")

