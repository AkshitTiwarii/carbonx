from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import os

router = APIRouter()

# In-memory storage (in production, use a database)
REWARDS_DB_FILE = "rewards_db.json"

# Badge definitions
BADGE_DEFINITIONS = {
    "carbon_saver": {
        "name": "Carbon Saver",
        "description": "Offset your first 1 ton of CO2",
        "points_required": 100,
        "icon": "🌱"
    },
    "green_champion": {
        "name": "Green Champion",
        "description": "Offset 10 tons of CO2",
        "points_required": 1000,
        "icon": "🏆"
    },
    "eco_investor": {
        "name": "Eco Investor",
        "description": "Invest in 5+ carbon credit projects",
        "points_required": 500,
        "icon": "💚"
    },
    "calculator_master": {
        "name": "Calculator Master",
        "description": "Use all calculator tools 10+ times",
        "points_required": 200,
        "icon": "🧮"
    },
    "water_warrior": {
        "name": "Water Warrior",
        "description": "Calculate and reduce water footprint",
        "points_required": 150,
        "icon": "💧"
    },
    "plastic_fighter": {
        "name": "Plastic Fighter",
        "description": "Track and reduce plastic usage",
        "points_required": 150,
        "icon": "♻️"
    },
    "ai_explorer": {
        "name": "AI Explorer",
        "description": "Use AI tools 20+ times",
        "points_required": 300,
        "icon": "🤖"
    },
    "sustainability_hero": {
        "name": "Sustainability Hero",
        "description": "Reach 5000 EcoPoints",
        "points_required": 5000,
        "icon": "🦸"
    }
}

# Action point values
ACTION_POINTS = {
    "carbon_offset": 50,  # Per ton offset
    "calculator_use": 10,  # Per calculator use
    "water_calculation": 15,
    "plastic_calculation": 15,
    "ai_tool_use": 20,
    "investment": 30,  # Per investment
    "energy_savings": 25,  # Per MWh saved
}

