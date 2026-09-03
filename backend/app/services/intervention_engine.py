"""
Intervention & overdraft engines.
Evaluates in responsible hierarchy: spending → restructure → overdraft → loan.
"""
from datetime import date, timedelta, datetime
from app.config import get_settings
from app.services.financial_engine import calculate_overdraft_cost


# ─── Overdraft ────────────────────────────────────────────────────────────────

def evaluate_overdraft(customer: dict, required_amount: float, repayment_date: str) -> dict:
    settings = get_settings()

    try:
        rep_date  = date.fromisoformat(repayment_date)
    except ValueError:
        rep_date  = date.today() + timedelta(days=25)

    duration_days = max((rep_date - date.today()).days, 1)

    checks = {
        "minimum_income_met":    customer["monthly_income"] >= settings.OVERDRAFT_MIN_INCOME,
        "within_limit":          required_amount <= settings.OVERDRAFT_MAX_AMOUNT,
        "positive_amount":       required_amount > 0,
        "reasonable_duration":   duration_days <= 31,
    }
    eligible = all(checks.values())

    costs = calculate_overdraft_cost(
        required_amount,
        duration_days,
        settings.OVERDRAFT_DAILY_RATE,
        settings.OVERDRAFT_PROCESSING_FEE,
    )

    return {
        "eligible":               eligible,
        "required_amount":        required_amount,
        "approved_amount":        required_amount if eligible else 0.0,
        "duration_days":          duration_days,
        "daily_interest_rate":    settings.OVERDRAFT_DAILY_RATE,
        "processing_fee":         settings.OVERDRAFT_PROCESSING_FEE,
        "total_interest":         costs["total_interest"],
        "total_repayment":        costs["total_repayment"],
        "expected_repayment_date": rep_date.isoformat(),
        "expected_income_date":   rep_date.isoformat(),
        "eligibility_check":      checks,
        "impact": {
            "monthly_cost":         costs["total_repayment"],
            "impact_on_risk_score": -1.5 if eligible else 0.0,
        },
    }


# ─── Intervention evaluator ──────────────────────────────────────────────────

def evaluate_interventions(customer: dict, risk_score: float, forecast: dict) -> list[dict]:
    """
    Returns a list of intervention dicts following the responsible hierarchy.
    Always evaluates non-credit options first.
    """
    now        = datetime.utcnow()
    settings   = get_settings()
    results    = []
    income     = customer["monthly_income"]
    expenses   = customer["monthly_expenses"]
    emi        = customer["total_emi"]
    balance    = customer["current_balance"]

    discretionary = expenses - (income * 0.50)   # rough essential = 50% of income

    # ── Level 1: Spending adjustment ─────────────────────────────────────────
    if discretionary > 0:
        potential = round(min(discretionary * 0.3, income * 0.08), 0)
        results.append({
            "id":                  "int-auto-1",
            "intervention_type":   "spending_adjustment",
            "trigger_reason":      f"Discretionary spending is ₹{discretionary:,.0f}/month above essential baseline",
            "trigger_score":       risk_score,
            "recommendation_text": (
                f"Reducing dining, entertainment and shopping by ₹{potential:,.0f}/month "
                f"would rebuild your cash buffer and improve your resilience score within 60 days."
            ),
            "expected_impact":     f"+3-5 resilience points over 60 days",
            "status":              "pending",
            "priority":            "high",
            "recommended_date":    now.isoformat() + "Z",
            "expiry_date":         (now + timedelta(days=14)).isoformat() + "Z",
            "metadata":            {"potential_saving": potential},
        })

    # ── Level 2: Repayment restructuring ─────────────────────────────────────
    emi_ratio = emi / income if income > 0 else 0
    if emi_ratio > 0.30:
        results.append({
            "id":                  "int-auto-2",
            "intervention_type":   "repayment_restructure",
            "trigger_reason":      f"EMI-to-income ratio is {emi_ratio*100:.0f}% — approaching the 40% threshold",
            "trigger_score":       risk_score,
            "recommendation_text": (
                "Extending your personal loan tenure can reduce your monthly EMI and give "
                "you more breathing room. Contact your lender to explore restructuring options."
            ),
            "expected_impact":     "Reduces monthly EMI burden, frees up cash flow",
            "status":              "pending",
            "priority":            "medium",
            "recommended_date":    now.isoformat() + "Z",
            "expiry_date":         (now + timedelta(days=30)).isoformat() + "Z",
            "metadata":            {"current_emi_ratio": round(emi_ratio, 4)},
        })

    # ── Level 3: Overdraft for liquidity gap ─────────────────────────────────
    alerts = forecast.get("summary", {}).get("low_balance_alerts", [])
    if alerts and balance < income * 0.3:
        gap_amount = round(abs(min(0.0, alerts[0]["projected_balance"])) + 10000, -3)
        next_salary_date = (date.today().replace(day=1) + timedelta(days=32)).replace(day=1)
        results.append({
            "id":                  "int-auto-3",
            "intervention_type":   "overdraft",
            "trigger_reason":      f"Balance projected to fall to ₹{alerts[0]['projected_balance']:,.0f} on {alerts[0]['date']}",
            "trigger_score":       risk_score,
            "recommendation_text": (
                f"A short-term overdraft of ₹{gap_amount:,.0f} can bridge the cash gap "
                f"until your next salary on {next_salary_date.isoformat()}. "
                "This prevents any missed payments or defaults."
            ),
            "expected_impact":     "Prevents payment default, protects credit score",
            "status":              "pending",
            "priority":            "critical",
            "recommended_date":    now.isoformat() + "Z",
            "expiry_date":         (now + timedelta(days=7)).isoformat() + "Z",
            "metadata": {
                "required_amount":        gap_amount,
                "expected_salary_date":   next_salary_date.isoformat(),
            },
        })

    return results
