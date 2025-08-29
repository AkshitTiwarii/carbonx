import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { eventType, attendees, duration, venue, budget, sustainabilityGoals, description } = await request.json();

    if (!eventType || !attendees || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, attendees, duration' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert sustainable event planner with deep knowledge of environmental impact, cost optimization, and practical implementation. Analyze the following event details and provide comprehensive sustainability recommendations.

EVENT DETAILS:
- Type: ${eventType}
- Attendees: ${attendees}
- Duration: ${duration} days
- Venue: ${venue || 'Not specified'}
- Budget: ${budget || 'Not specified'}
- Sustainability Goals: ${sustainabilityGoals || 'General environmental consciousness'}
- Description: ${description || 'Standard event'}

Please provide a detailed analysis and recommendations in JSON format with the following structure:

{
  "eventAnalysis": {
    "estimatedCarbonFootprint": "X kg CO2",
    "wasteGeneration": "X kg waste",
    "energyConsumption": "X kWh",
    "waterUsage": "X liters"
  },
  "sustainabilityRecommendations": [
    {
      "category": "Category name",
      "priority": "high|medium|low",
      "recommendation": "Specific recommendation",
      "carbonReduction": "X kg CO2",
      "costImpact": "percentage or amount",
      "implementation": "How to implement",
      "difficulty": "easy|medium|hard"
    }
  ],
  "venueRecommendations": {
    "sustainableFeatures": ["feature1", "feature2"],
    "energyEfficiency": "recommendations",
    "accessibility": "considerations"
  },
  "cateringPlan": {
    "sustainableOptions": ["option1", "option2"],
    "localSourcing": "specific suggestions",
    "wasteReduction": "strategies",
    "estimatedReduction": "X% waste reduction"
  },
  "transportationPlan": {
    "publicTransit": "recommendations",
    "carpooling": "strategies",
    "carbonOffset": "calculation and options",
    "estimatedReduction": "X kg CO2"
  },
  "wasteManagement": {
    "recyclingStations": "placement and types",
    "composting": "organic waste strategy",
    "digitalAlternatives": "paper reduction methods",
    "zeroWasteGoal": "achievability and steps"
  },
  "budgetOptimization": {
    "costSavings": "areas for savings",
    "sustainableInvestments": "worth the cost",
    "totalBudgetImpact": "percentage change",
    "roi": "return on investment timeline"
  },
  "actionPlan": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"],
    "longTerm": ["action1", "action2"]
  },
  "certificationOpportunities": ["certification1", "certification2"],
  "impactMetrics": {
    "carbonFootprintReduction": "X%",
    "wasteReduction": "X%",
    "costSavings": "X% or $X",
    "sustainabilityScore": "X/100"
  }
}

