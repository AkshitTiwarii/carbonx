"use client";

import { TrendingUp, BarChart3, Target, DollarSign, Lightbulb, Calendar } from "lucide-react";
import Link from "next/link";

export default function PortfolioOptimizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
              <TrendingUp className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-100 mb-4">AI Portfolio Optimizer</h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Optimize your carbon credit portfolio with AI-driven market analysis, risk assessment, and strategic recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Lightbulb className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-xl font-semibold text-orange-400 mb-2">Coming Soon</h3>
              <p className="text-zinc-400">We're developing advanced AI algorithms to help you maximize your carbon credit portfolio performance. Expected launch: Q2 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-zinc-100 mb-8 text-center">What's Coming</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <BarChart3 className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Market Analysis</h3>
            <p className="text-zinc-400">Real-time analysis of carbon credit markets, price trends, and volatility patterns</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <Target className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Risk Assessment</h3>
            <p className="text-zinc-400">AI-powered risk evaluation and portfolio diversification strategies</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <DollarSign className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">ROI Optimization</h3>
            <p className="text-zinc-400">Maximize returns with intelligent allocation and timing recommendations</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <TrendingUp className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Predictive Analytics</h3>
            <p className="text-zinc-400">Machine learning models to forecast market movements and opportunities</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <BarChart3 className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Performance Tracking</h3>
            <p className="text-zinc-400">Comprehensive analytics and reporting on portfolio performance</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <Calendar className="w-10 h-10 text-pink-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Automated Rebalancing</h3>
            <p className="text-zinc-400">Smart scheduling and execution of portfolio adjustments</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-zinc-100 mb-4">Be the First to Know</h3>
          <p className="text-zinc-400 mb-6">
            Get notified when the AI Portfolio Optimizer launches and gain early access to advanced features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              View Current Portfolio Tools
            </Link>
            <Link
              href="/ai-calculator"
              className="px-6 py-3 border border-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              Try AI Calculator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
