"""
RAG (Retrieval-Augmented Generation) Service for Cafeino Bistro Chatbot
Uses Qdrant for vector storage, sentence-transformers for embeddings, and Gemini for generation
"""
import json
from pathlib import Path
from typing import List, Dict
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import uuid


class RAGService:
    def __init__(self):
        # Qdrant configuration
        self.qdrant_url = "https://d00ae12b-5b29-441f-8a8c-1dd032bb4730.europe-west3-0.gcp.cloud.qdrant.io"
        self.qdrant_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6OTAzMTZkODEtYjEwNy00YWM4LWJhZjktMTZhNmExMmVlZDkwIn0.izBHAyT1CAjYhBFxmprb-3vJsfy3HxMRS7Jg9HbyqV0"
        self.collection_name = "cafeino_knowledge"
        
        # Initialize Qdrant client
        self.client = QdrantClient(
            url=self.qdrant_url,
            api_key=self.qdrant_api_key
        )
        
        # Initialize embedding model
        self.embedder = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.embedding_dim = 384  # Dimension for all-MiniLM-L6-v2
        
        # Initialize Gemini
        genai.configure(api_key="AIzaSyCfaq_Bs_fqeI939mn_000_CkIv1QV5m8o")
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    def initialize_collection(self):
        """Create or recreate the Qdrant collection"""
        try:
            # Delete collection if exists
            self.client.delete_collection(collection_name=self.collection_name)
        except:
            pass
        
        # Create new collection
        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(size=self.embedding_dim, distance=Distance.COSINE)
        )
        print(f"✅ Collection '{self.collection_name}' created successfully")
    
    def load_and_index_knowledge(self):
        """Load knowledge base and menu, then index into Qdrant"""
        base_path = Path(__file__).parent.parent.parent
        
        # Load knowledge base
        kb_path = base_path / "knowledge_base.json"
        with open(kb_path, 'r', encoding='utf-8') as f:
            knowledge_base = json.load(f)
        
        # Load menu
        menu_path = base_path / "scraped_menu.json"
        with open(menu_path, 'r', encoding='utf-8') as f:
            menu = json.load(f)
        
        documents = []
        
        # Index restaurant info
        rest_info = knowledge_base['restaurant_info']
        documents.append({
            "text": f"{rest_info['name']} is a {rest_info['type']} located in {rest_info['location']}. {rest_info['description']} Our tagline is: {rest_info['tagline']}. Contact: {rest_info['contact']['phone']}, Website: {rest_info['contact']['website']}. Follow us on Instagram: {rest_info['contact']['social_media']['instagram']}, Facebook: {rest_info['contact']['social_media']['facebook']}, TikTok: {rest_info['contact']['social_media']['tiktok']}",
            "metadata": {"type": "restaurant_info", "category": "general"}
        })
        
        # Index hours
        documents.append({
            "text": f"Opening hours: Monday to Friday {rest_info['hours']['monday_friday']}, Saturday {rest_info['hours']['saturday']}, Sunday {rest_info['hours']['sunday']}",
            "metadata": {"type": "hours", "category": "general"}
        })
        
        # Index FAQs
        for faq in knowledge_base['faqs']:
            documents.append({
                "text": f"Q: {faq['question']}\nA: {faq['answer']}",
                "metadata": {"type": "faq", "category": "general"}
            })
        
        # Index menu categories
        for cat in knowledge_base['menu_categories']:
            doc_text = f"Category: {cat['name']}. {cat['description']}. "
            if 'popular_items' in cat:
                doc_text += f"Popular items: {', '.join(cat['popular_items'])}. "
            doc_text += f"Price range: {cat['price_range']}."
            if 'specialties' in cat:
                if isinstance(cat['specialties'], list):
                    doc_text += f" Specialties: {', '.join(cat['specialties'])}"
                else:
                    doc_text += f" {cat['specialties']}"
            
            documents.append({
                "text": doc_text,
                "metadata": {"type": "category", "category": cat['name']}
            })
        
        # Index menu items
        for item in menu:
            item_text = f"{item['name']} - {item['category']} - {item['price']} TND"
            if item.get('description'):
                item_text += f". {item['description']}"
            if item.get('is_new'):
                item_text += ". This is a NEW item on our menu!"
            if not item.get('is_available'):
                item_text += ". Currently unavailable."
            
            documents.append({
                "text": item_text,
                "metadata": {
                    "type": "menu_item",
                    "category": item['category'],
                    "name": item['name'],
                    "price": item['price'],
                    "is_new": item.get('is_new', False)
                }
            })
        
        # Index recommendations
        for rec_type, items in knowledge_base['recommendations'].items():
            documents.append({
                "text": f"Recommendations for {rec_type.replace('_', ' ')}: {', '.join(items)}",
                "metadata": {"type": "recommendation", "category": rec_type}
            })
        
        # Create embeddings and index
        print(f"📝 Indexing {len(documents)} documents...")
        points = []
        
        for i, doc in enumerate(documents):
            embedding = self.embedder.encode(doc['text']).tolist()
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "text": doc['text'],
                    **doc['metadata']
                }
            )
            points.append(point)
            
            if (i + 1) % 50 == 0:
                print(f"  Processed {i + 1}/{len(documents)} documents...")
        
        # Upload to Qdrant
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        
        print(f"✅ Successfully indexed {len(documents)} documents to Qdrant")
        return len(documents)
    
    def search(self, query: str, limit: int = 5) -> List[Dict]:
        """Search for relevant documents"""
        # Create query embedding
        query_vector = self.embedder.encode(query).tolist()
        
        # Search in Qdrant
        search_results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit
        )
        
        # Format results
        results = []
        for hit in search_results:
            results.append({
                "text": hit.payload['text'],
                "score": hit.score,
                "metadata": {k: v for k, v in hit.payload.items() if k != 'text'}
            })
        
        return results
    
    def generate_answer(self, query: str, context_docs: List[Dict]) -> str:
        """Generate answer using Gemini based on retrieved context"""
        # Combine context
        context = "\n\n".join([doc['text'] for doc in context_docs])
        
        # Create prompt for Gemini
        prompt = f"""You are a helpful assistant for Cafeino Bistro, a premium coffee shop and bistro in Gabès, Tunisia.

Use the following information from our knowledge base to answer the customer's question. Be friendly, helpful, and enthusiastic about our products.

CONTEXT:
{context}

CUSTOMER QUESTION: {query}

Please provide a helpful, friendly response. If recommending items, mention prices in TND. If the information isn't in the context, politely say so and offer to help with something else.

ANSWER:"""

        try:
            # Generate response with Gemini
            response = self.gemini_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating with Gemini: {e}")
            # Fallback to simple response
            answer = "Based on our menu and information:\n\n"
            for i, doc in enumerate(context_docs[:3], 1):
                answer += f"{i}. {doc['text']}\n\n"
            return answer.strip()
    
    def chat(self, query: str) -> Dict:
        """Main chat function - search and generate answer"""
        # Search for relevant documents
        relevant_docs = self.search(query, limit=5)
        
        if not relevant_docs:
            return {
                "answer": "I'm sorry, I couldn't find relevant information. Please try rephrasing your question or contact our staff for assistance.",
                "sources": []
            }
        
        # Generate answer
        answer = self.generate_answer(query, relevant_docs)
        
        return {
            "answer": answer,
            "sources": relevant_docs,
            "query": query
        }


# Global instance
rag_service = RAGService()
