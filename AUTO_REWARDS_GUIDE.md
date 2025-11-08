# Automatic Rewards Detection Guide

## Overview

The CarbonX gamification system now **automatically detects and allocates rewards** when users interact with sustainability tools and features. No manual tracking required!

## How It Works

### Automatic Detection

When users use any of the following features, rewards are automatically tracked:

1. **Water Calculator** (`/api/water-calculator`)
   - Automatically tracks `water_saving` actions
   - Calculates points based on water saved vs regional average
   - Awards points even if just using the tool

2. **Plastic Calculator** (`/api/plastic-calculator`)
   - Automatically tracks `plastic_reduction` actions
   - Points based on plastic footprint calculated

3. **AI Carbon Calculator** (`/api/ai-calculator`)
   - Automatically tracks `ai_eco_tool` actions
   - Awards points for using AI-powered sustainability tools

4. **Event Planner** (coming soon)
   - Will automatically track `event_participation` actions

### How to Enable Auto-Tracking

To enable automatic rewards, simply include a `user_id` in the request body when calling any calculator:

```typescript
// Example: Water Calculator
const response = await fetch('/api/water-calculator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dietType: 'vegetarian',
    householdSize: 2,
    location: 'United States',
    user_id: 'user-12345' // ← Add this to enable auto-rewards
  })
});
```

### What Happens Automatically

1. **Action Detection**: The system detects which calculator/tool was used
2. **Value Calculation**: Calculates the impact value (water saved, plastic reduced, etc.)
3. **Points Awarded**: Automatically awards EcoPoints based on the action type
4. **Badge Unlocks**: Checks and unlocks badges if conditions are met
5. **Leaderboard Update**: Updates global and regional leaderboards
6. **NFT Minting**: If wallet address is provided, mints NFTs for significant achievements

### Points Awarded

| Calculator/Tool | Action Type | Points Formula |
|----------------|-------------|----------------|
| Water Calculator | `water_saving` | 0.1 points per liter saved |
| Plastic Calculator | `plastic_reduction` | 5 points per kg reduced |
| AI Carbon Calculator | `ai_eco_tool` | 50 points per use |
| Event Planner | `event_participation` | 200 points per event |

### Silent Failure

The auto-tracking system is designed to **never break** the main feature:
- If `user_id` is missing, the calculator still works normally
- If rewards tracking fails, it logs an error but doesn't affect the calculator
- All rewards tracking happens asynchronously (non-blocking)

### Frontend Integration

To enable auto-rewards in your frontend components:

```typescript
import { trackCalculatorUsage } from '@/lib/autoRewards';

// In your calculator component
const handleCalculate = async () => {
  const userId = getCurrentUserId(); // Get from auth context
  
  const response = await fetch('/api/water-calculator', {
    method: 'POST',
    body: JSON.stringify({
      ...inputs,
      user_id: userId // Include user ID
    })
  });
  
  // Rewards are automatically tracked in the background!
  // No need to call trackAction manually
};
```

### Manual Tracking (Still Available)

You can still manually track actions using the `/api/rewards` endpoint or `trackAction()` function for:
- Custom actions not covered by calculators
- Direct carbon offsets
- Energy savings
- Other sustainability actions

### Example Flow

1. User visits Water Calculator page
2. User enters their water usage data
3. User clicks "Calculate" (with `user_id` in request)
4. Calculator processes and returns results
5. **Automatically in background:**
   - System detects water calculator usage
   - Calculates water saved vs average
   - Awards EcoPoints
   - Checks for badge unlocks
   - Updates leaderboard
   - Mints NFT if wallet connected

### Benefits

✅ **Zero Friction**: Users don't need to manually claim rewards  
✅ **Automatic**: Rewards happen seamlessly in the background  
✅ **Non-Breaking**: If rewards fail, calculators still work  
✅ **Comprehensive**: Tracks all sustainability actions automatically  
✅ **Gamified**: Users earn points just by using the tools!

## Next Steps

To add auto-tracking to more features:

1. Import `trackCalculatorUsage` from `@/lib/autoRewards`
2. Add `user_id` check in your API route
3. Call `trackCalculatorUsage()` after successful calculation
4. Done! Rewards are now automatic

Example:
```typescript
// In your API route
const userId = (body as any).user_id;
if (userId) {
  trackCalculatorUsage(userId, "your_calculator_type", value, location)
    .catch(console.error); // Silent failure
}
```

