# AI Calculator Setup Guide

## Getting Your Gemini API Key

The AI Carbon Calculator uses Google's Gemini AI to provide intelligent carbon credit calculations. Follow these steps to set up your API key:

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Choose "Create API key in new project" (recommended) or select an existing project
5. Copy the generated API key

### Step 2: Add API Key to Environment
1. Open your `.env.local` file in the project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyA...your_actual_key_here
   ```
3. Save the file

### Step 3: Test the Calculator
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3001/ai-calculator`
3. Try one of the example queries or enter your own business description
4. Click "Calculate Carbon Credits" to see AI-powered results

## Features of the AI Calculator

- **Natural Language Processing**: Describe your business in plain English
- **Industry-Specific Calculations**: Automatic detection of industry type and emission factors
- **Scope 1, 2, 3 Breakdown**: Detailed emissions analysis across all scopes
- **Credit Recommendations**: AI-suggested carbon credit types and quantities
- **Regional Adjustments**: Location-based emission factor adjustments
- **Cost Estimates**: Price ranges for recommended carbon credits

## Troubleshooting

### "AI service not configured" Error
- This means your GEMINI_API_KEY is not set in .env.local
- Make sure you've added the key without quotes: `GEMINI_API_KEY=your_key`
- Restart the development server after adding the key

### API Rate Limits
- Gemini AI has usage limits for free tier
- If you hit limits, wait a few minutes or upgrade your Google Cloud account

### Calculation Accuracy
- Results are estimates based on industry averages
- For precise calculations, consult a certified carbon accounting professional
- The AI provides directional guidance, not audit-grade calculations

## Example Queries That Work Well

1. "Manufacturing company with $2M annual revenue, 200 employees, producing steel components in the US"
2. "Tech startup with 50 employees, cloud-based software, mostly remote work"
3. "Transportation company with 100 delivery trucks, operating in California"
4. "Retail fashion brand with $10M revenue, 5 physical stores, online sales"
5. "Agricultural farm with 500 hectares, livestock and crop production"

The more details you provide, the more accurate the AI calculation will be!
