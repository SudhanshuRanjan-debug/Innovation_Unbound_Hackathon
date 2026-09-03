# FinShield — Overdraft Engine Specification

## Overview
Calculates overdraft eligibility and costs for short-term liquidity gaps.

## Eligibility Criteria

```python
def check_overdraft_eligibility(customer: dict) -> dict:
    checks = {
        'minimum_income_met': customer['monthly_income'] >= MIN_INCOME (₹20,000),
        'regular_salary_pattern': has_regular_income(customer),
        'no_recent_defaults': customer['missed_payments'] == 0,
        'within_limit': required_amount <= MAX_OVERDRAFT (₹50,000)
    }
    return {
        'eligible': all(checks.values()),
        'checks': checks
    }
```

## Cost Calculation

```python
def calculate_overdraft_cost(amount: float, days: int) -> dict:
    daily_rate = DAILY_INTEREST_RATE  # 0.05% = 0.0005
    processing_fee = PROCESSING_FEE  # ₹100
    
    total_interest = amount * daily_rate * days
    total_repayment = amount + total_interest + processing_fee
    
    return {
        'amount': amount,
        'duration_days': days,
        'daily_interest_rate': daily_rate,
        'processing_fee': processing_fee,
        'total_interest': round(total_interest, 2),
        'total_repayment': round(total_repayment, 2)
    }
```

## Document Control
- Version: 1.0
- Last Updated: September 3, 2026
