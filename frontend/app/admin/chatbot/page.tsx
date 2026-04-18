"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Coffee, Clock, MapPin, DollarSign, Loader } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: any[];
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm the Cafeino Bistro assistant. Ask me anything about our menu, hours, location, or recommendations!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { icon: Coffee, text: "What coffee do you recommend?", category: "menu" },
    { icon: Clock, text: "What are your opening hours?", category: "info" },
    { icon: Sparkles, text: "What are your new items?", category: "menu" },
    { icon: MapPin, text: "Where are you located?", category: "info" },
    { icon: DollarSign, text: "What's under 5 TND?", category: "pricing" },
    { icon: Coffee, text: "Do you have matcha drinks?", category: "menu" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question?: string) => {
    const messageText = question || input;
    if (!messageText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call chatbot API
      const response = await api.post('/api/chatbot/query', {
        question: messageText,
        conversation_history: []
      });

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.data.answer,
        timestamp: new Date(),
        sources: response.data.sources
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error querying chatbot:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please make sure the chatbot is initialized by running 'python setup_rag.py' in the backend.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">AI Chatbot Testing 🤖</h1>
          <p className="text-[#6B6B63]">Test the RAG-powered chatbot for Cafeino Bistro</p>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="hidden md:block w-16 h-16 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-2xl flex items-center justify-center shadow-xl"
        >
          <Bot className="w-8 h-8 text-white" />
        </motion.div>
      </motion.div>

      {/* Chat Area - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-w-5xl mx-auto"
        style={{ height: 'calc(100vh - 16rem)' }}
      >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#C17817] to-[#E8B86D] p-6 flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30"
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Cafeino Assistant</h2>
              <p className="text-white/80 text-sm">Powered by AI • Always here to help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-[#FAFAF8] to-[#F5F5F3]">
            <AnimatePresence mode="popLayout">
              {/* Suggested Questions (shown initially) */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-4"
                    >
                      <Bot className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#1A1614] mb-2">How can I help you today?</h3>
                    <p className="text-[#6B6B63]">Try one of these questions or ask your own</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                    {suggestedQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSend(question.text)}
                        disabled={isLoading}
                        className="p-4 bg-white hover:bg-gradient-to-br hover:from-[#C17817]/5 hover:to-[#E8B86D]/5 rounded-xl border-2 border-[#e5e5e5] hover:border-[#C17817] transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-lg shadow-md group-hover:scale-110 transition-transform">
                            <question.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-[#1A1614]">{question.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${message.type === 'user' ? 'order-2' : ''}`}>
                    <div
                      className={`rounded-2xl p-4 shadow-md ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-white text-[#1A1614] border border-[#e5e5e5]'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className={`text-xs text-[#6B6B63] mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-md border border-[#e5e5e5]">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader className="w-4 h-4 text-[#C17817]" />
                      </motion.div>
                      <span className="text-sm text-[#6B6B63]">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t-2 border-[#E8E8E5]">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Cafeino Bistro..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0] disabled:opacity-50"
              />
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </motion.button>
            </div>
          </div>
        </motion.div>
    </div>
  );
}
