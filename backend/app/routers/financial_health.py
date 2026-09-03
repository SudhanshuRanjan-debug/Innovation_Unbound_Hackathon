from fastapi import APIRouter, HTTPException
from datetime import date
from app.data import CUSTOMERS, LOANS, get_transactions
from app.services.financial_engine import (
    debt_to_income, emi_to_income, savings_rate, emergency_fund_months,
)

router = APIRouter()


@router.get("/{customer_id}/financial-health")
def get_financial_health(customer_id: str):
    c = CUSTOMERS.get(customer_id)
    if not c:
        raise HTTPException(404, "Customer not found")

    loans      = LOANS.get(customer_id, [])
    total_debt = sum(ln["outstanding_principal"] for ln in loans)
    total_emi  = sum(ln["emi_amount"] for ln in loans)
    income     = c["monthly_income"]
    expenses   = c["monthly_expenses"]
    balance    = c["current_balance"]

    data = {
        "snapshot_date":          date.today().isoformat(),
        "monthly_income":         income,
        "total_balance":          balance,
        "average_balance":        round(balance * 0.9, 2),   # synthetic approximation
        "total_debt":             total_debt,
        "total_emi":              total_emi,
        "debt_to_income_ratio":   debt_to_income(total_debt, income),
        "emi_to_income_ratio":    emi_to_income(total_emi, income),
        "monthly_expenses":       expenses,
        "essential_expenses":     round(expenses * 0.65, 2),
        "discretionary_expenses": round(expenses * 0.35, 2),
        "savings_rate":           savings_rate(income, expenses),
        "emergency_fund_months":  emergency_fund_months(balance, expenses),
    }
    return {"success": True, "data": data}
