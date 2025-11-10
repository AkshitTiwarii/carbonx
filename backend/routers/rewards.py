from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
import json
import os
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

router = APIRouter()

# Error response model
class ErrorResponse(BaseModel):
    success: bool = False
    status: str
    message: str
    code: str
    details: Optional[dict] = None

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
    user_id: str = Field(..., min_length=1, description="User identifier")
    action_type: str = Field(..., description="Type of eco-action performed")
    amount: Optional[float] = Field(1.0, ge=0, description="Amount for the action (e.g., tons of CO2)")
    metadata: Optional[dict] = Field(default_factory=dict, description="Additional metadata")
    
    @validator('action_type')
    def validate_action_type(cls, v):
        valid_types = list(ACTION_POINTS.keys())
        if v not in valid_types:
            raise ValueError(f"Invalid action_type. Must be one of: {', '.join(valid_types)}")
        return v
    
    @validator('user_id')
    def validate_user_id(cls, v):
        if not v or not isinstance(v, str) or len(v.strip()) == 0:
            raise ValueError("user_id must be a non-empty string")
        return v.strip()
    
    @validator('amount')
    def validate_amount(cls, v):
        if v is not None and (not isinstance(v, (int, float)) or v < 0):
            raise ValueError("amount must be a non-negative number")
        return float(v) if v is not None else 1.0

class LeaderboardQuery(BaseModel):
    limit: Optional[int] = 100
    region: Optional[str] = None  # For future regional leaderboards

@router.post("/update", response_model_exclude_none=True)
def update_rewards(req: UpdateRewardsRequest):
    """Update user rewards when they perform an eco-action"""
    try:
        # Validate request
        if not req.user_id:
            logger.warning("Update rewards called with empty user_id")
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "status": "validation_error",
                    "message": "user_id is required",
                    "code": "INVALID_USER_ID"
                }
            )
        
        # Get user data with error handling
        try:
            user = get_user_rewards(req.user_id)
        except Exception as db_error:
            logger.error(f"Database error getting user rewards: {db_error}")
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "status": "database_error",
                    "message": "Failed to access user data. Please try again.",
                    "code": "DB_ACCESS_ERROR"
                }
            )
        
        # Validate user data structure
        if not isinstance(user, dict):
            logger.error(f"Invalid user data structure for {req.user_id}")
            user = get_user_rewards(req.user_id)  # Retry
        
        # Calculate points for this action
        base_points = ACTION_POINTS.get(req.action_type, 10)
        if not isinstance(base_points, (int, float)):
            base_points = 10
        
        try:
            amount = float(req.amount) if req.amount is not None else 1.0
            if amount < 0:
                amount = 0
            points_earned = int(base_points * amount)
        except (ValueError, TypeError) as calc_error:
            logger.warning(f"Invalid amount calculation: {calc_error}, using default")
            amount = 1.0
            points_earned = int(base_points * amount)
        
        # Safely get current points
        try:
            current_points = int(user.get("ecoPoints", 0)) if isinstance(user.get("ecoPoints"), (int, float)) else 0
        except (ValueError, TypeError):
            current_points = 0
        
        new_eco_points = current_points + points_earned
        new_rank = calculate_rank(new_eco_points)
        
        # Record action
        action = {
            "type": req.action_type,
            "amount": amount,
            "points_earned": points_earned,
            "timestamp": datetime.now().isoformat(),
            "metadata": req.metadata if isinstance(req.metadata, dict) else {}
        }
        
        # Safely handle actions list
        actions = user.get("actions", [])
        if not isinstance(actions, list):
            actions = []
        actions.append(action)
        
        # Update user with error handling
        try:
            update_user_rewards(req.user_id, {
                "ecoPoints": new_eco_points,
                "rank": new_rank,
                "actions": actions[-100:]  # Keep last 100 actions
            })
        except Exception as update_error:
            logger.error(f"Failed to update user rewards: {update_error}")
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "status": "database_error",
                    "message": "Failed to save rewards. Points may not have been updated.",
                    "code": "DB_UPDATE_ERROR"
                }
            )
        
        # Check for new badges with error handling
        new_badges = []
        try:
            user = get_user_rewards(req.user_id)  # Reload
            new_badges = check_badge_eligibility(req.user_id, new_eco_points, req.action_type)
            
            if new_badges:
                current_badges = user.get("badges", [])
                if not isinstance(current_badges, list):
                    current_badges = []
                current_badges.extend(new_badges)
                try:
                    update_user_rewards(req.user_id, {"badges": current_badges})
                except Exception as badge_error:
                    logger.error(f"Failed to save new badges: {badge_error}")
                    # Don't fail the whole request if badge save fails
        except Exception as badge_check_error:
            logger.error(f"Error checking badge eligibility: {badge_check_error}")
            # Continue without badges if check fails
        
        # Format badge details safely
        badge_details = []
        for bid in new_badges:
            if bid in BADGE_DEFINITIONS:
                badge_details.append(BADGE_DEFINITIONS[bid])
        
        logger.info(f"Successfully updated rewards for {req.user_id}: +{points_earned} points")
        
        return {
            "success": True,
            "points_earned": points_earned,
            "total_points": new_eco_points,
            "rank": new_rank,
            "new_badges": badge_details,
            "action": action
        }
    except HTTPException:
        raise
    except ValueError as ve:
        logger.warning(f"Validation error in update_rewards: {ve}")
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "status": "validation_error",
                "message": str(ve),
                "code": "VALIDATION_ERROR"
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error in update_rewards: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "status": "internal_error",
                "message": "An unexpected error occurred. Please try again later.",
                "code": "INTERNAL_ERROR",
                "details": {"error": str(e)} if os.getenv("DEBUG", "false").lower() == "true" else None
            }
        )

