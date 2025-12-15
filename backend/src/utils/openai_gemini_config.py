"""
Configuration to use Google's Gemini API with OpenAI Agents SDK
"""
import os
from openai import OpenAI
from .gemini_model_provider import set_gemini_provider, get_gemini_provider
from ..config.settings import settings


def configure_openai_for_gemini():
    """
    Configure the OpenAI client to work with Google's Gemini API
    """
    # Set up the Gemini model provider
    api_key = settings.google_api_key
    model_name = settings.google_chat_model if hasattr(settings, 'google_chat_model') else settings.chat_model

    set_gemini_provider(api_key, model_name)

    # Create a mock OpenAI client that uses our Gemini provider
    class GeminiOpenAIClient:
        def __init__(self):
            self.chat = GeminiChatClient()

    class GeminiChatClient:
        def __init__(self):
            self.completions = GeminiCompletionsClient()

    class GeminiCompletionsClient:
        def create(self, **kwargs):
            provider = get_gemini_provider()
            if provider:
                return provider.chat_completions_create(**kwargs)
            else:
                raise Exception("Gemini provider not initialized")

    # Return the mock client
    return GeminiOpenAIClient()


# Alternative approach: Monkey-patch the OpenAI client to use Gemini
def monkey_patch_openai_client():
    """
    Replace OpenAI client functionality with Gemini equivalent
    """
    import openai
    from .gemini_model_provider import get_gemini_provider

    # Store original client
    original_client = getattr(openai, '_original_client', None)
    if not original_client:
        openai._original_client = openai.OpenAI() if hasattr(openai, 'OpenAI') else None

    # Create a custom client that uses Gemini
    class CustomOpenAIClient:
        def __init__(self):
            from .gemini_model_provider import get_gemini_provider
            self._provider = get_gemini_provider()

        @property
        def chat(self):
            return CustomChatClient(self._provider)

    class CustomChatClient:
        def __init__(self, provider):
            self._provider = provider

        @property
        def completions(self):
            return CustomCompletionsClient(self._provider)

    class CustomCompletionsClient:
        def __init__(self, provider):
            self._provider = provider

        def create(self, **kwargs):
            if self._provider:
                return self._provider.chat_completions_create(**kwargs)
            else:
                raise Exception("Gemini provider not initialized")

    # Replace the OpenAI client
    openai.client = CustomOpenAIClient()

    # Also update the main openai module
    openai.chat = openai.client.chat