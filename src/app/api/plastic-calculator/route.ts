import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    const { query, generateReport } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Use AI to analyze and calculate plastic footprint
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const calculationPrompt = `
You are an expert in plastic waste management and environmental impact assessment. Analyze this business/project/event description and provide a comprehensive plastic footprint calculation.

Description: "${query}"

Please provide a detailed analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "analysisType": "business|event|product|lifestyle",
  "industry": "detected_industry_type",
  "scale": "detected_scale_information",
  "region": "detected_or_assumed_region",
  "analysisNotes": "brief explanation of assumptions made",
  "plasticFootprint": {
    "totalAnnualPlastic": weight_in_kg_per_year,
    "breakdown": {
      "packaging": weight_in_kg,
      "singleUse": weight_in_kg,
      "equipment": weight_in_kg,
      "promotional": weight_in_kg,
      "other": weight_in_kg
    },
    "plasticTypes": [
      {
        "type": "plastic_type_name",
        "percentage": percentage_of_total,
        "recyclable": true_or_false,
        "biodegradable": true_or_false,
        "weight": weight_in_kg
      }
    ]
  },
  "environmentalImpact": {
    "carbonEquivalent": co2_emissions_from_plastic_production_kg,
    "oceanPollutionRisk": "high|medium|low",
    "landfillContribution": weight_in_kg,
    "recyclingPotential": percentage_recyclable,
    "biodegradationTime": "estimated_years_to_decompose"
  },
  "reductionOpportunities": [
    {
      "category": "reduction_category",
      "action": "specific_action",
      "potentialReduction": percentage_or_weight,
      "difficulty": "easy|medium|hard",
      "costImpact": "saves|neutral|costs",
      "timeframe": "immediate|short_term|long_term"
    }
  ],
  "alternatives": [
    {
      "currentItem": "plastic_item",
      "alternative": "sustainable_alternative",
      "reductionPercent": percentage_reduction,
      "costComparison": "cheaper|same|more_expensive",
      "availability": "widely_available|limited|emerging"
    }
  ],
  "confidence": decimal_between_0_and_1,
  "explanation": "comprehensive_analysis_and_recommendations_max_500_words",
  "recommendations": [
    "specific_actionable_recommendation_1",
    "specific_actionable_recommendation_2",
    "specific_actionable_recommendation_3"
  ]
}

IMPORTANT CALCULATION GUIDELINES:
- Consider all plastic touchpoints: packaging, products, operations, supply chain
- Include both direct and indirect plastic usage
- Account for regional waste management capabilities
- Consider plastic lifecycle: production → use → disposal
- Factor in contamination and recycling inefficiencies
- For events: consider attendee count, duration, catering, swag, setup
- For businesses: consider operations, products, packaging, offices
- Use realistic data based on industry standards and studies
- Include micro-plastics and secondary plastic impacts
- Consider seasonal variations and growth projections

Provide realistic calculations based on current plastic usage patterns and waste management data.
`;

    let calculation;
    try {
      const result = await model.generateContent(calculationPrompt);
      const responseText = result.response.text();
      
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      calculation = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI calculation. Please try rephrasing your query.' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!calculation.plasticFootprint?.totalAnnualPlastic) {
      return NextResponse.json(
        { success: false, error: 'AI calculation incomplete. Please provide more details.' },
        { status: 400 }
      );
    }

    // Generate downloadable report if requested
    let reportContent = null;
    if (generateReport) {
      const reportPrompt = `
Generate a comprehensive plastic footprint assessment report based on this calculation data:

${JSON.stringify(calculation, null, 2)}

Original Query: "${query}"

Create a professional PDF-style report in HTML format with:
1. Executive Summary
2. Plastic Footprint Analysis
3. Environmental Impact Assessment
4. Reduction Strategies & Alternatives
5. Implementation Timeline
6. Cost-Benefit Analysis
7. Monitoring & Tracking Plan

Format as complete HTML document with inline CSS for professional styling suitable for PDF generation.
Include charts/tables using HTML/CSS, professional formatting, and actionable insights.
Focus on practical steps and measurable outcomes.
`;

      try {
        const reportResult = await model.generateContent(reportPrompt);
        reportContent = reportResult.response.text();
      } catch (reportError) {
        console.error('Report generation error:', reportError);
        // Continue without report if generation fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...calculation,
        query,
        timestamp: new Date().toISOString(),
        reportContent
      }
    });
    
  } catch (error) {
    console.error('Plastic Calculator error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
