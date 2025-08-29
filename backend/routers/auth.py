from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    # Dummy login for now
    if req.email and req.password:
        return {"token": "demo-jwt-token", "user": {"email": req.email}}
    raise HTTPException(status_code=400, detail="Invalid credentials")

@router.post("/signup")
def signup(req: SignupRequest):
    # Dummy signup for now
    return {"message": "User created", "user": {"name": req.name, "email": req.email}}
