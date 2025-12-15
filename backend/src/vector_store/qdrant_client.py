from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Dict, Optional, Any
from uuid import uuid4
from ..config.settings import settings


class QdrantStore:
    def __init__(self):
        # Initialize Qdrant client
        if settings.qdrant_api_key:
            self.client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                timeout=settings.timeout
            )
        else:
            # For local Qdrant instances without API key
            self.client = QdrantClient(
                url=settings.qdrant_url,
                timeout=settings.timeout
            )

        self.collection_name = settings.qdrant_collection_name
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        """
        Ensure the collection exists with proper configuration
        """
        try:
            # Check if collection exists
            self.client.get_collection(self.collection_name)
        except:
            # Create collection if it doesn't exist
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=1024,  # Size expected by the Qdrant instance
                    distance=models.Distance.COSINE
                )
            )

    def upsert_vectors(self, vectors: List[Dict[str, Any]]):
        """
        Upsert vectors into the collection

        Args:
            vectors: List of dictionaries with keys: id, vector, payload
        """
        points = [
            models.PointStruct(
                id=vec["id"],
                vector=vec["vector"],
                payload=vec["payload"]
            ) for vec in vectors
        ]

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search_vectors(self, query_vector: List[float], limit: int = 10, filters: Optional[Dict] = None):
        """
        Search for similar vectors

        Args:
            query_vector: The query embedding vector
            limit: Number of results to return
            filters: Optional filters for metadata search
        """
        if filters:
            filter_condition = models.Filter(
                must=[
                    models.FieldCondition(
                        key=key,
                        match=models.MatchValue(value=value)
                    ) for key, value in filters.items()
                ]
            )
        else:
            filter_condition = None

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            query_filter=filter_condition
        )

        return [
            {
                "id": result.id,
                "score": result.score,
                "payload": result.payload
            } for result in results
        ]

    def delete_vectors(self, ids: List[str]):
        """
        Delete vectors by IDs
        """
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.PointIdsList(
                points=ids
            )
        )

    def get_vector_count(self) -> int:
        """
        Get the total number of vectors in the collection
        """
        collection_info = self.client.get_collection(self.collection_name)
        return collection_info.points_count


# Global instance - will be initialized later when needed
qdrant_store = None


def get_qdrant_store():
    """
    Get or create the Qdrant store instance
    """
    global qdrant_store
    if qdrant_store is None:
        qdrant_store = QdrantStore()
    return qdrant_store