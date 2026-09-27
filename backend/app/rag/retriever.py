from typing import Any, Dict, List, Optional
from app.rag.chunking import chunk_text
from app.rag.qdrant_client import vector_store

class RAGRetriever:
    def index_document(self, document_id: str, text: str, metadata: Dict[str, Any]) -> int:
        chunks = chunk_text(text, chunk_size=500, overlap=100)
        if not chunks:
            return 0
        vector_store.upsert_chunks(document_id=document_id, chunks=chunks, metadata=metadata)
        return len(chunks)

    def retrieve(self, query: str, top_k: int = 5, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return vector_store.search(query=query, top_k=top_k, filter_project_id=project_id)

rag_retriever = RAGRetriever()
