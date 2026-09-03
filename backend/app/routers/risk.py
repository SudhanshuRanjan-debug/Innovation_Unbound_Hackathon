from fastapi import APIRouter, HTTPException
from app.data import CUSTOMERS, get_transactions
from app.services.risk_engine import calculate_risk_score, get_risk_history

router = APIRouter()


@router.get("/{customer_id}/risk/score")
def get_risk_score(customer_id: str):
    c = CUSTOMERS.get(customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")

    txns   = get_transactions(customer_id)
    result = calculate_risk_score(c, txns)
    return {"success": True, "data": result}


@router.get("/{customer_id}/risk/history")
def get_risk_score_history(customer_id: str, days: int = 180):
    if customer_id not in CUSTOMERS:
        raise HTTPException(404, "Customer not found")

    return {"success": True, "data": get_risk_history()}