Provide practical, actionable recommendations that are specific to the event type and size. Include realistic cost estimates and carbon impact calculations. Focus on measurable outcomes and implementation feasibility.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    // Generate downloadable report
    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sustainable Event Planning Report - ${eventType}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; }
        .metric { display: inline-block; background: white; padding: 15px; margin: 5px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .recommendation { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #10b981; }
        .priority-high { border-left-color: #dc2626; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        .footer { text-align: center; margin-top: 40px; color: #6b7280; }
        h1, h2, h3 { color: #1f2937; }
        .impact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌱 Sustainable Event Planning Report</h1>
        <p><strong>${eventType}</strong> • ${attendees} attendees • ${duration} days</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>📊 Event Impact Analysis</h2>
        <div class="impact-grid">
            <div class="metric">
                <strong>Carbon Footprint</strong><br>
                ${analysisData.eventAnalysis.estimatedCarbonFootprint}
            </div>
            <div class="metric">
                <strong>Waste Generation</strong><br>
                ${analysisData.eventAnalysis.wasteGeneration}
            </div>
            <div class="metric">
                <strong>Energy Consumption</strong><br>
                ${analysisData.eventAnalysis.energyConsumption}
            </div>
            <div class="metric">
                <strong>Water Usage</strong><br>
                ${analysisData.eventAnalysis.waterUsage}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💡 Sustainability Recommendations</h2>
        ${analysisData.sustainabilityRecommendations.map((rec: any) => `
            <div class="recommendation priority-${rec.priority}">
                <h3>${rec.category} (${rec.priority.toUpperCase()} Priority)</h3>
                <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                <p><strong>Carbon Reduction:</strong> ${rec.carbonReduction}</p>
                <p><strong>Cost Impact:</strong> ${rec.costImpact}</p>
                <p><strong>Implementation:</strong> ${rec.implementation}</p>
                <p><strong>Difficulty:</strong> ${rec.difficulty}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🍽️ Catering Plan</h2>
        <p><strong>Sustainable Options:</strong> ${analysisData.cateringPlan.sustainableOptions.join(', ')}</p>
        <p><strong>Local Sourcing:</strong> ${analysisData.cateringPlan.localSourcing}</p>
        <p><strong>Waste Reduction:</strong> ${analysisData.cateringPlan.wasteReduction}</p>
        <p><strong>Estimated Reduction:</strong> ${analysisData.cateringPlan.estimatedReduction}</p>
    </div>

    <div class="section">
        <h2>🚗 Transportation Plan</h2>
        <p><strong>Public Transit:</strong> ${analysisData.transportationPlan.publicTransit}</p>
        <p><strong>Carpooling:</strong> ${analysisData.transportationPlan.carpooling}</p>
        <p><strong>Carbon Offset:</strong> ${analysisData.transportationPlan.carbonOffset}</p>
        <p><strong>Estimated Reduction:</strong> ${analysisData.transportationPlan.estimatedReduction}</p>
    </div>

    <div class="section">
        <h2>♻️ Waste Management</h2>
        <p><strong>Recycling Stations:</strong> ${analysisData.wasteManagement.recyclingStations}</p>
        <p><strong>Composting:</strong> ${analysisData.wasteManagement.composting}</p>
        <p><strong>Digital Alternatives:</strong> ${analysisData.wasteManagement.digitalAlternatives}</p>
        <p><strong>Zero Waste Goal:</strong> ${analysisData.wasteManagement.zeroWasteGoal}</p>
    </div>

    <div class="section">
        <h2>📈 Expected Impact</h2>
        <div class="impact-grid">
            <div class="metric">
                <strong>Carbon Reduction</strong><br>
                ${analysisData.impactMetrics.carbonFootprintReduction}
            </div>
            <div class="metric">
                <strong>Waste Reduction</strong><br>
                ${analysisData.impactMetrics.wasteReduction}
            </div>
            <div class="metric">
                <strong>Cost Savings</strong><br>
                ${analysisData.impactMetrics.costSavings}
            </div>
            <div class="metric">
                <strong>Sustainability Score</strong><br>
                ${analysisData.impactMetrics.sustainabilityScore}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📋 Action Plan</h2>
        <h3>Immediate Actions</h3>
        <ul>${analysisData.actionPlan.immediate.map((action: any) => `<li>${action}</li>`).join('')}</ul>
        
        <h3>Short-term Actions</h3>
        <ul>${analysisData.actionPlan.shortTerm.map((action: any) => `<li>${action}</li>`).join('')}</ul>
        
        <h3>Long-term Actions</h3>
        <ul>${analysisData.actionPlan.longTerm.map((action: any) => `<li>${action}</li>`).join('')}</ul>
    </div>

    <div class="footer">
        <p>🌍 Generated by CarbonX AI Event Planner</p>
        <p>Helping create sustainable events that protect our planet</p>
    </div>
</body>
</html>`;

    return NextResponse.json({
      analysis: analysisData,
      report: reportHtml,
      success: true
    });

  } catch (error) {
    console.error('Error in event planning analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate event analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
