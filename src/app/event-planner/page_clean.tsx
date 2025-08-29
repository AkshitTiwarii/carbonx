"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Bot, Download, Calculator, Target, TrendingUp, Users, Calendar, MapPin, DollarSign, Lightbulb, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface EventItem {
  id: string;
  category: string;
  traditional: string;
  sustainable: string;
  carbonSaved: number;
  costDiff: number;
  completed: boolean;
  difficulty: string;
}

interface AIAnalysis {
  eventAnalysis: {
    estimatedCarbonFootprint: string;
    wasteGeneration: string;
    energyConsumption: string;
    waterUsage: string;
    sustainabilityScore: number;
  };
  sustainabilityRecommendations: Array<{
    category: string;
    recommendation: string;
    impact: string;
    priority: string;
  }>;
  impactMetrics: {
    carbonFootprintReduction: string;
    wasteReduction: string;
    costSavings: string;
    sustainabilityScore: string;
  };
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

const eventItems: EventItem[] = [
  {
    id: "1",
    category: "Signage & Banners",
    traditional: "Vinyl banners and plastic signage",
    sustainable: "Fabric banners and recyclable cardboard signs",
    carbonSaved: 15,
    costDiff: -10,
    completed: false,
    difficulty: "easy"
  },
  {
    id: "2",
    category: "Catering",
    traditional: "Single-use plastic plates, cups, and utensils",
    sustainable: "Compostable or reusable dinnerware",
    carbonSaved: 25,
    costDiff: 5,
    completed: false,
    difficulty: "medium"
  },
  {
    id: "3",
    category: "Transportation",
    traditional: "Individual car travel",
    sustainable: "Shuttle services and public transport incentives",
    carbonSaved: 40,
    costDiff: -15,
    completed: false,
    difficulty: "hard"
  },
  {
    id: "4",
    category: "Swag & Giveaways",
    traditional: "Plastic promotional items",
    sustainable: "Eco-friendly, useful items (bamboo, recycled materials)",
    carbonSaved: 20,
    costDiff: 10,
    completed: false,
    difficulty: "easy"
  },
  {
    id: "5",
    category: "Digital Integration",
    traditional: "Printed programs and paper handouts",
    sustainable: "QR codes for digital programs and materials",
    carbonSaved: 30,
    costDiff: -20,
    completed: false,
    difficulty: "easy"
  },
  {
    id: "6",
    category: "Venue Selection",
    traditional: "Standard conference center",
    sustainable: "LEED-certified or green building",
    carbonSaved: 35,
    costDiff: 0,
    completed: false,
    difficulty: "medium"
  },
  {
    id: "7",
    category: "Energy & Lighting",
    traditional: "Standard lighting and energy usage",
    sustainable: "LED lighting and renewable energy sources",
    carbonSaved: 50,
    costDiff: -25,
    completed: false,
    difficulty: "hard"
  },
  {
    id: "8",
    category: "Waste Management",
    traditional: "Single waste stream",
    sustainable: "Comprehensive recycling and composting stations",
    carbonSaved: 45,
    costDiff: 15,
    completed: false,
    difficulty: "medium"
  },
  {
    id: "9",
    category: "Water Stations",
    traditional: "Bottled water",
    sustainable: "Water fountains and reusable bottles",
    carbonSaved: 60,
    costDiff: -30,
    completed: false,
    difficulty: "easy"
  },
  {
    id: "10",
    category: "Local Sourcing",
    traditional: "Global suppliers",
    sustainable: "Local vendors and suppliers",
    carbonSaved: 25,
    costDiff: -5,
    completed: false,
    difficulty: "hard"
  }
];

export default function EventPlannerPage() {
  const [items, setItems] = useState<EventItem[]>(eventItems);
  const [attendees, setAttendees] = useState<number>(100);
  const [eventType, setEventType] = useState<string>("hackathon");
  const [eventDuration, setEventDuration] = useState<number>(2);
  const [venue, setVenue] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [sustainabilityGoals, setSustainabilityGoals] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const generateAIAnalysis = async () => {
    if (!eventType || !attendees || !eventDuration) {
      alert('Please fill in the basic event details first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/event-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          attendees,
          duration: eventDuration,
          venue,
          budget,
          sustainabilityGoals,
          eventDescription,
          completedSustainableActions: items.filter(item => item.completed).map(item => ({
            category: item.category,
            action: item.sustainable,
            carbonSaved: item.carbonSaved,
            costDiff: item.costDiff
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      const data = await response.json();
      setAIAnalysis(data.analysis);
      setShowAIRecommendations(true);

      // Optional: Download report if provided
      if (data.report) {
        const blob = new Blob([data.report], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sustainability-report.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      alert('Failed to generate analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const metrics = useMemo(() => {
    const completedItems = items.filter(item => item.completed);
    const totalCarbonSaved = completedItems.reduce((sum, item) => 
      sum + (item.carbonSaved * attendees / 100), 0
    );
    const totalCostDiff = completedItems.reduce((sum, item) => 
      sum + (item.costDiff * attendees / 100), 0
    );
    const completionRate = items.length > 0 ? (completedItems.length / items.length) * 100 : 0;
    
    return {
      completionRate,
      carbonSaved: totalCarbonSaved,
      costDiff: totalCostDiff
    };
  }, [items, attendees]);

  const sustainabilityScore = useMemo(() => {
    const maxPossibleScore = items.length * 10;
    const currentScore = items.filter(item => item.completed).length * 10;
    const percentage = maxPossibleScore > 0 ? (currentScore / maxPossibleScore) * 100 : 0;
    
    let grade;
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C+";
    else if (percentage >= 40) grade = "C";
    else grade = "D";

    return { score: grade, percentage: Math.round(percentage) };
  }, [items]);

  const downloadReport = () => {
    const report = `
SUSTAINABLE EVENT PLANNING REPORT
Generated on: ${new Date().toLocaleDateString()}

📅 EVENT DETAILS
Type: ${eventType}
Attendees: ${attendees}
Duration: ${eventDuration} days
${venue ? `Venue: ${venue}` : ''}
${budget ? `Budget: ${budget}` : ''}

📊 SUSTAINABILITY METRICS
Completion Rate: ${metrics.completionRate.toFixed(1)}%
Carbon Saved: ${metrics.carbonSaved.toFixed(1)} kg CO₂
Cost Impact: ${metrics.costDiff >= 0 ? '+' : ''}${metrics.costDiff.toFixed(1)}%
Sustainability Score: ${sustainabilityScore.score}

${aiAnalysis ? `
🤖 AI ANALYSIS RESULTS
Expected Carbon Footprint: ${aiAnalysis.eventAnalysis.estimatedCarbonFootprint}
Waste Generation: ${aiAnalysis.eventAnalysis.wasteGeneration}
Energy Consumption: ${aiAnalysis.eventAnalysis.energyConsumption}
Water Usage: ${aiAnalysis.eventAnalysis.waterUsage}

Top AI Recommendations:
${aiAnalysis.sustainabilityRecommendations.slice(0, 3).map(rec => `• ${rec.category}: ${rec.recommendation}`).join('\n')}
` : ''}

✅ COMPLETED SUSTAINABLE ACTIONS
${items.filter(item => item.completed).map(item => 
  `• ${item.category}: ${item.sustainable} (${item.carbonSaved}% carbon saved)`
).join('\n')}

⏳ PENDING ACTIONS
${items.filter(item => !item.completed).map(item => 
  `• ${item.category}: ${item.sustainable} (Potential: ${item.carbonSaved}% carbon saved)`
).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sustainability-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-zinc-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent mb-4">
            Sustainable Event Planner
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Transform your events with AI-powered sustainability insights and actionable recommendations
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Event Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Event Details */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100">Event Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="festival">Festival</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Attendees: {attendees}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={attendees}
                    onChange={(e) => setAttendees(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>10</span>
                    <span>1000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Duration: {eventDuration} days
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>1 day</span>
                    <span>7 days</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Venue (Optional)</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g., Convention Center, Hotel"
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Budget (Optional)</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., $10,000 - $50,000"
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Sustainability Goals</label>
                  <textarea
                    value={sustainabilityGoals}
                    onChange={(e) => setSustainabilityGoals(e.target.value)}
                    placeholder="What are your environmental goals for this event?"
                    rows={3}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Event Description</label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Describe your event for better AI recommendations..."
                    rows={3}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <button
                  onClick={generateAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      Get AI Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Recommendations & Impact Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100">
                  {aiAnalysis ? 'AI Analysis Results' : 'Impact Dashboard'}
                </h3>
              </div>

              {aiAnalysis ? (
                <div className="space-y-4">
                  {/* Impact Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-400">
                        {aiAnalysis.impactMetrics.carbonFootprintReduction}
                      </div>
                      <div className="text-xs text-zinc-400">Carbon Reduction</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-blue-400">
                        {aiAnalysis.impactMetrics.wasteReduction}
                      </div>
                      <div className="text-xs text-zinc-400">Waste Reduction</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-purple-400">
                        {aiAnalysis.impactMetrics.costSavings}
                      </div>
                      <div className="text-xs text-zinc-400">Cost Impact</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-amber-400">
                        {aiAnalysis.impactMetrics.sustainabilityScore}
                      </div>
                      <div className="text-xs text-zinc-400">AI Score</div>
                    </div>
                  </div>

                  {/* Top Recommendations */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      Priority Recommendations
                    </h4>
                    {aiAnalysis.sustainabilityRecommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="bg-zinc-800/50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            rec.priority === 'high' ? 'bg-red-400' :
                            rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                          }`}></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-zinc-200">{rec.category}</div>
                            <div className="text-xs text-zinc-400 mt-1">{rec.recommendation}</div>
                            <div className="text-xs text-green-400 mt-1">{rec.impact}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">{metrics.completionRate.toFixed(0)}%</div>
                    <div className="text-sm text-zinc-400">Completion</div>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{metrics.carbonSaved.toFixed(1)}kg</div>
                    <div className="text-sm text-zinc-400">CO₂ Saved</div>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${metrics.costDiff >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {metrics.costDiff >= 0 ? '+' : ''}{metrics.costDiff.toFixed(1)}%
                    </div>
                    <div className="text-sm text-zinc-400">Cost Impact</div>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">{sustainabilityScore.score}</div>
                    <div className="text-sm text-zinc-400">Grade</div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right Panel - Sustainability Checklist */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100">Sustainability Checklist</h3>
                </div>
                <button
                  onClick={downloadReport}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                        item.completed 
                          ? 'bg-emerald-900/30 border-emerald-600/50' 
                          : 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600'
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                          item.completed 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-zinc-500 hover:border-zinc-400'
                        }`}>
                          {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-zinc-100">{item.category}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.difficulty === 'easy' ? 'bg-green-900/50 text-green-300' :
                              item.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                              'bg-red-900/50 text-red-300'
                            }`}>
                              {item.difficulty}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="text-zinc-400">
                              <span className="text-red-300">Traditional:</span> {item.traditional}
                            </div>
                            <div className="text-zinc-300">
                              <span className="text-green-300">Sustainable:</span> {item.sustainable}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="w-3 h-3" />
                              {item.carbonSaved}% less CO₂
                            </div>
                            <div className={`flex items-center gap-1 ${
                              item.costDiff >= 0 ? 'text-red-400' : 'text-green-400'
                            }`}>
                              <DollarSign className="w-3 h-3" />
                              {item.costDiff >= 0 ? '+' : ''}{item.costDiff}% cost
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
