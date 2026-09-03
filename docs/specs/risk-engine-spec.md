# FinShield — Risk Engine Specification

## 1. Overview

Risk scoring engine calculates financial resilience score (0-100) from multiple factors.

---

## 2. Risk Score Components

### 2.1 Composite Formula

```
Risk Score = Σ (Factor Score × Weight)

Factors:
- Income Stability: 20%
- Liquidity: 25%
- Debt Burden: 25%
- Payment Behavior: 15%
- Credit Utilization: 15%
```

### 2.2 Score Categories

| Range | Category | Description |
|-------|----------|-------------|
| 0-30 | Critical | Immediate intervention needed |
| 31-50 | At Risk | High risk of financial distress |
| 51-70 | Watch | Requires monitoring |
| 71-100 | Healthy | Good financial health |

---

## 3. Factor Calculations

### 3.1 Income Stability Score (20%)

**Inputs:**
- Last 6 months income history
- Income frequency (monthly, bi-weekly)

**Calculation:**
```python
def calculate_income_stability_score(income_history: list[float]) -> float:
    if len(income_history) < 3:
        return 50.0  # Insufficient data
    
    # Calculate consistency
    mean_income = np.mean(income_history)
    std_dev = np.std(income_history)
    coefficient_of_variation = std_dev / mean_income if mean_income > 0 else 1.0
    
    # Score: Low volatility = High score
    if coefficient_of_variation <= 0.05:  # <5% variation
        return 100.0
    elif coefficient_of_variation >= 0.30:  # >30% variation
        return 0.0
    else:
        return 100 - (coefficient_of_variation * 333.33)
```

### 3.2 Liquidity Score (25%)

**Inputs:**
- Current balance
- Minimum safe balance (default: ₹5,000)
- Average monthly expenses

**Calculation:**
```python
def calculate_liquidity_score(
    current_balance: float,
    min_safe_balance: float,
    monthly_expenses: float
) -> float:
    # Emergency fund in months
    emergency_months = current_balance / monthly_expenses if monthly_expenses > 0 else 0
    
    # Score based on months of coverage
    if emergency_months >= 6:
        return 100.0
    elif emergency_months <= 0:
        return 0.0
    else:
        return (emergency_months / 6.0) * 100
```

### 3.3 Debt Burden Score (25%)

**Inputs:**
- Total debt
- Monthly income
- Total EMI

**Calculation:**
```python
def calculate_debt_burden_score(
    total_debt: float,
    monthly_income: float,
    total_emi: float
) -> float:
    dti_ratio = total_debt / monthly_income
    emi_ratio = total_emi / monthly_income
    
    # DTI scoring (ideal: <2.0, critical: >5.0)
    if dti_ratio <= 2.0:
        dti_score = 100
    elif dti_ratio >= 5.0:
        dti_score = 0
    else:
        dti_score = 100 - ((dti_ratio - 2.0) / 3.0) * 100
    
    # EMI ratio scoring (ideal: <30%, critical: >50%)
    if emi_ratio <= 0.30:
        emi_score = 100
    elif emi_ratio >= 0.50:
        emi_score = 0
    else:
        emi_score = 100 - ((emi_ratio - 0.30) / 0.20) * 100
    
    # Weighted average (DTI 60%, EMI 40%)
    return (dti_score * 0.6) + (emi_score * 0.4)
```

### 3.4 Payment Behavior Score (15%)

**Inputs:**
- Total payments due (last 12 months)
- On-time payments count
- Late payments count
- Missed payments count

**Calculation:**
```python
def calculate_payment_behavior_score(
    total_payments: int,
    on_time: int,
    late: int,
    missed: int
) -> float:
    if total_payments == 0:
        return 100.0  # No payment history
    
    on_time_rate = on_time / total_payments
    
    # Perfect record
    if on_time_rate == 1.0:
        return 100.0
    
    # With penalties for late/missed
    base_score = on_time_rate * 100
    late_penalty = late * 5  # -5 per late
    missed_penalty = missed * 15  # -15 per missed
    
    score = base_score - late_penalty - missed_penalty
    return max(0, min(100, score))
```

### 3.5 Credit Utilization Score (15%)

**Inputs:**
- Total available credit
- Total credit used

**Calculation:**
```python
def calculate_credit_utilization_score(
    total_credit: float,
    credit_used: float
) -> float:
    if total_credit == 0:
        return 100.0
    
    utilization_rate = credit_used / total_credit
    
    # Ideal: <30%, Critical: >80%
    if utilization_rate <= 0.30:
        return 100.0
    elif utilization_rate >= 0.80:
        return 0.0
    else:
        return 100 - ((utilization_rate - 0.30) / 0.50) * 100
```

---

## 4. Risk Explanation Generation

```python
def generate_risk_explanations(
    income_score: float,
    liquidity_score: float,
    debt_score: float,
    payment_score: float,
    credit_score: float,
    customer_data: dict
) -> list[dict]:
    explanations = []
    
    # Check each factor
    if debt_score < 60:
        dti = customer_data['total_debt'] / customer_data['monthly_income']
        explanations.append({
            "factor": "debt_burden",
            "impact": "high" if debt_score < 40 else "medium",
            "description": f"Debt-to-income ratio is {dti:.1f}x, above healthy threshold of 2.0x"
        })
    
    if liquidity_score < 60:
        months = customer_data['emergency_fund_months']
        explanations.append({
            "factor": "liquidity",
            "impact": "medium",
            "description": f"Emergency fund covers only {months:.1f} months, recommended is 6 months"
        })
    
    # ... more explanations
    
    return explanations
```

---

## 5. Complete Risk Assessment

```python
async def calculate_risk_assessment(customer_id: str, db: Session) -> RiskAssessment:
    # Fetch data
    customer = await get_customer_data(customer_id, db)
    transactions = await get_transactions(customer_id, db)
    loans = await get_loans(customer_id, db)
    
    # Calculate factors
    income_stability = calculate_income_stability_score(customer.income_history)
    liquidity = calculate_liquidity_score(
        customer.current_balance,
        MIN_SAFE_BALANCE,
        customer.monthly_expenses
    )
    debt_burden = calculate_debt_burden_score(
        customer.total_debt,
        customer.monthly_income,
        customer.total_emi
    )
    payment_behavior = calculate_payment_behavior_score(
        loans.total_payments,
        loans.on_time_payments,
        loans.late_payments,
        loans.missed_payments
    )
    credit_utilization = calculate_credit_utilization_score(
        customer.total_credit_limit,
        customer.credit_used
    )
    
    # Calculate composite
    weights = get_weights_from_config()
    composite_score = (
        income_stability * weights['income_stability'] +
        liquidity * weights['liquidity'] +
        debt_burden * weights['debt_burden'] +
        payment_behavior * weights['payment_behavior'] +
        credit_utilization * weights['credit_utilization']
    )
    
    # Determine category
    category = determine_category(composite_score)
    
    # Generate explanations
    explanations = generate_risk_explanations(
        income_stability, liquidity, debt_burden,
        payment_behavior, credit_utilization, customer
    )
    
    # Save and return
    return await save_risk_assessment(
        customer_id, composite_score, category, explanations, db
    )
```

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
