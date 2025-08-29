"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Send, Bot, User } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

const FAQ_DATA: FAQ[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'What is CarbonX?',
    answer: 'CarbonX is a comprehensive platform for carbon credit trading, sustainability tracking, and environmental impact management. We provide AI-powered tools to help individuals and businesses calculate, track, and offset their carbon footprint while participating in the carbon credit marketplace.'
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'How do I get started with CarbonX?',
    answer: 'Getting started is easy! Simply create an account, connect your wallet (MetaMask recommended), and explore our AI-powered tools like the Carbon Calculator and Event Planner. You can start tracking your carbon footprint immediately and begin trading carbon credits.'
  },
  {
    id: '3',
    category: 'AI Tools',
    question: 'What AI tools does CarbonX offer?',
    answer: 'CarbonX offers several AI-powered tools: AI Carbon Calculator for emission analysis, AI Plastic Footprint calculator for plastic waste tracking, Sustainable Event Planner for eco-friendly event management, and a coming-soon Sustainability Chat for personalized advice.'
  },
  {
    id: '4',
    category: 'AI Tools',
    question: 'How accurate is the AI Carbon Calculator?',
    answer: 'Our AI Carbon Calculator uses advanced machine learning models trained on extensive environmental data. It provides highly accurate estimations based on your input data and follows international carbon accounting standards like the GHG Protocol.'
  },
  {
    id: '5',
    category: 'Trading',
    question: 'How does carbon credit trading work on CarbonX?',
    answer: 'CarbonX provides a secure marketplace for buying and selling verified carbon credits. Our platform connects you with certified carbon offset projects, provides real-time pricing, and handles all transaction security through blockchain technology.'
  },
  {
    id: '6',
    category: 'Trading',
    question: 'What types of carbon credits are available?',
    answer: 'We offer various types of verified carbon credits including renewable energy projects, forest conservation, methane capture, and direct air capture technologies. All credits are certified by recognized standards like VCS, Gold Standard, and CDM.'
  },
  {
    id: '7',
    category: 'Portfolio',
    question: 'How can I track my carbon portfolio?',
    answer: 'Our Portfolio feature provides comprehensive tracking of your carbon credit investments, offset history, and environmental impact. You can view real-time valuations, performance analytics, and sustainability metrics all in one dashboard.'
  },
  {
    id: '8',
    category: 'Portfolio',
    question: 'Can I track cryptocurrency investments related to carbon credits?',
    answer: 'Yes! CarbonX integrates with major crypto platforms to track carbon-related cryptocurrency investments, green tokens, and environmental blockchain projects alongside traditional carbon credits.'
  },
  {
    id: '9',
    category: 'Technology',
    question: 'What blockchain technology does CarbonX use?',
    answer: 'CarbonX is built on Ethereum and uses smart contracts for secure, transparent carbon credit transactions. We also integrate with other EVM-compatible networks and use IPFS for decentralized data storage.'
  },
  {
    id: '10',
    category: 'Technology',
    question: 'Is my data secure on CarbonX?',
    answer: 'Absolutely. We use enterprise-grade security including end-to-end encryption, secure wallet connections, and never store your private keys. All personal data is encrypted and stored according to GDPR and SOC 2 Type II standards.'
  },
  {
    id: '11',
    category: 'Sustainability',
    question: 'How does CarbonX help with sustainability goals?',
    answer: 'CarbonX provides comprehensive sustainability management through carbon footprint tracking, offset purchasing, sustainable alternative recommendations, and detailed impact analytics to help you achieve net-zero goals.'
  },
  {
    id: '12',
    category: 'Sustainability',
    question: 'What sustainable alternatives does CarbonX recommend?',
    answer: 'Our platform recommends eco-friendly alternatives across various categories including renewable energy options, sustainable transportation, green products, and carbon-neutral services based on your specific needs and location.'
  }
];

const CATEGORIES = ['All', 'Getting Started', 'AI Tools', 'Trading', 'Portfolio', 'Technology', 'Sustainability'];

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Hi! I\'m your CarbonX assistant. I can help answer questions about our platform, AI tools, carbon trading, and sustainability features. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredFAQs = selectedCategory === 'All' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/carbonx-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          context: 'CarbonX FAQ Support'
        }),
      });

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: data.response || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: 'Sorry, I\'m having trouble connecting right now. Please try again later or check our FAQ section above.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Find answers to common questions about CarbonX platform, AI tools, carbon trading, and sustainability features.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-500 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <div key={faq.id} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded mb-2">
                      {faq.category}
                    </span>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {faq.question}
                    </h3>
                  </div>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  )}
                </button>
                {openFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div 
            className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-pointer flex items-center justify-between"
            onClick={() => setShowChat(!showChat)}
          >
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">CarbonX AI Assistant</h3>
                <p className="text-sm opacity-90">Ask me anything about CarbonX</p>
              </div>
            </div>
            <MessageCircle className="w-5 h-5" />
          </div>

          {showChat && (
            <div className="h-96 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(message => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-green-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about CarbonX features, carbon trading, AI tools..."
                    className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
