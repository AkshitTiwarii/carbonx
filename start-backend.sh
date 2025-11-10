#!/bin/bash

# Start the CarbonX Backend Server
# This script starts the FastAPI backend server on port 8000

cd "$(dirname "$0")/backend"

echo "🚀 Starting CarbonX Backend Server..."
echo "📍 Backend will be available at http://localhost:8000"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH"
    exit 1
fi

# Check if dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    python3 -m pip install -q -r requirements.txt
fi

# Start the server
echo "✅ Starting server..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

