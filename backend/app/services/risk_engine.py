"""
Risk scoring engine.
Explainable, deterministic, no black-box ML for the core score.
"""
import statistics
from datetime import date, datetime
from app.config import get_settings
from app.services.financial_engine import (
    debt_to_income, emi_to_income, emergency_fund_months
)


# ─── Individual factor scorers (each returns 0-100) ─────────────────────────

def _income_stability_score(income_history: list[float]) -> tuple[float, list[dict]]:
    """Low variance = high score."""
    explanations = []
    if len(income_history) < 2:
        return 50.0, [{"factor": "income_stability", "impact": "low",
                        "description": "Insufficient income history — defaulting to neutral score"}]

    mean = statistics.mean(income_history)
    if mean == 0:
        return 0.0, []

    cv = statistics.stdev(income_history) / mean   # coefficient of variation

    if cv <= 0.05:
        score = 100.0
    elif cv >= 0.30:
        score = 0.0
    else:
        score = round(100 - ((cv - 0.05) / 0.25) * 100, 2)

    if cv > 0.15:
        explanations.append({
            "factor": "income_stability",
            "impact": "high" if cv > 0.25 else "medium",
            "description": f"Income varies by {cv*100:.0f}% month-to-month — inconsistent income increases risk",
        })
    return score, explanations


def _liquidity_score(
    current_balance: float, monthly_expenses: float, min_safe_balance: float
) -> tuple[float, list[dict]]:
    """More months of cover = higher score. Target: 6 months."""
    explanations = []
    months = emergency_fund_months(current_balance, monthly_expenses)

    if months >= 6:
        score = 100.0
    elif months <= 0:
        score = 0.0
    else:
        score = round((months / 6) * 100, 2)

    if months < 3:
        explanations.append({
            "factor": "liquidity",
            "impact": "high" if months < 1 else "medium",
            "description": f"Emergency fund covers only {months:.1f} months — recommended minimum is 3 months",
        })
    if current_balance < min_safe_balance:
        explanations.append({
            "factor": "liquidity",
            "impact": "high",
            "description": f"Current balance ₹{current_balance:,.0f} is below the safe threshold of ₹{min_safe_balance:,.0f}",
        })
    return score, explanations


def _debt_burden_score(
    total_debt: float, monthly_income: float, total_emi: float
) -> tuple[float, list[dict]]:
    """Lower DTI and EMI ratio = higher score."""
    explanations = []
    dti = debt_to_income(total_debt, monthly_income)
    etr = emi_to_income(total_emi, monthly_income)

    # DTI: ideal <2, critical >5
    dti_score = 100 if dti <= 2 else (0 if dti >= 5 else round(100 - ((dti - 2) / 3) * 100, 2))
    # EMI ratio: ideal <30%, critical >50%
    etr_score = 100 if etr <= 0.30 else (0 if etr >= 0.50 else round(100 - ((etr - 0.30) / 0.20) * 100, 2))

    score = round(dti_score * 0.6 + etr_score * 0.4, 2)

    if dti > 3.5:
        explanations.append({
            "factor": "debt_burden",
            "impact": "high" if dti > 5 else "medium",
            "description": f"Debt-to-income ratio is {dti:.1f}x — above the healthy threshold of 2.0x",
        })
    if etr > 0.35:
        explanations.append({
            "factor": "debt_burden",
            "impact": "high" if etr > 0.45 else "medium",
            "description": f"EMI burden is {etr*100:.0f}% of monthly income — approaching the 40% warning threshold",
        })
    return score, explanations


def _payment_behavior_score(
    total_payments: int, on_time: int, late: int, missed: int
) -> tuple[float, list[dict]]:
    """Perfect payment history = 100."""
    explanations = []
    if total_payments == 0:
        return 100.0, []

    base = (on_time / total_payments) * 100
    score = max(0.0, round(base - (late * 5) - (missed * 15), 2))

    if late > 0 or missed > 0:
        explanations.append({
            "factor": "payment_behavior",
            "impact": "high" if missed > 1 else "medium",
            "description": f"{late} late and {missed} missed payment(s) in the last 12 months",
        })
    return score, explanations


