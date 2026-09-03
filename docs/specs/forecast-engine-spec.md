# FinShield — Forecast Engine Specification

## Overview
Cash-flow forecasting engine predicts daily balance for 90 days based on transaction patterns.

## Algorithm

### 1. Pattern Detection
```python
def detect_income_pattern(transactions: list) -> dict:
    income_txns = [t for t in transactions if t.type == 'credit' and t.category == 'salary']
    return {
        'average_amount': np.mean([t.amount for t in income_txns]),
        'frequency': 'monthly',  # Detect from dates
        'typical_day': 1  # Day of month
    }

def detect_expense_patterns(transactions: list) -> dict:
    # Group by category
    recurring = {}
    for category in ['rent', 'utilities', 'emi']:
        cat_txns = [t for t in transactions if t.category == category]
        if len(cat_txns) >= 3:
            recurring[category] = {
                'average_amount': np.mean([t.amount for t in cat_txns]),
                'typical_day': most_common_day(cat_txns)
            }
    
    # Calculate daily discretionary
    discretionary = calculate_average_daily_spending(transactions)
    recurring['daily_discretionary'] = discretionary
    
    return recurring
```

### 2. Balance Projection
```python
def project_balance(current_balance: float, income_pattern: dict, expense_patterns: dict, days: int) -> list:
    projections = []
    balance = current_balance
    start_date = date.today()
    
    for day in range(days):
        proj_date = start_date + timedelta(days=day)
        
        # Calculate inflows
        inflows = 0
        if is_salary_day(proj_date, income_pattern):
            inflows += income_pattern['average_amount']
        
        # Calculate outflows
        outflows = expense_patterns['daily_discretionary']
        for category, pattern in expense_patterns.items():
            if category != 'daily_discretionary' and is_expense_day(proj_date, pattern):
                outflows += pattern['average_amount']
        
        # Update balance
        balance = balance + inflows - outflows
        
        projections.append({
            'date': proj_date.isoformat(),
            'projected_balance': round(balance, 2),
            'inflows': round(inflows, 2),
            'outflows': round(outflows, 2)
        })
    
    return projections
```

### 3. Alert Identification
```python
def identify_alerts(projections: list, min_safe_balance: float) -> list:
    alerts = []
    for proj in projections:
        if proj['projected_balance'] < min_safe_balance:
            alerts.append({
                'date': proj['date'],
                'projected_balance': proj['projected_balance'],
                'reason': determine_reason(proj)
            })
    return alerts
```

## Document Control
- Version: 1.0
- Last Updated: September 3, 2026
