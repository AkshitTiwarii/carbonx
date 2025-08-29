from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class TradeRequest(BaseModel):
    amount: int
    action: str  # 'buy' or 'sell'

@router.get("/price")
def get_price():
    # Mocked price endpoint
    return {"symbol": "CO2C", "price": 12.34}

@router.post("/trade")
def trade(req: TradeRequest):
    # Mock trade
    return {"status": "filled", "action": req.action, "amount": req.amount}
