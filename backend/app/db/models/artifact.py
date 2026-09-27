import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transformation_id = Column(String(36), ForeignKey("transformations.id"), nullable=False)
    type = Column(String(100), nullable=False)  # executive_brief, advisory, linkedin, twitter, presentation, infographic, video_script, audio, video_package, srt
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="generated")  # pending, generating, generated, failed
    content = Column(JSON, nullable=True)  # Structured JSON content
    file_path = Column(String(512), nullable=True)  # Path to generated file if available (PDF, PPTX, MP3, ZIP)
    mime_type = Column(String(100), nullable=True)
    size = Column(Integer, default=0)
    validation_status = Column(JSON, nullable=True)  # Status returned by compliance agent

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transformation = relationship("Transformation", back_populates="artifacts")
    versions = relationship("ArtifactVersion", back_populates="artifact", cascade="all, delete-orphan")


class ArtifactVersion(Base):
    __tablename__ = "artifact_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    artifact_id = Column(String(36), ForeignKey("artifacts.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(JSON, nullable=True)
    file_path = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    artifact = relationship("Artifact", back_populates="versions")
