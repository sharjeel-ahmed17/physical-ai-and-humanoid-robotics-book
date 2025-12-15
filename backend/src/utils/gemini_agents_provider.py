"""
Custom model provider for Google's Gemini API and OpenRouter to work with OpenAI Agents SDK
Based on the example from: https://github.com/openai/openai-agents-python/blob/main/examples/model_providers/custom_example_global.py
"""
import google.generativeai as genai
from typing import Dict, Any, List, Union, Optional
from openai import AsyncOpenAI, OpenAI
from openai.types.chat import ChatCompletion, ChatCompletionMessage
from openai.types.chat.chat_completion import Choice
from pydantic import BaseModel
import json
import os
from ..config.settings import settings


class GeminiAgentsProvider:
    """
    A custom model provider that allows using Google's Gemini API
    with the OpenAI Agents SDK following official patterns
    """

    def __init__(self, api_key: str, model_name: str = "models/gemini-1.5-flash", provider_type: str = "gemini"):
        """
        Initialize the model provider (either Gemini or OpenRouter)
        """
        self.provider_type = provider_type

        if provider_type == "gemini":
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(model_name)
            self.model_name = model_name
        elif provider_type == "openrouter":
            # For OpenRouter, we'll use the OpenAI client with their API
            self.openai_client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
            )
            self.model_name = model_name
        else:
            raise ValueError(f"Unsupported provider type: {provider_type}")

    def chat_completions_create(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> ChatCompletion:
        """
        Create a chat completion using either Google's Gemini API or OpenRouter
        Following the OpenAI Agents SDK interface
        """
        if self.provider_type == "gemini":
            # Convert messages to a single prompt string following OpenAI format
            prompt_parts = []
            for message in messages:
                role = message.get("role", "user")
                content = message.get("content", "")

                # Format according to Gemini expectations
                if role == "system":
                    # For system messages, we'll include them as context
                    prompt_parts.append(f"Context: {content}")
                elif role == "user":
                    prompt_parts.append(f"User: {content}")
                elif role == "assistant":
                    prompt_parts.append(f"Assistant: {content}")

            full_prompt = "\n".join(prompt_parts)

            # Configure generation parameters
            generation_config = genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )

            # Generate content using Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )

            # Convert Gemini response to OpenAI-compatible format
            content = response.text if response.text else "I couldn't generate a response."

            # Create a mock OpenAI ChatCompletion response
            choice = Choice(
                index=0,
                message=ChatCompletionMessage(
                    role="assistant",
                    content=content,
                    name=None,
                    function_call=None,
                    tool_calls=None
                ),
                finish_reason="stop"
            )

            return ChatCompletion(
                id="gemini-agents-" + str(abs(hash(content)))[:8],
                choices=[choice],
                created=0,  # timestamp would go here in a real implementation
                model=model or self.model_name,
                object="chat.completion",
                usage=None  # usage info would go here in a real implementation
            )

        elif self.provider_type == "openrouter":
            # Use OpenRouter API directly through OpenAI client
            openai_messages = []
            for message in messages:
                role = message.get("role", "user")
                content = message.get("content", "")
                openai_messages.append({"role": role, "content": content})

            # Ensure max_tokens doesn't exceed safe limits and is not None
            safe_max_tokens = max_tokens
            if safe_max_tokens is None or safe_max_tokens > 1000:  # Use a reasonable default
                safe_max_tokens = 1000

            # Create completion using OpenRouter
            response = self.openai_client.chat.completions.create(
                model=model or self.model_name,
                messages=openai_messages,
                temperature=temperature,
                max_tokens=safe_max_tokens,
                **{k: v for k, v in kwargs.items() if k not in ['messages', 'model', 'temperature', 'max_tokens']}
            )

            return response

    async def async_chat_completions_create(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> ChatCompletion:
        """
        Async version of chat completions create
        """
        if self.provider_type == "gemini":
            # For Gemini, we'll call the sync version since the genai library doesn't have async support
            return self.chat_completions_create(messages, model, temperature, max_tokens, **kwargs)
        elif self.provider_type == "openrouter":
            # Use OpenRouter API directly through async OpenAI client
            import openai
            async_openai_client = openai.AsyncOpenAI(
                api_key=self.openai_client.api_key,
                base_url="https://openrouter.ai/api/v1",
            )

            openai_messages = []
            for message in messages:
                role = message.get("role", "user")
                content = message.get("content", "")
                openai_messages.append({"role": role, "content": content})

            # Ensure max_tokens doesn't exceed safe limits and is not None
            safe_max_tokens = max_tokens
            if safe_max_tokens is None or safe_max_tokens > 1000:  # Use a reasonable default
                safe_max_tokens = 1000

            # Create completion using OpenRouter async
            response = await async_openai_client.chat.completions.create(
                model=model or self.model_name,
                messages=openai_messages,
                temperature=temperature,
                max_tokens=safe_max_tokens,
                **{k: v for k, v in kwargs.items() if k not in ['messages', 'model', 'temperature', 'max_tokens']}
            )

            return response


# Global instance to maintain the model provider
_gemini_agents_provider = None


def set_gemini_agents_provider(api_key: str, model_name: str = "models/gemini-1.5-flash", provider_type: str = "gemini"):
    """
    Set up the global model provider (either Gemini or OpenRouter) for OpenAI Agents SDK
    """
    global _gemini_agents_provider
    _gemini_agents_provider = GeminiAgentsProvider(api_key, model_name, provider_type)

    # Configure the OpenAI client globally to use our provider
    import openai
    from openai import OpenAI, AsyncOpenAI

    # Create a mock client that uses our provider
    class MockOpenAIClient:
        def __init__(self, api_key=None, base_url=None, **kwargs):
            self.api_key = api_key or settings.google_api_key
            self.base_url = base_url
            self.chat = MockChatClient()

        def with_options(self, **kwargs):
            return self

    class MockAsyncOpenAIClient:
        def __init__(self, api_key=None, base_url=None, **kwargs):
            self.api_key = api_key or settings.google_api_key
            self.base_url = base_url
            self.chat = MockAsyncChatClient()

        def with_options(self, **kwargs):
            return self

    class MockChatClient:
        def __init__(self):
            self.completions = MockCompletionsClient()

    class MockAsyncChatClient:
        def __init__(self):
            self.completions = MockAsyncCompletionsClient()

    class MockCompletionsClient:
        def create(self, **kwargs):
            provider = _gemini_agents_provider
            if provider:
                return provider.chat_completions_create(**kwargs)
            else:
                raise Exception("Gemini agents provider not initialized")

    class MockAsyncCompletionsClient:
        async def create(self, **kwargs):
            provider = _gemini_agents_provider
            if provider:
                return provider.chat_completions_create(**kwargs)
            else:
                raise Exception("Gemini agents provider not initialized")

    # Replace the default OpenAI clients
    openai.OpenAI = MockOpenAIClient
    openai.AsyncOpenAI = MockAsyncOpenAIClient
    openai.default_client = MockOpenAIClient()


def get_gemini_agents_provider():
    """
    Get the global Gemini model provider
    """
    global _gemini_agents_provider
    return _gemini_agents_provider


def configure_global_gemini_provider():
    """
    Configure the global provider with settings (either Gemini or OpenRouter)
    """
    # Check which provider to use based on available settings
    if settings.openrouter_api_key and settings.openrouter_model:
        # Use OpenRouter
        set_gemini_agents_provider(
            api_key=settings.openrouter_api_key,
            model_name=settings.openrouter_model,
            provider_type="openrouter"
        )
    elif settings.google_api_key:
        # Use Google Gemini
        set_gemini_agents_provider(
            api_key=settings.google_api_key,
            model_name=settings.chat_model,
            provider_type="gemini"
        )
    else:
        raise ValueError("Either GEMINI_API_KEY or OPENROUTER_API_KEY environment variable is required")


def validate_no_openai_key():
    """
    Validate that no OPENAI_API_KEY is present to prevent accidental OpenAI usage
    """
    if os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY detected but not allowed. Remove it and use GEMINI_API_KEY or OPENROUTER_API_KEY only.")