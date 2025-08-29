"use client";

import { BarChart3, PieChart, Activity, Globe, Lightbulb, TrendingUp, Target, Zap } from "lucide-react";
import Link from "next/link";

export default function ImpactDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl mb-6">
              <BarChart3 className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-100 mb-4">AI Impact Analytics Dashboard</h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Comprehensive AI-powered analytics for tracking environmental impact, progress monitoring, and strategic insights
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
              <p className="text-zinc-400">Advanced AI analytics dashboard with real-time environmental impact tracking and predictive insights. Expected launch: Q3 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-zinc-100 mb-8 text-center">Dashboard Features</h2>
        
        {/* Mock Dashboard Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Real-time Impact Tracking
            </h3>
            <div className="h-48 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-zinc-700">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-zinc-400">Interactive charts and real-time metrics</p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Goal Progress
            </h3>
            <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-zinc-700">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-zinc-400">Track sustainability goals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <Globe className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Global Impact View</h3>
            <p className="text-zinc-400 text-sm">Visualize your environmental impact across different regions and projects</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <Zap className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Predictive Analytics</h3>
            <p className="text-zinc-400 text-sm">AI-powered forecasting for future impact and optimization opportunities</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <BarChart3 className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Custom Reports</h3>
            <p className="text-zinc-400 text-sm">Generate detailed reports for stakeholders and compliance requirements</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <Activity className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Real-time Alerts</h3>
            <p className="text-zinc-400 text-sm">Get notified about important changes and opportunities for improvement</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Preview */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-zinc-100 mb-8 text-center">Key Metrics You'll Track</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-400">CO₂</span>
            </div>
            <h3 className="font-semibold text-zinc-100 mb-2">Carbon Footprint</h3>
            <p className="text-zinc-400">Track emissions reduction and offset progress over time</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-400">$$$</span>
            </div>
            <h3 className="font-semibold text-zinc-100 mb-2">Cost Savings</h3>
            <p className="text-zinc-400">Monitor financial benefits of sustainability initiatives</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-400">📊</span>
            </div>
            <h3 className="font-semibold text-zinc-100 mb-2">ESG Scores</h3>
            <p className="text-zinc-400">Track Environmental, Social, and Governance performance</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-zinc-100 mb-4">Start Tracking Your Impact Today</h3>
          <p className="text-zinc-400 mb-6">
            While our advanced AI dashboard is in development, explore our current analytics tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              View Current Dashboard
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
