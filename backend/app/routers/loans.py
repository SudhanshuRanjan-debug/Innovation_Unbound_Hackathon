from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.data import CUSTOMERS, LOANS, get_transactions
from app.services.risk_engine import calculate_risk_score
from app.services.loan_engine import compare_loans

# customer-scoped router  →  mounted under /api/v1/customers
customer_router = APIRouter()

# top-level router  →  mounted under /api/v1
root_router = APIRouter()


class LoanCompareRequest(BaseModel):
    customer_id: str
    loan_amount: float
    tenure_months: int
    loan_type: str = "personal"


@customer_router.get("/{customer_id}/loans")
def get_loans(customer_id: str):
    if customer_id not in CUSTOMERS:
        raise HTTPException(404, "Customer not found")
    return {"success": True, "data": LOANS.get(customer_id, [])}


@root_router.post("/loans/compare")
def compare_loan_products(req: LoanCompareRequest):
    c = CUSTOMERS.get(req.customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")

    txns          = get_transactions(req.customer_id)
    risk          = calculate_risk_score(c, txns)
    current_score = risk["risk_score"]

    result = compare_loans(
        loan_amount=req.loan_amount,
        tenure_months=req.tenure_months,
        loan_type=req.loan_type,
        customer=c,
        current_risk_score=current_score,
    )
    return {"success": True, "data": result}
