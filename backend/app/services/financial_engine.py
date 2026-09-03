"""
Financial calculation engine.
All money calculations are deterministic — no AI, no rounding surprises.
"""
import math
from typing import Any


# ─── EMI ─────────────────────────────────────────────────────────────────────

def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """Standard reducing-balance EMI formula."""
    if principal <= 0 or tenure_months <= 0:
        raise ValueError("Principal and tenure must be positive")
    if annual_rate < 0:
        raise ValueError("Interest rate cannot be negative")

    if annual_rate == 0:
        return round(principal / tenure_months, 2)

    r = (annual_rate / 12) / 100
    emi = principal * r * math.pow(1 + r, tenure_months) / (math.pow(1 + r, tenure_months) - 1)
    return round(emi, 2)


def calculate_total_interest(principal: float, emi: float, tenure_months: int) -> float:
    return round(emi * tenure_months - principal, 2)


def generate_amortization_schedule(
    principal: float, annual_rate: float, tenure_months: int
) -> list[dict[str, Any]]:
    emi = calculate_emi(principal, annual_rate, tenure_months)
    r = (annual_rate / 12) / 100
    balance = principal
    schedule = []

    for month in range(1, tenure_months + 1):
        interest = round(balance * r, 2)
        principal_part = round(emi - interest, 2)

        if month == tenure_months:
            principal_part = round(balance, 2)
            balance = 0.0
        else:
            balance = round(balance - principal_part, 2)

        schedule.append({
            "month": month,
            "emi": emi,
            "principal": principal_part,
            "interest": interest,
            "balance": balance,
        })

    return schedule


# ─── Financial ratios ────────────────────────────────────────────────────────

def debt_to_income(total_debt: float, monthly_income: float) -> float:
    if monthly_income <= 0:
        return 0.0
    return round(total_debt / monthly_income, 2)


def emi_to_income(total_emi: float, monthly_income: float) -> float:
    if monthly_income <= 0:
        return 0.0
    return round(total_emi / monthly_income, 4)


def savings_rate(monthly_income: float, monthly_expenses: float) -> float:
    if monthly_income <= 0:
        return 0.0
    return round((monthly_income - monthly_expenses) / monthly_income, 4)


def emergency_fund_months(current_balance: float, monthly_expenses: float) -> float:
    if monthly_expenses <= 0:
        return 0.0
    return round(current_balance / monthly_expenses, 2)


# ─── Overdraft cost ──────────────────────────────────────────────────────────

def calculate_overdraft_cost(
    amount: float, duration_days: int,
    daily_rate: float = 0.0005, processing_fee: float = 100.0
) -> dict[str, float]:
    interest = round(amount * daily_rate * duration_days, 2)
    total = round(amount + interest + processing_fee, 2)
    return {
        "principal": amount,
        "duration_days": duration_days,
        "daily_interest_rate": daily_rate,
        "total_interest": interest,
        "processing_fee": processing_fee,
        "total_repayment": total,
    }
