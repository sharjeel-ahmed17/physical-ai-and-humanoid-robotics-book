import re
from typing import List, Dict, Tuple
from dataclasses import dataclass
from ..config.settings import settings


@dataclass
class ContentChunk:
    id: str
    text: str
    metadata: Dict
    hierarchy_path: str
    source_url: str
    title: str


class ChunkingService:
    def __init__(self, max_chunk_size: int = 1000, overlap_size: int = 100):
        self.max_chunk_size = max_chunk_size
        self.overlap_size = overlap_size

    def chunk_text_by_hierarchy(self, content: str, source_url: str, title: str, hierarchy_path: str) -> List[ContentChunk]:
        """
        Chunk text based on document hierarchy (sections, paragraphs) while respecting size limits
        """
        chunks = []
        chunk_id = 0

        # Split content by major sections first (h2, h3, etc.)
        sections = self._split_by_headers(content)

        for section in sections:
            section_chunks = self._chunk_section(section, source_url, title, hierarchy_path)
            for chunk in section_chunks:
                chunks.append(
                    ContentChunk(
                        id=f"{source_url.replace('/', '_')}_{chunk_id}",
                        text=chunk['text'],
                        metadata=chunk['metadata'],
                        hierarchy_path=hierarchy_path,
                        source_url=source_url,
                        title=title
                    )
                )
                chunk_id += 1

        return chunks

    def _split_by_headers(self, content: str) -> List[Dict]:
        """
        Split content by markdown headers to preserve document structure
        """
        # Find all headers and their positions
        header_pattern = r'^(#{1,6})\s+(.+)$'
        lines = content.split('\n')

        sections = []
        current_section = {'header': '', 'content': [], 'level': 0}

        for line in lines:
            match = re.match(header_pattern, line.strip())
            if match:
                # Save the previous section if it has content
                if current_section['content']:
                    sections.append({
                        'header': current_section['header'],
                        'content': '\n'.join(current_section['content']),
                        'level': current_section['level']
                    })

                # Start a new section
                current_section = {
                    'header': line.strip(),
                    'content': [],
                    'level': len(match.group(1))
                }
            else:
                current_section['content'].append(line)

        # Add the last section
        if current_section['content']:
            sections.append({
                'header': current_section['header'],
                'content': '\n'.join(current_section['content']),
                'level': current_section['level']
            })

        return sections

    def _chunk_section(self, section: Dict, source_url: str, title: str, hierarchy_path: str) -> List[Dict]:
        """
        Chunk a section while respecting the max chunk size
        """
        chunks = []
        header = section['header']
        content = section['content']

        # If the section is smaller than the max size, return as is
        if len(content) <= self.max_chunk_size:
            chunks.append({
                'text': f"{header}\n\n{content}" if header else content,
                'metadata': {
                    'source_url': source_url,
                    'hierarchy_path': hierarchy_path,
                    'title': title,
                    'section_header': header
                }
            })
        else:
            # Split the content into smaller chunks
            text_chunks = self._split_text_by_size(content)

            for i, text_chunk in enumerate(text_chunks):
                chunk_text = f"{header} (Part {i+1})\n\n{text_chunk}" if header else text_chunk
                chunks.append({
                    'text': chunk_text,
                    'metadata': {
                        'source_url': source_url,
                        'hierarchy_path': f"{hierarchy_path}#part-{i+1}",
                        'title': f"{title} - Part {i+1}",
                        'section_header': header,
                        'chunk_index': i
                    }
                })

        return chunks

    def _split_text_by_size(self, text: str) -> List[str]:
        """
        Split text into chunks of approximately max_chunk_size while trying to break at sentence boundaries
        """
        chunks = []
        current_chunk = ""
        sentences = re.split(r'(?<=[.!?])\s+', text)

        for sentence in sentences:
            if len(current_chunk) + len(sentence) <= self.max_chunk_size:
                current_chunk += sentence + " "
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + " "

        # Add the last chunk if it has content
        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        # If any chunk is still too large, split it by characters
        final_chunks = []
        for chunk in chunks:
            if len(chunk) > self.max_chunk_size:
                final_chunks.extend(self._split_large_chunk_by_size(chunk))
            else:
                final_chunks.append(chunk)

        return final_chunks

    def _split_large_chunk_by_size(self, text: str) -> List[str]:
        """
        Split a large chunk by character count as a last resort
        """
        chunks = []
        for i in range(0, len(text), self.max_chunk_size - self.overlap_size):
            chunk = text[i:i + self.max_chunk_size]
            chunks.append(chunk)
        return chunks


# Global instance
chunking_service = ChunkingService()