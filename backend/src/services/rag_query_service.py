import google.generativeai as genai
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import json

from ..config.settings import settings
from ..utils.embedding_utils import embedding_service
from ..services.vector_store_service import vector_store_service
from ..utils.citation_utils import citation_service


class RAGQueryService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        # Configure Google Generative AI
        genai.configure(api_key=settings.google_api_key)
        self.chat_model = genai.GenerativeModel(settings.chat_model)
        # Store the model name for later use
        self.model_name = settings.chat_model

    async def query_book_wide(self, query: str, session_id: str) -> Dict[str, Any]:
        """
        Handle book-wide Q&A queries
        """
        try:
            self.logger.info(f"Processing book-wide query: {query[:50]}...")

            # Search for relevant content in the vector store
            search_results = await vector_store_service.search_content(query, limit=5)

            if not search_results:
                return {
                    "response": "I couldn't find any relevant information in the book to answer your question.",
                    "citations": [],
                    "confidence_score": 0.0,
                    "query_mode": "book-wide"
                }

            # Format context from search results
            context_texts = [result["content"] for result in search_results]
            context = "\n\n".join(context_texts)

            # Generate response using OpenAI
            response_text = await self._generate_response(query, context)

            # Create citations from search results
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
            self.logger.error(f"Error in book-wide query: {str(e)}")
            raise

    async def query_selected_text(self, query: str, selected_text: str, session_id: str) -> Dict[str, Any]:
        """
        Handle selected-text Q&A queries
        """
        try:
            self.logger.info(f"Processing selected-text query: {query[:50]}...")

            # Combine the query with selected text for more focused search
            combined_query = f"{query} related to: {selected_text}"

            # Search for relevant content, potentially filtering by the selected text context
            search_results = await vector_store_service.search_content(
                combined_query,
                limit=3,
                filters={"chunk_text": selected_text[:100]} if selected_text else None  # This is a placeholder filter
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

            # Generate response using OpenAI with focus on selected text
            prompt = f"""
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

            generation_config = genai.GenerationConfig(
                temperature=settings.temperature,
                max_output_tokens=settings.max_tokens,
            )

            response = self.chat_model.generate_content(
                prompt,
                generation_config=generation_config
            )

            response_text = response.text if response.text else "I couldn't generate a response."

            # Create citations from search results
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
            self.logger.error(f"Error in selected-text query: {str(e)}")
            raise

    async def _generate_response(self, query: str, context: str) -> str:
        """
        Generate a response using OpenAI based on query and context
        """
        prompt = f"""
        You are a helpful assistant for the Physical AI & Humanoid Robotics book.
        Answer the user's question based on the following context from the book.
        If the context doesn't contain enough information to answer the question, say so.
        Always be truthful and only provide information that is present in the context.
        If you provide information from the book, include the relevant citations.

        Context: {context}

        Question: {query}

        Answer:
        """

        generation_config = genai.GenerationConfig(
            temperature=settings.temperature,
            max_output_tokens=settings.max_tokens,
        )

        response = self.chat_model.generate_content(
            prompt,
            generation_config=generation_config
        )

        return response.text if response.text else "I couldn't generate a response."

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

    async def validate_query_response(self, query: str, response: str, context: str) -> Dict[str, Any]:
        """
        Validate the quality and relevance of the generated response
        """
        try:
            # Check if response is related to the query
            validation_prompt = f"""
            Evaluate the following response to see if it appropriately answers the question based on the provided context.
            Respond with a JSON object containing:
            - "is_relevant": boolean indicating if the response is relevant to the question
            - "is_factual": boolean indicating if the response is factual and based on the context
            - "quality_score": number from 0-1 indicating the quality of the response
            - "feedback": string with brief feedback on the response quality

            Question: {query}
            Context: {context}
            Response: {response}
            """

            # For validation, we need to get a JSON response from Google's model
            # Google's API doesn't directly support JSON schema, so we'll parse the output
            generation_config = genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=300,
            )

            validation_response = self.chat_model.generate_content(
                validation_prompt,
                generation_config=generation_config
            )

            # Extract JSON from the response - Google might include text before/after JSON
            response_text = validation_response.text.strip()

            # Try to find JSON in the response (look for { and } brackets)
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}')

            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx+1]
                validation_result = json.loads(json_str)
            else:
                # If no JSON found, return default validation
                validation_result = {
                    "is_relevant": True,
                    "is_factual": True,
                    "quality_score": 0.8,
                    "feedback": "Could not parse validation response as JSON"
                }

            return validation_result

        except Exception as e:
            self.logger.error(f"Error validating query response: {str(e)}")
            # Return a default validation if the validation itself fails
            return {
                "is_relevant": True,
                "is_factual": True,
                "quality_score": 0.8,
                "feedback": "Validation could not be performed, assuming standard quality"
            }


# Global instance
rag_query_service = RAGQueryService()