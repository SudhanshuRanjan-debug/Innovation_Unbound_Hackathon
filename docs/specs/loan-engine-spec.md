# FinShield — Loan Engine Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

Loan eligibility checking, EMI comparison, and multi-criteria scoring logic.

---

## 2. Objectives

- Check customer eligibility against each loan product's criteria
- Calculate total cost metrics (EMI, interest, fees) for each product
- Score and rank products by best-fit, not cheapest rate alone
- Explain why a loan is or is not recommended

---

## 3. Eligibility Checking

```python
def check_loan_eligibility(customer: dict, product: dict) -> dict:
    """
    Checks whether a customer meets a product's eligibility criteria.
    Returns a dict with eligible flag and individual check results.
    """
    checks = {}

    # Minimum income
    checks['min_income'] = customer['monthly_income'] >= product['min_monthly_income']

    # Employment type
    checks['employment_type'] = (
        customer['employment_status'] in product['employment_types']
        if product['employment_types'] else True
    )

    # Age range
    age = calculate_age(customer['date_of_birth'])
    checks['age_min'] = age >= (product['min_age'] or 18)
    checks['age_max'] = age <= (product['max_age'] or 70)

    # Loan amount range
    checks['amount_in_range'] = (
        product['min_loan_amount'] <= customer['requested_amount'] <= product['max_loan_amount']
    )

    # Tenure range
    checks['tenure_in_range'] = (
        product['min_tenure_months'] <= customer['requested_tenure'] <= product['max_tenure_months']
    )

    return {
        'eligible': all(checks.values()),
        'checks': checks,
        'fail_reasons': [k for k, v in checks.items() if not v]
    }
```

---

## 4. Cost Calculations

```python
def calculate_loan_costs(amount: float, annual_rate: float, tenure_months: int, fees: dict) -> dict:
    """
    Calculates complete cost breakdown for a loan product.
    """
    emi = calculate_emi(amount, annual_rate, tenure_months)
    total_repayment = emi * tenure_months
    total_interest = total_repayment - amount

    # Processing fee (fixed or percentage-based)
    processing_fee = fees.get('fixed', 0) + (amount * fees.get('percent', 0) / 100)
    total_cost = total_repayment + processing_fee

    return {
        'emi': round(emi, 2),
        'total_interest': round(total_interest, 2),
        'total_repayment': round(total_repayment, 2),
        'processing_fee': round(processing_fee, 2),
        'total_cost': round(total_cost, 2)
    }
```

---

## 5. Affordability Check

```python
def check_affordability(customer: dict, new_emi: float) -> dict:
    """
    Determines whether the new EMI is affordable for the customer.

    Thresholds:
      Comfortable: New total EMI / income <= 30%
      Acceptable:  30% < ratio <= 40%
      Risky:       40% < ratio <= 50%
      Unaffordable: ratio > 50%
    """
    new_total_emi = customer['existing_total_emi'] + new_emi
    monthly_income = customer['monthly_income']
    new_emi_ratio = new_total_emi / monthly_income
    monthly_surplus = monthly_income - customer['monthly_expenses'] - new_total_emi

    if new_emi_ratio <= 0.30:
        level = 'comfortable'
    elif new_emi_ratio <= 0.40:
        level = 'acceptable'
    elif new_emi_ratio <= 0.50:
        level = 'risky'
    else:
        level = 'unaffordable'

    return {
        'new_emi_to_income_ratio': round(new_emi_ratio, 4),
        'monthly_surplus_after_emi': round(monthly_surplus, 2),
        'affordability_level': level,
        'affordable': level in ('comfortable', 'acceptable')
    }
```

---

## 6. Multi-Criteria Scoring

### 6.1 Scoring Weights (Configurable)

| Criterion | Default Weight |
|-----------|----------------|
| Total cost | 30% |
| EMI affordability | 25% |
| Impact on resilience | 20% |
| Tenure suitability | 10% |
| Fees | 5% |
| Repayment flexibility | 10% |

### 6.2 Individual Criterion Scorers

