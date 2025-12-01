from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import auth, credits, rewards
import os
import json
from datetime import datetime
import logging

# Basic logger
logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="CarbonX Backend", version="0.1.0")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://carbonx-future.vercel.app",  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(credits.router, prefix="/api/credits", tags=["credits"])
app.include_router(rewards.router, prefix="/api/rewards", tags=["rewards"])


@app.get("/")
def root():
    return {"status": "ok", "service": "carbonx-backend"}


@app.get("/api/debug/db")
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
                with open(db_file, "r", encoding="utf-8") as f:
                    db_content = json.load(f)
                    user_count = len(db_content) if isinstance(db_content, dict) else 0
            except Exception as e:
                db_content = f"Error reading: {str(e)}"

        return {
            "file_exists": file_exists,
            "file_size_bytes": file_size,
            "user_count": user_count,
            "working_directory": os.getcwd(),
            "db_sample": db_content if isinstance(db_content, dict) else str(db_content)[:500],
        }
    except Exception as e:
        logger.exception("Error in debug_database")
        return {"error": str(e), "working_directory": os.getcwd()}


# -------------------------
# Health & Readiness probes
# -------------------------
@app.get("/health", summary="Liveness probe")
def health():
    """
    Liveness probe. Return 200 when the process is alive.
    """
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.get("/ready", summary="Readiness probe")
def ready():
    """
    Readiness probe. Attempts quick checks of critical dependencies.
    Current implementation checks the presence/readability of `rewards_db.json`.
    Replace or extend these checks as needed (DB, cache, external services).
    """
    checks = {"rewards_db": {"ok": False, "reason": None}}

    # Check rewards_db.json
    db_file = "rewards_db.json"
    try:
        if not os.path.exists(db_file):
            checks["rewards_db"]["ok"] = False
            checks["rewards_db"]["reason"] = "file_not_found"
        else:
            # try reading and parsing
            try:
                with open(db_file, "r", encoding="utf-8") as f:
                    _ = json.load(f)
                checks["rewards_db"]["ok"] = True
                checks["rewards_db"]["reason"] = None
            except Exception as e:
                checks["rewards_db"]["ok"] = False
                checks["rewards_db"]["reason"] = f"read_error: {str(e)[:200]}"
    except Exception as e:
        # Any unexpected error
        logger.exception("Error while running readiness check")
        checks["rewards_db"]["ok"] = False
        checks["rewards_db"]["reason"] = f"unexpected_error: {str(e)[:200]}"

    # decide overall readiness
    all_ok = all(item["ok"] for item in checks.values())

    body = {"status": "ready" if all_ok else "not_ready", "checks": checks, "timestamp": datetime.utcnow().isoformat() + "Z"}

    if all_ok:
        return body
    else:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=body)
