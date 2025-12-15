<!--
Sync Impact Report:
Version change: 1.0.0 → 1.1.0 (enhanced RAG chatbot principles)
Added sections: Enhanced RAG Chatbot Development principles with specific rules and tech ethics
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/templates/commands/*.md ⚠ pending review
Follow-up TODOs: None
-->
# Physical AI & Humanoid Robotics Textbook Constitution

## Core Principles

### Textbook Creation
Create a comprehensive textbook to teach a course in Physical AI & Humanoid Robotics. The textbook must serve as both an educational resource and practical guide for students learning about physical AI and humanoid robotics.

### AI/Spec-Driven Development
Utilize Claude Code and Spec-Kit Plus for AI/Spec-Driven Book Creation. All development must follow spec-driven methodology with AI assistance to ensure consistency, quality, and rapid iteration.

### Docusaurus & GitHub Pages Deployment
The book will be written using Docusaurus and deployed to GitHub Pages. All content must be structured to work within the Docusaurus framework and be deployable to GitHub Pages for public access.

### Integrated RAG Chatbot Development
Build and embed a Retrieval-Augmented Generation (RAG) chatbot within the published book that strictly adheres to the following rules:
- Chatbot MUST answer strictly from book content
- Support user-selected text–only answering mode
- Prefer retrieval over hallucination
- Be transparent when information is not found
- Embed seamlessly inside a Docusaurus site
- Be production-ready, secure, and scalable
The chatbot must utilize OpenAI Agents/ChatKit SDKs, FastAPI, Neon Serverless Postgres database, and Qdrant Cloud Free Tier to answer user questions about book content and user-selected text with deterministic retrieval prioritized over creative generation.

### RAG Chatbot Tech Ethics
The RAG chatbot must follow ethical technology principles:
- Deterministic retrieval > creative generation
- Explicit source grounding for all responses
- Minimal latency and clear UX for optimal user experience
- Strict adherence to book content without hallucination
- Transparent communication when information is not available in the source material

### Reusable Intelligence Implementation
Incorporate Claude Code Subagents and Agent Skills for reusable intelligence to earn bonus points. This includes creating modular, reusable components that can be leveraged across different parts of the textbook project.

### User Authentication & Personalization
Implement Signup and Signin using Better-Auth.com. Collect user's software and hardware background at signup to personalize content. Authentication must be secure and user data must be handled according to privacy standards.

### Content Personalization
Allow logged users to personalize chapter content via a button at the start of each chapter. Personalization must adapt content based on user's background and preferences while maintaining educational integrity.

### Content Translation
Enable logged users to translate chapter content into Urdu in the chapters by pressing a button at the start of each chapter. Translation functionality must preserve technical accuracy and be accessible to users who prefer Urdu as their learning language.

## Technology Stack Requirements

The project must utilize the following technology stack:
- Docusaurus for documentation framework
- GitHub Pages for deployment
- OpenAI Agents/ChatKit SDKs for chatbot functionality
- FastAPI for backend API development
- Neon Serverless Postgres database for data storage
- Qdrant Cloud Free Tier for vector storage and retrieval
- Better-Auth.com for authentication (for bonus features)

## Development Workflow

- All work must follow the Spec-Driven Development methodology using Spec-Kit Plus
- Features must be planned, specified, and tasked before implementation
- Each feature must have user stories, requirements, and success criteria defined
- Code changes must be small, testable, and reference code precisely
- All outputs must strictly follow user intent and project requirements
- Chatbot responses must be grounded in source material with clear attribution

## Governance

This constitution governs all development activities for the Physical AI & Humanoid Robotics Textbook project. All team members must adhere to these principles and requirements. Amendments to this constitution require explicit approval from project stakeholders and must be documented with clear rationale. All PRs and reviews must verify compliance with these principles. The project is part of a hackathon with specific scoring criteria: base functionality (100 points), reusable intelligence (up to 50 bonus points), Signup/Signin & personalization (up to 50 bonus points), content personalization (up to 50 bonus points), Urdu translation (up to 50 bonus points).

**Version**: 1.1.0 | **Ratified**: 2025-12-14 | **Last Amended**: 2025-12-15