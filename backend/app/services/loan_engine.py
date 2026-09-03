"""
Loan comparison engine.
Multi-criteria scoring — best-fit, not just lowest rate.
"""
from app.config import get_settings
from app.services.financial_engine import calculate_emi, calculate_total_interest
from app.data import LOAN_PRODUCTS


# ─── Individual criterion scorers (0-100 each) ───────────────────────────────

def _score_cost(total_cost: float, all_costs: list[float]) -> float:
    lo, hi = min(all_costs), max(all_costs)
    if hi == lo:
        return 100.0
    return round(100 - ((total_cost - lo) / (hi - lo)) * 100, 2)


def _score_affordability(emi_ratio: float) -> float:
    if emi_ratio <= 0.30:
        return 100.0
    if emi_ratio >= 0.50:
        return 0.0
    return round(100 - ((emi_ratio - 0.30) / 0.20) * 100, 2)


def _score_resilience(current_score: float, projected_score: float) -> float:
    drop = current_score - projected_score
    if drop <= 0:
        return 100.0
    if drop >= 15:
        return 0.0
    return round(100 - (drop / 15) * 100, 2)


def _score_tenure(product_tenure: int, requested_tenure: int) -> float:
    diff_pct = abs(product_tenure - requested_tenure) / max(requested_tenure, 1)
    return round(max(0.0, 100 - diff_pct * 200), 2)


def _score_fees(fee_percent: float) -> float:
    if fee_percent <= 0:
        return 100.0
    if fee_percent >= 4.0:
        return 0.0
    return round(100 - (fee_percent / 4.0) * 100, 2)


def _score_flexibility(features: dict) -> float:
    score = 0.0
    if features.get("prepayment_allowed"):  score += 40
    if features.get("flexible_repayment"):  score += 35
    if features.get("top_up_available"):    score += 25
    return score


# ─── Eligibility ─────────────────────────────────────────────────────────────

def _check_eligibility(product: dict, customer: dict, loan_amount: float, tenure_months: int) -> bool:
    if customer["monthly_income"] < (product.get("min_monthly_income") or 0):
        return False
    if loan_amount < product["min_loan_amount"] or loan_amount > product["max_loan_amount"]:
        return False
    if tenure_months < product["min_tenure_months"] or tenure_months > product["max_tenure_months"]:
        return False
    emp = customer.get("employment_status", "employed")
    if product.get("employment_types") and emp not in product["employment_types"]:
        return False
    return True


# ─── Main comparison ─────────────────────────────────────────────────────────