@router.get("/leaderboard")
def get_leaderboard(limit: int = 100, region: Optional[str] = None):
    """Get global or regional leaderboard"""
    try:
        # Validate limit
        if limit < 1:
            limit = 100
        if limit > 1000:
            limit = 1000  # Cap at 1000 for performance
        
        # Load database with error handling
        try:
            db = load_rewards_db()
        except Exception as db_error:
            logger.error(f"Database error loading leaderboard: {db_error}")
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "status": "database_error",
                    "message": "Failed to load leaderboard data. Please try again.",
                    "code": "DB_LOAD_ERROR"
                }
            )
        
        if not isinstance(db, dict):
            logger.warning("Invalid database structure, returning empty leaderboard")
            return {
                "success": True,
                "leaderboard": [],
                "region": region or "global",
                "total_users": 0
            }
        
        # Convert to list and sort by points with error handling
        users = []
        for user_id, user_data in db.items():
            try:
                if not isinstance(user_data, dict):
                    continue
                
                # Safely extract data with defaults
                eco_points = int(user_data.get("ecoPoints", 0)) if isinstance(user_data.get("ecoPoints"), (int, float)) else 0
                rank = int(user_data.get("rank", 0)) if isinstance(user_data.get("rank"), (int, float)) else 0
                badges = list(user_data.get("badges", [])) if isinstance(user_data.get("badges"), list) else []
                
                users.append({
                    "user_id": str(user_id),
                    "ecoPoints": eco_points,
                    "rank": rank,
                    "badges": badges,
                    "badge_count": len(badges)
                })
            except Exception as user_error:
                logger.warning(f"Error processing user {user_id} for leaderboard: {user_error}")
                continue
        
        # Sort by points (descending) with error handling
        try:
            users.sort(key=lambda x: (x.get("ecoPoints", 0), x.get("badge_count", 0)), reverse=True)
        except Exception as sort_error:
            logger.error(f"Error sorting leaderboard: {sort_error}")
            # Return unsorted if sort fails
            pass
        
        # Add position
        for i, user in enumerate(users[:limit]):
            user["position"] = i + 1
        
        logger.info(f"Successfully loaded leaderboard: {len(users)} users, limit={limit}")
        
        return {
            "success": True,
            "leaderboard": users[:limit],
            "region": region or "global",
            "total_users": len(users)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_leaderboard: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "status": "internal_error",
                "message": "An unexpected error occurred while loading the leaderboard.",
                "code": "INTERNAL_ERROR"
            }
        )

