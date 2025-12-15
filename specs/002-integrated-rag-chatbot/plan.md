# Implementation Plan: Integrated RAG Chatbot

**Branch**: `002-integrated-rag-chatbot` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-integrated-rag-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of an integrated RAG (Retrieval-Augmented Generation) chatbot for the Physical AI & Humanoid Robotics book that enables users to ask questions about book content with two modes: book-wide Q&A and selected-text Q&A. The system will use FastAPI backend, OpenAI Agents/ChatKit SDK, Neon Serverless Postgres for metadata and conversations, and Qdrant Cloud Free Tier for vector storage and retrieval. The frontend widget will be embedded seamlessly in the Docusaurus book UI.

## Technical Context

**Language/Version**: Python 3.11, JavaScript/TypeScript for frontend components
**Primary Dependencies**: FastAPI, OpenAI Agents/ChatKit SDK, Qdrant, Neon Postgres, Docusaurus, React
**Storage**: Neon Serverless Postgres (conversations, metadata), Qdrant Cloud Free Tier (vector embeddings)
**Testing**: pytest for backend, Jest/React Testing Library for frontend
**Target Platform**: Web application (Docusaurus site deployed to GitHub Pages)
**Project Type**: Web application with backend API and frontend components
**Performance Goals**: <2 second response time for queries, handle up to 100 concurrent users
**Constraints**: Must operate within Qdrant Cloud Free Tier limits, integrate seamlessly with Docusaurus, deterministic retrieval prioritized over creative generation
**Scale/Scope**: Single book with multiple chapters, supporting 100+ concurrent users, 10+ conversation turns per session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The implementation must comply with the Physical AI & Humanoid Robotics Textbook Constitution:

- ✅ Integrated RAG Chatbot Development: Must answer strictly from book content
- ✅ Integrated RAG Chatbot Development: Must support user-selected text–only answering mode
- ✅ Integrated RAG Chatbot Development: Must prefer retrieval over hallucination
- ✅ Integrated RAG Chatbot Development: Must be transparent when information is not found
- ✅ Integrated RAG Chatbot Development: Must embed seamlessly inside a Docusaurus site
- ✅ Integrated RAG Chatbot Development: Must be production-ready, secure, and scalable
- ✅ RAG Chatbot Tech Ethics: Deterministic retrieval > creative generation
- ✅ RAG Chatbot Tech Ethics: Explicit source grounding for all responses
- ✅ RAG Chatbot Tech Ethics: Minimal latency and clear UX for optimal user experience
- ✅ RAG Chatbot Tech Ethics: Strict adherence to book content without hallucination
- ✅ RAG Chatbot Tech Ethics: Transparent communication when information is not available
- ✅ Technology Stack Requirements: Utilize FastAPI, OpenAI Agents/ChatKit SDKs, Neon Postgres, Qdrant Cloud Free Tier
- ✅ Development Workflow: Follow Spec-Driven Development methodology

## Project Structure

### Documentation (this feature)

```text
specs/002-integrated-rag-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code Structure

```text
backend/
├── src/
│   ├── models/
│   │   ├── user_query.py
│   │   ├── conversation.py
│   │   ├── book_content.py
│   │   ├── vector_embedding.py
│   │   └── chat_response.py
│   ├── services/
│   │   ├── content_ingestion_service.py
│   │   ├── vector_store_service.py
│   │   ├── rag_query_service.py
│   │   ├── chat_service.py
│   │   └── selected_text_service.py
│   ├── api/
│   │   ├── main.py
│   │   ├── endpoints/
│   │   │   ├── chat.py
│   │   │   ├── content.py
│   │   │   └── conversations.py
│   │   └── middleware/
│   ├── utils/
│   │   ├── embedding_utils.py
│   │   ├── chunking_utils.py
│   │   └── citation_utils.py
│   └── config/
│       └── settings.py
└── tests/
    ├── unit/
    ├── integration/
    └── contract/

frontend/
├── src/
│   ├── components/
│   │   ├── ChatWidget.jsx
│   │   ├── ChatInterface.jsx
│   │   ├── Message.jsx
│   │   ├── Citation.jsx
│   │   └── SelectedTextHighlighter.jsx
│   ├── hooks/
│   │   ├── useChat.js
│   │   └── useSelectedText.js
│   ├── services/
│   │   ├── apiClient.js
│   │   └── chatClient.js
│   └── styles/
│       └── chatWidget.css
└── tests/
    ├── unit/
    └── integration/
```

## Implementation Phases

### Phase 1: Content Ingestion & Indexing
- Develop content ingestion pipeline from Docusaurus markdown
- Implement chunking strategy for book content
- Create vector embeddings for content chunks
- Store embeddings in Qdrant vector database
- Implement content update mechanisms for book changes

### Phase 2: Vector Store & Metadata Design
- Design vector database schema for content chunks
- Define metadata structure for citations and sources
- Implement efficient similarity search algorithms
- Create indexing strategies for optimal retrieval
- Design fallback mechanisms for vector store unavailability

### Phase 3: RAG Query Pipeline
- Build retrieval pipeline for book-wide Q&A
- Implement context extraction and summarization
- Create citation generation system
- Design response validation and quality checks
- Implement transparency mechanisms for unavailable information

### Phase 4: Selected-text Scoped Retrieval
- Develop text selection detection in Docusaurus
- Implement scoped query processing for selected text
- Create context-aware response generation
- Design boundary detection for selected text scope
- Implement fallback to book-wide search when needed

### Phase 5: Chat API using OpenAI Agents / ChatKit
- Build FastAPI endpoints for chat functionality
- Integrate OpenAI Agents/ChatKit SDK for conversation management
- Implement conversation history storage and retrieval
- Create session management system
- Design error handling and fallback responses

### Phase 6: Frontend Widget Embedding in Docusaurus
- Develop React-based chat widget component
- Implement seamless integration with Docusaurus theme
- Create text selection and highlighting functionality
- Design responsive UI for various screen sizes
- Implement accessibility features for inclusive design

### Phase 7: Deployment, Monitoring, and Cost Optimization
- Containerize backend services with Docker
- Implement monitoring and logging solutions
- Set up performance metrics and alerting
- Optimize API usage for cost efficiency
- Implement caching strategies for performance
- Create deployment pipeline for GitHub Pages integration

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
