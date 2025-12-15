---
id: 1
title: Update Constitution
stage: constitution
date: 2025-12-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: SHARJEELAHMED
command: /sp.constitution
labels: [constitution, project-setup, governance]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
---

## Prompt

```text
'Project: Physical AI & Humanoid Robotics Textbook

Core principles:

Textbook Creation: Create a textbook to teach a course in Physical AI & Humanoid Robotics.
AI/Spec-Driven Development: Utilize Claude Code and Spec-Kit Plus for AI/Spec-Driven Book Creation.
Docusaurus & GitHub Pages: The book will be written using Docusaurus and deployed to GitHub Pages.
Integrated RAG Chatbot: Build and embed a Retrieval-Augmented Generation (RAG) chatbot within the published book. This chatbot, utilizing the OpenAI Agents/ChatKit SDKs, FastAPI, Neon Serverless Postgres database, and Qdrant Cloud Free Tier, must be able to answer user questions about the book's content, including answering questions based only on text selected by the user.
Reusable Intelligence (Bonus): Incorporate Claude Code Subagents and Agent Skills for reusable intelligence to earn bonus points.
User Authentication & Personalization (Bonus): Implement Signup and Signin using Better-Auth.com. Collect user's software and hardware background at signup to personalize content.
Content Personalization (Bonus): Allow logged users to personalize chapter content via a button at the start of each chapter.
Content Translation (Bonus): Enable logged users to translate chapter content into Urdu in the chapters by pressing a button at the start of each chapter.
Key standards:

Deliverables: A unified book project including AI/Spec-Driven Book Creation and Integrated RAG Chatbot Development.
Technology Stack: Docusaurus, GitHub Pages, OpenAI Agents/ChatKit SDKs, FastAPI, Neon Serverless Postgres, Qdrant Cloud Free Tier, Better-Auth.com (for bonus features).
Scoring: Base functionality (100 points), reusable intelligence (up to 50 bonus points), Signup/Signin & personalization (up to 50 bonus points), content personalization (up to 50 bonus points), Urdu translation (up to 50 bonus points).
Constraints:

The project is part of a hackathon.
The core deliverable is a textbook.
Mandatory use of Claude Code and Spec-Kit Plus.
Success criteria:

Successful deployment of the Docusaurus book to GitHub Pages.
A fully functional RAG chatbot embedded in the book, capable of answering questions based on book content and user-selected text.
Achieve maximum points by implementing all defined bonus features.'
```

## Response snapshot

Updated the project constitution with specific principles for the Physical AI & Humanoid Robotics Textbook project. The new constitution includes 8 core principles covering textbook creation, AI/Spec-driven development, deployment requirements, RAG chatbot development, reusable intelligence, user authentication, content personalization, and translation capabilities. It also includes technology stack requirements, development workflow guidelines, and governance rules.

## Outcome

- ✅ Impact: Created initial project constitution for Physical AI & Humanoid Robotics textbook project
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md with project-specific principles
- 🔁 Next prompts: Feature specification and planning can now proceed based on this constitution
- 🧠 Reflection: Constitution provides clear governance framework for the hackathon project

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin feature specification based on constitution