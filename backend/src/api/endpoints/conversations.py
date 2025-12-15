from fastapi import APIRouter, HTTPException
from typing import List
from ...database.database import get_db
from ...models.conversation import Conversation
from ...models.session import Session
from ...models.user_query import UserQuery
from ...models.chat_response import ChatResponse as ChatResponseModel
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import and_, desc
from ..models import ConversationHistoryResponse
import uuid


router = APIRouter()


@router.get("/{session_id}", response_model=List[dict])
async def get_conversation_history(session_id: str):
    """
    Get conversation history for a specific session
    """
    try:
        # Validate session ID format
        if not is_valid_uuid(session_id):
            raise HTTPException(status_code=400, detail="Invalid session ID format")

        session_uuid = uuid.UUID(session_id)

        # In a real implementation, you would query the database for conversation history
        # For now, we'll return an empty list as placeholder
        # The actual implementation would look something like:
        #
        # with next(get_db()) as db:
        #     # Query conversation history from database
        #     conversations = db.query(Conversation).filter(
        #         Conversation.session_id == session_uuid
        #     ).order_by(Conversation.turn_number).all()
        #
        #     # Build messages list with user queries and chat responses
        #     messages = []
        #     for conv in conversations:
        #         # Get user query
        #         user_query = db.query(UserQuery).filter(
        #             UserQuery.id == conv.user_query_id
        #         ).first()
        #
        #         # Get chat response
        #         chat_response = db.query(ChatResponseModel).filter(
        #             ChatResponseModel.id == conv.chat_response_id
        #         ).first()
        #
        #         messages.append({
        #             "turn_number": conv.turn_number,
        #             "user_query": user_query.query_text if user_query else "",
        #             "response": chat_response.response_text if chat_response else "",
        #             "timestamp": conv.created_at.isoformat() if conv.created_at else None
        #         })
        #
        #     return ConversationHistoryResponse(
        #         session_id=session_id,
        #         messages=messages,
        #         created_at=datetime.utcnow(),  # Placeholder
        #         updated_at=datetime.utcnow()   # Placeholder
        #     )

        # Placeholder response - in real implementation, this would fetch from database
        return []

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation history: {str(e)}")


@router.delete("/{session_id}")
async def delete_conversation_history(session_id: str):
    """
    Delete conversation history for a specific session
    """
    try:
        # Validate session ID format
        if not is_valid_uuid(session_id):
            raise HTTPException(status_code=400, detail="Invalid session ID format")

        # In a real implementation, you would delete from the database
        # For now, this is a placeholder

        return {"message": f"Conversation history for session {session_id} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conversation history: {str(e)}")


def is_valid_uuid(uuid_str):
    """
    Check if a string is a valid UUID
    """
    try:
        uuid.UUID(uuid_str)
        return True
    except ValueError:
        return False