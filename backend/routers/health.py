# backend/routes/health.py
from datetime import datetime
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/health", summary="Liveness probe")
def health():
    """
    Simple liveness probe. Returns 200 if process is up.
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/ready", summary="Readiness probe")
async def ready():
    """
    Readiness probe. Replace the stub with real checks like DB ping.
    Returns 200 when dependencies look OK, otherwise 503.
    """
    # TODO: Replace this stub with real checks (DB, cache, other services)
    dependencies_ok = True

    if dependencies_ok:
        return {"status": "ready"}
    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        content={"status": "not_ready"})
