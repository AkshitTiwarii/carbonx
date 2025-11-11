from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, credits, rewards

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
