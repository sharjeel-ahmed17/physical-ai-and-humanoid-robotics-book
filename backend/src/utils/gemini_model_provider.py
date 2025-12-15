"""
Custom model provider for Google's Gemini API to work with OpenAI Agents SDK
Based on the example from: https://github.com/openai/openai-agents-python/blob/main/examples/model_providers/custom_example_global.py
"""

import google.generativeai as genai
from typing import Dict, Any, List, Union
from openai import OpenAI
from openai.lib._parsing._completions import ChatCompletion, ChatCompletionMessage
from openai.types.chat import ChatCompletionMessage as OpenAIChatCompletionMessage
from openai.types.chat.chat_completion import Choice
from pydantic import BaseModel
import json


class GeminiModelProvider:
    """
    A custom model provider that allows using Google's Gemini API
    with the OpenAI Agents SDK
    """

    def __init__(self, api_key: str, model_name: str = "models/gemini-1.5-flash"):
        """
        Initialize the Gemini model provider
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
        self.model_name = model_name

    def chat_completions_create(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> ChatCompletion:
        """
        Create a chat completion using Google's Gemini API
        """
        # Convert messages to a single prompt string
        # In a real implementation, you might want to handle the conversation history more carefully
        prompt_parts = []
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")

            # Add role prefix for better context
            if role == "system":
                prompt_parts.append(f"System: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}")
            else:  # user
                prompt_parts.append(f"User: {content}")

        full_prompt = "\n".join(prompt_parts)

        # Configure generation parameters
        generation_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        }

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
            message=OpenAIChatCompletionMessage(
                role="assistant",
                content=content,
                name=None,
                function_call=None,
                tool_calls=None
            ),
            finish_reason="stop"
        )

        return ChatCompletion(
            id="gemini-response-" + str(hash(content)) % 1000000,
            choices=[choice],
            created=0,  # timestamp would go here in a real implementation
            model=self.model_name,
            object="chat.completion",
            usage=None  # usage info would go here in a real implementation
        )


# Global instance to maintain the model provider
_gemini_provider = None


def set_gemini_provider(api_key: str, model_name: str = "models/gemini-1.5-flash"):
    """
    Set up the global Gemini model provider
    """
    global _gemini_provider
    _gemini_provider = GeminiModelProvider(api_key, model_name)


def get_gemini_provider():
    """
    Get the global Gemini model provider
    """
    global _gemini_provider
    return _gemini_provider