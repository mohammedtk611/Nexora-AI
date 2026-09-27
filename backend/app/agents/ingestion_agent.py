from typing import List
from app.rag.retriever import rag_retriever
from app.agents.state import TransformationState

class IngestionAgent:
    def run(self, state: TransformationState) -> List[str]:
        # Index document texts into RAG vector store
        indexed_texts = []
        for idx, text in enumerate(state.source_texts):
            if text:
                doc_id = state.source_document_ids[idx] if idx < len(state.source_document_ids) else f"doc_{idx}"
                rag_retriever.index_document(
                    document_id=doc_id,
                    text=text,
                    metadata={"project_id": state.project_id, "transformation_id": state.transformation_id}
                )
                indexed_texts.append(text)
        return indexed_texts

ingestion_agent = IngestionAgent()
