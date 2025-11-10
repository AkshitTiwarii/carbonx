"use client";

import { useState } from "react";
import { Droplet, Loader2, Calculator, Users, MapPin, TrendingDown, Lightbulb, Globe } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";

interface WaterCalculatorInputs {
  dietType: "vegetarian" | "non-vegetarian" | "vegan";
  dailyWaterUsage: {
    showerMinutes: number;
    laundryLoadsPerWeek: number;
    dishwashingLoadsPerDay: number;
    handWashDishes: boolean;
  };
  householdSize: number;
  location: string;
}

interface WaterCalculatorResponse {
  daily_liters: number;
  monthly_liters: number;
  yearly_liters: number;
  breakdown: {
    diet_water_footprint: number;
    direct_water_usage: number;
    per_person_daily: number;
  };
  tips: string[];
  regional_comparison: string;
  regional_average: number;
  assumptions: {
    diet_type: string;
    household_size: number;
    location: string;
    note?: string;
  };
}

const DEFAULT_INPUTS: WaterCalculatorInputs = {
  dietType: "non-vegetarian",
  dailyWaterUsage: {
    showerMinutes: 8,
    laundryLoadsPerWeek: 3,
    dishwashingLoadsPerDay: 1,
    handWashDishes: false,
  },
  householdSize: 1,
  location: "",
};

const LOCATIONS = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "China",
  "India",
  "Japan",
  "South Korea",
  "Australia",
  "Brazil",
  "South Africa",
  "Global Average",
];

