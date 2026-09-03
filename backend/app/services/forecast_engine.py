"""
Cash-flow forecasting engine.
Detects recurring patterns from transaction history and projects
daily balance for the requested number of days.
"""
from datetime import date, timedelta
from collections import defaultdict
import statistics


MIN_SAFE_BALANCE = 5000.0


# ─── Pattern detection ───────────────────────────────────────────────────────

def _detect_income_pattern(transactions: list[dict]) -> dict:
    salary_txns = [t for t in transactions if t.get("category") == "salary"]
    if not salary_txns:
        return {"average_amount": 0, "typical_day": 1}

    amounts = [t["amount"] for t in salary_txns]
    days    = [int(t["transaction_date"][8:10]) for t in salary_txns]

    return {
        "average_amount": round(statistics.mean(amounts), 2),
        "typical_day":    sorted(days, key=lambda d: days.count(d), reverse=True)[0],
    }


def _detect_recurring_expenses(transactions: list[dict]) -> list[dict]:
    """Groups debits by category, finds those appearing 2+ months."""
    by_category: dict[str, list[dict]] = defaultdict(list)
    for t in transactions:
        if t["transaction_type"] == "debit":
            by_category[t["category"]].append(t)

    patterns = []
    for cat, txns in by_category.items():
        if len(txns) < 2:
            continue
        amounts = [t["amount"] for t in txns]
        days    = [int(t["transaction_date"][8:10]) for t in txns]
        typical_day = sorted(days, key=lambda d: days.count(d), reverse=True)[0]
        patterns.append({
            "category":      cat,
            "average_amount": round(statistics.mean(amounts), 2),
            "typical_day":   typical_day,
            "is_recurring":  txns[0].get("is_recurring", False),
        })
    return patterns


def _daily_discretionary(transactions: list[dict]) -> float:
    """Average daily non-recurring debit spend."""
    non_rec = [t["amount"] for t in transactions
               if t["transaction_type"] == "debit" and not t.get("is_recurring")]
    if not non_rec:
        return 0.0
    return round(sum(non_rec) / 180, 2)   # spread over 6-month window


# ─── Projection ──────────────────────────────────────────────────────────────

def project_cash_flow(
    current_balance: float,
    transactions: list[dict],
    days: int = 90,
) -> dict:
    income_pattern    = _detect_income_pattern(transactions)
    expense_patterns  = _detect_recurring_expenses(transactions)
    daily_disc        = _daily_discretionary(transactions)

    today      = date.today()
    balance    = current_balance
    projections: list[dict] = []
    alerts:      list[dict] = []

    for offset in range(days):
        d        = today + timedelta(days=offset)
        inflows  = 0.0
        outflows = daily_disc
        notes    = []

        # Salary
        if d.day == income_pattern["typical_day"] and income_pattern["average_amount"] > 0:
            inflows += income_pattern["average_amount"]
            notes.append("Salary credit")

        # Recurring expenses
        for pattern in expense_patterns:
            if d.day == pattern["typical_day"] and pattern["is_recurring"]:
                outflows += pattern["average_amount"]
                notes.append(pattern["category"].title())

        balance = round(balance + inflows - outflows, 2)

        projections.append({
            "date":               d.isoformat(),
            "projected_balance":  balance,
            "inflows":            round(inflows, 2),
            "outflows":           round(outflows, 2),
            "notes":              ", ".join(notes) if notes else None,
        })

        if balance < MIN_SAFE_BALANCE:
            alerts.append({
                "date":               d.isoformat(),
                "projected_balance":  balance,
                "reason": (
                    f"After {', '.join(notes)}" if notes
                    else "Cumulative daily expenses deplete buffer"
                ),
            })

    all_balances = [p["projected_balance"] for p in projections]
    min_balance  = min(all_balances)
    min_date     = projections[all_balances.index(min_balance)]["date"]

    return {
        "forecast_generated_at": today.isoformat() + "T00:00:00Z",
        "forecast_period": {
            "start_date": (today + timedelta(days=1)).isoformat(),
            "end_date":   (today + timedelta(days=days)).isoformat(),
        },
        "current_balance": current_balance,
        "daily_projections": projections,
        "summary": {
            "minimum_balance":       min_balance,
            "minimum_balance_date":  min_date,
            "average_balance":       round(sum(all_balances) / len(all_balances), 2),
            "negative_balance_days": sum(1 for b in all_balances if b < 0),
            "low_balance_alerts":    alerts,
        },
        "confidence_level": "high" if len(transactions) >= 60 else "medium",
    }
