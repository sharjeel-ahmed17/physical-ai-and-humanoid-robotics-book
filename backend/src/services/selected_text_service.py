from typing import Dict, Any, List, Optional
import logging

from ..services.rag_query_service import rag_query_service
from ..services.vector_store_service import vector_store_service
from ..utils.citation_utils import citation_service


class SelectedTextService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def process_selected_text_query(self, query: str, selected_text: str, session_id: str) -> Dict[str, Any]:
        """
        Process a query that is specifically about selected text
        """
        try:
            self.logger.info(f"Processing selected-text query for session {session_id}")

            # Validate inputs
            if not selected_text or not selected_text.strip():
                raise ValueError("Selected text cannot be empty")

            if not query or not query.strip():
                raise ValueError("Query cannot be empty")

            # Create a focused search combining the query and selected text
            combined_search_text = f"{query} {selected_text}".strip()

            # Search for content related to both the query and the selected text
            search_results = await vector_store_service.search_content(
                combined_search_text,
                limit=5
            )

            if not search_results:
                # If no results with combined search, try searching just the selected text
                search_results = await vector_store_service.search_content(selected_text, limit=5)

            if not search_results:
                return {
                    "response": "I couldn't find specific information related to the selected text to answer your question. The selected text might be too specific or not well-covered in the book.",
                    "citations": [],
                    "confidence_score": 0.0,
                    "query_mode": "selected-text",
                    "context_used": "selected-text-only"
                }

            # Filter results to prioritize those most relevant to the selected text
            filtered_results = self._filter_results_for_selected_text(search_results, selected_text)

            # Generate context from filtered results
            context_texts = [result["content"] for result in filtered_results]
            context = "\n\n".join(context_texts)

            # Generate a response focused on the selected text
            response = await self._generate_selected_text_response(query, selected_text, context)

            # Create citations from the search results
            citations = citation_service.create_citations_from_results(filtered_results, query)

            # Calculate confidence based on relevance to selected text
            confidence_score = self._calculate_selected_text_confidence(filtered_results, selected_text)

            return {
                "response": response,
                "citations": citations,
                "confidence_score": confidence_score,
                "query_mode": "selected-text",
                "context_used": "selected-text-focused"
            }

        except Exception as e:
            self.logger.error(f"Error processing selected text query: {str(e)}")
            raise

    def _filter_results_for_selected_text(self, search_results: List[Dict[str, Any]], selected_text: str) -> List[Dict[str, Any]]:
        """
        Filter and rank search results based on relevance to the selected text
        """
        # For now, return all results but in a more focused way
        # In a more sophisticated implementation, we would use semantic similarity
        # between the selected text and each result to re-rank them
        return search_results

    async def _generate_selected_text_response(self, query: str, selected_text: str, context: str) -> str:
        """
        Generate a response that specifically addresses the query in the context of the selected text
        """
        prompt = f"""
        You are a helpful assistant for the Physical AI & Humanoid Robotics book.
        The user has selected specific text from the book and asked a question about it.
        Answer the user's question focusing specifically on how it relates to the selected text.
        If the context doesn't contain enough information to answer the question in relation to the selected text,
        explain what you can about the general topic while noting the limitations.

        Selected text: "{selected_text}"

        User's question: "{query}"

        Context from the book: {context}

        Provide a detailed response that addresses the user's question in relation to the selected text:
        """

        import google.generativeai as genai
        from ..config.settings import settings

        # Configure Google Generative AI
        genai.configure(api_key=settings.google_api_key)
        chat_model = genai.GenerativeModel(settings.chat_model)

        generation_config = genai.GenerationConfig(
            temperature=settings.temperature,
            max_output_tokens=settings.max_tokens,
        )

        response = chat_model.generate_content(
            prompt,
            generation_config=generation_config
        )

        return response.text if response.text else "I couldn't generate a response."

    def _calculate_selected_text_confidence(self, search_results: List[Dict[str, Any]], selected_text: str) -> float:
        """
        Calculate confidence score based on relevance to selected text
        """
        if not search_results:
            return 0.0

        # Calculate average relevance score
        total_score = sum(result.get("score", 0.0) for result in search_results)
        avg_score = total_score / len(search_results)

        # Ensure score is between 0 and 1
        return min(max(avg_score, 0.0), 1.0)

    async def validate_selected_text_scope(self, query: str, selected_text: str) -> Dict[str, Any]:
        """
        Validate if the query is appropriately scoped to the selected text
        """
        try:
            # This would implement logic to determine if the question is relevant to the selected text
            # For now, return a basic validation
            query_lower = query.lower()
            text_lower = selected_text.lower()

            # Check if query contains keywords that appear in the selected text
            query_words = set(query_lower.split())
            text_words = set(text_lower.split())

            overlap = len(query_words.intersection(text_words))
            overlap_ratio = overlap / len(query_words) if query_words else 0

            return {
                "is_scoped_appropriately": overlap_ratio > 0.1,  # At least 10% word overlap
                "overlap_ratio": overlap_ratio,
                "suggestions": [] if overlap_ratio > 0.1 else [
                    "Consider rephrasing your question to be more specific to the selected text",
                    "Your question might be too general for the selected text"
                ]
            }

        except Exception as e:
            self.logger.error(f"Error validating selected text scope: {str(e)}")
            return {
                "is_scoped_appropriately": True,
                "overlap_ratio": 0.0,
                "suggestions": []
            }


# Global instance
selected_text_service = SelectedTextService()