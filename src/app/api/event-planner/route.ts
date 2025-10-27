import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Don't throw at module load time if the API key is missing — that causes build-time failures
// on platforms (like Vercel) when env vars aren't set during certain build steps.
// Initialize the client inside the request handler when possible.
let genAI: any = null;

export async function POST(request: NextRequest) {
  try {
    const { eventType, attendees, duration, venue, budget, sustainabilityGoals, description } = await request.json();

    if (!eventType || !attendees || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, attendees, duration' },
        { status: 400 }
      );
    }

  // model will be created below once genAI is initialized

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

    let analysisData;
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (genAI === null) {
          if (apiKey) {
            genAI = new GoogleGenerativeAI(apiKey);
          }
        }

        // Debugging: log key presence and client initialization (boolean only)
        try {
          console.log('event-planner: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
          console.log('event-planner: genAI initialized?', !!genAI);
        } catch (e) {}

        if (!genAI) {
          // No API key / client available — skip AI call and use fallback analysis directly
          throw new Error('GEMINI_API_KEY not available; using fallback analysis');
        }

        // Try candidate models, then discover available models if needed
        const candidateModels = ['gemini-1.5-flash-latest', 'gemini-1.0', 'text-bison-001'];
        let selectedModelInstance: any = null;
        let chosenModelName: string | null = null;
        let result: any = null;

        for (const candidate of candidateModels) {
          try {
            selectedModelInstance = genAI.getGenerativeModel({ model: candidate });
            console.log('event-planner: attempting model', candidate);
            result = await selectedModelInstance.generateContent(prompt);
            const upstreamStatus = result?.response?.status ?? result?.status;
            if (typeof upstreamStatus === 'number' && upstreamStatus >= 400) {
              console.warn('event-planner: model', candidate, 'returned status', upstreamStatus);
              if (upstreamStatus === 404) continue;
              continue;
            }
            chosenModelName = candidate;
            console.log('event-planner: model selected', chosenModelName);
            break;
          } catch (mErr) {
            console.warn('event-planner: model', candidate, 'failed:', (mErr as any)?.message || mErr);
            result = null;
            continue;
          }
        }

        // If candidates fail, try ListModels discovery
        if (!result) {
          try {
            const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey || '')}`;
            const listResp = await fetch(listUrl);
            if (listResp.ok) {
              const listJson = await listResp.json();
              const remoteModels: string[] = (listJson?.models || [])
                .map((m: any) => String(m?.name || ''))
                .filter(Boolean)
                .map((n: string) => n.replace(/^models\//, ''));
              console.log('event-planner: discovered models from ListModels:', remoteModels.join(', '));
              for (const remote of remoteModels) {
                if (candidateModels.includes(remote)) continue;
                try {
                  selectedModelInstance = genAI.getGenerativeModel({ model: remote });
                  console.log('event-planner: attempting discovered model', remote);
                  const r = await selectedModelInstance.generateContent(prompt);
                  const upstreamStatus = r?.response?.status ?? r?.status;
                  if (typeof upstreamStatus === 'number' && upstreamStatus >= 400) {
                    console.warn('event-planner: discovered model', remote, 'returned status', upstreamStatus);
                    continue;
                  }
                  result = r;
                  chosenModelName = remote;
                  console.log('event-planner: discovered model selected', chosenModelName);
                  break;
                } catch (dmErr) {
                  console.warn('event-planner: discovered model', remote, 'failed:', (dmErr as any)?.message || dmErr);
                  continue;
                }
              }
            } else {
              console.warn('event-planner: ListModels request failed with status', listResp.status);
            }
          } catch (listErr) {
            console.warn('event-planner: ListModels error:', (listErr as any)?.message || listErr);
          }
        }

        if (!result) {
          throw new Error('No candidate model produced a usable response');
        }

        const responseText = typeof result?.response?.text === 'function' ? await result.response.text() : String(result);

        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response');
        }

        analysisData = JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Event planner AI error:', error?.status || error?.message || error);
      
      // Check if it's a rate limit error or model not found error
      if (error?.status === 429 || error?.status === 404 || error?.message?.includes('RATE_LIMIT_EXCEEDED') || error?.message?.includes('not found')) {
        // Return a helpful fallback response
        analysisData = {
          eventAnalysis: {
            estimatedCarbonFootprint: `${attendees * 10} kg CO2`,
            wasteGeneration: `${attendees * 2} kg`,
            energyConsumption: `${attendees * 5} kWh`,
            waterUsage: `${attendees * 50} liters`
          },
          sustainabilityRecommendations: [
            {
              category: "Catering",
              priority: "high",
              recommendation: "Choose local, seasonal, plant-based menu options",
              carbonReduction: `${attendees * 3} kg CO2`,
              costImpact: "5-10% increase",
              implementation: "Work with caterer to source locally",
              difficulty: "easy"
            },
            {
              category: "Waste Management",
              priority: "high",
              recommendation: "Set up comprehensive recycling and composting stations",
              carbonReduction: `${attendees * 1.5} kg CO2`,
              costImpact: "Minimal",
              implementation: "Partner with waste management company",
              difficulty: "easy"
            }
          ],
          venueRecommendations: {
            sustainableFeatures: ["Green building certification", "Energy-efficient HVAC"],
            energyEfficiency: "Choose LEED-certified venues",
            accessibility: "Ensure public transit access"
          },
          cateringPlan: {
            sustainableOptions: ["Vegetarian options", "Local produce"],
            localSourcing: "Partner with local farms and suppliers",
            wasteReduction: "Use reusable dishware",
            estimatedReduction: "50% waste reduction"
          },
          transportationPlan: {
            publicTransit: "Provide transit passes or information",
            carpooling: "Set up carpool coordination platform",
            carbonOffset: "Calculate and offset travel emissions",
            estimatedReduction: `${attendees * 2} kg CO2`
          },
          wasteManagement: {
            recyclingStations: "Place stations at high-traffic areas",
            composting: "Separate organic waste from catering",
            digitalAlternatives: "Use digital tickets and programs",
            zeroWasteGoal: "Achievable with planning"
          },
          budgetOptimization: {
            costSavings: "Reduced waste disposal fees",
            sustainableInvestments: "Long-term cost savings",
            totalBudgetImpact: "0-5% increase"
          }
        };
      } else {
        throw error;
      }
    }

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
