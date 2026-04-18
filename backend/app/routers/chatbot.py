"""
Chatbot router
Handles RAG-based chatbot queries for Cafeino Bistro
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional
from ..services.rag_service import rag_service


router = APIRouter()


class ChatQuery(BaseModel):
    """Schema for chat query"""
    question: str
    conversation_history: Optional[List[Dict]] = None


class ChatResponse(BaseModel):
    """Schema for chat response"""
    answer: str
    sources: List[Dict]
    query: str


@router.post("/query", response_model=ChatResponse)
async def chat_query(query: ChatQuery):
    """
    Query the RAG chatbot
    
    Args:
        query: User question about Cafeino Bistro
    
    Returns:
        Answer with relevant sources
    """
    try:
        result = rag_service.chat(query.question)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )


@router.post("/initialize")
async def initialize_knowledge_base():
    """
    Initialize and index the knowledge base (Admin only)
    This should be called once to set up the vector database
    """
    try:
        rag_service.initialize_collection()
        doc_count = rag_service.load_and_index_knowledge()
        return {
            "message": "Knowledge base initialized successfully",
            "documents_indexed": doc_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing knowledge base: {str(e)}"
        )


@router.get("/health")
async def chatbot_health():
    """Check if the chatbot service is healthy"""
    try:
        # Try a simple search
        results = rag_service.search("test", limit=1)
        return {
            "status": "healthy",
            "collection": rag_service.collection_name,
            "can_search": len(results) >= 0
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
