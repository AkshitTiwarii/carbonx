# 🌱 CarbonX - AI-Powered Carbon Credit Trading Platform

> **Next-generation sustainability platform combining AI tools, carbon credit trading, and blockchain technology for environmental impact management.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

## 🚀 Live Demo

**🔗 [Visit CarbonX Platform](http://localhost:3002)** *(Running locally)*

## ✨ Features

### 🤖 AI-Powered Tools
- **AI Carbon Calculator** - Instant carbon footprint analysis with emission calculations and credit recommendations
- **AI Plastic Footprint** - Smart plastic waste analysis with reduction strategies and sustainable alternatives  
- **Sustainable Event Planner** - AI-powered eco-friendly event planning with carbon tracking
- **FAQ Chatbot** - Intelligent assistant powered by Google Gemini AI for instant platform support

### 💹 Carbon Trading & Finance
- **Secure Trading Platform** - Buy and sell verified carbon credits from certified projects
- **Portfolio Management** - Track carbon credit investments and environmental impact
- **Real-time Analytics** - Live market data and sustainability metrics
- **Cryptocurrency Integration** - Support for carbon-related crypto investments and green tokens

### 🌐 Web3 & Blockchain
- **Smart Contracts** - Ethereum-based carbon credit tokenization and trading
- **MetaMask Integration** - Secure wallet connectivity and transaction management
- **ThirdWeb Integration** - Simplified Web3 development and deployment

### 🎨 User Experience
- **Modern Dark Theme** - Professional, accessible design with smooth animations
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Interactive Navigation** - Mega menu with organized feature categories
- **Developer Hub** - Real-time GitHub integration with contribution charts

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4 + Framer Motion
- **UI Components**: Lucide React Icons + Custom Components

### AI & Backend
- **AI Integration**: Google Generative AI (Gemini 1.5-flash)
- **Backend**: Next.js API Routes + FastAPI (Python)
- **Database**: PostgreSQL (planned)
- **Authentication**: NextAuth.js

### Blockchain & Web3
- **Blockchain**: Ethereum + EVM-compatible networks
- **Smart Contracts**: Solidity + Hardhat
- **Web3 Library**: ThirdWeb + Ethers.js
- **Wallet**: MetaMask integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- MetaMask browser extension (for Web3 features)
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AkshitTiwarii/carbonx.git
cd carbonx
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:
```env
GEMINI_API_KEY=your_google_ai_api_key_here
THIRDWEB_API_KEY=your_thirdweb_api_key_here
NEXTAUTH_URL=http://localhost:3002
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3002` to see the application.

## 📱 Application Structure

```
carbonx/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── ai-calculator/      # AI Carbon Calculator
│   │   ├── plastic-calculator/ # AI Plastic Footprint
│   │   ├── event-planner/      # Sustainable Event Planner
│   │   ├── faqs/              # FAQ with AI Chatbot
│   │   ├── developer/         # Developer Hub
│   │   ├── trading/           # Carbon Credit Trading
│   │   ├── portfolio/         # Investment Portfolio
│   │   └── api/               # API Routes
│   ├── components/            # Reusable UI Components
│   ├── hooks/                 # Custom React Hooks
│   ├── lib/                   # Utility Libraries
│   └── types/                 # TypeScript Definitions
├── smart_contracts/           # Ethereum Smart Contracts
├── backend/                   # Python FastAPI Backend
└── public/                    # Static Assets
```

## 🤖 AI Features

### Carbon Calculator
- Real-time emission calculations using AI models
- Personalized carbon credit recommendations
- Integration with verified offset projects

### Plastic Footprint Analyzer
- Comprehensive plastic waste impact analysis
- AI-powered reduction strategy suggestions
- Sustainable product alternative recommendations

### Event Planner
- Sustainable event planning with AI assistance
- Carbon footprint estimation for events
- Eco-friendly vendor and location suggestions

### Chatbot Assistant
- 24/7 platform support powered by Google Gemini
- Comprehensive knowledge base about CarbonX features
- Natural language understanding for user queries

## 🔗 API Documentation

### AI Calculator API
```typescript
POST /api/ai-calculator
Content-Type: application/json

{
  "transport": "car",
  "energy": "electricity",
  "waste": "recycling",
  "consumption": "moderate"
}
```

### Trading API
```typescript
GET /api/trading/prices
Response: Array of carbon credit prices and market data
```

### Portfolio API
```typescript
GET /api/crypto/prices?category=all
Response: Real-time cryptocurrency and carbon token prices
```

## 🌍 Environmental Impact

CarbonX is committed to sustainability:
- **Carbon Neutral Platform**: All operations offset through verified projects
- **Transparency**: Open-source codebase and public impact metrics
- **Education**: Free tools and resources for carbon footprint awareness
- **Innovation**: Advancing Web3 solutions for environmental challenges

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Akshit Tiwari**
- 🐙 GitHub: [@AkshitTiwarii](https://github.com/AkshitTiwarii)
- 💼 LinkedIn: [akshit-tiwarii](https://www.linkedin.com/in/akshit-tiwarii/)
- 📧 Email: akshittiwari29@gmail.com

## 🙏 Acknowledgments

- [Google AI](https://ai.google.dev/) for Gemini AI integration
- [ThirdWeb](https://thirdweb.com/) for Web3 development tools
- [Vercel](https://vercel.com/) for Next.js framework
- [Tailwind CSS](https://tailwindcss.com/) for styling system
- Open source carbon data providers and environmental organizations

## 📊 Project Stats

- **Languages**: TypeScript, Python, Solidity
- **Framework**: Next.js 14 with App Router  
- **AI Integration**: Google Gemini 1.5-flash
- **Blockchain**: Ethereum smart contracts
- **UI/UX**: Modern dark theme with responsive design

---

<div align="center">

**🌱 Building a sustainable future with AI and blockchain technology**

[⭐ Star this repository](https://github.com/AkshitTiwarii/carbonx) if you find it helpful!

</div>
