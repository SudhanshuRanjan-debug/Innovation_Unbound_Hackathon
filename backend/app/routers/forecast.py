from fastapi import APIRouter, HTTPException
from app.data import CUSTOMERS, get_transactions
from app.services.forecast_engine import project_cash_flow

router = APIRouter()


@router.get("/{customer_id}/forecast")
def get_forecast(customer_id: str, days: int = 90):
    c = CUSTOMERS.get(customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")

    txns   = get_transactions(customer_id)
    result = project_cash_flow(c["current_balance"], txns, days=min(days, 180))
    return {"success": True, "data": result}
