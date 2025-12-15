import google.generativeai as genai
from typing import List, Union
import numpy as np
import os
from ..config.settings import settings


class EmbeddingService:
    def __init__(self):
        # Validate that no OpenAI API key is present
        if os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY detected but not allowed. Remove it and use GEMINI_API_KEY only.")

        # Use Google API key only
        api_key = settings.google_api_key
        genai.configure(api_key=api_key)

    async def create_embeddings(self, texts: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """
        Create embeddings for one or more texts using Google's embedding API
        """
        if isinstance(texts, str):
            texts = [texts]

        # Use the Google embedding model from settings
        embedding_model = settings.google_embedding_model

        # Create embeddings using Google's API
        embeddings = []
        for text in texts:
            # Use the embed_content method from Google Generative AI
            response = genai.embed_content(
                model=embedding_model,
                content=text,
                task_type="RETRIEVAL_DOCUMENT"  # or "RETRIEVAL_QUERY" depending on use case
            )
            embeddings.append(response['embedding'])

        # Return single embedding if input was single text
        if len(embeddings) == 1 and isinstance(texts, list) and len(texts) == 1:
            return embeddings[0]

        return embeddings

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors
        """
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        return dot_product / (magnitude1 * magnitude2)

    def normalize_vector(self, vector: List[float]) -> List[float]:
        """
        Normalize a vector to unit length
        """
        magnitude = sum(x * x for x in vector) ** 0.5
        if magnitude == 0:
            return vector
        return [x / magnitude for x in vector]


# Global instance
embedding_service = EmbeddingService()