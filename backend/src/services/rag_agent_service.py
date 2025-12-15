"""
RAG Agent for the Physical AI & Humanoid Robotics book
Uses OpenAI Agents SDK with Google Gemini backend
"""
from agents import Agent, Runner, RunConfig, FunctionTool, function_tool
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from ..config.settings import settings
from ..services.vector_store_service import vector_store_service
from ..utils.citation_utils import citation_service
from ..utils.embedding_utils import embedding_service
import logging


# Define Pydantic models for tool return types to avoid schema issues
class SimpleMetadata(BaseModel):
    """Simple metadata model to avoid additionalProperties issue"""
    source: Optional[str] = None
    page: Optional[int] = None
    chapter: Optional[str] = None
    section: Optional[str] = None
    # Add other known metadata fields as needed, avoid generic Dict


class SearchResult(BaseModel):
    id: str
    content: str
    score: float
    metadata: SimpleMetadata = SimpleMetadata()


class SearchResponse(BaseModel):
    id: str
    content: str
    score: float
    # Replace Dict with specific model to avoid additionalProperties issue
    metadata: SimpleMetadata = SimpleMetadata()


class CitationResult(BaseModel):
    id: str
    text: str
    page: Optional[int] = None
    source: str


class CitationResponse(BaseModel):
    id: str
    text: str
    page: Optional[int] = None
    source: str
    # Replace Dict with specific model to avoid additionalProperties issue
    metadata: Optional[SimpleMetadata] = None


# Define tools for the RAG agent
@function_tool
async def search_book_content(query: str, limit: int = 5) -> List[SearchResponse]:
    """
    Search the Physical AI & Humanoid Robotics book content for relevant information
    """
    try:
        search_results = await vector_store_service.search_content(query, limit=limit)
        # Convert the results to proper Pydantic models to avoid schema issues
        converted_results = []
        for result in search_results:
            # Convert raw metadata to SimpleMetadata model
            raw_metadata = result.get("metadata", {})
            simple_metadata = SimpleMetadata(
                source=raw_metadata.get("source"),
                page=raw_metadata.get("page"),
                chapter=raw_metadata.get("chapter"),
                section=raw_metadata.get("section")
            )

            converted_result = SearchResponse(
                id=result.get("id", ""),
                content=result.get("content", ""),
                score=result.get("score", 0.0),
                metadata=simple_metadata
            )
            converted_results.append(converted_result)
        return converted_results
    except Exception as e:
        logging.error(f"Error searching book content: {str(e)}")
        # Return empty list with proper model structure
        return []


@function_tool
async def create_citations_from_results(search_results: List[SearchResponse], query: str) -> List[CitationResponse]:
    """
    Create citations from search results
    """
    try:
        # Convert SearchResponse objects back to the format expected by citation_service
        raw_results = []
        for result in search_results:
            # Convert SimpleMetadata back to dict format for the service
            metadata_dict = {}
            if result.metadata:
                metadata_dict = {
                    "source": result.metadata.source,
                    "page": result.metadata.page,
                    "chapter": result.metadata.chapter,
                    "section": result.metadata.section
                }
            raw_results.append({
                "id": result.id,
                "content": result.content,
                "score": result.score,
                "metadata": metadata_dict
            })

        citations = citation_service.create_citations_from_results(raw_results, query)

        # Convert citations to proper Pydantic models
        converted_citations = []
        for citation in citations:
            # Convert raw citation metadata to SimpleMetadata model
            raw_metadata = citation.get("metadata", {})
            simple_metadata = SimpleMetadata(
                source=raw_metadata.get("source"),
                page=raw_metadata.get("page"),
                chapter=raw_metadata.get("chapter"),
                section=raw_metadata.get("section")
            )

            converted_citation = CitationResponse(
                id=citation.get("id", ""),
                text=citation.get("text", ""),
                page=citation.get("page"),
                source=citation.get("source", ""),
                metadata=simple_metadata
            )
            converted_citations.append(converted_citation)
        return converted_citations
    except Exception as e:
        logging.error(f"Error creating citations: {str(e)}")
        # Return empty list with proper model structure
        return []


