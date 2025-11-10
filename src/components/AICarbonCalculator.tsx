"use client";

import { useState } from 'react';
import { Loader2, Calculator, Lightbulb, TrendingUp, Leaf } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';

interface CalculationResult {
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  creditsNeeded: number;
  recommendedCredits: Array<{
    type: string;
    name: string;
    quantity: number;
    priceRange: number[];
    totalCost: number;
    quality: string;
  }>;
  industry: string;
  subIndustry?: string;
  region: string;
  confidence: number;
  explanation: string;
  query: string;
  timestamp: string;
}

const EXAMPLE_QUERIES = [
  "Calculate carbon credits for a manufacturing company with $2M annual revenue",
  "How many credits does a tech startup with 50 employees need?",
  "Carbon footprint for a transportation company with 100 trucks",
  "Agricultural farm with 500 hectares livestock operations",
  "Construction company doing $5M commercial projects",
  "Retail chain with $10M revenue in fashion industry"
];

export default function AICarbonCalculator() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const { awardPoints } = useRewards();

  const calculateCredits = async (includeReport = false) => {
    if (!query.trim()) {
      setError('Please enter a description of your business');
      return;
    }

    setLoading(true);
    setError('');
    if (!includeReport) setResult(null);

    try {
      const response = await fetch('/api/ai-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          generateReport: includeReport 
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        
        // Award EcoPoints for using AI calculator
        try {
          await awardPoints({
            type: 'ai_tool_use',
            amount: 1,
            metadata: {
              calculator_type: 'carbon',
              query: query.substring(0, 100), // Store first 100 chars
              credits_needed: data.data.creditsNeeded,
            },
          });
        } catch (rewardError) {
          // Don't block the calculation if rewards fail
          console.warn('Failed to award points:', rewardError);
        }
        
        if (includeReport && data.data.reportContent) {
          downloadReport(data.data);
        }
      } else {
        setError(data.error || 'Calculation failed');
      }
    } catch (error) {
      console.error('Calculator error:', error);
      setError('Failed to calculate carbon credits. Please try again.');
    } finally {
      setLoading(false);
      setGeneratingReport(false);
    }
  };

  const generateReport = async () => {
    if (!result) {
      await calculateCredits(true);
    } else {
      setGeneratingReport(true);
      await calculateCredits(true);
    }
  };

  const downloadReport = (data: any) => {
    if (!data.reportContent) return;
    
    const blob = new Blob([data.reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon-footprint-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              AI Carbon Credits Calculator
            </h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Get instant, AI-powered carbon credit calculations for your industry using natural language processing and industry-specific emission factors
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">
              Describe your business or project:
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., We're a manufacturing company with $5M annual revenue, 200 employees, producing steel components in the US..."
              className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-green-500 focus:outline-none resize-none"
            />
          </div>

          {/* Example Queries */}
          <div className="mb-6">
            <p className="text-sm text-zinc-400 mb-3">Try these examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {EXAMPLE_QUERIES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={() => calculateCredits()}
            disabled={loading || !query.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Calculate Carbon Credits
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && result.totalEmissions && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-red-300 mb-1">Total Emissions</h3>
                <p className="text-3xl font-bold text-red-400">{result.totalEmissions || 0}</p>
                <p className="text-xs text-red-300">tCO2e annually</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-blue-300 mb-1">Credits Needed</h3>
                <p className="text-3xl font-bold text-blue-400">{result.creditsNeeded || 0}</p>
                <p className="text-xs text-blue-300">carbon credits</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-green-300 mb-1">Industry</h3>
                <p className="text-xl font-bold text-green-400 capitalize">{result.industry || 'General'}</p>
                {result.subIndustry && (
                  <p className="text-xs text-green-300 capitalize">{result.subIndustry.replace('_', ' ')}</p>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-purple-300 mb-1">Confidence</h3>
                <p className="text-3xl font-bold text-purple-400">{Math.round((result.confidence || 0.85) * 100)}%</p>
                <p className="text-xs text-purple-300">accuracy</p>
              </div>
            </div>

            {/* Emissions Breakdown */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Emissions Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-400 mb-2">Scope 1 (Direct)</h3>
                  <p className="text-2xl font-bold mb-1">{result.scope1 || 0} tCO2e</p>
                  <p className="text-xs text-zinc-400">Direct emissions from owned sources</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">Scope 2 (Energy)</h3>
                  <p className="text-2xl font-bold mb-1">{result.scope2 || 0} tCO2e</p>
                  <p className="text-xs text-zinc-400">Indirect emissions from energy</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">Scope 3 (Value Chain)</h3>
                  <p className="text-2xl font-bold mb-1">{result.scope3 || 0} tCO2e</p>
                  <p className="text-xs text-zinc-400">Indirect emissions in value chain</p>
                </div>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                AI Analysis & Recommendations
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                  {result.explanation}
                </p>
              </div>
            </div>

            {/* Recommended Credits */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-400" />
                Recommended Carbon Credits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(result.recommendedCredits || []).map((credit, index) => (
                  <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{credit.type || 'Carbon Credit'}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        credit.quality === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                        credit.quality === 'high' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {credit.quality || 'standard'}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{credit.name || 'Standard Carbon Credit'}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Quantity:</span>
                        <span className="font-semibold">{credit.quantity || 0} credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Price Range:</span>
                        <span className="font-semibold">
                          ${credit.priceRange?.[0] || 0}-${credit.priceRange?.[1] || 0}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-700 pt-2">
                        <span className="text-zinc-400">Est. Total:</span>
                        <span className="font-bold text-green-400">
                          ${credit.totalCost ? credit.totalCost.toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Take Action?</h2>
              <p className="text-zinc-300 mb-6">
                Start your carbon neutrality journey with our trading platform or download a detailed report
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={generateReport}
                  disabled={generatingReport}
                  className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      📊 Download Detailed Report
                    </>
                  )}
                </button>
                <a
                  href="/trading"
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Browse Trading Platform
                </a>
                <a
                  href="/portfolio"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition-all border border-zinc-600"
                >
                  View Portfolio Options
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
