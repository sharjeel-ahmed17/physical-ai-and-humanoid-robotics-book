from fastapi import APIRouter, HTTPException
from typing import List
from ...utils.embedding_utils import embedding_service
from ...vector_store.qdrant_client import get_qdrant_store
from ..models import ContentSearchRequest, ContentSearchResponse
import uuid


router = APIRouter()


@router.post("/search", response_model=ContentSearchResponse)
async def search_content(request: ContentSearchRequest):
    """
    Search for content in the book using semantic search
    """
    try:
        # Generate embedding for the search query
        query_embedding = await embedding_service.create_embeddings(request.query)

        # Perform semantic search in Qdrant
        search_results = get_qdrant_store().search_vectors(
            query_vector=query_embedding,
            limit=request.limit,
            filters=request.filters
        )

        # Format results
        results = []
        for result in search_results:
            payload = result.get("payload", {})
            results.append({
                "id": result.get("id", ""),
                "score": result.get("score", 0.0),
                "title": payload.get("title", ""),
                "content": payload.get("chunk_text", "")[:500] + "..." if len(payload.get("chunk_text", "")) > 500 else payload.get("chunk_text", ""),
                "source_url": payload.get("source_url", ""),
                "hierarchy_path": payload.get("hierarchy_path", "")
            })

        return ContentSearchResponse(
            query=request.query,
            results=results,
            total_count=len(results)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching content: {str(e)}")


@router.get("/collections")
async def get_collections():
    """
    Get information about available collections in the vector store
    """
    try:
        collections = get_qdrant_store().client.get_collections()
        return {
            "collections": [collection.name for collection in collections.collections],
            "total": len(collections.collections)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting collections: {str(e)}")


@router.get("/stats")
async def get_content_stats():
    """
    Get statistics about the content in the vector store
    """
    try:
        vector_count = get_qdrant_store().get_vector_count()
        return {
            "vector_count": vector_count,
            "collection_name": get_qdrant_store().collection_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting content stats: {str(e)}")