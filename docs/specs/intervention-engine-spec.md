# FinShield — Intervention Engine Specification

## Overview
Evaluates customer financial situation and recommends interventions following responsible lending hierarchy.

## Intervention Hierarchy

1. **Spending Adjustment** — Reduce discretionary spending
2. **Repayment Restructuring** — Extend loan tenure, reduce EMI
3. **Short-term Overdraft** — Bridge temporary liquidity gaps
4. **New Loan** — Only if genuinely necessary

## Decision Logic

```python
async def evaluate_interventions(customer_id: str) -> list[Intervention]:
    customer = await fetch_customer_data(customer_id)
    interventions = []
    
    # Level 1: Spending Adjustment
    if can_solve_with_spending_adjustment(customer):
        interventions.append(create_spending_adjustment_intervention(customer))
    
    # Level 2: Repayment Restructuring
    if has_high_emi_burden(customer):
        interventions.append(create_restructuring_intervention(customer))
    
    # Level 3: Overdraft
    if has_temporary_liquidity_gap(customer):
        interventions.append(create_overdraft_intervention(customer))
    
    # Level 4: Loan
    if needs_new_loan(customer) and not interventions:
        interventions.append(create_loan_recommendation(customer))
    
    return interventions

def has_temporary_liquidity_gap(customer: dict) -> bool:
    forecast = customer['forecast']
    # Check if balance goes low but recovers within 30 days
    low_dates = [d for d in forecast if d['balance'] < MIN_SAFE_BALANCE]
    recovery_date = next((d for d in forecast if d['balance'] > MIN_SAFE_BALANCE and d['date'] > low_dates[0]['date']), None)
    
    return len(low_dates) > 0 and recovery_date and (recovery_date['date'] - low_dates[0]['date']).days <= 30
```

## Document Control
- Version: 1.0
- Last Updated: September 3, 2026