def _credit_utilization_score(
    total_credit: float, credit_used: float
) -> tuple[float, list[dict]]:
    """Lower utilisation = higher score. Ideal <30%, critical >80%."""
    explanations = []
    if total_credit <= 0:
        return 100.0, []

    util = credit_used / total_credit

    if util <= 0.30:
        score = 100.0
    elif util >= 0.80:
        score = 0.0
    else:
        score = round(100 - ((util - 0.30) / 0.50) * 100, 2)

    if util > 0.50:
        explanations.append({
            "factor": "credit_utilization",
            "impact": "high" if util > 0.70 else "medium",
            "description": f"Credit utilisation is {util*100:.0f}% — above the recommended 30%",
        })
    return score, explanations


# ─── Composite score ─────────────────────────────────────────────────────────

def calculate_risk_score(customer_data: dict, transactions: list[dict]) -> dict:
    settings = get_settings()

    # Build last-6-months income history
    income_history = sorted(
        [t["amount"] for t in transactions if t["category"] == "salary"],
        reverse=False,
    )[-6:]

    income    = customer_data["monthly_income"]
    balance   = customer_data["current_balance"]
    expenses  = customer_data["monthly_expenses"]
    debt      = customer_data["total_debt"]
    emi       = customer_data["total_emi"]

    # Approximate credit totals from loan data
    total_credit = debt * 1.2
    credit_used  = debt

    inc_score,  inc_expl  = _income_stability_score(income_history)
    liq_score,  liq_expl  = _liquidity_score(balance, expenses, settings.MIN_SAFE_BALANCE)
    dbt_score,  dbt_expl  = _debt_burden_score(debt, income, emi)
    pay_score,  pay_expl  = _payment_behavior_score(total_payments=24, on_time=22, late=1, missed=1)
    crd_score,  crd_expl  = _credit_utilization_score(total_credit, credit_used)

    weights = {
        "income_stability":   settings.RISK_WEIGHT_INCOME_STABILITY,
        "liquidity":          settings.RISK_WEIGHT_LIQUIDITY,
        "debt_burden":        settings.RISK_WEIGHT_DEBT_BURDEN,
        "payment_behavior":   settings.RISK_WEIGHT_PAYMENT_BEHAVIOR,
        "credit_utilization": settings.RISK_WEIGHT_CREDIT_UTILIZATION,
    }

    composite = round(
        inc_score * weights["income_stability"] +
        liq_score * weights["liquidity"] +
        dbt_score * weights["debt_burden"] +
        pay_score * weights["payment_behavior"] +
        crd_score * weights["credit_utilization"],
        2,
    )

    if composite >= 71:
        category = "healthy"
    elif composite >= 51:
        category = "watch"
    elif composite >= 31:
        category = "at_risk"
    else:
        category = "critical"

    all_explanations = inc_expl + liq_expl + dbt_expl + pay_expl + crd_expl

    return {
        "assessment_date": datetime.utcnow().isoformat() + "Z",
        "risk_score": composite,
        "risk_category": category,
        "previous_score": round(composite + 3.5, 2),
        "score_change": -3.5,
        "trend": "declining",
        "factors": {
            "income_stability_score": inc_score,
            "liquidity_score": liq_score,
            "debt_burden_score": dbt_score,
            "payment_behavior_score": pay_score,
            "credit_utilization_score": crd_score,
        },
        "weights": weights,
        "risk_factors": all_explanations,
        "ml_distress_probability": 0.34,
    }


def get_risk_history() -> list[dict]:
    """Synthetic 6-month score history for the demo customer."""
    today = date.today()
    base_scores = [72.0, 71.5, 70.0, 68.0, 65.5, 63.5]
    categories  = ["healthy","healthy","watch","watch","watch","watch"]
    result = []
    for i, (score, cat) in enumerate(zip(base_scores, categories)):
        d = date(today.year, today.month, 1)
        month_offset = 5 - i
        year = d.year
        month = d.month - month_offset
        while month <= 0:
            month += 12
            year -= 1
        result.append({
            "assessment_date": date(year, month, 1).isoformat(),
            "risk_score": score,
            "risk_category": cat,
        })
    return result
