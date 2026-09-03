# FinShield — Financial Engine Specification

## 1. Overview

Financial calculation engine for EMI, interest, ratios, and financial metrics.

---

## 2. EMI Calculation

### Formula
```
EMI = [P × r × (1 + r)^n] / [(1 + r)^n – 1]

Where:
P = Principal amount
r = Monthly interest rate (annual rate / 12 / 100)
n = Number of months
```

### Implementation
```python
def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    if principal <= 0 or annual_rate < 0 or tenure_months <= 0:
        raise ValueError("Invalid parameters")
    
    monthly_rate = (annual_rate / 12) / 100
    
    if monthly_rate == 0:
        return round(principal / tenure_months, 2)
    
    numerator = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)
    denominator = ((1 + monthly_rate) ** tenure_months) - 1
    
    return round(numerator / denominator, 2)
```

### Test Cases
- Normal: EMI(200000, 12, 24) = 9415.84
- Zero interest: EMI(100000, 0, 12) = 8333.33
- Edge cases: Validate negative/zero inputs

---

## 3. Financial Ratios

### 3.1 Debt-to-Income Ratio
```python
def calculate_dti_ratio(total_debt: float, monthly_income: float) -> float:
    """DTI = Total Debt / Monthly Income"""
    if monthly_income <= 0:
        raise ValueError("Income must be positive")
    return round(total_debt / monthly_income, 2)

# Thresholds:
# Healthy: < 2.0
# Acceptable: 2.0 - 3.5
# High: 3.5 - 5.0
# Critical: > 5.0
```

### 3.2 EMI-to-Income Ratio
```python
def calculate_emi_ratio(total_emi: float, monthly_income: float) -> float:
    """EMI Ratio = Total EMI / Monthly Income"""
    if monthly_income <= 0:
        raise ValueError("Income must be positive")
    return round(total_emi / monthly_income, 4)

# Thresholds:
# Healthy: < 0.30 (30%)
# Acceptable: 0.30 - 0.40
# Risky: 0.40 - 0.50
# Critical: > 0.50
```

### 3.3 Savings Rate
```python
def calculate_savings_rate(income: float, expenses: float) -> float:
    """Savings Rate = (Income - Expenses) / Income"""
    if income <= 0:
        return 0.0
    return round((income - expenses) / income, 4)
```

---

## 4. Interest Calculations

### Total Interest
```python
def calculate_total_interest(principal: float, emi: float, tenure_months: int) -> float:
    """Total Interest = (EMI × Tenure) - Principal"""
    total_repayment = emi * tenure_months
    return round(total_repayment - principal, 2)
```

### Daily Interest (Overdraft)
```python
def calculate_daily_interest(principal: float, daily_rate: float, days: int) -> float:
    """Simple interest for short-term overdraft"""
    return round(principal * daily_rate * days, 2)
```

---

## 5. Amortization Schedule

```python
def generate_amortization_schedule(
    principal: float,
    annual_rate: float,
    tenure_months: int
) -> list[dict]:
    emi = calculate_emi(principal, annual_rate, tenure_months)
    monthly_rate = (annual_rate / 12) / 100
    
    schedule = []
    balance = principal
    
    for month in range(1, tenure_months + 1):
        interest = balance * monthly_rate
        principal_payment = emi - interest
        balance -= principal_payment
        
        if month == tenure_months:
            principal_payment += balance  # Adjust for rounding
            balance = 0
        
        schedule.append({
            "month": month,
            "emi": round(emi, 2),
            "principal": round(principal_payment, 2),
            "interest": round(interest, 2),
            "balance": round(balance, 2)
        })
    
    return schedule
```

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
