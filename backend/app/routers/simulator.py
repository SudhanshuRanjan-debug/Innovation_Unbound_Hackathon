from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.data import CUSTOMERS, get_transactions
from app.services.financial_engine import (
    calculate_emi, calculate_total_interest, generate_amortization_schedule
)
from app.services.risk_engine import calculate_risk_score

router = APIRouter()


class LoanSimRequest(BaseModel):
    customer_id: str
    loan_amount: float
    interest_rate: float
    tenure_months: int
    processing_fee: float = 0.0


class EMIRequest(BaseModel):
    principal: float
    interest_rate: float
    tenure_months: int


@router.post("/simulator/loan")
def simulate_loan(req: LoanSimRequest):
    c = CUSTOMERS.get(req.customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")

    txns  = get_transactions(req.customer_id)
    risk  = calculate_risk_score(c, txns)

    emi         = calculate_emi(req.loan_amount, req.interest_rate, req.tenure_months)
    total_int   = calculate_total_interest(req.loan_amount, emi, req.tenure_months)
    total_rep   = round(emi * req.tenure_months, 2)
    total_cost  = round(total_rep + req.processing_fee, 2)

    income      = c["monthly_income"]
    expenses    = c["monthly_expenses"]
    current_emi = c["total_emi"]

    current_surplus    = round(income - expenses - current_emi, 2)
    new_total_emi      = round(current_emi + emi, 2)
    new_emi_ratio      = round(new_total_emi / income, 4) if income else 0
    new_surplus        = round(income - expenses - new_total_emi, 2)

    # Risk impact: each % above 30% costs ~8 points
    current_ratio       = round(current_emi / income, 4) if income else 0
    risk_delta          = max(0, (new_emi_ratio - 0.30) * 80)
    projected_score     = round(max(0, risk["risk_score"] - risk_delta), 2)

    if new_emi_ratio <= 0.30:
        affordability = "comfortable"
    elif new_emi_ratio <= 0.40:
        affordability = "acceptable"
    elif new_emi_ratio <= 0.50:
        affordability = "risky"
    else:
        affordability = "unaffordable"

    recommendations = {
        "comfortable": "This loan fits comfortably within your budget.",
        "acceptable":  "Manageable, but leaves limited room for unexpected expenses.",
        "risky":       "This will stretch your budget. Consider a smaller amount or longer tenure.",
        "unaffordable": "This loan would significantly strain your finances. Consider reducing the amount or extending the tenure.",
    }

    return {
        "success": True,
        "data": {
            "simulation_id": f"sim-{req.customer_id}-{int(req.loan_amount)}",
            "inputs": {
                "loan_amount":    req.loan_amount,
                "interest_rate":  req.interest_rate,
                "tenure_months":  req.tenure_months,
                "processing_fee": req.processing_fee,
            },
            "calculations": {
                "emi":            emi,
                "total_interest": total_int,
                "total_repayment": total_rep,
                "total_cost":     total_cost,
            },
            "current_state": {
                "monthly_income":      income,
                "total_emi":           current_emi,
                "emi_to_income_ratio": current_ratio,
                "risk_score":          risk["risk_score"],
                "monthly_surplus":     current_surplus,
            },
            "projected_state": {
                "total_emi":           new_total_emi,
                "emi_to_income_ratio": new_emi_ratio,
                "risk_score":          projected_score,
                "monthly_surplus":     new_surplus,
            },
            "impact": {
                "emi_increase":      emi,
                "risk_score_change": round(projected_score - risk["risk_score"], 2),
                "surplus_change":    round(new_surplus - current_surplus, 2),
                "affordability":     affordability,
                "recommendation":    recommendations[affordability],
            },
        },
    }


@router.post("/simulator/emi")
def simulate_emi(req: EMIRequest):
    emi       = calculate_emi(req.principal, req.interest_rate, req.tenure_months)
    total_int = calculate_total_interest(req.principal, emi, req.tenure_months)
    schedule  = generate_amortization_schedule(req.principal, req.interest_rate, req.tenure_months)
    return {
        "success": True,
        "data": {
            "emi":             emi,
            "total_interest":  total_int,
            "total_repayment": round(emi * req.tenure_months, 2),
            "amortization_schedule": schedule,
        },
    }
