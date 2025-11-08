from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

router = APIRouter()

# In-memory storage (replace with database in production)
user_rewards_db: Dict[str, Dict] = {}
global_leaderboard: List[Dict] = []
regional_leaderboards: Dict[str, List[Dict]] = {}

class RewardAction(BaseModel):
    user_id: str
    action: str
    action_value: float = 1.0
    timestamp: Optional[str] = None
    location: Optional[str] = None
    wallet_address: Optional[str] = None

class UserRewardsResponse(BaseModel):
    user_id: str
    ecoPoints: int
    new_badges: List[str]
    leaderboard: Dict
    wallet_tx: Optional[Dict] = None
    milestone_message: str
    stats: Dict

# Badge definitions (same as frontend)
BADGE_DEFINITIONS = [
    {"id": "first_step", "name": "First Step", "points_threshold": 0, "actions_threshold": 1},
    {"id": "carbon_saver", "name": "Carbon Saver", "co2_threshold": 1.0},
    {"id": "energy_hero", "name": "Energy Hero", "energy_threshold": 100.0},
    {"id": "green_champion", "name": "Green Champion", "points_threshold": 1000},
    {"id": "carbon_master", "name": "Carbon Master", "co2_threshold": 10.0},
    {"id": "eco_legend", "name": "Eco Legend", "points_threshold": 10000},
]

def calculate_eco_points(action_type: str, action_value: float) -> int:
    """Calculate EcoPoints based on action type and value"""
    multipliers = {
        "carbon_offset": 100,  # 100 points per ton of CO2
        "energy_saving": 2,    # 2 points per kWh saved
        "ai_eco_tool": 50,     # 50 points per AI tool usage
        "event_participation": 200,  # 200 points per event
        "water_saving": 0.1,    # 0.1 points per liter saved
        "plastic_reduction": 5, # 5 points per kg reduced
    }
    multiplier = multipliers.get(action_type, 10)
    return int(action_value * multiplier)

def check_badge_unlocks(user_data: Dict) -> List[str]:
    """Check which badges should be unlocked"""
    new_badges = []
    current_badges = user_data.get("badges", [])
    
    for badge in BADGE_DEFINITIONS:
        if badge["id"] in current_badges:
            continue
            
        unlocked = False
        if "points_threshold" in badge:
            unlocked = user_data.get("ecoPoints", 0) >= badge["points_threshold"]
        elif "co2_threshold" in badge:
            unlocked = user_data.get("totalCO2Offset", 0) >= badge["co2_threshold"]
        elif "energy_threshold" in badge:
            unlocked = user_data.get("totalEnergySaved", 0) >= badge["energy_threshold"]
        elif "actions_threshold" in badge:
            unlocked = user_data.get("totalActions", 0) >= badge["actions_threshold"]
        
        if unlocked:
            new_badges.append(badge["id"])
            current_badges.append(badge["id"])
    
    user_data["badges"] = current_badges
    return new_badges

def update_leaderboards(user_data: Dict):
    """Update global and regional leaderboards"""
    user_id = user_data["user_id"]
    
    # Update global leaderboard
    global_index = next((i for i, u in enumerate(global_leaderboard) if u["user_id"] == user_id), None)
    if global_index is not None:
        global_leaderboard[global_index] = user_data
    else:
        global_leaderboard.append(user_data)
    
    global_leaderboard.sort(key=lambda x: x.get("ecoPoints", 0), reverse=True)
    
    # Update regional leaderboard
    location = user_data.get("location")
    if location:
        normalized_location = location.lower().replace(" ", "-")
        regional_leaderboard = regional_leaderboards.get(normalized_location, [])
        
        regional_index = next((i for i, u in enumerate(regional_leaderboard) if u["user_id"] == user_id), None)
        if regional_index is not None:
            regional_leaderboard[regional_index] = user_data
        else:
            regional_leaderboard.append(user_data)
        
        regional_leaderboard.sort(key=lambda x: x.get("ecoPoints", 0), reverse=True)
        regional_leaderboards[normalized_location] = regional_leaderboard

def get_user_rank(user_id: str, leaderboard: List[Dict]) -> int:
    """Get user's rank in leaderboard"""
    for i, user in enumerate(leaderboard):
        if user["user_id"] == user_id:
            return i + 1
    return len(leaderboard) + 1

