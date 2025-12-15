from fastapi import APIRouter
from typing import List
import uuid
from datetime import datetime
import time
from ...services.chat_service import chat_service
from ...services.rag_query_service import rag_query_service
from ...services.selected_text_service import selected_text_service
from ..models import UserQueryRequest, ChatCompletionResponse
from ...config.settings import settings
import logging


router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/chat", response_model=ChatCompletionResponse)
async def chat_endpoint(request: UserQueryRequest):
    """
    Main chat endpoint for Q&A functionality
    """
    try:
        logger.info(f"Received chat request: mode={request.query_mode}, session={request.session_id}")

        # Process the request using the chat service
        response_data = await chat_service.process_chat_request(
            query=request.query,
            session_id=request.session_id,
            query_mode=request.query_mode,
            selected_text=request.selected_text
        )

        # Validate response quality
        quality_check = await chat_service.validate_response_quality(
            query=request.query,
            response=response_data["response"],
            citations=response_data["citations"]
        )

        if not quality_check["is_valid"]:
            logger.warning(f"Response quality issues for session {request.session_id}: {quality_check['issues']}")

        # Create the final response in the required format
        model_name = settings.openrouter_model or settings.chat_model or "gpt-3.5-turbo"  # Use configured model or default

        return ChatCompletionResponse(
            id=response_data["id"],
            created=int(datetime.utcnow().timestamp()),  # Add required 'created' field
            model=model_name,  # Add required 'model' field
            choices=[
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": response_data["response"]},
                    "finish_reason": "stop"
                }
            ],
            usage={
                "prompt_tokens": len(request.query.split()),
                "completion_tokens": len(response_data["response"].split()),
                "total_tokens": len(request.query.split()) + len(response_data["response"].split())
            },
            citations=response_data["citations"]
        )

    except ValueError as e:
        logger.error(f"Validation error in chat request: {str(e)}")
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")