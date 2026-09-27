from typing import List, Dict, Any

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[Dict[str, Any]]:
    if not text:
        return []
    
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0
    chunk_index = 0

    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk_str = " ".join(chunk_words)
        
        chunks.append({
            "chunk_index": chunk_index,
            "text": chunk_str,
            "word_count": len(chunk_words)
        })
        
        chunk_index += 1
        start += (chunk_size - overlap)
        if start >= len(words):
            break

    return chunks
