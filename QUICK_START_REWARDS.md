# 🚀 Quick Start Guide - CarbonX Rewards System

## Prerequisites
- Node.js 18.x or higher
- Python 3.8 or higher
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
python3 -m pip install -r requirements.txt
cd ..
```

Or use the npm script:
```bash
npm run backend:install
```

### 2. Start the Backend Server

**Option 1: Using npm script (Recommended)**
```bash
npm run backend
```

**Option 2: Using the shell script**
```bash
./start-backend.sh
```

**Option 3: Manual start**
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at: `http://localhost:8000`

✅ You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 3. Start the Frontend Server

**In a NEW terminal window:**
```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000`

✅ You should see:
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

### 4. Access the Rewards System

1. Open your browser and go to: `http://localhost:3000`
2. Navigate to the **Rewards** page: `http://localhost:3000/rewards`
3. The system will automatically:
   - Create a user ID (stored in localStorage)
   - Load your rewards data
   - Display badges and leaderboard

## 🎮 How to Earn Rewards

### Using Calculators
1. Go to any calculator page (Carbon Calculator, Water Calculator, etc.)
2. Use the calculator
3. Points are automatically awarded!

### Action Types & Points
- **Calculator Use**: 10 points
- **Water Calculation**: 15 points
- **Plastic Calculation**: 15 points
- **AI Tool Use**: 20 points
- **Carbon Offset**: 50 points per ton
- **Investment**: 30 points per investment

## 📊 Features

### Rewards Page (`/rewards`)
- **EcoPoints Summary**: See your total points and rank
- **Badge Collection**: View earned and available badges
- **Leaderboard**: See top users
- **Auto-refresh**: Updates every 15 seconds
- **Real-time Updates**: Notifications when you earn points

### Backend Status
- A status indicator shows if the backend is online/offline
- If offline, you'll see instructions to start it

## 🔧 Troubleshooting

### Backend Not Starting

**Issue: Port 8000 already in use**

This usually means the backend is already running! Check if it's working:
```bash
curl http://localhost:8000/
# Should return: {"status":"ok","service":"carbonx-backend"}
```

If it's working, you don't need to start it again. Just start the frontend!

If you need to restart the backend:
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Then start it again
npm run backend
```

Or use a different port:
```bash
cd backend
python3 -m uvicorn main:app --port 8001
# Then update NEXT_PUBLIC_BACKEND_URL in .env.local
```

**Issue: Python dependencies not found**
```bash
cd backend
python3 -m pip install -r requirements.txt
```

**Issue: Module not found errors**
```bash
# Make sure you're in the backend directory
cd backend
python3 -m pip install fastapi uvicorn[standard] pydantic python-multipart
```

### Frontend Not Connecting to Backend

**Check backend is running:**
```bash
curl http://localhost:8000/
# Should return: {"status":"ok","service":"carbonx-backend"}
```

**Check environment variables:**
- Make sure `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` is set (or uses default)

### Rewards Not Updating

1. **Check browser console** for errors
2. **Verify backend is running**: Look for the status indicator on the rewards page
3. **Check user ID**: Open browser DevTools → Application → Local Storage → Look for `carbonx_user_id`
4. **Refresh the page**: Click the refresh button on the rewards page

## 📝 Available Scripts

```bash
# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
npm run backend              # Start backend server
npm run backend:install     # Install backend dependencies
```

## 🎯 Quick Test

Test the rewards system:

1. **Start backend**: `npm run backend`
2. **Start frontend**: `npm run dev` (in another terminal)
3. **Visit**: `http://localhost:3000/rewards`
4. **Use a calculator**: Go to any calculator page and use it
5. **Check rewards**: Go back to `/rewards` - you should see your points!

## 📁 Project Structure

```
carbonx/
├── backend/              # FastAPI backend
│   ├── main.py          # Main server file
│   ├── routers/         # API routes
│   │   └── rewards.py   # Rewards endpoints
│   └── requirements.txt # Python dependencies
├── src/
│   ├── app/
│   │   ├── rewards/     # Rewards page
│   │   └── api/         # Next.js API routes (proxies to backend)
│   ├── components/
│   │   └── rewards/     # Rewards UI components
│   ├── hooks/
│   │   └── useRewards.ts # Rewards hook
│   └── lib/
│       └── rewards.ts   # Rewards utilities
└── package.json         # Node.js dependencies
```

## 🔗 API Endpoints

**Backend (Port 8000):**
- `GET /` - Health check
- `POST /api/rewards/update` - Award points
- `GET /api/rewards/user/{user_id}` - Get user rewards
- `GET /api/rewards/leaderboard` - Get leaderboard
- `GET /api/rewards/badges` - Get badge definitions

**Frontend API Routes (Port 3000):**
- `POST /api/rewards/update` - Proxy to backend
- `GET /api/rewards/user` - Proxy to backend
- `GET /api/rewards/leaderboard` - Proxy to backend
- `GET /api/rewards/badges` - Proxy to backend

## 💡 Tips

1. **Keep both servers running**: Backend and frontend need to run simultaneously
2. **Check the status indicator**: The rewards page shows backend status
3. **User ID persistence**: Your user ID is stored in localStorage, so it persists across sessions
4. **Auto-refresh**: The rewards page auto-refreshes every 15 seconds
5. **Real-time updates**: When you earn points on other pages, the rewards page updates automatically

## 🆘 Need Help?

- Check browser console for errors (F12)
- Check backend terminal for errors
- Verify both servers are running
- Check the backend status indicator on the rewards page

