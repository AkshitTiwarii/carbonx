# backend/tests/test_health.py
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend folder (the parent of this tests folder) is on sys.path
HERE = os.path.dirname(__file__)             # backend/tests
ROOT = os.path.abspath(os.path.join(HERE, ".."))  # backend
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# Now import the FastAPI app from backend/main.py
try:
    from main import app
except Exception as e:
    # helpful error if import fails
    raise RuntimeError(f"Failed to import 'main.app' — check path. Details: {e}")

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_ready_returns_200_or_503():
    r = client.get("/ready")
    assert r.status_code in (200, 503)
    data = r.json()
    assert "status" in data
    assert "checks" in data
