from app.rag.chunking import chunk_text
from app.rag.embeddings import embeddings_service
from app.rag.retriever import rag_retriever

def test_chunking():
    text = "Word " * 1200
    chunks = chunk_text(text, chunk_size=500, overlap=100)
    assert len(chunks) > 1
    assert chunks[0]["chunk_index"] == 0

def test_embeddings_service():
    vec = embeddings_service.embed_text("Cybersecurity vulnerability patch")
    assert isinstance(vec, list)
    assert len(vec) == 384

def test_rag_index_and_retrieve():
    doc_id = "test_doc_101"
    text = "APT29 sophisticated phishing campaign targeting energy infrastructure using zero-day vulnerability."
    
    count = rag_retriever.index_document(doc_id, text, metadata={"project_id": "proj_1"})
    assert count >= 1

    hits = rag_retriever.retrieve(query="APT29 phishing campaign", top_k=2)
    assert len(hits) >= 1
    assert "APT29" in hits[0]["chunk_text"]
