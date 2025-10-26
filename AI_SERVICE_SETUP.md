# AI Services Setup & Troubleshooting

## Current Status ✅

Your CarbonX application has been updated with **intelligent fallback handling** for all AI services. Even when the Gemini API rate limit is exceeded, the app will continue to work with sample calculations.

## What Was Fixed

All AI-powered features now include:
- ✅ **AI Carbon Calculator** - Fallback with sample emissions data
- ✅ **Plastic Calculator** - Fallback with sample plastic footprint
- ✅ **Event Planner** - Fallback with sustainable event recommendations
- ✅ **CarbonX Chat** - Already had fallback responses

## Rate Limit Error Explained

The error you saw:
```
[429 Too Many Requests] Quota exceeded for quota metric 'Generate Content API requests per minute'
```

This means you've used up your **free tier quota** for Google's Gemini API. The free tier has limits like:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per month

## Solutions

### Option 1: Wait (Immediate - Free)
Simply wait a few minutes for the rate limit to reset. The API quota resets:
- **Per-minute limit**: Resets every 60 seconds
- **Per-day limit**: Resets at midnight UTC

### Option 2: Use Sample Mode (Already Implemented)
Your app now automatically provides sample calculations when the AI is rate-limited. Users will see a message:
> "AI service temporarily rate limited. Showing sample calculation. Please try again in a few minutes for AI-powered analysis."

### Option 3: Get a New API Key (Recommended)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with a different Google account (if you've exhausted the current one)
3. Click "Create API Key"
4. Copy the new key
5. Update your `.env.local` file:
   ```bash
   GEMINI_API_KEY=your-new-api-key-here
   ```
6. Restart your dev server

### Option 4: Upgrade to Paid Plan (For Production)
If you need higher limits for production:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable billing for your project
3. The paid tier includes:
   - 1,000 requests per minute
   - 10M tokens per month
   - Higher rate limits

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in your project root:

```bash
# Gemini AI (Required for AI features)
GEMINI_API_KEY=your-gemini-api-key-here

# Thirdweb (Required for wallet connection)
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your-thirdweb-client-id
NEXT_PUBLIC_CLIENT_ID=your-thirdweb-client-id
THIRDWEB_SECRET_KEY=your-thirdweb-secret-key

# MetaMask/Infura (Optional - for enhanced Web3 features)
NEXT_PUBLIC_INFURA_API_KEY=your-infura-key
INFURA_API_KEY=your-infura-key

# Smart Contracts (Optional - if deployed)
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
```

### Getting API Keys

#### 1. Gemini API Key (Free)
- Visit: https://makersuite.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy and save the key

#### 2. Thirdweb Client ID (Free)
- Visit: https://thirdweb.com/dashboard
- Create an account
- Create a new project
- Copy the Client ID from your project dashboard

#### 3. Infura API Key (Optional - Free tier available)
- Visit: https://infura.io/
- Create an account
- Create a new project
- Copy the Project ID (API Key)

## Testing AI Services

### Test the Fixed Services
1. Start your dev server: `npm run dev`
2. Navigate to:
   - AI Carbon Calculator: http://localhost:3000/ai-calculator
   - Plastic Calculator: http://localhost:3000/plastic-calculator
   - Event Planner: http://localhost:3000/event-planner
3. Try making a query
4. If rate-limited, you'll see sample data with a notice

### Check Rate Limit Status
The API will return a special `rateLimited: true` flag when using fallback data:
```json
{
  "success": true,
  "rateLimited": true,
  "data": { ... },
  "message": "AI service temporarily rate limited..."
}
```

## Monitoring Usage

### Check Your Quota
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Navigate to your API key
3. View usage statistics

### Best Practices
- **Cache responses** when possible
- **Implement request throttling** on the client side
- **Monitor usage** regularly
- **Upgrade to paid tier** for production apps

## Troubleshooting

### "AI service not configured" Error
- **Cause**: Missing or invalid `GEMINI_API_KEY`
- **Fix**: Add a valid API key to `.env.local` and restart the server

### "Failed to parse AI calculation" Error
- **Cause**: AI response format issue
- **Fix**: The app now provides fallback data automatically

### Rate Limit Errors
- **Cause**: Too many requests in a short time
- **Fix**: Wait 60 seconds or use the sample data provided

### Connection Wallet Issues
- **Cause**: Missing Thirdweb configuration
- **Fix**: Add `NEXT_PUBLIC_TEMPLATE_CLIENT_ID` to `.env.local`

## Production Checklist

Before deploying to production:
- [ ] Get a paid Gemini API plan (if expecting high traffic)
- [ ] Set up proper error monitoring (Sentry, LogRocket, etc.)
- [ ] Implement request caching
- [ ] Add rate limiting on your API routes
- [ ] Set up environment variables in your hosting platform
- [ ] Test all AI features with production API keys
- [ ] Configure proper CORS and security headers

## Support

If you continue to have issues:
1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure your API keys haven't expired
4. Check Google AI Studio for quota status
5. Review the Next.js server logs for detailed errors

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Carbon Calculator Methodology](https://ghgprotocol.org/)

---

**Last Updated**: October 25, 2025
**Status**: All AI services operational with fallback support ✅
