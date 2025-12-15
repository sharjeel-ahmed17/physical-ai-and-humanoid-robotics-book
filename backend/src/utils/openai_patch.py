"""
Initialization module to patch OpenAI library to use Google's Gemini API
This should be imported first in the application to ensure proper patching
"""
import google.generativeai as genai
from openai import OpenAI
from openai.types.chat import ChatCompletion
from openai.types.chat.chat_completion import Choice
from openai.types.chat.chat_completion_message import ChatCompletionMessage
from typing import List, Dict, Any, Optional
from .config.settings import settings


class GeminiOpenAIClient:
    """
    A client that implements the OpenAI API interface but uses Google's Gemini API
    """
    def __init__(self, api_key=None, *args, **kwargs):
        # Use the provided API key or get from settings
        if api_key is None:
            api_key = settings.google_api_key
        genai.configure(api_key=api_key)
        self.model_name = settings.google_chat_model if hasattr(settings, 'google_chat_model') else settings.chat_model
        self.gemini_model = genai.GenerativeModel(self.model_name)

    def chat(self):
        return self

    @property
    def completions(self):
        return self

    def create(
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
        )


# Replace the OpenAI class globally
def patch_openai():
    import builtins
    original_import = builtins.__import__

    def patched_import(name, *args, **kwargs):
        module = original_import(name, *args, **kwargs)
        if name == "openai":
            # Replace the OpenAI class with our Gemini client
            module.OpenAI = GeminiOpenAIClient
            # Set up the chat.completions structure
            fake_client = GeminiOpenAIClient()
            module.chat = type('Chat', (), {'completions': fake_client})()
        return module

    builtins.__import__ = patched_import


# Apply the patch
patch_openai()