def compare_loans(
    loan_amount: float,
    tenure_months: int,
    loan_type: str,
    customer: dict,
    current_risk_score: float,
) -> dict:
    settings = get_settings()

    weights = {
        "total_cost":    settings.LOAN_WEIGHT_TOTAL_COST,
        "affordability": settings.LOAN_WEIGHT_AFFORDABILITY,
        "resilience":    settings.LOAN_WEIGHT_RESILIENCE,
        "tenure":        settings.LOAN_WEIGHT_TENURE,
        "fees":          settings.LOAN_WEIGHT_FEES,
        "flexibility":   settings.LOAN_WEIGHT_FLEXIBILITY,
    }

    # Filter eligible products by type
    candidates = [
        p for p in LOAN_PRODUCTS
        if p["loan_type"] == loan_type
        and p["is_active"]
        and _check_eligibility(p, customer, loan_amount, tenure_months)
    ]

    if not candidates:
        return {
            "comparison_id":      "cmp-no-results",
            "loan_amount":        loan_amount,
            "tenure_months":      tenure_months,
            "products":           [],
            "best_fit_product_id": None,
            "weights_used":       weights,
        }

    # Calculate costs for each product
    enriched = []
    for p in candidates:
        emi        = calculate_emi(loan_amount, p["interest_rate"], tenure_months)
        total_int  = calculate_total_interest(loan_amount, emi, tenure_months)
        total_rep  = round(emi * tenure_months, 2)
        proc_fee   = round(loan_amount * p["processing_fee_percent"] / 100 + p["processing_fee_fixed"], 2)
        total_cost = round(total_rep + proc_fee, 2)

        new_emi   = customer["total_emi"] + emi
        emi_ratio = new_emi / customer["monthly_income"]
        surplus   = round(customer["monthly_income"] - customer["monthly_expenses"] - new_emi, 2)

        new_dti   = round((customer["total_debt"] + loan_amount) / customer["monthly_income"], 2)
        # Rough risk projection: each point of extra EMI ratio costs 10 risk points
        risk_delta       = round((emi_ratio - 0.30) * 50, 2) if emi_ratio > 0.30 else 0.0
        projected_score  = round(max(0.0, current_risk_score - risk_delta), 2)

        enriched.append({
            **p,
            "costs": {
                "emi":             emi,
                "total_interest":  total_int,
                "total_repayment": total_rep,
                "processing_fee":  proc_fee,
                "total_cost":      total_cost,
            },
            "affordability": {
                "new_emi_to_income_ratio":    round(emi_ratio, 4),
                "monthly_surplus_after_emi":  surplus,
                "affordable":                 emi_ratio <= 0.45,
            },
            "impact": {
                "new_debt_to_income_ratio": new_dti,
                "projected_risk_score":     projected_score,
                "risk_score_change":        round(projected_score - current_risk_score, 2),
            },
        })

    all_costs = [e["costs"]["total_cost"] for e in enriched]

    for e in enriched:
        fee_pct   = e["processing_fee_percent"]
        cs        = _score_cost(e["costs"]["total_cost"], all_costs)
        afs       = _score_affordability(e["affordability"]["new_emi_to_income_ratio"])
        res       = _score_resilience(current_risk_score, e["impact"]["projected_risk_score"])
        ten       = _score_tenure(e["id"] and tenure_months, tenure_months)   # exact match always here
        fes       = _score_fees(fee_pct)
        fls       = _score_flexibility(e.get("features", {}))

        composite = round(
            cs  * weights["total_cost"]    +
            afs * weights["affordability"] +
            res * weights["resilience"]    +
            ten * weights["tenure"]        +
            fes * weights["fees"]          +
            fls * weights["flexibility"],
            2,
        )
        e["scores"] = {
            "total_cost_score":        cs,
            "affordability_score":     afs,
            "resilience_impact_score": res,
            "tenure_score":            ten,
            "fees_score":              fes,
            "flexibility_score":       fls,
            "composite_score":         composite,
        }

    enriched.sort(key=lambda x: x["scores"]["composite_score"], reverse=True)

    for rank, e in enumerate(enriched, 1):
        e["rank"]          = rank
        e["is_best_fit"]   = rank == 1
        e["product_id"]    = e["id"]
        e["lender_name"]   = e["lender_name"]
        if rank == 1:
            e["recommendation_reason"] = (
                f"Best balance of cost (₹{e['costs']['total_cost']:,.0f} total), "
                f"affordability ({e['affordability']['new_emi_to_income_ratio']*100:.0f}% of income), "
                f"and minimal impact on your resilience score"
            )

    # Flatten for API response
    results = []
    for e in enriched:
        results.append({
            "product_id":            e["id"],
            "lender_name":           e["lender_name"],
            "product_name":          e["product_name"],
            "interest_rate":         e["interest_rate"],
            "emi":                   e["costs"]["emi"],
            "total_interest":        e["costs"]["total_interest"],
            "total_repayment":       e["costs"]["total_repayment"],
            "processing_fee":        e["costs"]["processing_fee"],
            "total_cost":            e["costs"]["total_cost"],
            "affordability":         e["affordability"],
            "impact":                e["impact"],
            "scores":                e["scores"],
            "rank":                  e["rank"],
            "is_best_fit":           e["is_best_fit"],
            "recommendation_reason": e.get("recommendation_reason"),
        })

    return {
        "comparison_id":       f"cmp-{loan_type}-{int(loan_amount)}",
        "loan_amount":         loan_amount,
        "tenure_months":       tenure_months,
        "products":            results,
        "best_fit_product_id": results[0]["product_id"] if results else None,
        "weights_used":        weights,
    }
