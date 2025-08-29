"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Alternative {
  id: string;
  category: string;
  problem: string;
  solution: string;
  carbonReduction: number;
  costImpact: "savings" | "neutral" | "investment";
  difficulty: "easy" | "medium" | "hard";
  tips: string[];
  suppliers?: string[];
}

const alternatives: Alternative[] = [
  {
    id: "signage",
    category: "Signage & Banners",
    problem: "Vinyl banners and plastic signs create lasting waste and are often single-use",
    solution: "Use fabric banners, digital displays, or reclaimed wood signs that can be reused",
    carbonReduction: 85,
    costImpact: "savings",
    difficulty: "easy",
    tips: [
      "Design banners with removable text panels for reuse",
      "Use QR codes to link to digital content instead of printing details",
      "Partner with local woodworkers for custom sustainable signage",
      "Consider chalk boards or whiteboards for dynamic messaging"
    ],
    suppliers: ["EcoSign", "GreenBanners", "Sustainable Displays Inc."]
  },
  {
    id: "food-service",
    category: "Food Service",
    problem: "Disposable plates, cups, and utensils contribute to massive waste streams",
    solution: "Implement reusable dishware, compostable alternatives, or rental services",
    carbonReduction: 75,
    costImpact: "investment",
    difficulty: "medium",
    tips: [
      "Partner with local restaurants for dishware rental",
      "Use bamboo or wheat-based compostable plates",
      "Set up washing stations for reusable items",
      "Offer incentives for attendees who bring their own cups"
    ],
    suppliers: ["GreenWare", "Bamboo Tableware Co.", "EcoServe Rentals"]
  },
  {
    id: "documentation",
    category: "Programs & Handouts",
    problem: "Printed materials often end up as waste and have high production costs",
    solution: "Create digital programs accessible via QR codes or mobile apps",
    carbonReduction: 95,
    costImpact: "savings",
    difficulty: "easy",
    tips: [
      "Create a simple mobile-responsive website for your event",
      "Use QR codes on reusable table tents",
      "Send digital tickets and programs via email",
      "Offer limited print copies only on recycled paper"
    ],
    suppliers: ["EventApp", "QR-Code Solutions", "Digital Program Makers"]
  },
  {
    id: "decoration",
    category: "Decorations",
    problem: "Plastic balloons, synthetic flowers, and disposable decorations harm the environment",
    solution: "Use live plants, natural materials, and LED lighting for ambiance",
    carbonReduction: 60,
    costImpact: "neutral",
    difficulty: "medium",
    tips: [
      "Rent or borrow potted plants that can be returned",
      "Use string lights with LED bulbs",
      "Create photo backdrops with natural materials",
      "Design decorations that attendees can take home"
    ],
    suppliers: ["Plant Rentals Plus", "Natural Decorations", "LED Solutions"]
  },
  {
    id: "catering",
    category: "Food & Catering",
    problem: "Food waste and non-local sourcing increase environmental impact significantly",
    solution: "Source locally, plan portions carefully, and implement composting systems",
    carbonReduction: 70,
    costImpact: "savings",
    difficulty: "hard",
    tips: [
      "Partner with local farms and suppliers",
      "Use accurate attendance tracking for portion planning",
      "Set up clearly marked composting stations",
      "Donate excess food to local shelters",
      "Offer more plant-based options"
    ],
    suppliers: ["Local Farm Network", "Zero Waste Catering", "Compost Solutions"]
  },
  {
    id: "transportation",
    category: "Transportation",
    problem: "Individual car travel to events creates significant carbon emissions",
    solution: "Organize group transportation and incentivize public transit use",
    carbonReduction: 80,
    costImpact: "savings",
    difficulty: "medium",
    tips: [
      "Partner with local transit authorities for group discounts",
      "Organize carpooling via event app or social media",
      "Provide shuttle services from major transit hubs",
      "Offer parking discounts for electric vehicles",
      "Choose venues accessible by public transportation"
    ],
    suppliers: ["EcoTransit", "Group Shuttle Services", "CarShare Networks"]
  },
  {
    id: "energy",
    category: "Energy & Power",
    problem: "Standard electrical power often comes from non-renewable sources",
    solution: "Use renewable energy sources, efficient lighting, and smart power management",
    carbonReduction: 90,
    costImpact: "investment",
    difficulty: "hard",
    tips: [
      "Rent solar generators for outdoor events",
      "Use LED lighting throughout the venue",
      "Implement smart power strips to reduce phantom loads",
      "Choose venues with renewable energy commitments",
      "Use natural lighting whenever possible"
    ],
    suppliers: ["Solar Event Power", "Renewable Energy Solutions", "Smart Power Systems"]
  },
  {
    id: "waste",
    category: "Waste Management",
    problem: "Mixed waste disposal reduces recycling effectiveness and increases landfill impact",
    solution: "Implement comprehensive sorting systems with clear signage and education",
    carbonReduction: 65,
    costImpact: "neutral",
    difficulty: "medium",
    tips: [
      "Use color-coded bins with clear visual instructions",
      "Station volunteers at waste areas to help with sorting",
      "Track waste diversion rates to measure success",
      "Partner with local recycling facilities",
      "Aim for zero waste to landfill"
    ],
    suppliers: ["Zero Waste Events", "Recycling Partners", "Waste Solutions Co."]
  }
];

export default function SustainableAlternatives() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAlternatives = alternatives.filter(alt => 
    alt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alt.solution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alt.problem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCostColor = (impact: string) => {
    switch (impact) {
      case "savings": return "text-green-600 dark:text-green-400";
      case "neutral": return "text-yellow-600 dark:text-yellow-400";
      case "investment": return "text-blue-600 dark:text-blue-400";
      default: return "text-zinc-600 dark:text-zinc-400";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          🌱 Sustainable Event Alternatives
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Discover eco-friendly alternatives for every aspect of your event planning. Each solution includes practical tips, supplier recommendations, and environmental impact data.
        </p>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search alternatives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredAlternatives.map((alternative, index) => (
          <motion.div
            key={alternative.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {alternative.category}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(alternative.difficulty)}`}>
                      {alternative.difficulty}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3">
                    <span className="font-medium">Problem:</span> {alternative.problem}
                  </p>
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400">Solution:</span> {alternative.solution}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      -{alternative.carbonReduction}%
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      carbon reduction
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getCostColor(alternative.costImpact)}`}>
                    {alternative.costImpact === "savings" && "💰 Cost Savings"}
                    {alternative.costImpact === "neutral" && "➖ Cost Neutral"}
                    {alternative.costImpact === "investment" && "📈 Investment Needed"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategory(
                  selectedCategory === alternative.id ? null : alternative.id
                )}
                className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    View Implementation Tips & Suppliers
                  </span>
                  <svg 
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                      selectedCategory === alternative.id ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {selectedCategory === alternative.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      💡 Implementation Tips
                    </h4>
                    <ul className="space-y-1">
                      {alternative.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {alternative.suppliers && alternative.suppliers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        🤝 Recommended Suppliers
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {alternative.suppliers.map((supplier, supplierIndex) => (
                          <span 
                            key={supplierIndex}
                            className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full"
                          >
                            {supplier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAlternatives.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            No alternatives found
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Try adjusting your search terms to find relevant sustainable alternatives.
          </p>
        </div>
      )}
    </div>
  );
}
