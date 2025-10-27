import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Don't initialize the client at module load time; initialize per-request to avoid build-time failures
let genAI: any = null;

export async function POST(request: NextRequest) {
  try {
    // Read API key from environment and initialize Gemini client for this request if possible
    const apiKey = process.env.GEMINI_API_KEY;
    if (genAI === null) {
      if (apiKey) genAI = new GoogleGenerativeAI(apiKey);
    }

    // Debugging: log boolean presence of key and whether client was initialized
    try {
      console.log('ai-calculator: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
      console.log('ai-calculator: genAI initialized?', !!genAI);
    } catch (e) {
      // swallow logging errors
    }

    const { query, generateReport } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Use AI to analyze and calculate everything (if genAI available)
    if (!genAI) {
      // No API key available — return a helpful fallback sample calculation
      return NextResponse.json({
        success: true,
        rateLimited: true,
        data: {
          industry: "General Business",
          subIndustry: "Service Sector",
          region: "Global",
          analysisNotes: "Fallback demo calculation — GEMINI_API_KEY not configured in environment.",
          totalEmissions: 150,
          scope1: 30,
          scope2: 50,
          scope3: 70,
          creditsNeeded: 165,
          confidence: 0.6,
          calculationMethod: "Fallback sample calculation",
        },
        message: "AI service not configured. Showing sample calculation. Set GEMINI_API_KEY to enable AI-powered analysis."
      });
    }

    // candidate models to try (some accounts may not have access to all models)
    const candidateModels = [
      'gemini-1.5-flash-latest',
      'gemini-1.0',
      'text-bison-001'
    ];
  let chosenModelName: string | null = null;
  let result: any = null;
  // Keep a reference to the chosen model instance so we can reuse it for report generation
  let selectedModelInstance: any = null;

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
      // Helper: fallback to calling the v1 REST generateContent endpoint directly
      // Some keys/accounts expose models only on the v1 endpoint. If the SDK
      // (which may call v1beta) returns 404, we'll try the v1 REST path.
      async function tryV1Generate(apiKey: string | undefined, modelName: string, prompt: string) {
        if (!apiKey) return null;
        try {
          const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instances: [{ content: prompt }] })
          });
          const txt = await resp.text();
          return { response: { status: resp.status, text: () => Promise.resolve(txt) }, status: resp.status };
        } catch (e) {
          console.warn('ai-calculator: v1 generateContent fetch failed:', (e as any)?.message || e);
          return null;
        }
      }

      // Try candidate models in order until one produces a non-error response
      for (const candidate of candidateModels) {
        try {
          selectedModelInstance = genAI.getGenerativeModel({ model: candidate });
          console.log('ai-calculator: attempting model', candidate);
          result = await selectedModelInstance.generateContent(calculationPrompt);
          const upstreamStatus = result?.response?.status ?? result?.status;
          if (typeof upstreamStatus === 'number' && upstreamStatus >= 400) {
            console.warn('ai-calculator: model', candidate, 'returned status', upstreamStatus);
            if (upstreamStatus === 404) {
              // Try the v1 REST generateContent endpoint as a fallback for this model
              const v1res = await tryV1Generate(apiKey, candidate, calculationPrompt);
              if (v1res && (v1res?.response?.status ?? v1res?.status) < 400) {
                result = v1res;
                chosenModelName = candidate;
                console.log('ai-calculator: v1 generateContent succeeded for', candidate);
                break;
              }
              continue; // try next model
            }
            // for other statuses, also try next model
            continue;
          }
          chosenModelName = candidate;
          console.log('ai-calculator: model selected', chosenModelName);
          break;
        } catch (mErr) {
          console.warn('ai-calculator: model', candidate, 'failed to init or call:', (mErr as any)?.message || mErr);
          result = null;
          continue;
        }
      }

      if (!result) {
        // As a last resort, call the provider's ListModels endpoint to discover
        // what models are available to this API key and try them dynamically.
        try {
          const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey || '')}`;
          const listResp = await fetch(listUrl);
          if (listResp.ok) {
            const listJson = await listResp.json();
            const remoteModels: string[] = (listJson?.models || [])
              .map((m: any) => String(m?.name || ''))
              .filter(Boolean)
              .map((n: string) => n.replace(/^models\//, ''));
            console.log('ai-calculator: discovered models from ListModels:', remoteModels.join(', '));

            for (const remote of remoteModels) {
              if (candidateModels.includes(remote)) continue; // already tried
              try {
                console.log('ai-calculator: attempting discovered model', remote);
                selectedModelInstance = genAI.getGenerativeModel({ model: remote });
                const r = await selectedModelInstance.generateContent(calculationPrompt);
                const upstreamStatus = r?.response?.status ?? r?.status;
                if (typeof upstreamStatus === 'number' && upstreamStatus >= 400) {
                  console.warn('ai-calculator: discovered model', remote, 'returned status', upstreamStatus);
                  if (upstreamStatus === 404) {
                    // Try v1 REST generateContent for discovered model
                    const v1res = await tryV1Generate(apiKey, remote, calculationPrompt);
                    if (v1res && (v1res?.response?.status ?? v1res?.status) < 400) {
                      result = v1res;
                      chosenModelName = remote;
                      console.log('ai-calculator: v1 generateContent succeeded for discovered model', remote);
                      break;
                    }
                  }
                  continue;
                }
                result = r;
                chosenModelName = remote;
                console.log('ai-calculator: discovered model selected', chosenModelName);
                break;
              } catch (dmErr) {
                console.warn('ai-calculator: discovered model', remote, 'failed:', (dmErr as any)?.message || dmErr);
                continue;
              }
            }
          } else {
            console.warn('ai-calculator: ListModels request failed with status', listResp.status);
          }
        } catch (listErr) {
          console.warn('ai-calculator: ListModels error:', (listErr as any)?.message || listErr);
        }

        if (!result) {
          throw new Error('No candidate model produced a usable response');
        }
      }

      // Normalize getting the response text from different result shapes
      const responseText = typeof result?.response?.text === 'function'
        ? await result.response.text()
        : String(result);

      // If the upstream service returned an HTTP error status, surface it (no secrets)
      const upstreamStatus = result?.response?.status ?? result?.status;
      if (typeof upstreamStatus === 'number' && upstreamStatus >= 400) {
        // Log a short snippet of the upstream body for diagnostics (no secrets)
        console.error('Upstream AI error:', upstreamStatus, responseText?.slice?.(0, 200));
        return NextResponse.json({
          success: false,
          upstreamError: true,
          upstreamStatus,
          message: 'Upstream AI service returned an error. See server logs for non-secret details.'
        }, { status: 502 });
      }

      // Clean the response to ensure it's valid JSON
      let cleanedResponse = (responseText || '').trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      try {
        calculation = JSON.parse(cleanedResponse);
      } catch (jsonErr) {
        // Include a snippet of the response in server logs to help diagnose malformed output
        console.error('AI response parsing error: invalid JSON. Snippet:', (cleanedResponse || '').slice(0, 1000));
        throw jsonErr;
      }
    } catch (parseError: any) {
      // If parseError is a structured upstream error, include its status/message in logs
      console.error('AI response parsing error:', (parseError && (parseError.status || parseError.message)) || parseError);

      // Check for rate limit/model-not-found style errors and return a helpful fallback
      const msg = String(parseError?.message || parseError || 'Unknown error');
      if (parseError?.status === 429 || parseError?.status === 404 || msg.includes('RATE_LIMIT_EXCEEDED') || msg.includes('not found')) {
        return NextResponse.json({
          success: true,
          rateLimited: true,
          data: {
            industry: "General Business",
            subIndustry: "Service Sector",
            region: "Global",
            analysisNotes: "Demo calculation - AI service temporarily unavailable due to rate limits. This is a sample calculation based on typical business operations.",
            totalEmissions: 150,
            scope1: 30,
            scope2: 50,
            scope3: 70,
            creditsNeeded: 165,
            confidence: 0.6,
            calculationMethod: "Sample calculation based on industry averages. For accurate calculations, please try again later when AI service is available.",
            emissionFactors: {
              source: "Industry standard emission factors",
              methodology: "Placeholder calculation - AI quota exceeded"
            },
            recommendedCredits: [
              {
                type: "VCS",
                name: "Verified Carbon Standard Credits",
                quantity: 165,
                priceRange: [15, 25],
                totalCost: 3300,
                quality: "high",
                reasoning: "Widely recognized standard suitable for general carbon offsetting"
              }
            ],
            reductionStrategies: [
              {
                strategy: "Energy Efficiency Improvements",
                potentialReduction: "20-30%",
                timeframe: "6-12 months",
                cost: "$5,000-$15,000"
              },
              {
                strategy: "Renewable Energy Transition",
                potentialReduction: "40-60%",
                timeframe: "12-24 months",
                cost: "$20,000-$50,000"
              }
            ],
            explanation: "This is a sample calculation provided because the AI service has reached its rate limit. Your actual emissions may vary. For a precise AI-powered analysis, please try again in a few minutes. In the meantime, this estimate is based on typical small to medium business operations with moderate energy consumption.",
            query,
            timestamp: new Date().toISOString()
          },
          message: "AI service temporarily unavailable (model access issue or rate limit). Showing sample calculation. Please check your API key configuration or try again later."
        });
      }

      // For all other parse/errors, return a 502 with a non-secret message
      return NextResponse.json({ success: false, error: 'Upstream AI parsing or service error. Check server logs.' }, { status: 502 });
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
        // Ensure we have a model instance to generate the report. If not, create one from chosenModelName.
        if (!selectedModelInstance && chosenModelName) {
          selectedModelInstance = genAI.getGenerativeModel({ model: chosenModelName });
        }
        if (selectedModelInstance) {
          const reportResult = await selectedModelInstance.generateContent(reportPrompt);
          reportContent = typeof reportResult?.response?.text === 'function' ? await reportResult.response.text() : String(reportResult);
        }
      } catch (reportError) {
        console.error('Report generation error:', (reportError as any)?.message || reportError);
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
