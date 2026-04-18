# Cafeino Bistro RAG Chatbot 🤖☕

## Overview

This RAG (Retrieval-Augmented Generation) chatbot provides intelligent responses about Cafeino Bistro using:
- **Vector Database**: Qdrant Cloud
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2
- **Orchestration**: LangChain
- **Knowledge Base**: Restaurant info, menu, FAQs

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Initialize Knowledge Base

```bash
python setup_rag.py
```

This will:
- Create Qdrant collection
- Index all knowledge base documents
- Index complete menu (1300+ items)
- Test search and chat functionality

### 3. Start Backend

```bash
uvicorn app.main:app
```

## API Endpoints

### POST `/api/chatbot/query`

Query the chatbot with a question.

**Request:**
```json
{
  "question": "What coffee do you recommend?",
  "conversation_history": []
}
```

**Response:**
```json
{
  "answer": "Based on our menu...",
  "sources": [
    {
      "text": "CAPPUCCINO - Coffee Soft Drink - 4.5 TND",
      "score": 0.85,
      "metadata": {"type": "menu_item", "category": "Coffee Soft Drink"}
    }
  ],
  "query": "What coffee do you recommend?"
}
```

### POST `/api/chatbot/initialize`

Initialize/reinitialize the knowledge base (Admin only).

**Response:**
```json
{
  "message": "Knowledge base initialized successfully",
  "documents_indexed": 1450
}
```

### GET `/api/chatbot/health`

Check chatbot service health.

**Response:**
```json
{
  "status": "healthy",
  "collection": "cafeino_knowledge",
  "can_search": true
}
```

## Knowledge Base Structure

### 1. Restaurant Information
- Name, location, description
- Contact information
- Social media links
- Opening hours

### 2. FAQs
- Common questions and answers
- Information about services
- Policies and features

### 3. Menu Categories
- 10 categories with descriptions
- Popular items per category
- Price ranges
- Specialties

### 4. Menu Items
- 1300+ products with:
  - Name, category, price
  - Descriptions
  - Availability status
  - NEW item flags

### 5. Recommendations
- Coffee lovers
- Sweet tooth
- Healthy options
- Breakfast
- Signature drinks
- Budget-friendly

## Example Queries

The chatbot can answer questions like:

**General Information:**
- "What are your opening hours?"
- "Where are you located?"
- "Do you have WiFi?"
- "What's your Instagram?"

**Menu Questions:**
- "What coffee do you recommend?"
- "Do you have matcha drinks?"
- "What's the CAFÉINO smoothie?"
- "Show me breakfast options"
- "What are your new items?"

**Recommendations:**
- "I want something sweet"
- "What's good for breakfast?"
- "Recommend a healthy drink"
- "What's your signature drink?"

**Pricing:**
- "How much is a cappuccino?"
- "What's in the price range of 5-10 TND?"
- "What's your cheapest coffee?"

## Technical Details

### Embeddings Model
- **Model**: sentence-transformers/all-MiniLM-L6-v2
- **Dimension**: 384
- **Language**: Multilingual support
- **Speed**: Fast inference (~50ms per query)

### Vector Database
- **Provider**: Qdrant Cloud
- **Region**: Europe West 3 (GCP)
- **Distance Metric**: Cosine similarity
- **Collection**: cafeino_knowledge

### Search Parameters
- **Top-K**: 5 documents retrieved per query
- **Threshold**: Cosine similarity score
- **Re-ranking**: By relevance score

## Customization

### Adding New Knowledge

1. Edit `knowledge_base.json`
2. Run `python setup_rag.py` to reindex
3. Restart backend

### Updating Menu

1. Run scraper: `python app/scrape_menu.py`
2. Import to database: `python app/import_menu.py`
3. Reindex: `python setup_rag.py`

## Future Enhancements

- [ ] Add LLM for better answer generation (OpenAI/Claude)
- [ ] Implement conversation memory
- [ ] Add multilingual support (Arabic/French)
- [ ] Image-based menu search
- [ ] Voice input support
- [ ] Sentiment analysis
- [ ] Order suggestions based on preferences

## Troubleshooting

**Error: "Collection not found"**
- Run `python setup_rag.py` to initialize

**Error: "Connection refused"**
- Check Qdrant credentials in `rag_service.py`
- Verify internet connection

**Poor search results**
- Reindex knowledge base
- Check if documents were indexed correctly
- Verify embedding model is loaded

## Support

For issues or questions, contact the development team or check the main README.md.
