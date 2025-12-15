#!/usr/bin/env python3
"""
Validation script for the Integrated RAG Chatbot implementation
"""
import os
import sys
from pathlib import Path

def validate_backend_structure():
    """Validate that all required backend files and directories exist"""
    backend_path = Path("backend")

    required_dirs = [
        "backend/src",
        "backend/src/models",
        "backend/src/services",
        "backend/src/api",
        "backend/src/api/endpoints",
        "backend/src/utils",
        "backend/src/config",
        "backend/src/database",
        "backend/src/vector_store",
        "backend/tests",
        "backend/tests/unit",
        "backend/tests/integration",
        "backend/tests/contract"
    ]

    required_files = [
        "backend/requirements.txt",
        "backend/src/config/settings.py",
        "backend/src/models/user_query.py",
        "backend/src/models/session.py",
        "backend/src/models/conversation.py",
        "backend/src/models/chat_response.py",
        "backend/src/models/book_content.py",
        "backend/src/models/citation.py",
        "backend/src/database/database.py",
        "backend/src/vector_store/qdrant_client.py",
        "backend/src/utils/embedding_utils.py",
        "backend/src/utils/chunking_utils.py",
        "backend/src/utils/citation_utils.py",
        "backend/src/api/models.py",
        "backend/src/api/main.py",
        "backend/src/api/endpoints/chat.py",
        "backend/src/api/endpoints/content.py",
        "backend/src/api/endpoints/conversations.py",
        "backend/src/services/content_ingestion_service.py",
        "backend/src/services/vector_store_service.py",
        "backend/src/services/rag_query_service.py",
        "backend/src/services/chat_service.py",
        "backend/src/services/selected_text_service.py",
        "backend/.env.example",
        "backend/Dockerfile"
    ]

    print("Validating backend structure...")
    all_good = True

    for directory in required_dirs:
        if not Path(directory).exists():
            print(f"ERROR: Missing directory: {directory}")
            all_good = False
        else:
            print(f"OK: Found directory: {directory}")

    for file in required_files:
        if not Path(file).exists():
            print(f"ERROR: Missing file: {file}")
            all_good = False
        else:
            print(f"OK: Found file: {file}")

    return all_good


def validate_frontend_structure():
    """Validate that all required frontend files and directories exist"""
    book_path = Path("book")

    required_dirs = [
        "book/src",
        "book/src/components",
        "book/src/hooks",
        "book/src/services",
        "book/src/styles",
        "book/tests",
        "book/tests/unit",
        "book/tests/integration"
    ]

    required_files = [
        "book/package.json",
        "book/src/components/ChatWidget.jsx",
        "book/src/components/ChatInterface.jsx",
        "book/src/components/Message.jsx",
        "book/src/components/Citation.jsx",
        "book/src/components/SelectedTextHighlighter.jsx",
        "book/src/hooks/useChat.js",
        "book/src/hooks/useSelectedText.js",
        "book/src/services/apiClient.js",
        "book/src/services/chatClient.js",
        "book/src/styles/chatWidget.css",
        "book/src/theme/Root.js",
        "book/docusaurus.config.js",
        "book/Dockerfile"
    ]

    print("\nValidating frontend structure...")
    all_good = True

    for directory in required_dirs:
        if not Path(directory).exists():
            print(f"ERROR: Missing directory: {directory}")
            all_good = False
        else:
            print(f"OK: Found directory: {directory}")

    for file in required_files:
        if not Path(file).exists():
            print(f"ERROR: Missing file: {file}")
            all_good = False
        else:
            print(f"OK: Found file: {file}")

    return all_good


def validate_docker_compose():
    """Validate docker-compose file exists and has correct services"""
    docker_compose_path = Path("docker-compose.yml")

    print("\nValidating docker-compose...")
    if docker_compose_path.exists():
        print("OK: Found docker-compose.yml")
        # Read and check for required services
        with open(docker_compose_path, 'r') as f:
            content = f.read()

        required_services = ["backend", "db", "qdrant"]
        all_good = True

        for service in required_services:
            if service in content:
                print(f"OK: Found service: {service}")
            else:
                print(f"ERROR: Missing service: {service}")
                all_good = False

        return all_good
    else:
        print("ERROR: Missing docker-compose.yml")
        return False


def validate_implementation():
    """Main validation function"""
    print("Validating Integrated RAG Chatbot Implementation")
    print("=" * 50)

    backend_ok = validate_backend_structure()
    frontend_ok = validate_frontend_structure()
    docker_ok = validate_docker_compose()

    print("\n" + "=" * 50)
    print("VALIDATION SUMMARY:")
    print(f"Backend structure: {'PASS' if backend_ok else 'FAIL'}")
    print(f"Frontend structure: {'PASS' if frontend_ok else 'FAIL'}")
    print(f"Docker setup: {'PASS' if docker_ok else 'FAIL'}")

    overall_success = backend_ok and frontend_ok and docker_ok

    print(f"\nOverall status: {'ALL CHECKS PASSED' if overall_success else 'SOME CHECKS FAILED'}")

    return overall_success


if __name__ == "__main__":
    success = validate_implementation()
    sys.exit(0 if success else 1)