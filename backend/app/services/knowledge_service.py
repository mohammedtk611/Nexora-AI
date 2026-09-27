from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.db.models.knowledge_document import KnowledgeDocument
from app.rag.retriever import rag_retriever
from app.rag.qdrant_client import vector_store
from app.core.exceptions import NotFoundError

class KnowledgeService:
    def list_documents(self, db: Session, project_id: Optional[str] = None) -> List[KnowledgeDocument]:
        query = db.query(KnowledgeDocument)
        if project_id:
            query = query.filter(KnowledgeDocument.project_id == project_id)
        return query.order_by(KnowledgeDocument.created_at.desc()).all()

    def index_document(
        self,
        db: Session,
        title: str,
        content: str,
        source_type: str = "text",
        project_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> KnowledgeDocument:
        meta = metadata or {}
        meta["project_id"] = project_id

        doc = KnowledgeDocument(
            project_id=project_id,
            title=title,
            source_type=source_type,
            meta_info=meta
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        chunk_count = rag_retriever.index_document(document_id=doc.id, text=content, metadata=meta)
        doc.chunk_count = chunk_count
        db.commit()
        db.refresh(doc)
        return doc

    def search_knowledge(self, query: str, top_k: int = 5, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return rag_retriever.retrieve(query=query, top_k=top_k, project_id=project_id)

    def delete_document(self, db: Session, doc_id: str) -> bool:
        doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
        if not doc:
            raise NotFoundError(message=f"Knowledge document {doc_id} not found")
        
        vector_store.delete_document(doc_id)
        db.delete(doc)
        db.commit()
        return True

knowledge_service = KnowledgeService()
