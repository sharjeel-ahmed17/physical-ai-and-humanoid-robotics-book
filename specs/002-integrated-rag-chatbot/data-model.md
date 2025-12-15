# Data Model: Integrated RAG Chatbot

## Entities

### UserQuery
- **id**: UUID (primary key)
- **query_text**: String (2-2000 characters)
- **query_mode**: Enum ["book-wide", "selected-text"]
- **selected_text**: String (optional, 0-5000 characters)
- **timestamp**: DateTime (UTC)
- **session_id**: UUID (foreign key to Session)
- **metadata**: JSON (source page, user context, etc.)

### Session
- **id**: UUID (primary key)
- **user_id**: UUID (optional, for logged users)
- **created_at**: DateTime (UTC)
- **last_activity**: DateTime (UTC)
- **is_active**: Boolean
- **metadata**: JSON (device info, preferences, etc.)

### Conversation
- **id**: UUID (primary key)
- **session_id**: UUID (foreign key to Session)
- **turn_number**: Integer (sequence in conversation)
- **user_query_id**: UUID (foreign key to UserQuery)
- **chat_response_id**: UUID (foreign key to ChatResponse)
- **created_at**: DateTime (UTC)

### ChatResponse
- **id**: UUID (primary key)
- **response_text**: String (response content)
- **citations**: JSON array of citation objects
- **confidence_score**: Float (0.0-1.0)
- **response_time_ms**: Integer
- **created_at**: DateTime (UTC)
- **metadata**: JSON (model used, tokens, etc.)

### BookContent
- **id**: UUID (primary key)
- **content_type**: Enum ["chapter", "section", "subsection", "paragraph"]
- **title**: String (content title)
- **content**: Text (the actual content)
- **chunk_text**: String (processed chunk for embedding)
- **source_url**: String (URL in the book)
- **page_number**: Integer (optional)
- **hierarchy_path**: String (e.g., "Chapter 3/Section 2.1")
- **embedding_id**: String (reference to vector database)
- **created_at**: DateTime (UTC)
- **updated_at**: DateTime (UTC)

### VectorEmbedding (Qdrant Collection)
- **id**: String (Qdrant point ID)
- **vector**: Array of floats (embedding vector)
- **payload**: JSON object with:
  - content_id: UUID (reference to BookContent)
  - source_url: String
  - hierarchy_path: String
  - title: String
  - chunk_text: String (first 500 chars)

### Citation
- **id**: UUID (primary key)
- **chat_response_id**: UUID (foreign key to ChatResponse)
- **book_content_id**: UUID (foreign key to BookContent)
- **citation_text**: String (the cited text)
- **source_url**: String (link to source)
- **relevance_score**: Float (0.0-1.0)
- **created_at**: DateTime (UTC)

## Relationships

- Session (1) → (*) UserQuery (many queries per session)
- Session (1) → (*) Conversation (many conversations per session)
- UserQuery (1) → (1) Conversation (one-to-one relationship)
- ChatResponse (1) → (1) Conversation (one-to-one relationship)
- Conversation (1) → (*) Citation (one conversation can have multiple citations)
- BookContent (1) → (*) Citation (one content can be cited multiple times)
- BookContent (1) → (*) UserQuery (through selected_text field, optional)

## Validation Rules

### UserQuery
- query_text must be 2-2000 characters
- query_mode must be one of the allowed values
- selected_text, if provided, must be 0-5000 characters
- session_id must reference an active session

### Session
- created_at must be before or equal to last_activity
- is_active can only be false if last_activity is set

### ChatResponse
- confidence_score must be between 0.0 and 1.0
- response_time_ms must be positive
- response_text must not be empty

### BookContent
- content_type must be one of the allowed values
- hierarchy_path must follow the format "Level1/Level2/Level3"
- embedding_id must be unique

### Citation
- relevance_score must be between 0.0 and 1.0
- chat_response_id and book_content_id combination must be unique within a response

## State Transitions

### Session
- NEW → ACTIVE (when first query is made)
- ACTIVE → INACTIVE (after period of inactivity or explicit end)
- INACTIVE → ARCHIVED (after retention period)

### UserQuery
- CREATED → PROCESSING (when sent to RAG pipeline)
- PROCESSING → COMPLETED (when response is ready)
- PROCESSING → FAILED (when error occurs)

## Indexes

### Postgres
- Session: idx_session_user_id, idx_session_active_status
- UserQuery: idx_userquery_session_timestamp
- ChatResponse: idx_chatresponse_created_at
- BookContent: idx_bookcontent_source_url, idx_bookcontent_hierarchy
- Citation: idx_citation_response_id

### Qdrant
- VectorEmbedding: payload.index on content_id, source_url, hierarchy_path