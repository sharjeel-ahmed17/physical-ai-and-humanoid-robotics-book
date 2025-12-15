import os
import glob
from typing import List, Dict, Any
from pathlib import Path
import markdown
from bs4 import BeautifulSoup
from uuid import uuid4
import logging

from ..utils.chunking_utils import chunking_service
from ..utils.embedding_utils import embedding_service
from ..vector_store.qdrant_client import qdrant_store
from ..models.book_content import BookContent
from ..database.database import get_db


class ContentIngestionService:
    def __init__(self, source_path: str = None):
        self.source_path = source_path or "book/docs"  # Default to book docs directory
        self.logger = logging.getLogger(__name__)

    async def ingest_content(self, source_path: str = None):
        """
        Main method to ingest content from markdown files
        """
        source_path = source_path or self.source_path
        self.logger.info(f"Starting content ingestion from: {source_path}")

        # Get all markdown files
        markdown_files = self._get_markdown_files(source_path)
        self.logger.info(f"Found {len(markdown_files)} markdown files to process")

        all_chunks = []
        for file_path in markdown_files:
            try:
                self.logger.info(f"Processing file: {file_path}")
                chunks = await self._process_markdown_file(file_path)
                all_chunks.extend(chunks)
                self.logger.info(f"Processed {len(chunks)} chunks from {file_path}")
            except Exception as e:
                self.logger.error(f"Error processing file {file_path}: {str(e)}")
                continue

        # Store chunks in vector database
        await self._store_chunks_in_vector_db(all_chunks)
        self.logger.info(f"Successfully ingested {len(all_chunks)} content chunks")

        return {
            "total_files": len(markdown_files),
            "total_chunks": len(all_chunks),
            "status": "success"
        }

    def _get_markdown_files(self, source_path: str) -> List[str]:
        """
        Get all markdown files from the source path
        """
        patterns = [
            os.path.join(source_path, "**/*.md"),
            os.path.join(source_path, "**/*.mdx")
        ]

        files = []
        for pattern in patterns:
            files.extend(glob.glob(pattern, recursive=True))

        # Remove duplicates and return
        return list(set(files))

    async def _process_markdown_file(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Process a single markdown file and return content chunks
        """
        # Read the markdown file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Convert markdown to HTML to extract text
        html = markdown.markdown(content)
        soup = BeautifulSoup(html, 'html.parser')
        text_content = soup.get_text()

        # Create a relative URL for the file
        relative_path = os.path.relpath(file_path, self.source_path)
        source_url = f"/docs/{relative_path.replace(os.sep, '/').replace('.md', '').replace('.mdx', '')}"

        # Extract title from the first H1 header or filename
        title = self._extract_title(content, relative_path)

        # Create hierarchy path based on directory structure
        hierarchy_path = self._create_hierarchy_path(relative_path)

        # Chunk the content
        chunks = chunking_service.chunk_text_by_hierarchy(
            text_content,
            source_url,
            title,
            hierarchy_path
        )

        # Convert to the format needed for vector storage
        chunk_dicts = []
        for chunk in chunks:
            # Create embedding for the chunk
            embedding = await embedding_service.create_embeddings(chunk.text)

            chunk_dict = {
                "id": str(uuid4()),
                "vector": embedding,
                "payload": {
                    "content_id": str(uuid4()),
                    "source_url": chunk.source_url,
                    "hierarchy_path": chunk.hierarchy_path,
                    "title": chunk.title,
                    "chunk_text": chunk.text,
                    "metadata": chunk.metadata
                }
            }
            chunk_dicts.append(chunk_dict)

        return chunk_dicts

    def _extract_title(self, content: str, file_path: str) -> str:
        """
        Extract title from markdown content or use filename
        """
        lines = content.split('\n')
        for line in lines:
            if line.strip().startswith('# '):
                return line.strip()[2:]  # Remove '# ' prefix

        # If no title found, use the filename
        return Path(file_path).stem.replace('-', ' ').replace('_', ' ').title()

    def _create_hierarchy_path(self, relative_path: str) -> str:
        """
        Create hierarchy path from file path
        """
        # Remove file extension and split path
        path_parts = Path(relative_path).with_suffix('').parts

        # Join with '/' to create hierarchy path
        hierarchy_path = '/'.join(path_parts)

        return hierarchy_path

    async def _store_chunks_in_vector_db(self, chunks: List[Dict[str, Any]]):
        """
        Store content chunks in the vector database
        """
        if not chunks:
            self.logger.warning("No chunks to store")
            return

        # Store in Qdrant
        from ..vector_store.qdrant_client import get_qdrant_store
        get_qdrant_store().upsert_vectors(chunks)
        self.logger.info(f"Stored {len(chunks)} chunks in vector database")


# Create a global instance
content_ingestion_service = ContentIngestionService()


# CLI command for content ingestion
if __name__ == "__main__":
    import asyncio
    import argparse

    parser = argparse.ArgumentParser(description="Content Ingestion CLI")
    parser.add_argument("--source-path", type=str, default=None,
                       help="Path to source markdown files (default: book/docs)")
    args = parser.parse_args()

    async def main():
        service = ContentIngestionService(args.source_path)
        result = await service.ingest_content()
        print(f"Content ingestion completed: {result}")

    asyncio.run(main())