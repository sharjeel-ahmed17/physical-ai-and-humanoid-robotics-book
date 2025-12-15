"""
OpenAI Agents SDK Configuration with Google Gemini and OpenRouter backend
"""
from agents import Agent, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig, Runner
from pydantic_settings import BaseSettings
from typing import Optional
import os
from ..config.settings import settings
from ..utils.gemini_agents_provider import configure_global_gemini_provider, validate_no_openai_key


class AgentConfig:
    """
    Configuration for OpenAI Agents SDK to use with Google Gemini or OpenRouter
    """
    def __init__(self):
        # Check which provider to use based on available settings
        if settings.openrouter_api_key and settings.openrouter_model:
            # Use OpenRouter
            self.api_key = settings.openrouter_api_key
            self.model_name = settings.openrouter_model
            self.base_url = "https://openrouter.ai/api/v1"
        elif settings.google_api_key:
            # Use Google Gemini
            self.api_key = settings.google_api_key
            self.model_name = settings.google_chat_model
            self.base_url = "https://generativelanguage.googleapis.com/v1beta/openai"
        else:
            raise ValueError("Either GEMINI_API_KEY or OPENROUTER_API_KEY environment variable is required")

    def client(self):
        """
        Return configured AsyncOpenAI client that uses either Gemini or OpenRouter
        """
        return AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
        )

    def model(self):
        """
        Return configured model for the agent
        """
        return OpenAIChatCompletionsModel(
            model=self.model_name,
            openai_client=self.client()
        )


# Validate that no OpenAI key is present
validate_no_openai_key()

# Configure the global provider (either Gemini or OpenRouter)
configure_global_gemini_provider()

# Initialize the agent configuration
agent_config = AgentConfig()