function formatLiters(liters: number): string {
  if (liters >= 1000000) {
    return `${(liters / 1000000).toFixed(1)}M`;
  }
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(1)}K`;
  }
  return Math.round(liters).toLocaleString();
}

export default function WaterCalculatorPage() {
  const [inputs, setInputs] = useState<WaterCalculatorInputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<WaterCalculatorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { awardPoints } = useRewards();

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/water-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to calculate water footprint");
      }

      setResult(data.data);
      
      // Award EcoPoints for using water calculator
      try {
        await awardPoints({
          type: 'water_calculation',
          amount: 1,
          metadata: {
            calculator_type: 'water',
            daily_liters: data.data.daily_liters,
            household_size: inputs.householdSize,
            location: inputs.location,
          },
        });
      } catch (rewardError) {
        // Don't block the calculation if rewards fail
        console.warn('Failed to award points:', rewardError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
              <Droplet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Water Footprint Calculator
            </h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Estimate your water consumption based on diet, daily usage, and household size. Get personalized conservation tips and regional comparisons.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Diet Type */}
            <div>
              <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Diet Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["vegetarian", "non-vegetarian", "vegan"] as const).map((diet) => (
                  <button
                    key={diet}
                    onClick={() => setInputs((prev) => ({ ...prev, dietType: diet }))}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      inputs.dietType === diet
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 border border-zinc-700"
                    }`}
                  >
                    {diet === "non-vegetarian" ? "Non-Veg" : diet.charAt(0).toUpperCase() + diet.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Household Size */}
            <div>
              <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Household Size
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={inputs.householdSize}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    householdSize: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Location (for regional comparison)
            </label>
            <select
              value={inputs.location}
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            >
              <option value="">Select location...</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Water Usage */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-cyan-400" />
              Daily Water Usage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                  <Droplet className="w-4 h-4" />
                  Shower Duration
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={inputs.dailyWaterUsage.showerMinutes}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(60, parseFloat(e.target.value) || 0));
                      setInputs((prev) => ({
                        ...prev,
                        dailyWaterUsage: {
                          ...prev.dailyWaterUsage,
                          showerMinutes: val,
                        },
                      }));
                    }}
                    min={0}
                    max={60}
                    step={1}
                    className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                  <span className="text-xs text-zinc-400">min/day</span>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                  <Droplet className="w-4 h-4" />
                  Laundry Loads
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={inputs.dailyWaterUsage.laundryLoadsPerWeek}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(20, parseFloat(e.target.value) || 0));
                      setInputs((prev) => ({
                        ...prev,
                        dailyWaterUsage: {
                          ...prev.dailyWaterUsage,
                          laundryLoadsPerWeek: val,
                        },
                      }));
                    }}
                    min={0}
                    max={20}
                    step={1}
                    className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                  <span className="text-xs text-zinc-400">per week</span>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                  <Droplet className="w-4 h-4" />
                  Dishwashing
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      checked={inputs.dailyWaterUsage.handWashDishes}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          dailyWaterUsage: {
                            ...prev.dailyWaterUsage,
                            handWashDishes: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-zinc-700 bg-zinc-900"
                    />
                    Hand wash dishes
                  </label>
                  {!inputs.dailyWaterUsage.handWashDishes && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputs.dailyWaterUsage.dishwashingLoadsPerDay}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0));
                          setInputs((prev) => ({
                            ...prev,
                            dailyWaterUsage: {
                              ...prev.dailyWaterUsage,
                              dishwashingLoadsPerDay: val,
                            },
                          }));
                        }}
                        min={0}
                        max={10}
                        step={0.5}
                        className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      />
                      <span className="text-xs text-zinc-400">loads/day</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result?.assumptions?.note && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">{result.assumptions.note}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Calculate Water Footprint
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-blue-300 mb-1">Daily Consumption</h3>
                <p className="text-3xl font-bold text-blue-400">{formatLiters(result.daily_liters)}</p>
                <p className="text-xs text-blue-300">liters per day</p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-cyan-300 mb-1">Monthly Consumption</h3>
                <p className="text-3xl font-bold text-cyan-400">{formatLiters(result.monthly_liters)}</p>
                <p className="text-xs text-cyan-300">liters per month</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-teal-300 mb-1">Yearly Consumption</h3>
                <p className="text-3xl font-bold text-teal-400">{formatLiters(result.yearly_liters)}</p>
                <p className="text-xs text-teal-300">liters per year</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-emerald-300 mb-1">Per Person Daily</h3>
                <p className="text-3xl font-bold text-emerald-400">{formatLiters(result.breakdown.per_person_daily)}</p>
                <p className="text-xs text-emerald-300">liters per person</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-cyan-400" />
                Water Usage Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="font-semibold text-cyan-400 mb-2">Diet Water Footprint</h3>
                  <p className="text-3xl font-bold mb-1">{formatLiters(result.breakdown.diet_water_footprint)}</p>
                  <p className="text-xs text-zinc-400">liters per day (virtual water)</p>
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <p className="text-xs text-zinc-500">
                      Virtual water includes water used in food production, which is the largest component of most people's water footprint.
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="font-semibold text-blue-400 mb-2">Direct Water Usage</h3>
                  <p className="text-3xl font-bold mb-1">{formatLiters(result.breakdown.direct_water_usage)}</p>
                  <p className="text-xs text-zinc-400">liters per day (household use)</p>
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <p className="text-xs text-zinc-500">
                      Includes showers, laundry, dishwashing, and other direct household water consumption.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Comparison */}
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-400" />
                Regional Comparison
              </h2>
              <p className="text-zinc-300 leading-relaxed text-lg">
                {result.regional_comparison}
              </p>
              <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-sm text-zinc-400">
                  Regional average: <span className="text-cyan-400 font-semibold">{formatLiters(result.regional_average * inputs.householdSize)}</span> liters per day
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                Personalized Water-Saving Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.tips.map((tip, index) => (
                  <div key={index} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Reduce Your Water Footprint?</h2>
              <p className="text-zinc-300 mb-6">
                Start implementing these tips today and track your progress over time
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/sustainable-alternatives"
                  className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Explore Sustainable Alternatives
                </a>
                <a
                  href="/dashboard"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition-all border border-zinc-600"
                >
                  Track Your Impact
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder when no results */}
        {!result && !loading && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💧</div>
            <p className="text-zinc-400 text-lg">Enter your details and click Calculate to see your water footprint</p>
          </div>
        )}
      </div>
    </div>
  );
}
