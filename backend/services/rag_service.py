"""
FAISS-backed retrieval service with sentence-transformer embeddings.
Falls back to simple keyword scoring if optional dependencies are unavailable.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path


class FitnessRAGService:
    def __init__(self, knowledge_path: Path, cache_dir: Path):
        self.knowledge_path = knowledge_path
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.cache_dir / "fitness_kb.index"
        self.meta_path = self.cache_dir / "fitness_kb_meta.json"
        self.embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_optional_dependencies():
        try:
            import faiss  # type: ignore
            import numpy as np  # type: ignore
            from sentence_transformers import SentenceTransformer  # type: ignore

            return faiss, np, SentenceTransformer
        except Exception:
            return None, None, None

    @lru_cache(maxsize=1)
    def load_documents(self) -> list[dict]:
        with self.knowledge_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def _build_or_load_faiss(self):
        faiss, np, SentenceTransformer = self._load_optional_dependencies()
        if not all([faiss, np, SentenceTransformer]):
            return None, None, None

        documents = self.load_documents()

        if self.index_path.exists() and self.meta_path.exists():
            index = faiss.read_index(str(self.index_path))
            with self.meta_path.open("r", encoding="utf-8") as meta_file:
                metadata = json.load(meta_file)
            model = SentenceTransformer(self.embedding_model_name)
            return model, index, metadata

        model = SentenceTransformer(self.embedding_model_name)
        texts = [doc["content"] for doc in documents]
        embeddings = model.encode(texts, normalize_embeddings=True)
        embeddings = np.asarray(embeddings, dtype="float32")
        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)
        faiss.write_index(index, str(self.index_path))
        with self.meta_path.open("w", encoding="utf-8") as meta_file:
            json.dump(documents, meta_file, ensure_ascii=False, indent=2)
        return model, index, documents

    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        model, index, documents = self._build_or_load_faiss()
        if model and index and documents:
            _, np, _ = self._load_optional_dependencies()
            query_embedding = model.encode([query], normalize_embeddings=True)
            query_embedding = np.asarray(query_embedding, dtype="float32")
            _, indices = index.search(query_embedding, min(top_k, len(documents)))
            results = []
            for idx in indices[0]:
                if idx == -1:
                    continue
                results.append(documents[idx])
            return results

        query_terms = set(query.lower().split())
        scored_docs = []
        for doc in self.load_documents():
            content_terms = set(doc["content"].lower().split())
            score = len(query_terms.intersection(content_terms))
            scored_docs.append((score, doc))

        scored_docs.sort(key=lambda item: item[0], reverse=True)
        return [doc for _, doc in scored_docs[:top_k]]


@lru_cache(maxsize=1)
def get_rag_service() -> FitnessRAGService:
    root = Path(__file__).resolve().parent.parent
    return FitnessRAGService(
        knowledge_path=root / "fitness_knowledge.json",
        cache_dir=root / ".cache",
    )
