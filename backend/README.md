# CarbonX Backend (FastAPI)

## Quickstart

1. Create and activate a venv (recommended)
2. Install dependencies
3. Run the server

### Windows PowerShell
```powershell
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at http://127.0.0.1:8000

- POST /api/auth/login
- POST /api/auth/signup
- GET  /api/credits/price
- POST /api/credits/trade
