import os
import json
import logging
import traceback
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# File-based database for rewards (simple implementation)
REWARDS_DB_FILE = "rewards_db.json"

# Badge definitions
BADGE_DEFINITIONS = {
    "carbon_saver": {
        "name": "Carbon Saver",
        "description": "Offset 100+ tons of CO2",
        "points_required": 500,
        "icon": "🌱"
    },
    "green_champion": {
        "name": "Green Champion",
        "description": "Reach 1000 EcoPoints",
        "points_required": 1000,
        "icon": "🏆"
    },
    "eco_investor": {
        "name": "Eco Investor",
        "description": "Make 5+ green investments",
        "points_required": 0,
        "icon": "💚"
    },
    "calculator_master": {
        "name": "Calculator Master",
        "description": "Use calculators 10+ times",
        "points_required": 0,
        "icon": "🧮"
    },
    "water_warrior": {
        "name": "Water Warrior",
        "description": "Complete water footprint analysis",
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
    try:
        if os.path.exists(REWARDS_DB_FILE):
            try:
                with open(REWARDS_DB_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Validate data structure
                    if not isinstance(data, dict):
                        logger.warning("Rewards DB file contains invalid data structure, resetting")
                        return {}
                    return data
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse rewards DB JSON: {e}")
                # Backup corrupted file
                backup_file = f"{REWARDS_DB_FILE}.backup.{datetime.now().timestamp()}"
                try:
                    os.rename(REWARDS_DB_FILE, backup_file)
                    logger.info(f"Backed up corrupted DB to {backup_file}")
                except:
                    pass
                return {}
            except Exception as e:
                logger.error(f"Unexpected error loading rewards DB: {e}")
                return {}
        return {}
    except Exception as e:
        logger.error(f"Critical error in load_rewards_db: {e}")
        return {}

def save_rewards_db(data):
    """Save rewards database to file"""
    try:
        if not isinstance(data, dict):
            raise ValueError("Data must be a dictionary")
        
        # Create backup before saving
        if os.path.exists(REWARDS_DB_FILE):
            try:
                backup_file = f"{REWARDS_DB_FILE}.backup"
                with open(REWARDS_DB_FILE, 'r', encoding='utf-8') as src:
                    with open(backup_file, 'w', encoding='utf-8') as dst:
                        dst.write(src.read())
            except Exception as backup_error:
                logger.warning(f"Failed to create backup: {backup_error}")
        
        # Write new data
        with open(REWARDS_DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.debug("Successfully saved rewards DB")
        return True
    except PermissionError as e:
        logger.error(f"Permission denied saving rewards DB: {e}")
        raise
    except Exception as e:
        logger.error(f"Error saving rewards DB: {e}")
        logger.error(traceback.format_exc())
        raise

def get_user_rewards(user_id: str):
    """Get or create user rewards entry"""
    try:
        if not user_id or not isinstance(user_id, str) or len(user_id.strip()) == 0:
            raise ValueError("Invalid user_id provided")
        
        db = load_rewards_db()
        
        # Validate existing user data structure
        if user_id in db:
            user_data = db[user_id]
            # Ensure required fields exist with defaults
            if not isinstance(user_data, dict):
                logger.warning(f"Invalid user data structure for {user_id}, resetting")
                user_data = {}
            
            # Normalize user data
            normalized = {
                "ecoPoints": int(user_data.get("ecoPoints", 0)) if isinstance(user_data.get("ecoPoints"), (int, float)) else 0,
                "badges": list(user_data.get("badges", [])) if isinstance(user_data.get("badges"), list) else [],
                "rank": int(user_data.get("rank", 0)) if isinstance(user_data.get("rank"), (int, float)) else 0,
                "actions": list(user_data.get("actions", [])) if isinstance(user_data.get("actions"), list) else [],
                "created_at": user_data.get("created_at", datetime.now().isoformat()),
                "updated_at": user_data.get("updated_at", datetime.now().isoformat())
            }
            db[user_id] = normalized
        else:
            # Create new user entry
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
    except Exception as e:
        logger.error(f"Error in get_user_rewards for {user_id}: {e}")
        logger.error(traceback.format_exc())
        # Return default structure on error
        return {
            "ecoPoints": 0,
            "badges": [],
            "rank": 0,
            "actions": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

def update_user_rewards(user_id: str, updates: dict):
    """Update user rewards"""
    try:
        if not user_id or not isinstance(user_id, str):
            raise ValueError("Invalid user_id provided")
        
        if not isinstance(updates, dict):
            raise ValueError("Updates must be a dictionary")
        
        db = load_rewards_db()
        if user_id not in db:
            get_user_rewards(user_id)  # Initialize if needed
            db = load_rewards_db()
        
        if user_id not in db:
            raise ValueError(f"Failed to initialize user {user_id}")
        
        # Validate and merge updates safely
        user_data = db[user_id]
        if not isinstance(user_data, dict):
            user_data = {}
            db[user_id] = user_data
        
        # Safely update fields
        for key, value in updates.items():
            if key == "ecoPoints":
                user_data[key] = int(value) if isinstance(value, (int, float)) else 0
            elif key == "rank":
                user_data[key] = int(value) if isinstance(value, (int, float)) else 0
            elif key == "badges":
                user_data[key] = list(value) if isinstance(value, list) else []
            elif key == "actions":
                user_data[key] = list(value) if isinstance(value, list) else []
            else:
                user_data[key] = value
        
        user_data["updated_at"] = datetime.now().isoformat()
        save_rewards_db(db)
        return db[user_id]
    except Exception as e:
        logger.error(f"Error in update_user_rewards for {user_id}: {e}")
        logger.error(traceback.format_exc())
        raise

def check_badge_eligibility(user_id: str, eco_points: int, action_type: str):
    """Check if user is eligible for new badges"""
    try:
        # Input validation
        if not user_id or not isinstance(user_id, str):
            logger.warning(f"Invalid user_id in badge eligibility check: {user_id}")
            return []
        
        if not isinstance(eco_points, (int, float)) or eco_points < 0:
            logger.warning(f"Invalid eco_points in badge eligibility check: {eco_points}")
            eco_points = 0
        
        if not isinstance(action_type, str):
            action_type = ""
        
        user = get_user_rewards(user_id)
        if not isinstance(user, dict):
            logger.error(f"Failed to get user data for badge eligibility: {user_id}")
            return []
        
        earned_badges = set(user.get("badges", []))
        new_badges = []
        
        # Check each badge definition
        for badge_id, badge_def in BADGE_DEFINITIONS.items():
            try:
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
                    try:
                        investments = sum(1 for a in user.get("actions", []) if isinstance(a, dict) and a.get("type") == "investment")
                        if investments >= 5:
                            eligible = True
                    except Exception as e:
                        logger.warning(f"Error counting investments for {user_id}: {e}")
                elif badge_id == "calculator_master":
                    try:
                        calc_uses = sum(1 for a in user.get("actions", []) if isinstance(a, dict) and "calculator" in str(a.get("type", "")))
                        if calc_uses >= 10:
                            eligible = True
                    except Exception as e:
                        logger.warning(f"Error counting calculator uses for {user_id}: {e}")
                elif badge_id == "water_warrior" and action_type == "water_calculation":
                    eligible = True
                elif badge_id == "plastic_fighter" and action_type == "plastic_calculation":
                    eligible = True
                elif badge_id == "ai_explorer":
                    try:
                        ai_uses = sum(1 for a in user.get("actions", []) if isinstance(a, dict) and "ai" in str(a.get("type", "")).lower())
                        if ai_uses >= 20:
                            eligible = True
                    except Exception as e:
                        logger.warning(f"Error counting AI uses for {user_id}: {e}")
                elif badge_id == "sustainability_hero" and eco_points >= badge_def["points_required"]:
                    eligible = True
                
                if eligible:
                    new_badges.append(badge_id)
                    logger.info(f"User {user_id} earned new badge: {badge_id}")
                    
            except Exception as e:
                logger.error(f"Error checking badge {badge_id} for user {user_id}: {e}")
                continue
        
        return new_badges
        
    except Exception as e:
        logger.error(f"Critical error in check_badge_eligibility for {user_id}: {e}")
        logger.error(traceback.format_exc())
        return []

def calculate_rank(eco_points: int) -> int:
    """Calculate user rank based on points"""
    try:
        # Input validation
        if not isinstance(eco_points, (int, float)):
            logger.warning(f"Invalid eco_points type for rank calculation: {type(eco_points)}")
            return 1
        
        if eco_points < 0:
            logger.warning(f"Negative eco_points for rank calculation: {eco_points}")
            eco_points = 0
        
        # Prevent overflow
        if eco_points > 1000000:  # 1M points max
            logger.warning(f"Eco_points too high for rank calculation: {eco_points}")
            eco_points = 1000000
        
        # Simple ranking: every 100 points = 1 rank level
        rank = max(1, int(eco_points // 100))
        
        # Cap maximum rank
        return min(rank, 10000)
        
    except Exception as e:
        logger.error(f"Error in calculate_rank with eco_points {eco_points}: {e}")
        return 1

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
        # Input validation
        if not req.user_id or not isinstance(req.user_id, str) or len(req.user_id.strip()) == 0:
            logger.warning(f"Invalid user_id in update_rewards: {req.user_id}")
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        if not req.action_type or not isinstance(req.action_type, str):
            logger.warning(f"Invalid action_type in update_rewards: {req.action_type}")
            raise HTTPException(status_code=400, detail="Invalid action type provided")
        
        if not isinstance(req.amount, (int, float)) or req.amount <= 0:
            logger.warning(f"Invalid amount in update_rewards: {req.amount}")
            req.amount = 1.0
        
        # Rate limiting check (simple implementation)
        # In production, use Redis or similar
        
        logger.info(f"Processing reward update for user {req.user_id}, action: {req.action_type}")
        
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
            "metadata": req.metadata or {}
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
        
        logger.info(f"Successfully updated rewards for user {req.user_id}: +{points_earned} points")
        
        return {
            "success": True,
            "points_earned": points_earned,
            "total_points": new_eco_points,
            "rank": new_rank,
            "new_badges": [BADGE_DEFINITIONS[bid] for bid in new_badges],
            "action": action
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Validation error in update_rewards: {e}")
        raise HTTPException(status_code=400, detail="Invalid request data")
    except Exception as e:
        logger.error(f"Server error in update_rewards: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/leaderboard")
def get_leaderboard(limit: int = 100, region: Optional[str] = None):
    """Get global or regional leaderboard"""
    try:
        # Input validation
        if not isinstance(limit, int) or limit <= 0:
            limit = 100
        if limit > 1000:  # Prevent excessive data transfer
            limit = 1000
            
        if region and not isinstance(region, str):
            region = None
            
        logger.info(f"Fetching leaderboard with limit {limit}, region: {region}")
        
        db = load_rewards_db()
        
        # Convert to list and sort by points
        users = []
        for user_id, user_data in db.items():
            try:
                if not isinstance(user_data, dict):
                    continue
                    
                users.append({
                    "user_id": user_id,
                    "ecoPoints": int(user_data.get("ecoPoints", 0)),
                    "rank": int(user_data.get("rank", 0)),
                    "badges": list(user_data.get("badges", [])),
                    "badge_count": len(user_data.get("badges", []))
                })
            except Exception as e:
                logger.warning(f"Error processing user {user_id} for leaderboard: {e}")
                continue
        
        # Sort by points (descending)
        users.sort(key=lambda x: x["ecoPoints"], reverse=True)
        
        # Add position
        for i, user in enumerate(users[:limit]):
            user["position"] = i + 1
        
        logger.info(f"Successfully generated leaderboard with {len(users[:limit])} users")
        
        return {
            "success": True,
            "leaderboard": users[:limit],
            "region": region or "global",
            "total_users": len(users)
        }
        
    except Exception as e:
        logger.error(f"Server error in get_leaderboard: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/user/{user_id}")
def get_user_rewards_data(user_id: str):
    """Get user's rewards data"""
    try:
        # Input validation
        if not user_id or not isinstance(user_id, str) or len(user_id.strip()) == 0:
            logger.warning(f"Invalid user_id in get_user_rewards_data: {user_id}")
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        logger.info(f"Fetching rewards data for user {user_id}")
        
        user = get_user_rewards(user_id)
        
        # Get badge details
        badge_details = []
        try:
            for badge_id in user.get("badges", []):
                if badge_id in BADGE_DEFINITIONS:
                    badge_details.append({
                        "id": badge_id,
                        **BADGE_DEFINITIONS[badge_id]
                    })
        except Exception as e:
            logger.warning(f"Error processing badges for user {user_id}: {e}")
        
        # Calculate stats
        try:
            actions = user.get("actions", [])
            total_actions = len(actions) if isinstance(actions, list) else 0
            carbon_offset = sum(
                a.get("amount", 0) for a in actions 
                if isinstance(a, dict) and a.get("type") == "carbon_offset"
            )
        except Exception as e:
            logger.warning(f"Error calculating stats for user {user_id}: {e}")
            total_actions = 0
            carbon_offset = 0
        
        # Get leaderboard position
        position = None
        try:
            db = load_rewards_db()
            all_users = []
            for uid, data in db.items():
                if isinstance(data, dict):
                    all_users.append((uid, int(data.get("ecoPoints", 0))))
            
            all_users.sort(key=lambda x: x[1], reverse=True)
            position = next((i + 1 for i, (uid, _) in enumerate(all_users) if uid == user_id), None)
        except Exception as e:
            logger.warning(f"Error calculating position for user {user_id}: {e}")
        
        logger.info(f"Successfully fetched rewards data for user {user_id}")
        
        return {
            "success": True,
            "user_id": user_id,
            "ecoPoints": user.get("ecoPoints", 0),
            "rank": user.get("rank", 0),
            "position": position,
            "badges": badge_details,
            "total_actions": total_actions,
            "carbon_offset": carbon_offset,
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Server error in get_user_rewards_data: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error")# Check frontend logs (most likely to have issues)
        docker-compose -f docker-compose.dev.yml logs -f frontend

        # Check backend logs
        docker-compose -f docker-compose.dev.yml logs -f backend

        # Check blockchain logs
        docker-compose -f docker-compose.dev.yml logs -f blockchain
