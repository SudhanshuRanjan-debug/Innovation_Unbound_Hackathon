# FinShield — Recommendation Engine Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

Aggregates outputs from all engines into prioritised, explainable recommendations for the customer.

---

## 2. Objectives

- Consolidate signals from Risk, Forecast, Intervention, Loan, and AI engines
- Rank recommendations by urgency and expected impact
- Attach a plain-language explanation to every recommendation
- Ensure no duplicate or contradictory recommendations surface together

---

## 3. Recommendation Types

| Type | Source Engine | Trigger |
|------|---------------|---------|
| `spending_adjustment` | Intervention | Discretionary spend > 30% of income |
| `repayment_restructure` | Intervention | EMI ratio > 40% |
| `emergency_fund` | Risk | Emergency fund < 3 months |
| `overdraft` | Overdraft | Temporary liquidity gap detected |
| `loan_comparison` | Loan | New loan genuinely required |
| `income_diversification` | Risk | Single income source, high volatility |

---

## 4. Recommendation Object

```python
class Recommendation(BaseModel):
    id: str
    customer_id: str
    recommendation_type: str
    title: str                      # Short headline, ≤ 60 chars
    description: str                # 1–3 sentence explanation
    current_risk_score: float
    projected_risk_score: float     # After acting on recommendation
    impact_summary: str             # e.g. "+5 resilience points"
    priority: int                   # 1 = highest urgency
    confidence: float               # 0–100
    ai_explanation: str | None      # LLM-generated natural language
    status: str                     # active | dismissed | actioned
    recommended_at: datetime
    expires_at: datetime | None
```

---

## 5. Prioritisation Algorithm

```python
PRIORITY_RULES = [
    # (condition, priority_score)
    (lambda r: r.recommendation_type == 'overdraft',              10),
    (lambda r: r.recommendation_type == 'repayment_restructure',   8),
    (lambda r: r.recommendation_type == 'spending_adjustment',     6),
    (lambda r: r.recommendation_type == 'emergency_fund',          5),
    (lambda r: r.recommendation_type == 'loan_comparison',         4),
    (lambda r: r.recommendation_type == 'income_diversification',  3),
]

def prioritise(recommendations: list[Recommendation]) -> list[Recommendation]:
    for rec in recommendations:
        score = next(
            (score for condition, score in PRIORITY_RULES if condition(rec)),
            1  # default lowest priority
        )
        rec.priority = score

    # Sort: highest priority first, then by confidence DESC
    recommendations.sort(key=lambda r: (-r.priority, -r.confidence))
    return recommendations
```

---

## 6. Deduplication and Conflict Resolution

```python
def deduplicate(recommendations: list[Recommendation]) -> list[Recommendation]:
    """
    Rules:
    - Only one 'overdraft' recommendation at a time.
    - If 'loan_comparison' and 'spending_adjustment' both exist,
      keep spending_adjustment first (prefer non-credit solution).
    - Drop lower-confidence duplicates of the same type.
    """
    seen_types: dict[str, Recommendation] = {}

    for rec in recommendations:
        existing = seen_types.get(rec.recommendation_type)
        if existing is None or rec.confidence > existing.confidence:
            seen_types[rec.recommendation_type] = rec

    # Enforce hierarchy: remove 'loan_comparison' if non-credit options exist
    non_credit_types = {'spending_adjustment', 'repayment_restructure', 'emergency_fund'}
    if non_credit_types & set(seen_types.keys()):
        # Only keep loan_comparison if the problem cannot be resolved otherwise
        pass  # Business rule evaluated by intervention engine upstream

    return list(seen_types.values())
```

---

## 7. Reason Codes

Every recommendation carries a machine-readable reason code for traceability.

| Reason Code | Human Meaning |
|-------------|---------------|
| `HIGH_DTI_RATIO` | Debt-to-income ratio above 3.5x |
| `LOW_EMERGENCY_FUND` | Emergency fund < 3 months |
| `HIGH_EMI_BURDEN` | EMI / income > 40% |
| `CASH_FLOW_GAP` | Balance projected below safe level |
| `LATE_PAYMENT_TREND` | 2+ late payments in last 6 months |
| `INCOME_VOLATILITY` | CV of income > 15% |
| `HIGH_DISCRETIONARY_SPEND` | Discretionary spend > 35% of income |

```python
def attach_reason_code(recommendation: Recommendation, customer_data: dict) -> str:
    """Returns the primary reason code driving this recommendation."""
    if recommendation.recommendation_type == 'overdraft':
        return 'CASH_FLOW_GAP'
    if recommendation.recommendation_type == 'repayment_restructure':
        return 'HIGH_EMI_BURDEN'
    if recommendation.recommendation_type == 'spending_adjustment':
        return 'HIGH_DISCRETIONARY_SPEND'
    return 'GENERAL_RISK_ELEVATION'
```

---

## 8. Impact Projection

```python
def project_impact(recommendation_type: str, customer: dict) -> float:
    """
    Estimates the projected risk score after acting on this recommendation.
    Returns the projected score (0–100).
    """
    current = customer['risk_score']

    IMPACT_DELTAS = {
        'spending_adjustment':    +4.0,
        'repayment_restructure':  +6.0,
        'emergency_fund':         +3.0,
        'overdraft':              +2.0,   # Prevents a score drop
        'loan_comparison':        -3.0,   # New debt adds some risk
        'income_diversification': +5.0,
    }

    delta = IMPACT_DELTAS.get(recommendation_type, 0.0)
    return round(min(100, max(0, current + delta)), 2)
```

---

## 9. Integration with AI Service

```python
async def enrich_with_ai(recommendation: Recommendation, ai_service: AIService) -> Recommendation:
    """
    Sends structured recommendation data to LLM.
    LLM returns a personalised, plain-language explanation.
    The financial values in the recommendation are NOT recalculated by the LLM.
    """
    context = {
        'type': recommendation.recommendation_type,
        'title': recommendation.title,
        'current_score': recommendation.current_risk_score,
        'projected_score': recommendation.projected_risk_score,
        'reason_code': recommendation.reason_code,
    }

    explanation = await ai_service.explain(
        context_type='recommendation',
        context_data=context
    )

    recommendation.ai_explanation = explanation
    return recommendation
```

---

## 10. Acceptance Criteria

- [ ] Recommendations are always sorted: highest urgency first
- [ ] No two recommendations of the same type appear simultaneously
- [ ] Loan recommendation is never present if a non-credit option covers the problem
- [ ] Every recommendation has a non-null `reason_code`
- [ ] `projected_risk_score` is always within 0–100
- [ ] System functions without AI enrichment (graceful fallback to structured text)

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: intervention-engine-spec.md, loan-engine-spec.md, ai-service-spec.md
