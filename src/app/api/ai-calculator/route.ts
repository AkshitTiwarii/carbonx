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

    // Use AI to analyze and calculate everything
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const calculationPrompt = `
You are an expert carbon accountant and sustainability consultant. Analyze this business/project description and provide a comprehensive carbon footprint calculation.

Business Description: "${query}"

Please provide a detailed analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "industry": "detected_industry_type",
  "subIndustry": "specific_sub_sector_if_applicable",
  "region": "detected_or_assumed_region",
  "analysisNotes": "brief explanation of how you determined the industry and scale",
  "totalEmissions": calculated_annual_emissions_in_tCO2e,
  "scope1": scope_1_emissions_in_tCO2e,
  "scope2": scope_2_emissions_in_tCO2e,
  "scope3": scope_3_emissions_in_tCO2e,
  "creditsNeeded": recommended_carbon_credits_needed,
  "confidence": decimal_between_0_and_1,
  "calculationMethod": "explanation of calculation methodology used",
  "emissionFactors": {
    "source": "data sources used",
    "methodology": "specific approach taken"
  },
  "recommendedCredits": [
    {
      "type": "credit_standard_name",
      "name": "full_credit_name", 
      "quantity": number_of_credits,
      "priceRange": [min_price, max_price],
      "totalCost": estimated_total_cost,
      "quality": "premium|high|medium",
      "reasoning": "why this credit type is recommended"
    }
  ],
  "reductionStrategies": [
    {
      "strategy": "specific_reduction_approach",
      "potentialReduction": "percentage_or_tonnage",
      "timeframe": "implementation_timeframe",
      "cost": "estimated_cost_range"
    }
  ],
  "explanation": "comprehensive_analysis_and_recommendations_max_500_words"
}

IMPORTANT CALCULATION GUIDELINES:
- For energy production: Use real emission factors (coal: 2.4 tCO2e/MWh, gas: 1.2 tCO2e/MWh, oil: 2.0 tCO2e/MWh)
- For manufacturing: Consider production volume, energy use, materials
- For services: Focus on building energy, transport, digital infrastructure
- For agriculture: Include livestock methane, soil emissions, machinery
- Always convert time units properly (per minute → annual)
- Scope 1: Direct emissions from owned sources
- Scope 2: Purchased electricity/heating/cooling
- Scope 3: All other indirect emissions in value chain
- Credits needed should include 10-20% buffer for net-zero
- Price realistic carbon credit costs ($8-50 per credit depending on quality)

Provide realistic, industry-standard calculations based on current emission factors and best practices.
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
    if (!calculation.totalEmissions || !calculation.creditsNeeded) {
      return NextResponse.json(
        { success: false, error: 'AI calculation incomplete. Please provide more details about your business.' },
        { status: 400 }
      );
    }

    // Generate downloadable report if requested
    let reportContent = null;
    if (generateReport) {
      const reportPrompt = `
Generate a comprehensive carbon footprint assessment report based on this calculation data:

${JSON.stringify(calculation, null, 2)}

Original Query: "${query}"

Create a professional PDF-style report in HTML format with:
1. Executive Summary
2. Methodology & Data Sources
3. Detailed Emissions Analysis
4. Carbon Credit Recommendations
5. Reduction Strategies & Timeline
6. Appendices with technical details

Format as complete HTML document with inline CSS for professional styling suitable for PDF generation.
Include charts/tables using HTML/CSS, professional formatting, and executive-level presentation.
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
    console.error('AI Calculator error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
