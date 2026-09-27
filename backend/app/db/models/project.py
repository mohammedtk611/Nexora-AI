import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active")
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner_user = relationship("User", back_populates="projects")
    source_documents = relationship("SourceDocument", back_populates="project", cascade="all, delete-orphan")
    transformations = relationship("Transformation", back_populates="project", cascade="all, delete-orphan")
    knowledge_documents = relationship("KnowledgeDocument", back_populates="project", cascade="all, delete-orphan")
