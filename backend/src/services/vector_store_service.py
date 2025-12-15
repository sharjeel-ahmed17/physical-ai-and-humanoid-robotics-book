from typing import List, Dict, Any, Optional
from uuid import uuid4
import logging

from ..utils.embedding_utils import embedding_service
from ..vector_store.qdrant_client import get_qdrant_store
from ..utils.citation_utils import citation_service


class VectorStoreService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def search_content(self, query: str, limit: int = 5, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        Search for content in the vector store based on the query
        """
        try:
            # Generate embedding for the query
            query_embedding = await embedding_service.create_embeddings(query)

            # Search in Qdrant
            search_results = get_qdrant_store().search_vectors(
                query_vector=query_embedding,
                limit=limit,
                filters=filters
            )

            # Format results
            formatted_results = []
            for result in search_results:
                payload = result.get("payload", {})
                formatted_result = {
                    "id": result.get("id", ""),
                    "score": result.get("score", 0.0),
                    "payload": payload,
                    "source_url": payload.get("source_url", ""),
                    "title": payload.get("title", ""),
                    "content": payload.get("chunk_text", ""),
                    "hierarchy_path": payload.get("hierarchy_path", "")
                }
                formatted_results.append(formatted_result)

            self.logger.info(f"Found {len(formatted_results)} results for query: {query[:50]}...")
            return formatted_results

        except Exception as e:
            self.logger.error(f"Error searching content: {str(e)}")
            raise

    async def add_content(self, content: str, source_url: str, title: str, metadata: Optional[Dict] = None) -> str:
        """
        Add content to the vector store
        """
        try:
            # Generate embedding for the content
            embedding = await embedding_service.create_embeddings(content)

            # Create a unique ID for this content
            content_id = str(uuid4())

            # Prepare the vector data
            vector_data = {
                "id": content_id,
                "vector": embedding,
                "payload": {
                    "content_id": content_id,
                    "source_url": source_url,
                    "title": title,
                    "chunk_text": content[:500] + "..." if len(content) > 500 else content,  # First 500 chars
                    "metadata": metadata or {}
                }
            }

            # Store in Qdrant
            get_qdrant_store().upsert_vectors([vector_data])

            self.logger.info(f"Added content to vector store: {title}")
            return content_id

        except Exception as e:
            self.logger.error(f"Error adding content: {str(e)}")
            raise

    async def delete_content(self, content_ids: List[str]):
        """
        Delete content from the vector store by IDs
        """
        try:
            get_qdrant_store().delete_vectors(content_ids)
            self.logger.info(f"Deleted {len(content_ids)} items from vector store")
        except Exception as e:
            self.logger.error(f"Error deleting content: {str(e)}")
            raise

    async def get_content_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the vector store
        """
        try:
            count = get_qdrant_store().get_vector_count()
            return {
                "total_vectors": count,
                "collection_name": get_qdrant_store().collection_name
            }
        except Exception as e:
            self.logger.error(f"Error getting content stats: {str(e)}")
            raise

    async def search_with_citations(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for content and format results with citations
        """
        try:
            # Search for relevant content
            search_results = await self.search_content(query, limit=limit)

            # Format citations from search results
            citations = citation_service.create_citations_from_results(search_results, query)

            # Return both search results and citations
            return {
                "search_results": search_results,
                "citations": citations
            }

        except Exception as e:
            self.logger.error(f"Error searching content with citations: {str(e)}")
            raise


# Global instance
vector_store_service = VectorStoreService()