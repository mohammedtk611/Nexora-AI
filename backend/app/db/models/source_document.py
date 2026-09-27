import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class SourceDocument(Base):
    __tablename__ = "source_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)  # pdf, docx, txt, image, audio, video, url, text
    file_path = Column(String(512), nullable=True)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)
    normalized_doc = Column(JSON, nullable=True)  # Stores common normalized document schema
    status = Column(String(50), default="uploaded")  # uploaded, processing, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="source_documents")
    ingestion_jobs = relationship("IngestionJob", back_populates="source_document", cascade="all, delete-orphan")
