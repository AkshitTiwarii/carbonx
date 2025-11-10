"use client";

import { useState } from 'react';
import { Loader2, Calculator, Recycle, AlertTriangle, Leaf, Download } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';

interface PlasticCalculationResult {
  analysisType: string;
  industry: string;
  scale: string;
  region: string;
  analysisNotes: string;
  plasticFootprint: {
    totalAnnualPlastic: number;
    breakdown: {
      packaging: number;
      singleUse: number;
      equipment: number;
      promotional: number;
      other: number;
    };
    plasticTypes: Array<{
      type: string;
      percentage: number;
      recyclable: boolean;
      biodegradable: boolean;
      weight: number;
    }>;
  };
  environmentalImpact: {
    carbonEquivalent: number;
    oceanPollutionRisk: string;
    landfillContribution: number;
    recyclingPotential: number;
    biodegradationTime: string;
  };
  reductionOpportunities: Array<{
    category: string;
    action: string;
    potentialReduction: string;
    difficulty: string;
    costImpact: string;
    timeframe: string;
  }>;
  alternatives: Array<{
    currentItem: string;
    alternative: string;
    reductionPercent: number;
    costComparison: string;
    availability: string;
  }>;
  confidence: number;
  explanation: string;
  recommendations: string[];
  query: string;
  timestamp: string;
}

const EXAMPLE_QUERIES = [
  "Corporate office with 200 employees, monthly meetings, cafeteria, and promotional materials",
  "Music festival with 10,000 attendees, 3 days, food vendors and merchandise",
  "E-commerce business shipping 1000 packages monthly with clothing products",
  "Restaurant chain with 5 locations, takeout service, and disposable packaging",
  "Manufacturing facility producing electronics with 500 employees",
  "University campus with 15,000 students and multiple dining facilities"
];

export default function AIPlasticCalculator() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<PlasticCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const { awardPoints } = useRewards();

  const calculatePlasticFootprint = async (includeReport = false) => {
    if (!query.trim()) {
      setError('Please enter a description of your business, event, or project');
      return;
    }

    setLoading(true);
    setError('');
    if (!includeReport) setResult(null);

    try {
      const response = await fetch('/api/plastic-calculator', {
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
        
        // Award EcoPoints for using plastic calculator
        try {
          await awardPoints({
            type: 'plastic_calculation',
            amount: 1,
            metadata: {
              calculator_type: 'plastic',
              query: query.substring(0, 100),
              total_plastic: data.data.plasticFootprint?.totalAnnualPlastic || 0,
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
      setError('Failed to calculate plastic footprint. Please try again.');
    } finally {
      setLoading(false);
      setGeneratingReport(false);
    }
  };

  const generateReport = async () => {
    if (!result) {
      await calculatePlasticFootprint(true);
    } else {
      setGeneratingReport(true);
      await calculatePlasticFootprint(true);
    }
  };

  const downloadReport = (data: any) => {
    if (!data.reportContent) return;
    
    const blob = new Blob([data.reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plastic-footprint-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
              <Recycle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              AI Plastic Footprint Calculator
            </h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Get instant, AI-powered plastic waste analysis for your business, event, or lifestyle with actionable reduction strategies
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">
              Describe your business, event, or project:
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., We run a food truck business serving 200 customers daily with takeout containers, utensils, and packaging..."
              className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none resize-none"
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
            onClick={() => calculatePlasticFootprint()}
            disabled={loading || !query.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Calculate Plastic Footprint
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && result.plasticFootprint && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-red-300 mb-1">Total Plastic Waste</h3>
                <p className="text-3xl font-bold text-red-400">{result.plasticFootprint.totalAnnualPlastic || 0}</p>
                <p className="text-xs text-red-300">kg annually</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-orange-300 mb-1">Carbon Impact</h3>
                <p className="text-3xl font-bold text-orange-400">{result.environmentalImpact.carbonEquivalent || 0}</p>
                <p className="text-xs text-orange-300">kg CO2e</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-blue-300 mb-1">Recycling Potential</h3>
                <p className="text-3xl font-bold text-blue-400">{Math.round((result.environmentalImpact.recyclingPotential || 0))}%</p>
                <p className="text-xs text-blue-300">recyclable</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-green-300 mb-1">Ocean Risk</h3>
                <p className={`text-2xl font-bold ${getRiskColor(result.environmentalImpact.oceanPollutionRisk || 'medium')}`}>
                  {(result.environmentalImpact.oceanPollutionRisk || 'Medium').toUpperCase()}
                </p>
                <p className="text-xs text-green-300">pollution risk</p>
              </div>
            </div>

            {/* Plastic Breakdown */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Recycle className="w-6 h-6 text-cyan-400" />
                Plastic Usage Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(result.plasticFootprint.breakdown || {}).map(([category, weight]) => (
                  <div key={category} className="bg-zinc-800/50 rounded-lg p-4">
                    <h3 className="font-semibold text-cyan-400 mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1')}</h3>
                    <p className="text-2xl font-bold mb-1">{weight || 0} kg</p>
                    <p className="text-xs text-zinc-400">Annual usage</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plastic Types */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                Plastic Types Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(result.plasticFootprint.plasticTypes || []).map((plastic, index) => (
                  <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{plastic.type || 'Unknown'}</h3>
                      <span className="text-sm font-medium text-zinc-400">
                        {plastic.percentage || 0}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Weight:</span>
                        <span className="font-semibold">{plastic.weight || 0} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Recyclable:</span>
                        <span className={`font-semibold ${plastic.recyclable ? 'text-green-400' : 'text-red-400'}`}>
                          {plastic.recyclable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Biodegradable:</span>
                        <span className={`font-semibold ${plastic.biodegradable ? 'text-green-400' : 'text-red-400'}`}>
                          {plastic.biodegradable ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reduction Opportunities */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-400" />
                Reduction Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(result.reductionOpportunities || []).map((opportunity, index) => (
                  <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg capitalize">{opportunity.category || 'General'}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(opportunity.difficulty || 'medium')}`}>
                        {opportunity.difficulty || 'medium'}
                      </span>
                    </div>
                    <p className="text-zinc-300 mb-4">{opportunity.action || 'No action specified'}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Potential Reduction:</span>
                        <span className="font-semibold text-green-400">{opportunity.potentialReduction || 'TBD'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Cost Impact:</span>
                        <span className={`font-semibold ${
                          opportunity.costImpact === 'saves' ? 'text-green-400' :
                          opportunity.costImpact === 'neutral' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {opportunity.costImpact || 'neutral'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Timeframe:</span>
                        <span className="font-semibold">{opportunity.timeframe || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-400" />
                AI Analysis & Recommendations
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line mb-6">
                  {result.explanation}
                </p>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">Key Recommendations:</h3>
                  <ul className="space-y-2">
                    {(result.recommendations || []).map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span className="text-zinc-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Reduce Your Plastic Footprint?</h2>
              <p className="text-zinc-300 mb-6">
                Take action with detailed insights and start your plastic reduction journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={generateReport}
                  disabled={generatingReport}
                  className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Detailed Report
                    </>
                  )}
                </button>
                <a
                  href="/sustainable-alternatives"
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Explore Alternatives
                </a>
                <a
                  href="/trading"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition-all border border-zinc-600"
                >
                  Offset Impact
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
