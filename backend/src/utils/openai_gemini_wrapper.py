"""
Global OpenAI client configuration to use Google's Gemini API
This module should be imported and used to configure the OpenAI client globally
"""
import google.generativeai as genai
from openai import OpenAI
from openai.types.chat import ChatCompletion
from openai.types.chat.chat_completion import Choice
from openai.types.chat.chat_completion_message import ChatCompletionMessage
from typing import List, Dict, Any, Optional
from ..config.settings import settings


class GeminiAPIClient:
    """
    A client that implements the OpenAI API interface but uses Google's Gemini API
    """

    def __init__(self):
        # Configure Google Generative AI
        api_key = settings.google_api_key
        genai.configure(api_key=api_key)
        self.model_name = settings.google_chat_model if hasattr(settings, 'google_chat_model') else settings.chat_model
        self.gemini_model = genai.GenerativeModel(self.model_name)

    def chat_completions_create(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> ChatCompletion:
        """
        Create a chat completion using Google's Gemini API but returning OpenAI-compatible response
        """
        # Convert messages to a single prompt string
        prompt_parts = []
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            prompt_parts.append(f"{role.capitalize()}: {content}")

        full_prompt = "\n".join(prompt_parts)

        # Configure generation parameters
        generation_config = genai.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

        # Generate content using Gemini
        response = self.gemini_model.generate_content(
            full_prompt,
            generation_config=generation_config
        )

        # Convert Gemini response to OpenAI-compatible format
        content = response.text if response.text else "I couldn't generate a response."

        # Create OpenAI-compatible response
        choice = Choice(
            index=0,
            message=ChatCompletionMessage(
                role="assistant",
                content=content,
            ),
            finish_reason="stop"
        )

        return ChatCompletion(
            id=f"gemini-{hash(content) % 1000000}",
            choices=[choice],
            created=0,  # In a real implementation, use actual timestamp
            model=self.model_name,
            object="chat.completion",
            # Add usage info if needed
        )


# Global instance
_gemini_client = None


def get_gemini_client():
    """
    Get the global Gemini API client that implements OpenAI interface
    """
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiAPIClient()
    return _gemini_client


def patch_openai_globally():
    """
    Patch the OpenAI library globally to use Gemini API
    """
    import openai

    # Create a mock client with Gemini backend
    class MockOpenAIClient:
        def __init__(self):
            self.chat = MockChatClient()

    class MockChatClient:
        def __init__(self):
            self.completions = MockCompletionsClient()

    class MockCompletionsClient:
        def create(self, **kwargs):
            client = get_gemini_client()
            return client.chat_completions_create(**kwargs)

    # Set up the mock client
    mock_client = MockOpenAIClient()

    # If there's an existing openai.OpenAI() instance, replace its functionality
    if hasattr(openai, 'OpenAI'):
        # Store original class
        original_openai_class = openai.OpenAI

        # Create a new class that uses Gemini
        class NewOpenAIClient:
            def __init__(self, *args, **kwargs):
                self.chat = MockChatClient()

        # Replace the class
        openai.OpenAI = NewOpenAIClient

    # Also set up direct access
    openai.chat = mock_client.chat