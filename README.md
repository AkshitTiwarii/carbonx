
# CarbonX - AI-Powered Carbon Credits Platform

CarbonX is a Next.js-based platform for trading carbon credits with AI-powered calculations and portfolio management. Built with [thirdweb](https://thirdweb.com/) and [Next.js](https://nextjs.org/).

## Features

- 🤖 **AI Carbon Calculator**: Get instant, AI-powered carbon credit calculations using Google Gemini AI
- 💱 **Trading Platform**: Trade carbon credits with real-time market data
- 📊 **Portfolio Management**: Track and manage your carbon credit investments
- 🌱 **Sustainable Alternatives**: Discover eco-friendly alternatives for various industries
- 📱 **Event Planner**: Plan sustainable events with carbon footprint tracking
- 🌊 **Plastic Tracker**: Visualize and track plastic waste footprint

## Installation

Install the template using [thirdweb create](https://portal.thirdweb.com/cli/create)

```bash
  npx thirdweb create app --next
```

Or clone directly:
```bash
git clone <your-repo-url>
cd carbonx
npm install
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

```env
# Gemini AI API Key (Required for AI Calculator)
GEMINI_API_KEY=your_gemini_api_key_here

# ThirdWeb Client ID (Required for Web3 features)
CLIENT_ID=your_thirdweb_client_id

# NextAuth URL (Optional, for authentication)
NEXTAUTH_URL=http://localhost:3000
```

### Setting up Gemini AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file as `GEMINI_API_KEY=your_api_key_here`

To learn how to create a thirdweb client ID, refer to the [client documentation](https://portal.thirdweb.com/typescript/v5/client). 

## Run locally

Install dependencies

```bash
yarn
```

Start development server

```bash
yarn dev
```

Create a production build

```bash
yarn build
```

Preview the production build

```bash
yarn start
```

## Resources

- [Documentation](https://portal.thirdweb.com/typescript/v5)
- [Templates](https://thirdweb.com/templates)
- [YouTube](https://www.youtube.com/c/thirdweb)
- [Blog](https://blog.thirdweb.com)

## Need help?

For help or feedback, please [visit our support site](https://thirdweb.com/support)

---

# CarbonX Full-Stack Extensions

This project has been extended with:

- `backend/` — FastAPI server with auth and trading endpoints
- `smart_contracts/` — Hardhat workspace with a CarbonCreditToken ERC-20
- Frontend pages: `/login`, `/signup`, `/dashboard`

## Run Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Run Frontend (Next.js)

```powershell
npm install
npm run dev
```

Set environment variables in `.env`:

```
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=YOUR_THIRDWEB_CLIENT_ID
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
# Optional: server-only thirdweb key (do NOT prefix with NEXT_PUBLIC)
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
```

## Run Contracts (Hardhat)

```powershell
cd smart_contracts
npm install
npm run build
npm run node
# in another terminal
npm run deploy
```

Copy the deployed address into the Dashboard Token panel to interact (mint/test).

## Troubleshooting Dashboard API

The Dashboard calls the FastAPI backend on `NEXT_PUBLIC_API_BASE` (default: `http://127.0.0.1:8000`). If you see errors near `apiGet`/`fetch`:

1. Ensure the backend is running on port 8000 (see "Run Backend").
2. If you changed the port, set the env var before starting Next:

```powershell
$env:NEXT_PUBLIC_API_BASE = "http://127.0.0.1:8001"; npm run dev
```

3. The API helper has an 8s timeout and improved error messages to help identify connection issues.

## Engine-based ERC1155 Mint (Server)

Environment variables for Engine (set in `.env` or your host env):

```
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
# Optional: Engine base URL (defaults to https://api.thirdweb.com/v1/transactions)
THIRDWEB_ENGINE_URL=https://api.thirdweb.com/v1/transactions
# Required if you don't provide `from` in API requests
THIRDWEB_SERVER_WALLET=0xYourServerWalletAddress
```

New API routes (Next.js App Router):

- POST `/api/engine/erc1155/claim`
  - Body (default signature): `{ chainId, contractAddress, to, tokenId, quantity, from? }`
  - Or custom: `{ chainId, contractAddress, method, params, from? }`
  - Returns Engine transaction object (e.g., `{ id, status, ... }`).

- GET `/api/engine/tx?id=...`
  - Fetch a transaction by id to check status/hash.

PowerShell example to enqueue a mint:

```powershell
$body = @{ chainId = "137"; contractAddress = "0x..."; to = "0x..."; tokenId = 0; quantity = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/engine/erc1155/claim -ContentType application/json -Body $body
```
