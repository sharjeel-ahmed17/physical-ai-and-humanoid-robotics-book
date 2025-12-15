---
id: 2
title: create-rag-chatbot-constitution
stage: constitution
date: 2025-12-15
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: 001-docusaurus-book-creation
user: Claude User
command: /sp.constitution
labels: ["constitution", "rag", "chatbot", "principles"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

Create a constitution for the "Integrated RAG Chatbot" embedded inside the Physical AI & Humanoid Robotics book.

Purpose:
Define the principles for building a trustworthy, in-book RAG chatbot.

Core Rules:
- Chatbot MUST answer strictly from book content
- Support user-selected text–only answering mode
- Prefer retrieval over hallucination
- Be transparent when information is not found
- Embed seamlessly inside a Docusaurus site
- Be production-ready, secure, and scalable

Tech Ethics:
- Deterministic retrieval > creative generation
- Explicit source grounding
- Minimal latency and clear UX

## Response snapshot

Updated the project constitution to enhance the "Integrated RAG Chatbot Development" section with specific principles and added a new "RAG Chatbot Tech Ethics" section. The updated constitution now includes:

1. Enhanced RAG Chatbot Development principles with the specific core rules requested:
   - Chatbot MUST answer strictly from book content
   - Support user-selected text–only answering mode
   - Prefer retrieval over hallucination
   - Be transparent when information is not found
   - Embed seamlessly inside a Docusaurus site
   - Be production-ready, secure, and scalable

2. New RAG Chatbot Tech Ethics section with:
   - Deterministic retrieval > creative generation
   - Explicit source grounding for all responses
   - Minimal latency and clear UX for optimal user experience
   - Strict adherence to book content without hallucination
   - Transparent communication when information is not available

3. Version incremented from 1.0.0 to 1.1.0
4. Updated the Sync Impact Report in the header
5. Added a requirement in the Development Workflow section about chatbot responses being grounded in source material with clear attribution

## Outcome

- ✅ Impact: Enhanced constitution with detailed RAG chatbot principles and ethics
- 🧪 Tests: No tests required for constitution update
- 📁 Files: Updated .specify/memory/constitution.md with new principles
- 🔁 Next prompts: Ready for feature specification and planning
- 🧠 Reflection: Constitution now provides clear guidelines for RAG chatbot development ensuring it adheres to the specified core rules and tech ethics

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Begin feature specification for RAG chatbot implementation