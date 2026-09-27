import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transformation_id = Column(String(36), ForeignKey("transformations.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)  # context_agent, executive_agent, etc.
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    output_reference = Column(String(512), nullable=True)
    agent_metadata = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transformation = relationship("Transformation", back_populates="agent_runs")
