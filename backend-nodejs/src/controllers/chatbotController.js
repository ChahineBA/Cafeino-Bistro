const ragService = require('../services/ragService');

// @desc    Query the RAG chatbot
// @route   POST /api/chatbot/query
// @access  Public
const chatQuery = async (req, res) => {
  const { question } = req.body;

  try {
    const result = await ragService.chat(question);
    res.json(result);
  } catch (error) {
    console.error(`Error processing query: ${error.message}`);
    res.status(500).json({ detail: `Error processing query: ${error.message}` });
  }
};

// @desc    Initialize and index the knowledge base
// @route   POST /api/chatbot/initialize
// @access  Private/Admin
const initializeKnowledgeBase = async (req, res) => {
  try {
    await ragService.initializeCollection();
    const docCount = await ragService.loadAndIndexKnowledge();
    res.json({
      message: 'Knowledge base initialized successfully',
      documents_indexed: docCount,
    });
  } catch (error) {
    console.error(`Error initializing knowledge base: ${error.message}`);
    res.status(500).json({ detail: `Error initializing knowledge base: ${error.message}` });
  }
};

// @desc    Check if the chatbot service is healthy
// @route   GET /api/chatbot/health
// @access  Public
const chatbotHealth = async (req, res) => {
  try {
    const results = await ragService.search('test', 1);
    res.json({
      status: 'healthy',
      collection: ragService.collectionName,
      can_search: results.length >= 0,
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      error: error.message,
    });
  }
};

module.exports = {
  chatQuery,
  initializeKnowledgeBase,
  chatbotHealth,
};
