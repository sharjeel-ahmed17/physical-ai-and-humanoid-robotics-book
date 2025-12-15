import google.generativeai as genai
from qdrant_client import QdrantClient
from src.config.settings import settings

# Configure Google API
genai.configure(api_key=settings.openai_api_key)

# Initialize Qdrant client
if settings.qdrant_api_key:
    client = QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=settings.timeout
    )
else:
    client = QdrantClient(
        url=settings.qdrant_url,
        timeout=settings.timeout
    )

print(f"Connected to Qdrant at {settings.qdrant_url}")
print(f"Collection name: {settings.qdrant_collection_name}")

# List existing collections
collections = client.get_collections()
print("Existing collections:")
for collection in collections.collections:
    # Get collection info to get point count
    try:
        collection_info = client.get_collection(collection.name)
        print(f"  - {collection.name} (size: {collection_info.points_count})")
    except Exception as e:
        print(f"  - {collection.name} (could not get details: {e})")

# Try to delete the existing collection
try:
    print(f"\nDeleting collection: {settings.qdrant_collection_name}")
    client.delete_collection(settings.qdrant_collection_name)
    print("Collection deleted successfully")
except Exception as e:
    print(f"Error deleting collection: {e}")

# Create a new collection with 768 dimensions
from qdrant_client.http import models

print(f"\nCreating new collection: {settings.qdrant_collection_name} with 768 dimensions")
client.create_collection(
    collection_name=settings.qdrant_collection_name,
    vectors_config=models.VectorParams(
        size=768,  # Match Google's embedding dimension
        distance=models.Distance.COSINE
    )
)

# Verify the collection was created
collections = client.get_collections()
print("\nCollections after creation:")
for collection in collections.collections:
    try:
        collection_info = client.get_collection(collection.name)
        print(f"  - {collection.name} (size: {collection_info.points_count})")
    except Exception as e:
        print(f"  - {collection.name} (could not get details: {e})")

print("Collection setup complete!")