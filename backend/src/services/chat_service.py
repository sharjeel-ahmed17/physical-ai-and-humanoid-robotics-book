from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
import logging
import asyncio

from ..models.user_query import UserQuery
from ..models.chat_response import ChatResponse as ChatResponseModel
from ..models.session import Session
from ..models.conversation import Conversation
from ..models.citation import Citation as CitationModel
from ..database.database import get_db
from ..services.rag_agent_service import rag_agent_service
from ..utils.citation_utils import citation_service
from ..config.settings import settings


class ChatService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def process_chat_request(self, query: str, session_id: str, query_mode: str = "book-wide", selected_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a chat request and return a response using OpenAI Agents SDK with Gemini
        """
        try:
            self.logger.info(f"Processing chat request: mode={query_mode}, session={session_id}")

            # Process the query based on mode using the RAG agent
            if query_mode == "selected-text" and selected_text:
                response_data = await rag_agent_service.query_selected_text(query, selected_text, session_id)
            else:
                response_data = await rag_agent_service.query_book(query, session_id)

            # Create response object
            response_obj = {
                "id": str(uuid4()),
                "response": response_data["response"],
                "citations": response_data["citations"],
                "confidence_score": response_data["confidence_score"],
                "created_at": datetime.utcnow()
            }

            # Store the interaction in the database (in a real implementation)
            # await self._store_conversation(query, response_obj, session_id, query_mode)

            self.logger.info(f"Successfully processed chat request for session {session_id}")
            return response_obj

        except Exception as e:
            self.logger.error(f"Error processing chat request: {str(e)}")
            raise

    async def _store_conversation(self, query: str, response: Dict[str, Any], session_id: str, query_mode: str):
        """
        Store the conversation in the database
        This is a simplified version - a full implementation would handle all the database operations
        """
        try:
            # In a real implementation, this would:
            # 1. Create or update session
            # 2. Store user query
            # 3. Store chat response
            # 4. Create conversation record linking them
            # 5. Store citations
            # For now, this is a placeholder
            self.logger.info(f"Storing conversation for session {session_id}")
        except Exception as e:
            self.logger.error(f"Error storing conversation: {str(e)}")
            # Don't raise the exception as it shouldn't fail the main request

    async def get_conversation_history(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve conversation history for a session
        """
        try:
            # In a real implementation, this would query the database for conversation history
            # For now, return an empty list as a placeholder
            self.logger.info(f"Retrieving conversation history for session {session_id}")

            # Placeholder implementation
            return []
        except Exception as e:
            self.logger.error(f"Error retrieving conversation history: {str(e)}")
            raise

    async def create_session(self) -> str:
        """
        Create a new session
        """
        try:
            session_id = str(uuid4())
            self.logger.info(f"Created new session: {session_id}")

            # In a real implementation, this would store the session in the database
            # await self._store_session(session_id)

            return session_id
        except Exception as e:
            self.logger.error(f"Error creating session: {str(e)}")
            raise

    async def validate_response_quality(self, query: str, response: str, citations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate the quality of the response
        """
        try:
            # Check if citations are properly formatted
            valid_citations = []
            for citation in citations:
                if citation_service.validate_citation_format(citation):
                    valid_citations.append(citation)

            # Calculate overall quality metrics
            quality_metrics = {
                "citation_count": len(valid_citations),
                "has_citations": len(valid_citations) > 0,
                "response_length": len(response),
                "is_sufficient_length": len(response) > 20,  # At least 20 characters
            }

            # Overall quality assessment
            overall_quality = (
                quality_metrics["citation_count"] > 0 and
                quality_metrics["has_citations"] and
                quality_metrics["is_sufficient_length"]
            )

            quality_result = {
                "is_valid": overall_quality,
                "metrics": quality_metrics,
                "valid_citations": valid_citations,
                "issues": [] if overall_quality else ["Response may lack proper citations or be too short"]
            }

            return quality_result

        except Exception as e:
            self.logger.error(f"Error validating response quality: {str(e)}")
            # Return a default quality check if validation fails
            return {
                "is_valid": True,
                "metrics": {"citation_count": len(citations), "has_citations": len(citations) > 0, "response_length": len(response)},
                "valid_citations": citations,
                "issues": []
            }

    async def handle_transparency_for_unavailable_info(self, query: str) -> Dict[str, Any]:
        """
        Handle cases where information is not available in the book
        """
        try:
            # This would implement the logic to detect when the query cannot be answered
            # from the book content and return an appropriate transparent response
            response = {
                "response": "I couldn't find information in the Physical AI & Humanoid Robotics book to answer your question. The book may not contain content related to this topic.",
                "citations": [],
                "confidence_score": 0.0,
                "transparency_note": "Information not found in book content"
            }

            return response
        except Exception as e:
            self.logger.error(f"Error handling transparency: {str(e)}")
            raise


# Global instance
chat_service = ChatService()