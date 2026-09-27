import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_document_id = Column(String(36), ForeignKey("source_documents.id"), nullable=False)
    status = Column(String(50), default="queued")  # queued, processing, completed, failed
    stage = Column(String(100), default="pending")  # parsing, ocr, transcription, normalization
    metadata_info = Column(JSON, nullable=True)
    error_details = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    source_document = relationship("SourceDocument", back_populates="ingestion_jobs")
