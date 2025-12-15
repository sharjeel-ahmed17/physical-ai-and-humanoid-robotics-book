from typing import List, Dict, Any
from urllib.parse import urljoin


class CitationService:
    def __init__(self):
        pass

    def format_citation(self, source_url: str, title: str, text: str, relevance_score: float = 1.0) -> Dict[str, Any]:
        """
        Format a citation with proper structure
        """
        return {
            "source_url": source_url,
            "title": title,
            "text": text[:200] + "..." if len(text) > 200 else text,  # Truncate long text
            "relevance_score": relevance_score,
            "formatted": f"[{title}]({source_url})"
        }

    def create_citations_from_results(self, search_results: List[Dict], query_text: str) -> List[Dict[str, Any]]:
        """
        Create formatted citations from search results
        """
        citations = []
        for result in search_results:
            payload = result.get("payload", {})
            score = result.get("score", 0.0)

            citation = self.format_citation(
                source_url=payload.get("source_url", ""),
                title=payload.get("title", "Untitled"),
                text=payload.get("chunk_text", "")[:500],  # First 500 chars
                relevance_score=score
            )
            citations.append(citation)

        # Sort by relevance score (descending)
        citations.sort(key=lambda x: x["relevance_score"], reverse=True)
        return citations

    def extract_citation_context(self, content: str, query: str, window_size: int = 100) -> str:
        """
        Extract context around a citation that's relevant to the query
        """
        # Find the position of the query text in the content (case insensitive)
        content_lower = content.lower()
        query_lower = query.lower()

        pos = content_lower.find(query_lower)
        if pos == -1:
            # If exact query not found, try to find relevant sentences
            sentences = content.split('.')
            relevant_sentences = []
            for sentence in sentences:
                if any(word in sentence.lower() for word in query_lower.split()):
                    relevant_sentences.append(sentence.strip())

            if relevant_sentences:
                context = '. '.join(relevant_sentences[:3])  # First 3 relevant sentences
                return context + "." if not context.endswith(".") else context
            else:
                # Return first part of content if no relevant sentences found
                return content[:window_size * 2] + "..." if len(content) > window_size * 2 else content
        else:
            # Extract context around the found position
            start = max(0, pos - window_size)
            end = min(len(content), pos + len(query) + window_size)
            context = content[start:end]

            # Add ellipsis if we're not at the beginning or end
            if start > 0:
                context = "..." + context
            if end < len(content):
                context = context + "..."

            return context

    def validate_citation_format(self, citation: Dict[str, Any]) -> bool:
        """
        Validate that a citation has the required fields
        """
        required_fields = ["source_url", "title", "text", "relevance_score", "formatted"]
        return all(field in citation for field in required_fields)


# Global instance
citation_service = CitationService()