# Gamified Sustainability Rewards System

## Overview

The CarbonX Gamified Sustainability Rewards System incentivizes users to take eco-friendly actions by awarding EcoPoints, unlocking badges, and competing on leaderboards.

## Features

### 🎯 EcoPoints System
Users earn points for various sustainability actions:
- **Carbon Offsetting**: 50 points per ton of CO₂ offset
- **Calculator Use**: 10 points per calculator use
- **Water Calculation**: 15 points per calculation
- **Plastic Calculation**: 15 points per calculation
- **AI Tool Use**: 20 points per use
- **Investment**: 30 points per investment
- **Energy Savings**: 25 points per MWh saved

### 🏆 Badge System
Users can unlock badges by reaching milestones:
- **Carbon Saver** 🌱: Offset 1 ton of CO₂ (100 points)
- **Green Champion** 🏆: Offset 10 tons of CO₂ (1000 points)
- **Eco Investor** 💚: Invest in 5+ projects (500 points)
- **Calculator Master** 🧮: Use calculators 10+ times (200 points)
- **Water Warrior** 💧: Calculate water footprint (150 points)
- **Plastic Fighter** ♻️: Track plastic usage (150 points)
- **AI Explorer** 🤖: Use AI tools 20+ times (300 points)
- **Sustainability Hero** 🦸: Reach 5000 EcoPoints

### 📊 Leaderboard
- Global and regional leaderboards
- Real-time ranking updates
- Shows points, rank, and badge count

### 🔗 Blockchain Integration
- Badges can be minted as NFTs using ThirdWeb
- MetaMask wallet integration
- On-chain badge ownership verification

## API Endpoints

### Backend (FastAPI)

#### `POST /api/rewards/update`
Update user rewards when they perform an eco-action.

**Request:**
```json
{
  "user_id": "user_123",
  "action_type": "carbon_offset",
  "amount": 1.5,
  "metadata": {
    "project_id": "proj_456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "points_earned": 75,
  "total_points": 175,
  "rank": 2,
  "new_badges": [
    {
      "id": "carbon_saver",
      "name": "Carbon Saver",
      "description": "Offset your first 1 ton of CO2",
      "icon": "🌱"
    }
  ]
}
```

#### `GET /api/rewards/leaderboard?limit=100&region=global`
Get leaderboard data.

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "user_id": "user_123",
      "ecoPoints": 5000,
      "rank": 50,
      "position": 1,
      "badges": ["carbon_saver", "green_champion"],
      "badge_count": 2
    }
  ],
  "total_users": 150
}
```

#### `GET /api/rewards/user/{user_id}`
Get user's rewards data.

**Response:**
```json
{
  "success": true,
  "user_id": "user_123",
  "ecoPoints": 175,
  "rank": 2,
  "position": 45,
  "badges": [...],
  "stats": {
    "total_actions": 5,
    "carbon_offset_tons": 1.5,
    "badge_count": 1
  }
}
```

### Frontend (Next.js API Routes)

- `POST /api/rewards/update` - Proxy to backend
- `GET /api/rewards/leaderboard` - Proxy to backend
- `GET /api/rewards/user` - Proxy to backend
- `GET /api/rewards/badges` - Get badge definitions

## Usage

### Integrating Rewards in Your Components

```typescript
import { useRewards } from "@/hooks/useRewards";

function MyComponent() {
  const { awardPoints, loading } = useRewards();

  const handleAction = async () => {
    // Perform your action...
    
    // Award points
    const result = await awardPoints({
      type: 'carbon_offset',
      amount: 1.5,
      metadata: {
        project_id: 'proj_123',
      },
    });

    if (result.success) {
      console.log(`Earned ${result.points_earned} points!`);
      if (result.new_badges?.length > 0) {
        console.log('Unlocked badges:', result.new_badges);
      }
    }
  };

  return (
    <button onClick={handleAction} disabled={loading}>
      Perform Action
    </button>
  );
}
```

### Accessing Rewards Dashboard

Navigate to `/rewards` to view:
- Your EcoPoints summary
- Badge collection
- Leaderboard position
- Impact statistics

## User ID Management

The system uses a simple localStorage-based user ID for demo purposes. In production, integrate with your authentication system:

```typescript
// In src/lib/rewards.ts, update getUserId():
export function getUserId(): string | null {
  // Replace with your auth system
  const user = getCurrentUser();
  return user?.id || null;
}
```

## Badge NFT Minting

Badges are automatically minted as NFTs when unlocked (if wallet is connected). The NFT minting uses ThirdWeb SDK:

```typescript
import { mintBadgeNFT, generateBadgeMetadata } from "@/lib/badgeNFT";

// Badge metadata is automatically generated
const metadata = generateBadgeMetadata(badge);
await mintBadgeNFT(walletAddress, badgeId, metadata);
```

**Note**: Deploy an ERC-721 or ERC-1155 contract for badge NFTs. Update `BADGE_NFT_CONTRACT_ADDRESS` in `src/lib/badgeNFT.ts`.

## Data Storage

Currently uses JSON file storage (`rewards_db.json`). For production, migrate to a database:

1. Update `backend/routers/rewards.py` to use your database
2. Implement proper user authentication
3. Add database migrations for user schema

## Environment Variables

```env
# Backend URL (for frontend API routes)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Badge NFT Contract (optional)
NEXT_PUBLIC_BADGE_NFT_CONTRACT=0x...
```

## Future Enhancements

- [ ] Regional leaderboards with geolocation
- [ ] Team/group competitions
- [ ] Seasonal challenges
- [ ] Badge trading marketplace
- [ ] Achievement streaks
- [ ] Referral rewards
- [ ] Integration with DeFi protocols for staking rewards

## Testing

To test the rewards system:

1. Start the backend: `cd backend && uvicorn main:app --reload`
2. Start the frontend: `npm run dev`
3. Navigate to `/rewards`
4. Use calculators or perform actions to earn points
5. Check leaderboard and badge collection

## Troubleshooting

### Points not updating
- Check backend is running on port 8000
- Verify user_id is set in localStorage
- Check browser console for errors

### Badges not unlocking
- Verify badge requirements are met
- Check backend logs for badge eligibility checks
- Ensure action types match badge criteria

### NFT minting fails
- Ensure wallet is connected
- Verify ThirdWeb client ID is configured
- Check contract address is correct

