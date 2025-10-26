import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize per-request to avoid build-time failures when env is missing
let genAI: any = null;

export async function POST(request: NextRequest) {
  try {
    // Lazy-init Gemini client for this request
    if (genAI === null) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) genAI = new GoogleGenerativeAI(apiKey);
    }

    // Debugging: presence of key and client init (boolean only)
    try {
      console.log('plastic-calculator: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
      console.log('plastic-calculator: genAI initialized?', !!genAI);
    } catch {}

    const { query, generateReport } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!genAI) {
      // Return a helpful fallback when the AI key isn't available
      return NextResponse.json({
        success: true,
        rateLimited: true,
        data: {
          materialType: 'Mixed Plastics',
          weightKg: 1000,
          recycledPercent: 20,
          projectedSavingsKgCO2e: 800,
          notes: 'Fallback sample: GEMINI_API_KEY not configured in environment. Set key to enable AI calculations.'
        },
        message: 'AI service not configured. Showing sample calculation.'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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
    } catch (parseError: any) {
      console.error('Plastic AI response parsing/error:', parseError?.status || parseError?.message || parseError);

      // Check if it's a rate limit error or model not found error
      if (parseError?.status === 429 || parseError?.status === 404 || parseError?.message?.includes('RATE_LIMIT_EXCEEDED') || parseError?.message?.includes('not found')) {
        // Return a helpful fallback response for rate limiting or model errors
        return NextResponse.json({
          success: true,
          rateLimited: true,
          data: {
            plasticFootprint: {
              totalAnnualPlastic: 500,
              singleUsePlastic: 300,
              recyclablePlastic: 150,
              nonRecyclablePlastic: 50,
              microplasticImpact: 25
            },
            breakdown: [
              { category: 'Packaging', amount: 200, percentage: 40 },
              { category: 'Single-use items', amount: 150, percentage: 30 },
              { category: 'Products', amount: 100, percentage: 20 },
              { category: 'Other', amount: 50, percentage: 10 }
            ],
            sustainableAlternatives: [
              {
                currentItem: 'Plastic water bottles',
                alternative: 'Reusable water bottles',
                reductionPercent: 95,
                costComparison: 'cheaper',
                availability: 'widely_available'
              }
            ],
            confidence: 0.6,
            explanation: 'This is a sample calculation provided because the AI service has reached its rate limit. For a precise AI-powered analysis, please try again in a few minutes.',
            recommendations: [
              'Switch to reusable alternatives where possible',
              'Implement a plastic reduction policy',
              'Partner with sustainable suppliers'
            ],
            query,
            timestamp: new Date().toISOString()
          },
          message: 'AI service temporarily unavailable (model access issue or rate limit). Showing sample calculation.'
        });
      }

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
        console.error('Report generation error:', reportError?.message || reportError);
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
    console.error('Plastic Calculator error:', error?.status || error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize per-request to avoid build-time failures when env is missing
let genAI: any = null;

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

    // Use AI to analyze plastic footprint
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
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
    // Initialize Gemini client for this request if possible
    if (genAI === null) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) genAI = new GoogleGenerativeAI(apiKey);
    }

    if (!genAI) {
      // Return a helpful fallback when the AI key isn't available
      return NextResponse.json({
        success: true,
        rateLimited: true,
        data: {
          materialType: 'Mixed Plastics',
          weightKg: 1000,
          recycledPercent: 20,
          projectedSavingsKgCO2e: 800,
          notes: 'Fallback sample: GEMINI_API_KEY not configured in environment. Set key to enable AI calculations.'
        },
        message: 'AI service not configured. Showing sample calculation.'
      });
    }
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
    } catch (parseError: any) {
      console.error('AI response parsing error:', parseError);
      
      // Check if it's a rate limit error or model not found error
      if (parseError?.status === 429 || parseError?.status === 404 || parseError?.message?.includes('RATE_LIMIT_EXCEEDED') || parseError?.message?.includes('not found')) {
        // Return a helpful fallback response for rate limiting or model errors
        return NextResponse.json({
          success: true,
          rateLimited: true,
          data: {
            plasticFootprint: {
              totalAnnualPlastic: 500,
              singleUsePlastic: 300,
              recyclablePlastic: 150,
              nonRecyclablePlastic: 50,
              microplasticImpact: 25
            },
            breakdown: [
              { category: "Packaging", amount: 200, percentage: 40 },
              { category: "Single-use items", amount: 150, percentage: 30 },
              { category: "Products", amount: 100, percentage: 20 },
              { category: "Other", amount: 50, percentage: 10 }
            ],
            sustainableAlternatives: [
              {
                currentItem: "Plastic water bottles",
                alternative: "Reusable water bottles",
                reductionPercent: 95,
                costComparison: "cheaper",
                availability: "widely_available"
              }
            ],
            confidence: 0.6,
            explanation: "This is a sample calculation provided because the AI service has reached its rate limit. For a precise AI-powered analysis, please try again in a few minutes.",
            recommendations: [
              "Switch to reusable alternatives where possible",
              "Implement a plastic reduction policy",
              "Partner with sustainable suppliers"
            ],
            query,
            timestamp: new Date().toISOString()
          },
          message: "AI service temporarily unavailable (model access issue or rate limit). Showing sample calculation."
        });
      }
      
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
