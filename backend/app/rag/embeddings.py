from typing import List
import numpy as np

class EmbeddingsService:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    def _get_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception:
                self._model = None
        return self._model

    def embed_text(self, text: str) -> List[float]:
        model = self._get_model()
        if model is not None:
            try:
                vec = model.encode(text, convert_to_numpy=True)
                return vec.tolist()
            except Exception:
                pass
        
        # Fallback 384-dim pseudo vector for isolated testing or offline mode
        import hashlib
        h = hashlib.sha256(text.encode()).digest()
        seed = int.from_bytes(h[:4], "big")
        np.random.seed(seed)
        vec = np.random.uniform(-1, 1, 384).astype(np.float32)
        norm = np.linalg.norm(vec)
        return (vec / norm).tolist()

    def embed_documents(self, docs: List[str]) -> List[List[float]]:
        return [self.embed_text(d) for d in docs]

embeddings_service = EmbeddingsService()
