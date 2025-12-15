import google.generativeai as genai
import os
from src.config.settings import settings

# Configure with the API key from settings
genai.configure(api_key=settings.openai_api_key)

# Test embedding to see what dimension is produced
test_text = "This is a test sentence for embedding."
try:
    response = genai.embed_content(
        model=settings.embedding_model,
        content=test_text,
        task_type="RETRIEVAL_DOCUMENT"
    )
    embedding = response['embedding']
    print(f"Embedding dimension: {len(embedding)}")
    print(f"First 10 values: {embedding[:10]}")
except Exception as e:
    print(f"Error getting embedding: {e}")

    # Try with a different model that might produce 1024 dimensions
    print("Trying with embedding-003 model which might produce 1024 dimensions...")
    try:
        response = genai.embed_content(
            model="models/embedding-001",  # This is the older model
            content=test_text,
            task_type="RETRIEVAL_DOCUMENT"
        )
        embedding = response['embedding']
        print(f"Embedding-001 dimension: {len(embedding)}")
    except Exception as e2:
        print(f"Error with embedding-001: {e2}")