@router.post("/track", response_model=UserRewardsResponse)
def track_action(action: RewardAction):
    """Track a user action and calculate rewards"""
    user_id = action.user_id
    
    # Get or create user data
    user_data = user_rewards_db.get(user_id, {
        "user_id": user_id,
        "ecoPoints": 0,
        "badges": [],
        "totalActions": 0,
        "totalCO2Offset": 0.0,
        "totalEnergySaved": 0.0,
        "location": action.location,
        "lastUpdated": datetime.now().isoformat(),
    })
    
    # Calculate points
    old_points = user_data["ecoPoints"]
    points_earned = calculate_eco_points(action.action, action.action_value)
    user_data["ecoPoints"] += points_earned
    user_data["totalActions"] += 1
    
    # Update specific metrics
    if action.action == "carbon_offset":
        user_data["totalCO2Offset"] += action.action_value
    elif action.action == "energy_saving":
        user_data["totalEnergySaved"] += action.action_value
    
    if action.location:
        user_data["location"] = action.location
    
    user_data["lastUpdated"] = action.timestamp or datetime.now().isoformat()
    
    # Check for badge unlocks
    old_rank = get_user_rank(user_id, global_leaderboard)
    new_badges = check_badge_unlocks(user_data)
    new_badge_names = [b["name"] for b in BADGE_DEFINITIONS if b["id"] in new_badges]
    
    # Update leaderboards
    update_leaderboards(user_data)
    new_rank = get_user_rank(user_id, global_leaderboard)
    regional_rank = None
    if user_data.get("location"):
        normalized_location = user_data["location"].lower().replace(" ", "-")
        regional_leaderboard = regional_leaderboards.get(normalized_location, [])
        regional_rank = get_user_rank(user_id, regional_leaderboard)
    
    # Generate milestone message
    milestone_parts = []
    if new_badges:
        milestone_parts.append(f"🎉 Congratulations! You unlocked: {', '.join(new_badge_names)}!")
    if new_rank < old_rank:
        milestone_parts.append(f"📈 You moved up {old_rank - new_rank} rank(s) in the leaderboard!")
    if user_data["ecoPoints"] >= 1000 and old_points < 1000:
        milestone_parts.append("🌟 You've reached 1,000 EcoPoints!")
    
    milestone_message = " ".join(milestone_parts) if milestone_parts else "Great work! Keep it up!"
    
    # Save user data
    user_rewards_db[user_id] = user_data
    
    return UserRewardsResponse(
        user_id=user_id,
        ecoPoints=user_data["ecoPoints"],
        new_badges=new_badge_names,
        leaderboard={
            "global_rank": new_rank,
            "regional_rank": regional_rank,
            "total_users": len(global_leaderboard),
        },
        milestone_message=milestone_message,
        stats={
            "totalActions": user_data["totalActions"],
            "totalCO2Offset": user_data["totalCO2Offset"],
            "totalEnergySaved": user_data["totalEnergySaved"],
            "badges": len(user_data["badges"]),
        },
    )

@router.get("/user/{user_id}")
def get_user_rewards(user_id: str):
    """Get user rewards data"""
    user_data = user_rewards_db.get(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    global_rank = get_user_rank(user_id, global_leaderboard)
    regional_rank = None
    if user_data.get("location"):
        normalized_location = user_data["location"].lower().replace(" ", "-")
        regional_leaderboard = regional_leaderboards.get(normalized_location, [])
        regional_rank = get_user_rank(user_id, regional_leaderboard)
    
    return {
        "user_id": user_id,
        "ecoPoints": user_data["ecoPoints"],
        "badges": [b for b in BADGE_DEFINITIONS if b["id"] in user_data.get("badges", [])],
        "leaderboard": {
            "global_rank": global_rank,
            "regional_rank": regional_rank,
        },
        "stats": {
            "totalActions": user_data["totalActions"],
            "totalCO2Offset": user_data["totalCO2Offset"],
            "totalEnergySaved": user_data["totalEnergySaved"],
        },
    }

@router.get("/leaderboard")
def get_leaderboard(type: str = "global", location: Optional[str] = None, limit: int = 100):
    """Get leaderboard data"""
    if type == "global":
        return {
            "type": "global",
            "leaderboard": [
                {
                    "rank": i + 1,
                    "user_id": user["user_id"],
                    "ecoPoints": user["ecoPoints"],
                    "badges": len(user.get("badges", [])),
                    "totalCO2Offset": user.get("totalCO2Offset", 0),
                }
                for i, user in enumerate(global_leaderboard[:limit])
            ],
        }
    elif type == "regional" and location:
        normalized_location = location.lower().replace(" ", "-")
        regional_leaderboard = regional_leaderboards.get(normalized_location, [])
        return {
            "type": "regional",
            "location": location,
            "leaderboard": [
                {
                    "rank": i + 1,
                    "user_id": user["user_id"],
                    "ecoPoints": user["ecoPoints"],
                    "badges": len(user.get("badges", [])),
                    "totalCO2Offset": user.get("totalCO2Offset", 0),
                }
                for i, user in enumerate(regional_leaderboard[:limit])
            ],
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid leaderboard type or missing location")