def load_rewards_db():
    """Load rewards database from file or return empty dict"""
    if os.path.exists(REWARDS_DB_FILE):
        try:
            with open(REWARDS_DB_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_rewards_db(data):
    """Save rewards database to file"""
    try:
        with open(REWARDS_DB_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving rewards DB: {e}")

def get_user_rewards(user_id: str):
    """Get or create user rewards entry"""
    db = load_rewards_db()
    if user_id not in db:
        db[user_id] = {
            "ecoPoints": 0,
            "badges": [],
            "rank": 0,
            "actions": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        save_rewards_db(db)
    return db[user_id]

def update_user_rewards(user_id: str, updates: dict):
    """Update user rewards"""
    db = load_rewards_db()
    if user_id not in db:
        get_user_rewards(user_id)  # Initialize if needed
        db = load_rewards_db()
    
    db[user_id].update(updates)
    db[user_id]["updated_at"] = datetime.now().isoformat()
    save_rewards_db(db)
    return db[user_id]

def check_badge_eligibility(user_id: str, eco_points: int, action_type: str):
    """Check if user is eligible for new badges"""
    user = get_user_rewards(user_id)
    earned_badges = set(user.get("badges", []))
    new_badges = []
    
    # Check each badge definition
    for badge_id, badge_def in BADGE_DEFINITIONS.items():
        if badge_id in earned_badges:
            continue  # Already earned
        
        # Check if user meets criteria
        eligible = False
        
        if badge_id == "carbon_saver" and eco_points >= badge_def["points_required"]:
            eligible = True
        elif badge_id == "green_champion" and eco_points >= badge_def["points_required"]:
            eligible = True
        elif badge_id == "eco_investor":
            # Count investments from actions
            investments = sum(1 for a in user.get("actions", []) if a.get("type") == "investment")
            if investments >= 5:
                eligible = True
        elif badge_id == "calculator_master":
            calc_uses = sum(1 for a in user.get("actions", []) if "calculator" in a.get("type", ""))
            if calc_uses >= 10:
                eligible = True
        elif badge_id == "water_warrior" and action_type == "water_calculation":
            eligible = True
        elif badge_id == "plastic_fighter" and action_type == "plastic_calculation":
            eligible = True
        elif badge_id == "ai_explorer":
            ai_uses = sum(1 for a in user.get("actions", []) if "ai" in a.get("type", "").lower())
            if ai_uses >= 20:
                eligible = True
        elif badge_id == "sustainability_hero" and eco_points >= badge_def["points_required"]:
            eligible = True
        
        if eligible:
            new_badges.append(badge_id)
            earned_badges.add(badge_id)
    
    return new_badges

def calculate_rank(eco_points: int) -> int:
    """Calculate user rank based on points"""
    # Simple ranking: every 100 points = 1 rank level
    return max(1, eco_points // 100)

class UpdateRewardsRequest(BaseModel):
    user_id: str
    action_type: str  # carbon_offset, calculator_use, water_calculation, etc.
    amount: Optional[float] = 1.0  # For actions like carbon_offset, amount in tons
    metadata: Optional[dict] = {}

class LeaderboardQuery(BaseModel):
    limit: Optional[int] = 100
    region: Optional[str] = None  # For future regional leaderboards

@router.post("/update")
def update_rewards(req: UpdateRewardsRequest):
    """Update user rewards when they perform an eco-action"""
    try:
        user = get_user_rewards(req.user_id)
        
        # Calculate points for this action
        base_points = ACTION_POINTS.get(req.action_type, 10)
        points_earned = int(base_points * req.amount)
        
        # Update points
        new_eco_points = user["ecoPoints"] + points_earned
        new_rank = calculate_rank(new_eco_points)
        
        # Record action
        action = {
            "type": req.action_type,
            "amount": req.amount,
            "points_earned": points_earned,
            "timestamp": datetime.now().isoformat(),
            "metadata": req.metadata
        }
        
        actions = user.get("actions", [])
        actions.append(action)
        
        # Update user
        update_user_rewards(req.user_id, {
            "ecoPoints": new_eco_points,
            "rank": new_rank,
            "actions": actions[-100:]  # Keep last 100 actions
        })
        
        # Check for new badges
        user = get_user_rewards(req.user_id)  # Reload
        new_badges = check_badge_eligibility(req.user_id, new_eco_points, req.action_type)
        
        if new_badges:
            current_badges = user.get("badges", [])
            current_badges.extend(new_badges)
            update_user_rewards(req.user_id, {"badges": current_badges})
        
        return {
            "success": True,
            "points_earned": points_earned,
            "total_points": new_eco_points,
            "rank": new_rank,
            "new_badges": [BADGE_DEFINITIONS[bid] for bid in new_badges],
            "action": action
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating rewards: {str(e)}")

@router.get("/leaderboard")
def get_leaderboard(limit: int = 100, region: Optional[str] = None):
    """Get global or regional leaderboard"""
    try:
        db = load_rewards_db()
        
        # Convert to list and sort by points
        users = []
        for user_id, user_data in db.items():
            users.append({
                "user_id": user_id,
                "ecoPoints": user_data.get("ecoPoints", 0),
                "rank": user_data.get("rank", 0),
                "badges": user_data.get("badges", []),
                "badge_count": len(user_data.get("badges", []))
            })
        
        # Sort by points (descending)
        users.sort(key=lambda x: x["ecoPoints"], reverse=True)
        
        # Add position
        for i, user in enumerate(users[:limit]):
            user["position"] = i + 1
        
        return {
            "success": True,
            "leaderboard": users[:limit],
            "region": region or "global",
            "total_users": len(users)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")

@router.get("/user/{user_id}")
def get_user_rewards_data(user_id: str):
    """Get user's rewards data"""
    try:
        user = get_user_rewards(user_id)
        
        # Get badge details
        badge_details = []
        for badge_id in user.get("badges", []):
            if badge_id in BADGE_DEFINITIONS:
                badge_details.append({
                    "id": badge_id,
                    **BADGE_DEFINITIONS[badge_id]
                })
        
        # Calculate stats
        actions = user.get("actions", [])
        total_actions = len(actions)
        carbon_offset = sum(a.get("amount", 0) for a in actions if a.get("type") == "carbon_offset")
        
        # Get leaderboard position
        db = load_rewards_db()
        all_users = [(uid, data.get("ecoPoints", 0)) for uid, data in db.items()]
        all_users.sort(key=lambda x: x[1], reverse=True)
        position = next((i + 1 for i, (uid, _) in enumerate(all_users) if uid == user_id), None)
        
        return {
            "success": True,
            "user_id": user_id,
            "ecoPoints": user.get("ecoPoints", 0),
            "rank": user.get("rank", 0),
            "position": position,
            "badges": badge_details,
            "stats": {
                "total_actions": total_actions,
                "carbon_offset_tons": carbon_offset,
                "badge_count": len(badge_details)
            },
            "recent_actions": actions[-10:]  # Last 10 actions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user rewards: {str(e)}")

@router.get("/badges")
def get_badge_definitions():
    """Get all available badge definitions"""
    return {
        "success": True,
        "badges": BADGE_DEFINITIONS
    }

