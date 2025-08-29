"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface PlasticItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  weight: number; // grams per item
  decompositionTime: string; // years to decompose
  alternatives: string[];
  monthlyEstimate: number; // default monthly usage
}

const plasticItems: PlasticItem[] = [
  {
    id: "water-bottles",
    name: "Plastic Water Bottles",
    icon: "🍼",
    category: "Beverages",
    weight: 22,
    decompositionTime: "450 years",
    alternatives: ["Reusable water bottle", "Glass bottles", "Filtered tap water"],
    monthlyEstimate: 15
  },
  {
    id: "coffee-cups",
    name: "Coffee Cups (Disposable)",
    icon: "☕",
    category: "Beverages", 
    weight: 10,
    decompositionTime: "20 years",
    alternatives: ["Reusable coffee cup", "Ceramic mugs", "Bring your own cup"],
    monthlyEstimate: 20
  },
  {
    id: "plastic-bags",
    name: "Plastic Shopping Bags",
    icon: "🛍️",
    category: "Shopping",
    weight: 6,
    decompositionTime: "10-20 years",
    alternatives: ["Reusable bags", "Paper bags", "No bag needed"],
    monthlyEstimate: 25
  },
  {
    id: "straws",
    name: "Plastic Straws",
    icon: "🥤",
    category: "Beverages",
    weight: 0.42,
    decompositionTime: "200 years",
    alternatives: ["Metal straws", "Paper straws", "No straw", "Bamboo straws"],
    monthlyEstimate: 10
  },
  {
    id: "food-containers",
    name: "Takeout Containers",
    icon: "🥡",
    category: "Food",
    weight: 25,
    decompositionTime: "50-80 years",
    alternatives: ["Bring your own container", "Eat in", "Compostable containers"],
    monthlyEstimate: 12
  },
  {
    id: "cutlery",
    name: "Plastic Cutlery",
    icon: "🍴",
    category: "Food",
    weight: 5,
    decompositionTime: "200-1000 years",
    alternatives: ["Reusable cutlery", "Bamboo cutlery", "Eat with hands when possible"],
    monthlyEstimate: 8
  },
  {
    id: "bottle-caps",
    name: "Bottle Caps",
    icon: "🔵",
    category: "Beverages",
    weight: 2,
    decompositionTime: "450 years",
    alternatives: ["Canned beverages", "Glass bottles", "Reusable bottles"],
    monthlyEstimate: 15
  },
  {
    id: "produce-bags",
    name: "Produce Bags",
    icon: "🥬",
    category: "Shopping",
    weight: 3,
    decompositionTime: "10-20 years",
    alternatives: ["Mesh produce bags", "No bag for hardy items", "Paper bags"],
    monthlyEstimate: 10
  }
];

