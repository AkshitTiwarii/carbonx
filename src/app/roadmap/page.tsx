"use client";

import { Calendar, CheckCircle, Clock, Lightbulb, Rocket, Star } from "lucide-react";
import Link from "next/link";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  quarter: string;
  category: 'ai-tools' | 'platform' | 'trading' | 'analytics';
  features: string[];
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: '1',
    title: 'AI Carbon Calculator',
    description: 'AI-powered carbon footprint analysis with industry-specific calculations',
    status: 'completed',
    quarter: 'Q4 2024',
    category: 'ai-tools',
    features: ['Gemini AI Integration', 'Industry-specific calculations', 'Downloadable reports', 'Real-time analysis']
  },
  {
    id: '2',
    title: 'AI Plastic Footprint Tracker',
    description: 'Comprehensive plastic waste analysis with reduction strategies',
    status: 'completed',
    quarter: 'Q4 2024',
    category: 'ai-tools',
    features: ['Multi-category analysis', 'Environmental impact assessment', 'Alternative suggestions', 'Progress tracking']
  },
  {
    id: '3',
    title: 'Sustainable Event Planner',
    description: 'Plan eco-friendly events with carbon tracking and sustainability recommendations',
    status: 'completed',
    quarter: 'Q1 2025',
    category: 'ai-tools',
    features: ['Event carbon calculation', 'Venue recommendations', 'Sustainable vendor network', 'Impact reporting']
  },
  {
    id: '4',
    title: 'AI Sustainability Chat',
    description: 'Intelligent chat assistant for personalized sustainability advice',
    status: 'in-progress',
    quarter: 'Q1 2025',
    category: 'ai-tools',
    features: ['Natural language processing', 'Personalized recommendations', 'Multi-language support', 'Integration with calculators']
  },
  {
    id: '5',
    title: 'AI Portfolio Optimizer',
    description: 'Advanced AI-driven carbon credit portfolio optimization',
    status: 'planned',
    quarter: 'Q2 2025',
    category: 'ai-tools',
    features: ['Market analysis', 'Risk assessment', 'Automated rebalancing', 'Predictive analytics']
  },
  {
    id: '6',
    title: 'Impact Analytics Dashboard',
    description: 'Comprehensive AI-powered environmental impact tracking',
    status: 'planned',
    quarter: 'Q3 2025',
    category: 'analytics',
    features: ['Real-time monitoring', 'Custom reporting', 'Goal tracking', 'Predictive insights']
  },
  {
    id: '7',
    title: 'Advanced Trading Platform',
    description: 'Enhanced carbon credit trading with AI-powered market insights',
    status: 'planned',
    quarter: 'Q2 2025',
    category: 'trading',
    features: ['Advanced order types', 'Market making', 'Cross-chain trading', 'Institutional features']
  },
  {
    id: '8',
    title: 'Mobile Applications',
    description: 'Native iOS and Android apps for on-the-go sustainability management',
    status: 'planned',
    quarter: 'Q3 2025',
    category: 'platform',
    features: ['Full feature parity', 'Offline capabilities', 'Push notifications', 'Mobile-first UI']
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'in-progress': return <Clock className="w-5 h-5 text-yellow-400" />;
    case 'planned': return <Lightbulb className="w-5 h-5 text-blue-400" />;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'border-green-500/30 bg-green-500/10';
    case 'in-progress': return 'border-yellow-500/30 bg-yellow-500/10';
    case 'planned': return 'border-blue-500/30 bg-blue-500/10';
    default: return 'border-zinc-600';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'ai-tools': return '🤖';
    case 'platform': return '🌐';
    case 'trading': return '📈';
    case 'analytics': return '📊';
    default: return '⭐';
  }
};

export default function RoadmapPage() {
  const completedItems = ROADMAP_ITEMS.filter(item => item.status === 'completed');
  const inProgressItems = ROADMAP_ITEMS.filter(item => item.status === 'in-progress');
  const plannedItems = ROADMAP_ITEMS.filter(item => item.status === 'planned');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl mb-6">
              <Rocket className="w-12 h-12 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-100 mb-4">Product Roadmap</h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Discover what's coming next in our journey to revolutionize sustainability and carbon markets with AI
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{completedItems.length}</div>
            <div className="text-sm text-zinc-400">Completed</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{inProgressItems.length}</div>
            <div className="text-sm text-zinc-400">In Progress</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{plannedItems.length}</div>
            <div className="text-sm text-zinc-400">Planned</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{ROADMAP_ITEMS.length}</div>
            <div className="text-sm text-zinc-400">Total Features</div>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-zinc-100 mb-8">Development Timeline</h2>
        
        <div className="space-y-8">
          {ROADMAP_ITEMS.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index !== ROADMAP_ITEMS.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-zinc-700"></div>
              )}
              
              <div className="flex gap-6">
                {/* Timeline Dot */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 ${getStatusColor(item.status)} flex items-center justify-center`}>
                  {getStatusIcon(item.status)}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className={`bg-zinc-900/50 border ${getStatusColor(item.status)} rounded-xl p-6`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                          <h3 className="text-xl font-semibold text-zinc-100">{item.title}</h3>
                          <span className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full">
                            {item.quarter}
                          </span>
                        </div>
                        <p className="text-zinc-400 mb-4">{item.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-zinc-300 mb-2">Key Features:</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {item.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                            <Star className="w-3 h-3 text-yellow-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {item.status === 'completed' && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Feature available now
                      </div>
                    )}
                    
                    {item.status === 'in-progress' && (
                      <div className="flex items-center gap-2 text-sm text-yellow-400">
                        <Clock className="w-4 h-4" />
                        Currently in development
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border border-purple-500/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-zinc-100 mb-4">Shape the Future</h3>
          <p className="text-zinc-400 mb-6">
            Have ideas for new features or want early access to upcoming tools? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ai-calculator"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Available Tools
            </Link>
            <button className="px-6 py-3 border border-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-800/60 transition-colors">
              Request Feature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
