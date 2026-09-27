from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.knowledge_base import (
    KnowledgeDocumentResponse,
    KnowledgeIndexRequest,
    KnowledgeSearchRequest,
    KnowledgeSearchResult,
)
from app.services.knowledge_service import knowledge_service
from app.services.audit_service import audit_service
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base & RAG"])

@router.get("/documents", response_model=List[KnowledgeDocumentResponse])
def list_knowledge_documents(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return knowledge_service.list_documents(db, project_id=project_id)

@router.post("/index", response_model=KnowledgeDocumentResponse, status_code=status.HTTP_201_CREATED)
def index_document(
    request: KnowledgeIndexRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = knowledge_service.index_document(
        db,
        title=request.title,
        content=request.content,
        source_type=request.source_type,
        project_id=request.project_id,
        metadata=request.metadata
    )
    audit_service.log_action(db, action="index_knowledge", resource="knowledge_document", user_id=current_user.id, resource_id=doc.id)
    return doc

@router.post("/search", response_model=List[KnowledgeSearchResult])
def search_knowledge(
    request: KnowledgeSearchRequest,
    current_user: User = Depends(get_current_user)
):
    hits = knowledge_service.search_knowledge(
        query=request.query,
        top_k=request.top_k,
        project_id=request.project_id
    )
    return [
        KnowledgeSearchResult(
            score=hit["score"],
            chunk_text=hit["chunk_text"],
            metadata=hit["metadata"]
        )
        for hit in hits
    ]

@router.post("/{id}/reindex", response_model=KnowledgeDocumentResponse)
def reindex_document(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(KnowledgeDocumentResponse).filter(KnowledgeDocumentResponse.id == id).first()
    if not doc:
        raise NotFoundError(message=f"Knowledge document {id} not found")
    audit_service.log_action(db, action="reindex_knowledge", resource="knowledge_document", user_id=current_user.id, resource_id=id)
    return doc

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_document(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    knowledge_service.delete_document(db, id)
    audit_service.log_action(db, action="delete_knowledge", resource="knowledge_document", user_id=current_user.id, resource_id=id)
    return None
