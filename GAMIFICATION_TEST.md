# Gamification System Testing Guide

## Quick Start

1. **Start your Next.js development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   Open your browser and go to: `http://localhost:3000/rewards-test`

3. **Test the system:**
   - Enter a User ID (or use the default)
   - Select an action type
   - Enter an action value
   - Click "Track Action" or use the quick action buttons
   - Watch your EcoPoints, badges, and leaderboard rank update!

## Testing via API (cURL)

### Track an Action
```bash
curl -X POST http://localhost:3000/api/rewards \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "action": "carbon_offset",
    "action_value": 2.5,
    "location": "United States",
    "wallet_address": "0x1234567890123456789012345678901234567890"
  }'
```

### Get User Rewards
```bash
curl "http://localhost:3000/api/rewards?user_id=test-user-123"
```

### Get Global Leaderboard
```bash
curl "http://localhost:3000/api/rewards?type=global&limit=10"
```

### Get Regional Leaderboard
```bash
curl "http://localhost:3000/api/rewards?type=regional&location=United%20States&limit=10"
```

## Action Types & Point Values

| Action Type | Points Multiplier | Example |
|------------|-------------------|---------|
| `carbon_offset` | 100 pts/ton | 2.5 tons = 250 points |
| `energy_saving` | 2 pts/kWh | 50 kWh = 100 points |
| `ai_eco_tool` | 50 pts/use | 1 use = 50 points |
| `event_participation` | 200 pts/event | 1 event = 200 points |
| `water_saving` | 0.1 pts/liter | 100 liters = 10 points |
| `plastic_reduction` | 5 pts/kg | 10 kg = 50 points |
| `sustainable_transport` | 10 pts/km | 5 km = 50 points |
| `recycling` | 25 pts/action | 1 action = 25 points |
| `tree_planting` | 150 pts/tree | 1 tree = 150 points |
| `renewable_energy` | 75 pts/installation | 1 install = 75 points |

## Badge Unlock Conditions

### Common Badges
- **First Step**: Complete 1 action
- **Carbon Saver**: Offset 1 ton of CO2
- **Energy Hero**: Save 100 kWh

### Rare Badges
- **Green Champion**: Reach 1,000 EcoPoints
- **Carbon Master**: Offset 10 tons of CO2
- **AI Eco Explorer**: Use AI tools 10 times
- **Event Organizer**: Participate in 5 events

### Epic Badges
- **Eco Legend**: Reach 10,000 EcoPoints
- **Carbon Warrior**: Offset 100 tons of CO2
- **Sustainability Guru**: Complete 100 actions

### Legendary Badges
- **Planet Protector**: 50,000 EcoPoints + 50 tons CO2 offset

## Testing Scenarios

### Scenario 1: New User First Action
```json
{
  "user_id": "new-user-1",
  "action": "carbon_offset",
  "action_value": 0.5,
  "location": "Canada"
}
```
**Expected Result:**
- Earns 50 EcoPoints
- Unlocks "First Step" badge
- Unlocks "Carbon Saver" badge (if 0.5 >= 1, wait for next action)

### Scenario 2: Energy Saving
```json
{
  "user_id": "energy-user",
  "action": "energy_saving",
  "action_value": 100,
  "location": "Germany"
}
```
**Expected Result:**
- Earns 200 EcoPoints
- Unlocks "Energy Hero" badge (100 kWh threshold)

### Scenario 3: Multiple Actions to Unlock Badges
Track these actions in sequence:
1. `carbon_offset` with value `1.0` → Unlocks "Carbon Saver"
2. `energy_saving` with value `100` → Unlocks "Energy Hero"
3. `ai_eco_tool` with value `10` → Unlocks "AI Eco Explorer"
4. Continue until reaching 1,000 points → Unlocks "Green Champion"

## What to Check

✅ **EcoPoints Calculation**: Points should match the formula (action_value × multiplier)

✅ **Badge Unlocking**: Badges should unlock when conditions are met

✅ **Leaderboard Updates**: Global and regional rankings should update after each action

✅ **Milestone Messages**: Friendly messages should appear for achievements

✅ **NFT Minting**: If wallet address is provided and contracts are configured, NFTs should mint

✅ **Persistence**: User data should persist across requests (in-memory for now)

## Troubleshooting

### API Returns 500 Error
- Check the server console for error messages
- Ensure all required fields are provided
- Verify the action type is valid

### Badges Not Unlocking
- Check the badge unlock conditions
- Ensure action values meet thresholds
- Verify user stats are being tracked correctly

### Leaderboard Not Updating
- Check that location is provided for regional leaderboard
- Verify user data is being saved correctly
- Check that leaderboard sorting is working

### NFT Minting Not Working
- Ensure `ECOPOINTS_NFT_CONTRACT` and `BADGE_NFT_CONTRACT` env vars are set
- Check that `THIRDWEB_SECRET_KEY` is configured
- Verify wallet address is valid
- Check ThirdWeb Engine logs

## Next Steps

1. **Database Integration**: Replace in-memory storage with a database (PostgreSQL, MongoDB, etc.)

2. **Real NFT Contracts**: Deploy actual ERC-721 contracts for badges and ERC-20 for EcoPoints

3. **User Authentication**: Integrate with your auth system to get real user IDs

4. **Analytics**: Add tracking for user engagement and badge distribution

5. **Notifications**: Implement real-time notifications for badge unlocks and rank changes