@router.get("/user/{user_id}")
def get_user_rewards_data(user_id: str):
    """Get user's rewards data"""
    try:
        # Validate user_id
        if not user_id or not isinstance(user_id, str) or len(user_id.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "status": "validation_error",
                    "message": "Invalid user_id provided",
                    "code": "INVALID_USER_ID"
                }
            )
        
        user_id = user_id.strip()
        
        # Get user data with error handling
        try:
            user = get_user_rewards(user_id)
        except Exception as db_error:
            logger.error(f"Database error getting user rewards: {db_error}")
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "status": "database_error",
                    "message": "Failed to access user data. Please try again.",
                    "code": "DB_ACCESS_ERROR"
                }
            )
        
        if not isinstance(user, dict):
            logger.warning(f"Invalid user data structure for {user_id}")
            user = {}
        
        # Get badge details with error handling
        badge_details = []
        try:
            badges = user.get("badges", [])
            if not isinstance(badges, list):
                badges = []
            
            for badge_id in badges:
                if isinstance(badge_id, str) and badge_id in BADGE_DEFINITIONS:
                    badge_details.append({
                        "id": badge_id,
                        **BADGE_DEFINITIONS[badge_id]
                    })
        except Exception as badge_error:
            logger.warning(f"Error processing badges for {user_id}: {badge_error}")
        
        # Calculate stats with error handling
        try:
            actions = user.get("actions", [])
            if not isinstance(actions, list):
                actions = []
            
            total_actions = len(actions)
            carbon_offset = 0.0
            
            for action in actions:
                if isinstance(action, dict):
                    if action.get("type") == "carbon_offset":
                        try:
                            amount = float(action.get("amount", 0))
                            if amount > 0:
                                carbon_offset += amount
                        except (ValueError, TypeError):
                            pass
        except Exception as stats_error:
            logger.warning(f"Error calculating stats for {user_id}: {stats_error}")
            total_actions = 0
            carbon_offset = 0.0
            actions = []
        
        # Get leaderboard position with error handling
        position = None
        try:
            db = load_rewards_db()
            if isinstance(db, dict):
                all_users = []
                for uid, data in db.items():
                    if isinstance(data, dict):
                        try:
                            points = int(data.get("ecoPoints", 0)) if isinstance(data.get("ecoPoints"), (int, float)) else 0
                            all_users.append((str(uid), points))
                        except (ValueError, TypeError):
                            continue
                
                all_users.sort(key=lambda x: x[1], reverse=True)
                position = next((i + 1 for i, (uid, _) in enumerate(all_users) if uid == user_id), None)
        except Exception as pos_error:
            logger.warning(f"Error calculating position for {user_id}: {pos_error}")
        
        # Safely get user values
        eco_points = int(user.get("ecoPoints", 0)) if isinstance(user.get("ecoPoints"), (int, float)) else 0
        rank = int(user.get("rank", 0)) if isinstance(user.get("rank"), (int, float)) else 0
        
        # Get recent actions safely
        recent_actions = actions[-10:] if isinstance(actions, list) else []
        
        return {
            "success": True,
            "user_id": user_id,
            "ecoPoints": eco_points,
            "rank": rank,
            "position": position,
            "badges": badge_details,
            "stats": {
                "total_actions": total_actions,
                "carbon_offset_tons": round(carbon_offset, 2),
                "badge_count": len(badge_details)
            },
            "recent_actions": recent_actions
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_user_rewards_data: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "status": "internal_error",
                "message": "An unexpected error occurred while fetching user rewards.",
                "code": "INTERNAL_ERROR"
            }
        )

@router.get("/badges")
def get_badge_definitions():
    """Get all available badge definitions"""
    try:
        # Validate badge definitions exist
        if not BADGE_DEFINITIONS or not isinstance(BADGE_DEFINITIONS, dict):
            logger.warning("Badge definitions are missing or invalid")
            return {
                "success": True,
                "badges": {}
            }
        
        return {
            "success": True,
            "badges": BADGE_DEFINITIONS
        }
    except Exception as e:
        logger.error(f"Error getting badge definitions: {e}")
        # Return empty badges on error rather than failing
        return {
            "success": True,
            "badges": {}
        }

