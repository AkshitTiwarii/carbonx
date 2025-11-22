# 🐳 Docker Setup Guide

## Quick Start

```bash
# Clone and setup
git clone https://github.com/AkshitTiwarii/carbonx.git
cd carbonx
cp .env.example .env.local

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Access application
open http://localhost:3000
```

## Services

- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:8000 (FastAPI)
- **Blockchain**: http://localhost:8545 (Hardhat)

## Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Features

✅ One-command setup  
✅ Hot reload for development  
✅ Multi-service orchestration  
✅ Volume persistence  
✅ Health checks  
✅ Production-ready builds