```python
def score_total_cost(total_cost: float, all_costs: list[float]) -> float:
    """Lower cost relative to the field = higher score (0-100)."""
    min_cost = min(all_costs)
    max_cost = max(all_costs)
    if max_cost == min_cost:
        return 100.0
    return 100 - ((total_cost - min_cost) / (max_cost - min_cost)) * 100


def score_affordability(emi_to_income_ratio: float) -> float:
    """
    Ideal: <= 30% → 100
    Acceptable: 30-40% → 70-100
    Risky: 40-50% → 30-70
    Unaffordable: > 50% → 0-30
    """
    if emi_to_income_ratio <= 0.30:
        return 100.0
    elif emi_to_income_ratio <= 0.40:
        return 100 - ((emi_to_income_ratio - 0.30) / 0.10) * 30
    elif emi_to_income_ratio <= 0.50:
        return 70 - ((emi_to_income_ratio - 0.40) / 0.10) * 40
    else:
        return max(0, 30 - ((emi_to_income_ratio - 0.50) / 0.10) * 30)


def score_resilience_impact(current_score: float, projected_score: float) -> float:
    """
    Less negative impact on resilience = higher score.
    A drop of 10+ points → 0, no drop → 100.
    """
    drop = current_score - projected_score
    if drop <= 0:
        return 100.0
    elif drop >= 10:
        return 0.0
    return 100 - (drop / 10) * 100


def score_fees(processing_fee_pct: float) -> float:
    """
    Lower fee percentage = higher score.
    0% → 100, 3%+ → 0
    """
    if processing_fee_pct <= 0:
        return 100.0
    elif processing_fee_pct >= 3.0:
        return 0.0
    return 100 - (processing_fee_pct / 3.0) * 100


def score_tenure_suitability(product_tenure: int, requested_tenure: int) -> float:
    """
    Exact match → 100. Penalise proportionally for deviation.
    """
    diff_pct = abs(product_tenure - requested_tenure) / requested_tenure
    return max(0, 100 - diff_pct * 200)


def score_flexibility(features: dict) -> float:
    """
    Score based on available features.
    """
    score = 0
    if features.get('prepayment_allowed'):
        score += 40
    if features.get('flexible_repayment'):
        score += 30
    if features.get('top_up_available'):
        score += 30
    return float(score)
```

### 6.3 Composite Score and Ranking

```python
def score_and_rank_products(
    products: list[dict],
    customer: dict,
    weights: dict
) -> list[dict]:
    all_total_costs = [p['costs']['total_cost'] for p in products]

    for p in products:
        cost_score = score_total_cost(p['costs']['total_cost'], all_total_costs)
        afford_score = score_affordability(p['affordability']['new_emi_to_income_ratio'])
        resilience_score = score_resilience_impact(
            customer['risk_score'],
            p['impact']['projected_risk_score']
        )
        tenure_score = score_tenure_suitability(p['tenure_months'], customer['requested_tenure'])
        fees_score = score_fees(p['processing_fee_pct'])
        flexibility_score = score_flexibility(p.get('features', {}))

        composite = (
            cost_score        * weights['total_cost'] +
            afford_score      * weights['affordability'] +
            resilience_score  * weights['resilience_impact'] +
            tenure_score      * weights['tenure_suitability'] +
            fees_score        * weights['fees'] +
            flexibility_score * weights['flexibility']
        )

        p['scores'] = {
            'total_cost_score':      round(cost_score, 2),
            'affordability_score':   round(afford_score, 2),
            'resilience_score':      round(resilience_score, 2),
            'tenure_score':          round(tenure_score, 2),
            'fees_score':            round(fees_score, 2),
            'flexibility_score':     round(flexibility_score, 2),
            'composite_score':       round(composite, 2),
        }

    # Sort descending by composite score
    products.sort(key=lambda x: x['scores']['composite_score'], reverse=True)

    for rank, p in enumerate(products, start=1):
        p['rank'] = rank
        p['is_best_fit'] = (rank == 1)

    return products
```

---

## 7. Business Rules

| Rule | Value | Configurable |
|------|-------|--------------|
| Max EMI-to-income for recommendation | 50% | Yes |
| Minimum loan amount | ₹10,000 | Yes |
| Maximum loan amount | ₹50,00,000 | Yes |
| Minimum tenure | 6 months | Yes |
| Maximum tenure | 120 months | Yes |
| Do not recommend loan if alternatives exist | True | Yes |

---

## 8. Edge Cases

- **No eligible products found:** Return empty list with reason "No eligible products for your profile"
- **Single product:** Skip relative cost scoring, use absolute thresholds
- **Zero income:** Block all eligibility checks, return error
- **Existing high EMI:** Warn customer that new loan is risky even if technically eligible

---

## 9. Acceptance Criteria

- [ ] Correctly filters ineligible products
- [ ] EMI matches standard banking formula (±₹1 rounding tolerance)
- [ ] Composite score correctly weights all criteria
- [ ] Best-fit is not always the cheapest rate
- [ ] All weights sum to 1.0; validated at startup
- [ ] 100% unit test coverage on scoring functions

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: financial-engine-spec.md, recommendation-engine-spec.md
