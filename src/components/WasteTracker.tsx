"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface WasteCategory {
  id: string;
  name: string;
  icon: string;
  estimatedPerPerson: number; // kg per person per day
  recyclable: boolean;
  alternatives: string[];
}

const wasteCategories: WasteCategory[] = [
  {
    id: "food",
    name: "Food Waste",
    icon: "🍎",
    estimatedPerPerson: 0.8,
    recyclable: true,
    alternatives: ["Composting", "Food donation", "Portion control", "Local sourcing"]
  },
  {
    id: "plastic",
    name: "Plastic Items",
    icon: "🥤",
    estimatedPerPerson: 0.3,
    recyclable: true,
    alternatives: ["Reusable containers", "Biodegradable alternatives", "Elimination"]
  },
  {
    id: "paper",
    name: "Paper Products",
    icon: "📄",
    estimatedPerPerson: 0.2,
    recyclable: true,
    alternatives: ["Digital alternatives", "Recycled paper", "Reusable signage"]
  },
  {
    id: "electronic",
    name: "Electronic Waste",
    icon: "📱",
    estimatedPerPerson: 0.05,
    recyclable: true,
    alternatives: ["Device collection drives", "Refurbishment", "Proper disposal"]
  },
  {
    id: "general",
    name: "General Waste",
    icon: "🗑️",
    estimatedPerPerson: 0.4,
    recyclable: false,
    alternatives: ["Waste reduction", "Material substitution", "Zero waste goal"]
  }
];

interface WasteTrackerProps {
  attendees: number;
  eventDuration: number;
}

export default function WasteTracker({ attendees, eventDuration }: WasteTrackerProps) {
  const [sustainabilityActions, setSustainabilityActions] = useState<{[key: string]: boolean}>({});
  const [customReductions, setCustomReductions] = useState<{[key: string]: number}>({});

  const toggleAction = (categoryId: string) => {
    setSustainabilityActions(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const updateReduction = (categoryId: string, reduction: number) => {
    setCustomReductions(prev => ({
      ...prev,
      [categoryId]: Math.max(0, Math.min(100, reduction))
    }));
  };

  const calculateWaste = (category: WasteCategory) => {
    const baseWaste = category.estimatedPerPerson * attendees * eventDuration;
    const hasAction = sustainabilityActions[category.id];
    const customReduction = customReductions[category.id] || 0;
    
    // Default reduction of 70% if sustainability action is taken
    const reductionPercent = hasAction ? Math.max(70, customReduction) : customReduction;
    const reducedWaste = baseWaste * (1 - reductionPercent / 100);
    
    return {
      baseWaste,
      reducedWaste,
      reduction: baseWaste - reducedWaste,
      reductionPercent
    };
  };

  const totalWaste = wasteCategories.reduce((total, category) => {
    const calc = calculateWaste(category);
    return {
      base: total.base + calc.baseWaste,
      reduced: total.reduced + calc.reducedWaste,
      saved: total.saved + calc.reduction
    };
  }, { base: 0, reduced: 0, saved: 0 });

  const overallReduction = totalWaste.base > 0 ? (totalWaste.saved / totalWaste.base) * 100 : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
          ♻️
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Waste Impact Tracker
        </h3>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalWaste.base.toFixed(1)} kg
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Projected Waste
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalWaste.saved.toFixed(1)} kg
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Waste Prevented
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {overallReduction.toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Total Reduction
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {wasteCategories.map((category) => {
          const calc = calculateWaste(category);
          const hasAction = sustainabilityActions[category.id];
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {category.name}
                    </h4>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {calc.baseWaste.toFixed(1)} kg → {calc.reducedWaste.toFixed(1)} kg
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    -{calc.reduction.toFixed(1)} kg
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {calc.reductionPercent.toFixed(0)}% reduction
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => toggleAction(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasAction
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    hasAction 
                      ? 'border-emerald-500 bg-emerald-500' 
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {hasAction && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  Sustainability Actions
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Custom reduction:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customReductions[category.id] || 0}
                    onChange={(e) => updateReduction(category.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">%</span>
                </div>
              </div>

              {hasAction && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                    Recommended Actions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.alternatives.map((alt, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, calc.reductionPercent)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
        <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          💡 Waste Reduction Tips
        </h4>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <li>• Set up clearly marked recycling and composting stations</li>
          <li>• Train volunteers to help attendees sort waste properly</li>
          <li>• Partner with local organizations for food donation</li>
          <li>• Measure and track actual waste to improve future events</li>
          <li>• Communicate waste reduction goals to attendees</li>
        </ul>
      </div>
    </div>
  );
}
