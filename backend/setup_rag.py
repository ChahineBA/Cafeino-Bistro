"""
Setup script for RAG chatbot
Initializes Qdrant collection and indexes knowledge base
"""
import asyncio
from app.services.rag_service import rag_service


async def main():
    print("=" * 60)
    print("🤖 Cafeino Bistro RAG Chatbot Setup")
    print("=" * 60)
    print()
    
    # Initialize collection
    print("📦 Step 1: Creating Qdrant collection...")
    rag_service.initialize_collection()
    print()
    
    # Load and index knowledge
    print("📚 Step 2: Loading and indexing knowledge base...")
    doc_count = rag_service.load_and_index_knowledge()
    print()
    
    # Test search
    print("🔍 Step 3: Testing search functionality...")
    test_query = "What are your opening hours?"
    results = rag_service.search(test_query, limit=3)
    print(f"  Query: '{test_query}'")
    print(f"  Found {len(results)} relevant documents")
    if results:
        print(f"  Top result: {results[0]['text'][:100]}...")
    print()
    
    # Test chat
    print("💬 Step 4: Testing chat functionality...")
    chat_response = rag_service.chat("What coffee do you recommend?")
    print(f"  Query: 'What coffee do you recommend?'")
    print(f"  Answer preview: {chat_response['answer'][:150]}...")
    print()
    
    print("=" * 60)
    print("✅ RAG Chatbot Setup Complete!")
    print("=" * 60)
    print()
    print("📌 Next steps:")
    print("  1. Start the backend: uvicorn app.main:app")
    print("  2. Test the chatbot at: http://localhost:8000/docs")
    print("  3. Use endpoint: POST /api/chatbot/query")
    print()


if __name__ == "__main__":
    asyncio.run(main())
