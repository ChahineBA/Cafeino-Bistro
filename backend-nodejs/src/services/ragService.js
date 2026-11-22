const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class RAGService {
  constructor() {
    this.qdrantUrl = process.env.QDRANT_URL;
    this.qdrantApiKey = process.env.QDRANT_API_KEY;
    this.collectionName = process.env.COLLECTION_NAME || 'cafeino_knowledge';
    this.embeddingDim = 384;

    this.client = new QdrantClient({
      url: this.qdrantUrl,
      apiKey: this.qdrantApiKey,
    });

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    this.embedder = null;
  }

  async getEmbedder() {
    if (!this.embedder) {
      // @xenova/transformers is ESM-only: load it with import() (require() crashes on Node < 22.12).
      // Loading it here also keeps the model out of memory until the chatbot is first used.
      const { pipeline } = await import('@xenova/transformers');
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return this.embedder;
  }

  async initializeCollection() {
    try {
      await this.client.deleteCollection(this.collectionName);
    } catch (error) {
      // Ignore if collection doesn't exist
    }

    await this.client.createCollection(this.collectionName, {
      vectors: {
        size: this.embeddingDim,
        distance: 'Cosine',
      },
    });
    console.log(`✅ Collection '${this.collectionName}' created successfully`);
  }

  async loadAndIndexKnowledge() {
    const basePath = path.join(__dirname, '..', '..', '..');
    
    // Load knowledge base
    const kbPath = path.join(basePath, 'backend', 'knowledge_base.json');
    const knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

    // Load menu
    const menuPath = path.join(basePath, 'backend', 'scraped_menu.json');
    const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

    const documents = [];

    // Index restaurant info
    const restInfo = knowledgeBase.restaurant_info;
    documents.push({
      text: `${restInfo.name} is a ${restInfo.type} located in ${restInfo.location}. ${restInfo.description} Our tagline is: ${restInfo.tagline}. Contact: ${restInfo.contact.phone}, Website: ${restInfo.contact.website}. Follow us on Instagram: ${restInfo.contact.social_media.instagram}, Facebook: ${restInfo.contact.social_media.facebook}, TikTok: ${restInfo.contact.social_media.tiktok}`,
      metadata: { type: 'restaurant_info', category: 'general' }
    });

    // Index hours
    documents.push({
      text: `Opening hours: Monday to Friday ${restInfo.hours.monday_friday}, Saturday ${restInfo.hours.saturday}, Sunday ${restInfo.hours.sunday}`,
      metadata: { type: 'hours', category: 'general' }
    });

    // Index FAQs
    for (const faq of knowledgeBase.faqs) {
      documents.push({
        text: `Q: ${faq.question}\nA: ${faq.answer}`,
        metadata: { type: 'faq', category: 'general' }
      });
    }

    // Index menu categories
    for (const cat of knowledgeBase.menu_categories) {
      let docText = `Category: ${cat.name}. ${cat.description}. `;
      if (cat.popular_items) {
        docText += `Popular items: ${cat.popular_items.join(', ')}. `;
      }
      docText += `Price range: ${cat.price_range}.`;
      if (cat.specialties) {
        if (Array.isArray(cat.specialties)) {
          docText += ` Specialties: ${cat.specialties.join(', ')}`;
        } else {
          docText += ` ${cat.specialties}`;
        }
      }

      documents.push({
        text: docText,
        metadata: { type: 'category', category: cat.name }
      });
    }

    // Index menu items
    for (const item of menu) {
      let itemText = `${item.name} - ${item.category} - ${item.price} TND`;
      if (item.description) {
        itemText += `. ${item.description}`;
      }
      if (item.is_new) {
        itemText += ". This is a NEW item on our menu!";
      }
      if (!item.is_available) {
        itemText += ". Currently unavailable.";
      }

      documents.push({
        text: itemText,
        metadata: {
          type: 'menu_item',
          category: item.category,
          name: item.name,
          price: item.price,
          is_new: item.is_new || false
        }
      });
    }

    // Index recommendations
    for (const [recType, items] of Object.entries(knowledgeBase.recommendations)) {
      documents.push({
        text: `Recommendations for ${recType.replace('_', ' ')}: ${items.join(', ')}`,
        metadata: { type: 'recommendation', category: recType }
      });
    }

    console.log(`📝 Indexing ${documents.length} documents...`);
    const embedder = await this.getEmbedder();
    const points = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const output = await embedder(doc.text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      points.push({
        id: uuidv4(),
        vector: embedding,
        payload: {
          text: doc.text,
          ...doc.metadata
        }
      });

      if ((i + 1) % 50 === 0) {
        console.log(`  Processed ${i + 1}/${documents.length} documents...`);
      }
    }

    // Upload to Qdrant
    await this.client.upsert(this.collectionName, {
      points: points,
    });

    console.log(`✅ Successfully indexed ${documents.length} documents to Qdrant`);
    return documents.length;
  }

  async search(query, limit = 5) {
    const embedder = await this.getEmbedder();
    const output = await embedder(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data);

    const searchResults = await this.client.search(this.collectionName, {
      vector: queryVector,
      limit: limit,
      with_payload: true,
    });

    return searchResults.map(hit => ({
      text: hit.payload.text,
      score: hit.score,
      metadata: Object.fromEntries(
        Object.entries(hit.payload).filter(([key]) => key !== 'text')
      )
    }));
  }

  async generateAnswer(query, contextDocs) {
    const context = contextDocs.map(doc => doc.text).join('\n\n');

    const prompt = `You are a helpful assistant for Cafeino Bistro, a premium coffee shop and bistro in Gabès, Tunisia.

Use the following information from our knowledge base to answer the customer's question. Be friendly, helpful, and enthusiastic about our products.

CONTEXT:
${context}

CUSTOMER QUESTION: ${query}

Please provide a helpful, friendly response. If recommending items, mention prices in TND. If the information isn't in the context, politely say so and offer to help with something else.

ANSWER:`;

    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error(`Error generating with Gemini: ${error.message}`);
      let answer = "Based on our menu and information:\n\n";
      contextDocs.slice(0, 3).forEach((doc, i) => {
        answer += `${i + 1}. ${doc.text}\n\n`;
      });
      return answer.trim();
    }
  }

  async chat(query) {
    const relevantDocs = await this.search(query, 5);

    if (relevantDocs.length === 0) {
      return {
        answer: "I'm sorry, I couldn't find relevant information. Please try rephrasing your question or contact our staff for assistance.",
        sources: []
      };
    }

    const answer = await this.generateAnswer(query, relevantDocs);

    return {
      answer: answer,
      sources: relevantDocs,
      query: query
    };
  }
}

const ragService = new RAGService();
module.exports = ragService;
