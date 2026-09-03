from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date, timedelta
from app.data import CUSTOMERS
from app.services.intervention_engine import evaluate_overdraft

router = APIRouter()


class OverdraftRequest(BaseModel):
    required_amount: float
    expected_repayment_date: str | None = None


@router.post("/{customer_id}/overdraft/calculate")
def calculate_overdraft(customer_id: str, req: OverdraftRequest):
    c = CUSTOMERS.get(customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")

    repayment_date = req.expected_repayment_date or (
        date.today() + timedelta(days=25)
    ).isoformat()

    result = evaluate_overdraft(c, req.required_amount, repayment_date)
    return {"success": True, "data": result}