export default function PlasticFootprintPage() {
  const [usage, setUsage] = useState<{[key: string]: number}>(() => {
    const initial: {[key: string]: number} = {};
    plasticItems.forEach(item => {
      initial[item.id] = item.monthlyEstimate;
    });
    return initial;
  });

  const [timeframe, setTimeframe] = useState<"month" | "year" | "lifetime">("month");
  const [showAlternatives, setShowAlternatives] = useState<{[key: string]: boolean}>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateUsage = (itemId: string, value: number) => {
    setUsage(prev => ({
      ...prev,
      [itemId]: Math.max(0, value)
    }));
  };

  const toggleAlternatives = (itemId: string) => {
    setShowAlternatives(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const metrics = useMemo(() => {
    const monthly = plasticItems.reduce((total, item) => {
      const itemUsage = usage[item.id] || 0;
      return {
        weight: total.weight + (itemUsage * item.weight),
        count: total.count + itemUsage
      };
    }, { weight: 0, count: 0 });

    const multiplier = timeframe === "month" ? 1 : timeframe === "year" ? 12 : 12 * 70; // 70 year lifetime
    
    return {
      weight: monthly.weight * multiplier,
      count: monthly.count * multiplier,
      monthly
    };
  }, [usage, timeframe]);

  // Calculate environmental impact
  const environmentalImpact = useMemo(() => {
    const carbonFootprint = metrics.weight * 3.4; // kg CO2 per kg plastic
    const oilEquivalent = metrics.weight * 2; // liters of oil per kg plastic
    const energyEquivalent = metrics.weight * 84; // MJ per kg plastic
    
    return {
      carbonFootprint: carbonFootprint / 1000, // Convert to kg
      oilEquivalent: oilEquivalent / 1000, // Convert to liters
      energyEquivalent: energyEquivalent / 1000, // Convert to MJ
      landfillSpace: metrics.weight * 0.001 // m³ of landfill space
    };
  }, [metrics.weight]);

  // Draw visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw ocean background
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#4682B4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw plastic items as floating debris
    const itemsPerRow = Math.floor(rect.width / 30);
    const totalItems = Math.min(metrics.monthly.count, 200); // Cap visualization
    
    for (let i = 0; i < totalItems; i++) {
      const x = (i % itemsPerRow) * 30 + 15;
      const y = Math.floor(i / itemsPerRow) * 30 + 15;
      
      if (y > rect.height - 30) break;
      
      // Draw plastic item as a small colored circle
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.random() * 4, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${Math.random() * 60 + 10}, 70%, 50%)`; // Oranges/reds for plastic
      ctx.fill();
      
      // Add some transparency for depth effect
      ctx.globalAlpha = 0.7 + Math.random() * 0.3;
    }
    
    ctx.globalAlpha = 1;
    
    // Add overlay text
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${metrics.monthly.count} plastic items per month`,
      rect.width / 2,
      rect.height - 20
    );
  }, [metrics.monthly.count]);

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "month": return "This Month";
      case "year": return "This Year";
      case "lifetime": return "Your Lifetime";
      default: return "This Month";
    }
  };

  const getWeightDisplay = () => {
    const weight = metrics.weight;
    if (weight < 1000) return `${weight.toFixed(1)} g`;
    return `${(weight / 1000).toFixed(2)} kg`;
  };

  return (
    <div className="min-h-screen bg-rose-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
          >
            ♻️ Plastic Footprint Analysis
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent mb-6"
          >
            Visualize Your
            <br />
            Plastic Impact
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto mb-8"
          >
            Track your single-use plastic consumption and discover its environmental impact through interactive visualizations and actionable alternatives.
          </motion.p>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Timeframe Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex bg-white dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
              {(["month", "year", "lifetime"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === period
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {period === "month" && "Monthly"}
                  {period === "year" && "Yearly"}
                  {period === "lifetime" && "Lifetime"}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Impact Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  📊
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {getTimeframeLabel()} Impact
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {getWeightDisplay()}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total plastic weight
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    {metrics.count.toLocaleString()} individual items
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {environmentalImpact.carbonFootprint.toFixed(2)} kg
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    CO₂ emissions
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    From plastic production
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {environmentalImpact.oilEquivalent.toFixed(2)} L
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Oil equivalent
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    Petroleum used for production
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(environmentalImpact.landfillSpace * 1000).toFixed(1)} L
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Landfill volume
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    Space occupied in landfills
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
                  🌊
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Ocean Impact Visualization
                </h3>
              </div>

              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-64 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-zinc-900/90 rounded px-2 py-1 text-xs">
                  Each dot = 1 plastic item
                </div>
              </div>

              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                This visualization shows how your monthly plastic consumption would look as ocean pollution. 
                Each dot represents one plastic item that could end up in our waterways.
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  💡
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Quick Wins
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    Biggest Impact Items
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {plasticItems
                      .sort((a, b) => (usage[b.id] * b.weight) - (usage[a.id] * a.weight))
                      .slice(0, 3)
                      .map(item => item.name)
                      .join(", ")}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    Easy Swaps
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Replace straws and cutlery first - they're easy to avoid and add up quickly
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    Biggest Polluters
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Water bottles and bags take centuries to decompose - prioritize reusables
                  </div>
                </div>

                <button
                  onClick={() => {
                    const report = `🔍 PLASTIC FOOTPRINT REPORT
Timeframe: ${getTimeframeLabel()}
Total Weight: ${getWeightDisplay()}
Items Used: ${metrics.count.toLocaleString()}
CO₂ Impact: ${environmentalImpact.carbonFootprint.toFixed(2)} kg
Oil Used: ${environmentalImpact.oilEquivalent.toFixed(2)} L

📊 BREAKDOWN:
${plasticItems.map(item => 
  `${item.name}: ${usage[item.id]} per month (${(usage[item.id] * item.weight).toFixed(1)}g)`
).join('\n')}

Generated by CarbonX Plastic Tracker - ${new Date().toLocaleDateString()}`;
                    
                    navigator.clipboard.writeText(report).then(() => {
                      alert('Report copied to clipboard!');
                    });
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  📋 Copy Report
                </button>
              </div>
            </motion.div>
          </div>

          {/* Plastic Items Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                📝
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Track Your Plastic Usage
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {plasticItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </h4>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {item.weight}g • Decomposes in {item.decompositionTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">
                      Monthly usage:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={usage[item.id] || 0}
                      onChange={(e) => updateUsage(item.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      = {((usage[item.id] || 0) * item.weight).toFixed(1)}g/month
                    </span>
                  </div>

                  <button
                    onClick={() => toggleAlternatives(item.id)}
                    className="w-full text-left p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        View Alternatives
                      </span>
                      <svg 
                        className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                          showAlternatives[item.id] ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {showAlternatives[item.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 space-y-2"
                    >
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        🌱 Sustainable Alternatives:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.alternatives.map((alt, altIndex) => (
                          <span 
                            key={altIndex}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded"
                          >
                            {alt}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
