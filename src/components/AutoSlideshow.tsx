"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Reveal from "./Reveal";

interface Slide {
  id: string;
  badge: string;
  badgeIcon: string;
  badgeColor: string;
  title: string;
  description: string;
  features: {
    icon: string;
    title: string;
    description: string;
    bgColor: string;
  }[];
  ctaText: string;
  ctaIcon: string;
  ctaLink: string;
  ctaColor: string;
  borderColor: string;
  bgGradient: string;
  ambientColors: {
    primary: string;
    secondary: string;
  };
}

const slides: Slide[] = [
  {
    id: "trading",
    badge: "Live Trading",
    badgeIcon: "🔄",
    badgeColor: "bg-indigo-900/30 border-indigo-800 text-indigo-300",
    title: "Carbon Credits Trading Platform",
    description: "Trade verified carbon credits with real-time market data, MetaMask integration, and advanced order management.",
    features: [
      {
        icon: "📈",
        title: "Real-time Markets",
        description: "Live pricing for CCX, VCU, REDD+, and GOLD carbon credits with 24/7 market access.",
        bgColor: "bg-indigo-900/50"
      },
      {
        icon: "🦊",
        title: "MetaMask Integration",
        description: "Connect your MetaMask wallet for secure trading with automatic balance tracking.",
        bgColor: "bg-orange-900/50"
      },
      {
        icon: "⚡",
        title: "Advanced Orders",
        description: "Place limit and market orders with real-time order book depth and trade execution.",
        bgColor: "bg-blue-900/50"
      }
    ],
    ctaText: "Start Trading Carbon Credits",
    ctaIcon: "🔄",
    ctaLink: "/trading",
    ctaColor: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
    borderColor: "border-indigo-800",
    bgGradient: "from-indigo-900/20 via-blue-900/20 to-purple-900/20",
    ambientColors: {
      primary: "bg-indigo-300/20",
      secondary: "bg-blue-300/15"
    }
  },
  {
    id: "event-planner",
    badge: "New Feature",
    badgeIcon: "🌱",
    badgeColor: "bg-emerald-900/30 border-emerald-800 text-emerald-300",
    title: "Sustainable Event Planner",
    description: "Plan eco-friendly hackathons, college fests, and events with our comprehensive sustainability checklist and carbon calculator.",
    features: [
      {
        icon: "✅",
        title: "Smart Checklist",
        description: "Get personalized recommendations for sustainable alternatives to traditional event materials and practices.",
        bgColor: "bg-emerald-900/50"
      },
      {
        icon: "🧮",
        title: "Impact Calculator",
        description: "Track carbon savings, cost implications, and environmental impact of your sustainable choices in real-time.",
        bgColor: "bg-green-900/50"
      },
      {
        icon: "📊",
        title: "Sustainability Score",
        description: "Get a comprehensive sustainability rating and exportable reports to showcase your environmental commitment.",
        bgColor: "bg-teal-900/50"
      }
    ],
    ctaText: "Start Planning Your Event",
    ctaIcon: "🌱",
    ctaLink: "/event-planner",
    ctaColor: "bg-emerald-600 hover:bg-emerald-700",
    borderColor: "border-emerald-800",
    bgGradient: "from-emerald-900/20 via-green-900/20 to-teal-900/20",
    ambientColors: {
      primary: "bg-emerald-300/20",
      secondary: "bg-green-300/15"
    }
  },
  {
    id: "plastic-tracker",
    badge: "New Tool",
    badgeIcon: "🌊",
    badgeColor: "bg-blue-900/30 border-blue-800 text-blue-300",
    title: "Plastic Footprint Visualizer",
    description: "Track your single-use plastic consumption and visualize its environmental impact through interactive ocean pollution simulations.",
    features: [
      {
        icon: "📊",
        title: "Usage Tracking",
        description: "Monitor your monthly plastic consumption across 8 categories from water bottles to shopping bags.",
        bgColor: "bg-blue-900/50"
      },
      {
        icon: "🌊",
        title: "Ocean Visualization",
        description: "See how your plastic usage translates to ocean pollution with real-time interactive visualizations.",
        bgColor: "bg-cyan-900/50"
      },
      {
        icon: "♻️",
        title: "Smart Alternatives",
        description: "Discover sustainable alternatives for each plastic item with decomposition timelines and environmental impact data.",
        bgColor: "bg-teal-900/50"
      }
    ],
    ctaText: "Visualize Your Impact",
    ctaIcon: "🌊",
    ctaLink: "/plastic-tracker",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-blue-800",
    bgGradient: "from-blue-900/20 via-cyan-900/20 to-teal-900/20",
    ambientColors: {
      primary: "bg-blue-300/20",
      secondary: "bg-cyan-300/15"
    }
  }
];

export default function AutoSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setKey(prev => prev + 1); // Force re-render of Reveal components
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:py-16">
      {/* Slide Controls */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
        >
          {isPlaying ? "⏸️ Pause" : "▶️ Play"}
        </button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setKey(prev => prev + 1);
              }}
              aria-label={`Go to slide ${index + 1}`}
              title={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? "true" : "false"}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-indigo-500 scale-125"
                  : "bg-zinc-600 hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide */}
      <div className={`relative overflow-hidden rounded-3xl border ${currentSlideData.borderColor} bg-gradient-to-br ${currentSlideData.bgGradient} p-8 md:p-12 transition-all duration-1000`}>
        <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full ${currentSlideData.ambientColors.primary} blur-3xl transition-all duration-1000`} />
        <div className={`absolute -bottom-16 -left-16 h-32 w-32 rounded-full ${currentSlideData.ambientColors.secondary} blur-2xl transition-all duration-1000`} />
        
        <Reveal key={`title-${key}`} className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${currentSlideData.badgeColor} rounded-full text-sm font-medium mb-4 transition-all duration-500`}>
            {currentSlideData.badgeIcon} {currentSlideData.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3 transition-all duration-500">
            {currentSlideData.title}
          </h2>
          <p className="text-zinc-300 text-lg max-w-2xl mx-auto transition-all duration-500">
            {currentSlideData.description}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {currentSlideData.features.map((feature, index) => (
            <Reveal key={`feature-${currentSlide}-${index}-${key}`} delay={100 * (index + 1)}>
              <div className={`bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border ${currentSlideData.borderColor}/50 shadow-sm transition-all duration-500 hover:scale-105`}>
                <div className={`w-12 h-12 ${feature.bgColor} rounded-full flex items-center justify-center mb-4 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal key={`cta-${key}`} delay={400} className="text-center">
          <Link 
            href={currentSlideData.ctaLink}
            className={`inline-flex items-center gap-2 ${currentSlideData.ctaColor} text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            {currentSlideData.ctaIcon} {currentSlideData.ctaText}
          </Link>
        </Reveal>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 mx-auto max-w-md">
        <div className="bg-zinc-800 rounded-full h-1 overflow-hidden">
          <div 
            className={`bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-100 ease-linear ${
              isPlaying ? 'animate-progress' : 'w-0'
            }`}
          />
        </div>
      </div>
    </section>
  );
}
