import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Try different possible environment variable names
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';

if (!API_KEY) {
  console.warn('Warning: No Gemini API key found. Chatbot will use fallback responses.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const CARBONX_KNOWLEDGE_BASE = `
CarbonX Platform Knowledge Base:

ABOUT CARBONX:
CarbonX is a comprehensive platform for carbon credit trading, sustainability tracking, and environmental impact management. We provide AI-powered tools to help individuals and businesses calculate, track, and offset their carbon footprint while participating in the carbon credit marketplace.

CORE FEATURES:
1. AI Carbon Calculator - Advanced AI-powered tool for calculating carbon footprints with emission analysis and credit recommendations
2. AI Plastic Footprint Calculator - Analyzes plastic waste impact with reduction strategies and sustainable alternatives
3. Sustainable Event Planner - AI-powered tool for planning eco-friendly events with sustainability recommendations and carbon tracking
4. Trading Platform - Secure marketplace for buying and selling verified carbon credits
5. Portfolio Management - Track carbon credit investments, offset history, and environmental impact
6. Cryptocurrency Integration - Track carbon-related crypto investments and green tokens

TECHNOLOGY STACK:
- Built on Ethereum blockchain with smart contracts
- Uses Next.js 14, React 18, TypeScript
- Tailwind CSS for styling
- Google Generative AI (Gemini) for AI features
- MetaMask wallet integration
- ThirdWeb for Web3 connectivity

AI TOOLS:
- AI Carbon Calculator: Provides instant carbon footprint analysis using machine learning models trained on environmental data
- AI Plastic Footprint: Analyzes plastic waste impact and suggests sustainable alternatives
- Sustainable Event Planner: Plans eco-friendly events with AI-powered sustainability recommendations
- Sustainability Chat (Beta): AI assistant for personalized sustainability advice

CARBON TRADING:
- Secure marketplace for verified carbon credits
- Supports various credit types: renewable energy, forest conservation, methane capture, direct air capture
- Certified by recognized standards: VCS, Gold Standard, CDM
- Real-time pricing and blockchain-secured transactions

SECURITY & COMPLIANCE:
- Enterprise-grade security with end-to-end encryption
- GDPR and SOC 2 Type II compliant
- Never stores private keys
- Secure wallet connections

SUSTAINABILITY FEATURES:
- Comprehensive carbon footprint tracking
- Offset purchasing and management
- Sustainable alternative recommendations
- Impact analytics and reporting
- Net-zero goal achievement tools

GETTING STARTED:
1. Create an account
2. Connect your wallet (MetaMask recommended)
3. Use AI tools to calculate your carbon footprint
4. Start trading carbon credits or tracking sustainability metrics

DEVELOPER:
Created by Akshit Tiwari (@AkshitTiwarii)
GitHub: https://github.com/AkshitTiwarii
LinkedIn: https://www.linkedin.com/in/akshit-tiwarii/
Email: akshittiwari29@gmail.com
`;

// Fallback responses for common questions when AI is unavailable
const FALLBACK_RESPONSES = {
  'what is carbonx': 'CarbonX is a comprehensive platform for carbon credit trading, sustainability tracking, and environmental impact management. We provide AI-powered tools to help calculate, track, and offset your carbon footprint.',
  'ai tools': 'CarbonX offers several AI-powered tools: AI Carbon Calculator for emission analysis, AI Plastic Footprint calculator for waste tracking, and Sustainable Event Planner for eco-friendly event management.',
  'carbon calculator': 'Our AI Carbon Calculator provides instant carbon footprint analysis using machine learning models trained on environmental data. It offers emission calculations and credit recommendations.',
  'plastic calculator': 'The AI Plastic Footprint calculator analyzes plastic waste impact and provides smart reduction strategies with sustainable alternatives.',
  'event planner': 'Our Sustainable Event Planner helps you plan eco-friendly events with AI-powered sustainability recommendations and carbon tracking.',
  'how to start': 'Getting started is easy! Create an account, connect your wallet (MetaMask recommended), and explore our AI-powered tools. You can start tracking your carbon footprint immediately.',
  'trading': 'Our platform provides a secure marketplace for buying and selling verified carbon credits from renewable energy, forest conservation, methane capture, and direct air capture projects.',
  'portfolio': 'Track your carbon credit investments, offset history, and environmental impact with our Portfolio feature. View real-time valuations and sustainability metrics.',
  'security': 'CarbonX uses enterprise-grade security including end-to-end encryption, secure wallet connections, and follows GDPR and SOC 2 Type II standards. We never store your private keys.',
  'blockchain': 'CarbonX is built on Ethereum with smart contracts for secure, transparent carbon credit transactions. We also integrate with other EVM-compatible networks.',
  'cryptocurrency': 'Our platform integrates with major crypto platforms to track carbon-related cryptocurrency investments, green tokens, and environmental blockchain projects.',
  'sustainable alternatives': 'We recommend eco-friendly alternatives across various categories including renewable energy, sustainable transportation, green products, and carbon-neutral services.',
  'developer': 'CarbonX is created by Akshit Tiwari. You can reach out via GitHub: https://github.com/AkshitTiwarii, LinkedIn: https://www.linkedin.com/in/akshit-tiwarii/, or email: akshittiwari29@gmail.com',
  'technology': 'CarbonX is built with Next.js 14, React 18, TypeScript, Tailwind CSS, Google Generative AI (Gemini), MetaMask integration, and ThirdWeb for Web3 connectivity.',
  'help': 'I can help you with questions about CarbonX features, AI tools, carbon trading, portfolio management, security, getting started, and sustainability features. What would you like to know?'
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific keywords in the message
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lowerMessage.includes(key.replace(/\s+/g, '')) || lowerMessage.includes(key)) {
      return response;
    }
  }
  
  // Default helpful response
  return `Thank you for your question about CarbonX! Here's what I can help you with:

🤖 **AI Tools**: Carbon Calculator, Plastic Footprint tracker, Event Planner
💹 **Trading**: Secure carbon credit marketplace with verified projects  
📊 **Portfolio**: Track investments and environmental impact
🔧 **Technology**: Built on Ethereum with enterprise-grade security
🌱 **Sustainability**: Comprehensive carbon footprint management

You can also check our detailed FAQ section above for more information. Is there a specific feature you'd like to know more about?`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // If no API key or genAI is not available, use fallback responses
    if (!genAI || !API_KEY) {
      console.log('Using fallback response - no API key available');
      const fallbackResponse = getFallbackResponse(message);
      return NextResponse.json({ 
        response: fallbackResponse,
        mode: 'fallback'
      });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

      const prompt = `
You are a helpful AI assistant for CarbonX, a carbon credit trading and sustainability platform. You should answer questions based on the following knowledge base and be helpful, informative, and professional.

${CARBONX_KNOWLEDGE_BASE}

Context: ${context || 'General CarbonX Support'}

User Question: ${message}

Instructions:
- Answer questions specifically about CarbonX features, functionality, and capabilities
- Be helpful and provide detailed explanations when needed
- If asked about something not related to CarbonX, politely redirect to CarbonX topics
- Mention specific features and tools when relevant
- Be encouraging about sustainability and environmental impact
- Keep responses conversational but professional
- If you don't know something specific about CarbonX, say so and suggest they contact support

Please provide a helpful response:
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ 
        response: text,
        mode: 'ai'
      });

    } catch (aiError: any) {
      console.log('AI API error, using fallback:', aiError.message);
      // If AI fails, use fallback response
      const fallbackResponse = getFallbackResponse(message);
      return NextResponse.json({ 
        response: fallbackResponse,
        mode: 'fallback'
      });
    }

  } catch (error: any) {
    console.error('Error in CarbonX chat API:', error);
    
    // Try to get the message for fallback response
    try {
      const body = await request.json();
      const fallbackResponse = getFallbackResponse(body.message || '');
      return NextResponse.json({ 
        response: fallbackResponse,
        mode: 'fallback'
      });
    } catch {
      // Final fallback if we can't even parse the request
      return NextResponse.json({ 
        response: getFallbackResponse('help'),
        mode: 'fallback'
      });
    }
  }
}