class RAGAgentService:
    """
    Service class that manages the RAG agent using OpenAI Agents SDK
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Create the RAG agent
        self.rag_agent = Agent(
            name="Book RAG Agent",
            instructions="""
            You are an expert assistant for the Physical AI & Humanoid Robotics book.
            Your purpose is to answer questions about the book content using retrieval augmented generation.
            Use the search_book_content tool to find relevant information from the book.
            Use the create_citations_from_results tool to properly cite sources from the book.
            Always be truthful and only provide information that is present in the book content.
            If the book doesn't contain enough information to answer a question, clearly state this.
            Structure your response with the answer first, followed by citations if any.
            """,
            tools=[
                search_book_content,  # Functions decorated with @function_tool are already FunctionTool instances
                create_citations_from_results
            ]
        )

        # Create run configuration using the Gemini-configured model
        from ..lib.openaiagentsdk_config import agent_config
        self.run_config = RunConfig(
            model=agent_config.model(),
            model_provider=agent_config.client(),
            # Add any additional configuration as needed
        )

    async def query_book(self, query: str, session_id: str = None) -> Dict[str, Any]:
        """
        Process a query using the RAG agent
        """
        try:
            self.logger.info(f"Processing RAG query: {query[:50]}...")

            # First, search for relevant content in the vector store
            search_results = await vector_store_service.search_content(query, limit=5)

            if not search_results:
                return {
                    "response": "I couldn't find any relevant information in the Physical AI & Humanoid Robotics book to answer your question.",
                    "citations": [],
                    "confidence_score": 0.0,
                    "query_mode": "book-wide"
                }

            # Format context from search results
            context_texts = [result["content"] for result in search_results]
            context = "\n\n".join(context_texts)

            # Create the full prompt with context
            full_prompt = f"""
            You are a helpful assistant for the Physical AI & Humanoid Robotics book.
            Answer the user's question based on the following context from the book.
            If the context doesn't contain enough information to answer the question, say so.
            Always be truthful and only provide information that is present in the context.
            If you provide information from the book, include the relevant citations.

            Question: {query}

            Context: {context}

            Answer:
            """

            # Run the agent with the full prompt
            result = await Runner.run(
                starting_agent=self.rag_agent,
                input=full_prompt,
                run_config=self.run_config
            )

            # Process the result
            response_text = result.final_output if result.final_output else "I couldn't generate a response."

            # Create citations from search results using the vector store service directly (not the tool)
            citations = citation_service.create_citations_from_results(search_results, query)

            # Calculate confidence score based on relevance scores
            confidence_score = self._calculate_confidence_score(search_results)

            return {
                "response": response_text,
                "citations": citations,
                "confidence_score": confidence_score,
                "query_mode": "book-wide"
            }

        except Exception as e:
            self.logger.error(f"Error in RAG agent query: {str(e)}")
            raise

    async def query_selected_text(self, query: str, selected_text: str, session_id: str = None) -> Dict[str, Any]:
        """
        Process a query about selected text using the RAG agent
        """
        try:
            self.logger.info(f"Processing selected-text query: {query[:50]}...")

            # Combine the query with selected text for more focused search
            combined_query = f"{query} related to: {selected_text}"

            # Search for relevant content, potentially filtering by the selected text context
            search_results = await vector_store_service.search_content(
                combined_query,
                limit=3
            )

            if not search_results:
                # If no specific results found, broaden the search to the selected text itself
                search_results = await vector_store_service.search_content(selected_text, limit=3)

            if not search_results:
                return {
                    "response": "I couldn't find specific information related to the selected text to answer your question.",
                    "citations": [],
                    "confidence_score": 0.0,
                    "query_mode": "selected-text"
                }

            # Format context from search results
            context_texts = [result["content"] for result in search_results]
            context = "\n\n".join(context_texts)

            # Create the full prompt with selected text context
            full_prompt = f"""
            You are a helpful assistant for the Physical AI & Humanoid Robotics book.
            The user has selected specific text and asked a question about it.
            Answer the user's question based on the following context from the book, with special focus on the selected text.
            If the context doesn't contain enough information to answer the question, say so.
            Always be truthful and only provide information that is present in the context.
            If you provide information from the book, include the relevant citations.

            Selected text: {selected_text}

            Question: {query}

            Context: {context}

            Answer:
            """

            # Run the agent with the enhanced query
            result = await Runner.run(
                starting_agent=self.rag_agent,
                input=full_prompt,
                run_config=self.run_config
            )

            # Process the result
            response_text = result.final_output if result.final_output else "I couldn't generate a response."

            # Create citations from search results using the vector store service directly (not the tool)
            citations = citation_service.create_citations_from_results(search_results, query)

            # Calculate confidence score based on relevance scores
            confidence_score = self._calculate_confidence_score(search_results)

            return {
                "response": response_text,
                "citations": citations,
                "confidence_score": confidence_score,
                "query_mode": "selected-text"
            }

        except Exception as e:
            self.logger.error(f"Error in selected-text RAG agent query: {str(e)}")
            raise

    def _calculate_confidence_score(self, search_results: List[Dict[str, Any]]) -> float:
        """
        Calculate a confidence score based on the relevance scores of search results
        """
        if not search_results:
            return 0.0

        # Calculate average score, weighted by the position in results (first results are more relevant)
        total_weighted_score = 0.0
        total_weight = 0.0

        for i, result in enumerate(search_results):
            score = result.get("score", 0.0)
            # Weight by position (first results have higher weight)
            weight = 1.0 / (i + 1)
            total_weighted_score += score * weight
            total_weight += weight

        if total_weight == 0:
            return 0.0

        avg_score = total_weighted_score / total_weight

        # Normalize to 0-1 range (Qdrant scores can vary, so we cap at 1.0)
        return min(avg_score, 1.0)


# Global instance
rag_agent_service = RAGAgentService()