from fastapi import APIRouter
import os
import json

router = APIRouter()

@router.get("/debug/db")
def debug_database():
    """Debug endpoint to check rewards database state"""
    try:
        db_file = "rewards_db.json"
        
        # Check if file exists
        file_exists = os.path.exists(db_file)
        
        # Try to read the file
        db_content = None
        file_size = 0
        user_count = 0
        
        if file_exists:
            file_size = os.path.getsize(db_file)
            try:
                with open(db_file, 'r') as f:
                    db_content = json.load(f)
                    user_count = len(db_content) if isinstance(db_content, dict) else 0
            except Exception as e:
                db_content = f"Error reading: {str(e)}"
        
        return {
            "file_exists": file_exists,
            "file_size_bytes": file_size,
            "user_count": user_count,
            "working_directory": os.getcwd(),
            "db_sample": db_content if isinstance(db_content, dict) else str(db_content)[:500]
        }
    except Exception as e:
        return {
            "error": str(e),
            "working_directory": os.getcwd()
        }
