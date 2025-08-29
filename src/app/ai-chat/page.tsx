"use client";

import { useState } from "react";
import { Send, Bot, User, Lightbulb, TrendingUp, Leaf } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const SAMPLE_SUGGESTIONS = [
  "How can I reduce my company's carbon footprint?",
  "What are the best carbon credit investment strategies?",
  "Calculate emissions for a manufacturing plant",
  "How to implement sustainable practices in my business?",
  "What are the latest carbon pricing trends?",
  "How to track and report environmental impact?"
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI sustainability assistant. I can help you with carbon footprint calculations, sustainability strategies, carbon credit investments, and environmental impact analysis. How can I assist you today?",
      timestamp: new Date(),
      suggestions: SAMPLE_SUGGESTIONS.slice(0, 3)
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call your AI API)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Thank you for your question! This is a placeholder response. In the full implementation, I would provide detailed sustainability advice, carbon calculations, and actionable recommendations based on your specific needs.",
        timestamp: new Date(),
        suggestions: SAMPLE_SUGGESTIONS.slice(3, 6)
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl">
              <Bot className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">AI Sustainability Chat</h1>
              <p className="text-zinc-400">Get personalized advice for your carbon reduction journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-medium text-orange-400">Coming Soon</h3>
              <p className="text-sm text-zinc-400">This AI chat feature is currently in development. Experience our other AI tools while we prepare this exciting feature!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-400" />
                  </div>
                )}
                
                <div className={`max-w-md ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-zinc-800/60 text-zinc-100'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-zinc-500">Suggested questions:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs text-zinc-400 hover:text-zinc-300 p-2 rounded bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green-400" />
                </div>
                <div className="bg-zinc-800/60 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about carbon footprints, sustainability strategies, or carbon credits..."
                className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-6">What you'll be able to do:</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-semibold text-zinc-100 mb-2">Carbon Analysis</h3>
            <p className="text-sm text-zinc-400">Get instant carbon footprint calculations and personalized reduction strategies</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <Leaf className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-semibold text-zinc-100 mb-2">Sustainability Advice</h3>
            <p className="text-sm text-zinc-400">Receive expert guidance on implementing sustainable practices in your business</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <Bot className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-semibold text-zinc-100 mb-2">Smart Recommendations</h3>
            <p className="text-sm text-zinc-400">AI-powered suggestions for carbon credit investments and environmental initiatives</p>
          </div>
        </div>
      </div>
    </div>
  );
}
