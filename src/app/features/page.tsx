"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Reveal from "../../components/Reveal";
import { 
  Calculator, 
  Leaf, 
  TrendingUp, 
  Recycle,
  MapPin,
  ShoppingCart,
  PieChart,
  Calendar,
  Droplet
} from "lucide-react";

const features = [
  {
    title: "AI Carbon Calculator",
    description: "Calculate your carbon footprint with AI-powered analysis",
    icon: Calculator,
    href: "/ai-calculator",
    gradient: "from-emerald-600 to-green-600",
    badge: "AI"
  },
  {
    title: "Trading Platform", 
    description: "Trade carbon credits with advanced tools",
    icon: TrendingUp,
    href: "/trading",
    gradient: "from-blue-600 to-indigo-600",
    badge: "NEW"
  },
  {
    title: "Portfolio Tracker",
    description: "Track your crypto and carbon credit portfolio",
    icon: PieChart,
    href: "/portfolio",
    gradient: "from-purple-600 to-violet-600",
    badge: "NEW"
  },
  {
    title: "Marketplace",
    description: "Browse and purchase verified carbon credits",
    icon: ShoppingCart,
    href: "/marketplace",
    gradient: "from-orange-600 to-red-600",
    badge: "HOT"
  },
  {
    title: "Plastic Calculator",
    description: "AI-powered plastic footprint analysis",
    icon: Recycle,
    href: "/plastic-calculator",
    gradient: "from-cyan-600 to-blue-600",
    badge: "AI"
  },
  {
    title: "Water Footprint Calculator",
    description: "Estimate your water consumption and get personalized conservation tips",
    icon: Droplet,
    href: "/water-calculator",
    gradient: "from-blue-600 to-cyan-600",
    badge: "NEW"
  },
  {
    title: "Sustainable Alternatives",
    description: "Discover eco-friendly product alternatives",
    icon: Leaf,
    href: "/sustainable-alternatives",
    gradient: "from-green-600 to-emerald-600"
  },
  {
    title: "Event Planner",
    description: "Plan sustainable events with carbon tracking",
    icon: Calendar,
    href: "/event-planner",
    gradient: "from-indigo-600 to-purple-600",
    badge: "NEW"
  },
  {
    title: "Toucan Protocol Marketplace",
    description: "Real carbon credits powered by blockchain technology",
    icon: Leaf,
    href: "/toucan-demo",
    gradient: "from-emerald-600 to-teal-600",
    badge: "NEW",
    verified: true
  }
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-4">
              Explore All Features
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Discover our comprehensive suite of tools for carbon tracking, trading, and sustainable living
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.1}>
                <Link href={feature.href}>
                  <Card className="group bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-900/70 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2">
                          {feature.badge && (
                            <span className="px-2 py-1 text-xs font-semibold bg-zinc-800 text-zinc-100 rounded-full">
                              {feature.badge}
                            </span>
                          )}
                          {feature.verified && (
                            <span className="px-2 py-1 text-xs font-semibold bg-emerald-900/50 text-emerald-100 border border-emerald-800 rounded-full flex items-center gap-1">
                              ✓ Toucan Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-zinc-100 group-hover:text-white transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.8}>
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-zinc-100 mb-4">
              More Features Coming Soon
            </h2>
            <p className="text-zinc-400 mb-8">
              We're constantly developing new tools to help you on your sustainability journey
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-zinc-100 font-semibold mb-2">Impact Dashboard</h3>
                <p className="text-zinc-400 text-sm">Comprehensive analytics on your environmental impact</p>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-zinc-100 font-semibold mb-2">Corporate Solutions</h3>
                <p className="text-zinc-400 text-sm">Enterprise-grade carbon management tools</p>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-zinc-100 font-semibold mb-2">Mobile App</h3>
                <p className="text-zinc-400 text-sm">Take CarbonX with you wherever you go</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}