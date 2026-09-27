import uuid
from typing import Any, Dict, List, Optional
import numpy as np
from app.core.config import settings
from app.rag.embeddings import embeddings_service

class QdrantVectorStore:
    def __init__(self):
        self.collection_name = settings.QDRANT_COLLECTION
        self._qdrant_client = None
        self._in_memory_docs: List[Dict[str, Any]] = []

    def _get_client(self):
        if self._qdrant_client is None:
            try:
                from qdrant_client import QdrantClient
                from qdrant_client.models import Distance, VectorParams
                client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY, timeout=3.0)
                # Check health
                client.get_collections()
                self._qdrant_client = client
                
                # Ensure collection exists
                collections = [c.name for c in client.get_collections().collections]
                if self.collection_name not in collections:
                    client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                    )
            except Exception:
                self._qdrant_client = None
        return self._qdrant_client

    def upsert_chunks(self, document_id: str, chunks: List[Dict[str, Any]], metadata: Dict[str, Any]) -> List[str]:
        client = self._get_client()
        point_ids = []

        for chunk in chunks:
            text = chunk["text"]
            vec = embeddings_service.embed_text(text)
            point_id = str(uuid.uuid4())
            point_ids.append(point_id)

            payload = {
                "document_id": document_id,
                "chunk_index": chunk["chunk_index"],
                "text": text,
                "metadata": metadata
            }

            if client is not None:
                try:
                    from qdrant_client.models import PointStruct
                    client.upsert(
                        collection_name=self.collection_name,
                        points=[PointStruct(id=point_id, vector=vec, payload=payload)]
                    )
                except Exception:
                    pass

            # Always maintain in memory store for fallback search
            self._in_memory_docs.append({
                "id": point_id,
                "vector": vec,
                "payload": payload
            })

        return point_ids

    def search(self, query: str, top_k: int = 5, filter_project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query_vec = embeddings_service.embed_text(query)
        client = self._get_client()

        if client is not None:
            try:
                hits = client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vec,
                    limit=top_k
                )
                results = []
                for hit in hits:
                    results.append({
                        "score": round(float(hit.score), 4),
                        "chunk_text": hit.payload.get("text", ""),
                        "metadata": hit.payload.get("metadata", {})
                    })
                if results:
                    return results
            except Exception:
                pass

        # Fallback to in-memory cosine search
        if not self._in_memory_docs:
            return []

        q_arr = np.array(query_vec, dtype=np.float32)
        q_norm = np.linalg.norm(q_arr)
        if q_norm == 0:
            q_norm = 1.0

        scores = []
        for doc in self._in_memory_docs:
            if filter_project_id:
                doc_proj = doc["payload"].get("metadata", {}).get("project_id")
                if doc_proj and doc_proj != filter_project_id:
                    continue
            v_arr = np.array(doc["vector"], dtype=np.float32)
            v_norm = np.linalg.norm(v_arr)
            if v_norm == 0:
                v_norm = 1.0
            cos_sim = float(np.dot(q_arr, v_arr) / (q_norm * v_norm))
            scores.append((cos_sim, doc["payload"]))

        scores.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, payload in scores[:top_k]:
            results.append({
                "score": round(score, 4),
                "chunk_text": payload.get("text", ""),
                "metadata": payload.get("metadata", {})
            })
        return results

    def delete_document(self, document_id: str):
        client = self._get_client()
        if client is not None:
            try:
                from qdrant_client.models import Filter, FieldCondition, MatchValue
                client.delete(
                    collection_name=self.collection_name,
                    points_selector=Filter(
                        must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
                    )
                )
            except Exception:
                pass
        self._in_memory_docs = [d for d in self._in_memory_docs if d["payload"].get("document_id") != document_id]

vector_store = QdrantVectorStore()
