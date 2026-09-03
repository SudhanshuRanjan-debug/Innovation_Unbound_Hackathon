# FinShield — Design Document

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026  
**Status:** Design Specification

This document provides the complete design specification for FinShield, including system design, data flows, algorithms, UI/UX patterns, and implementation details.

---

## 2. System Design Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet Users                        │
│            (Customers, Bank Officers, Admins)                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼──────────┐          ┌────────▼──────────┐
│   Vercel CDN      │          │   Client Browser  │
│   (Next.js SSR)   │          │   (React SPA)     │
└────────┬──────────┘          └────────┬──────────┘
         │                               │
         └───────────┬───────────────────┘
                     │ REST API (JSON)
              ┌──────▼──────────────────────┐
              │  Render/Railway             │
              │  FastAPI Backend            │
              │  ┌────────────────────────┐ │
              │  │  API Layer (REST)      │ │
              │  └───────────┬────────────┘ │
              │              │              │
              │  ┌───────────▼────────────┐ │
              │  │  Service Layer         │ │
              │  │  - Financial Engine    │ │
              │  │  - Risk Engine         │ │
              │  │  - Forecast Engine     │ │
              │  │  - Intervention Engine │ │
              │  │  - Loan Engine         │ │
              │  │  - AI Service          │ │
              │  └───────────┬────────────┘ │
              │              │              │
              │  ┌───────────▼────────────┐ │
              │  │  Data Layer (ORM)      │ │
              │  └───────────┬────────────┘ │
              └──────────────┼──────────────┘
                             │ SQL
                    ┌────────▼────────┐
                    │   Supabase      │
                    │  - PostgreSQL   │
                    │  - Auth Service │
                    │  - Row-Level    │
                    │    Security     │
                    └─────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐         ┌─────────▼────────┐
     │  OpenAI/        │         │  Email Service   │
     │  Anthropic      │         │  (Future)        │
     │  LLM API        │         │                  │
     └─────────────────┘         └──────────────────┘
```

### 2.2 Technology Stack Rationale

#### Frontend: Next.js 14 + React
- **Server-side rendering** for better SEO and initial load
- **App Router** for modern routing patterns
- **TypeScript** for type safety on financial data
- **Tailwind CSS** for rapid, consistent styling
- **shadcn/ui** for professional, accessible components
- **Recharts** for financial visualizations

#### Backend: FastAPI + Python
- **FastAPI** for automatic API docs and async support
- **Python** ideal for financial calculations and ML
- **Pandas/NumPy** for data analysis
- **scikit-learn** for interpretable ML models
- **Pydantic** for request/response validation

#### Database: PostgreSQL + Supabase
- **PostgreSQL** for ACID compliance (financial data)
- **Supabase** for managed hosting + built-in auth
- **Row-Level Security** for data isolation by design

---

## 3. Data Flow Design

### 3.1 Risk Score Calculation Flow

```
User visits dashboard
       ↓
Frontend: GET /api/v1/risk/score
       ↓
Backend: Risk API Endpoint
       ↓
Risk Engine Service
       ↓
┌──────────────────────────────────────┐
│ 1. Fetch Customer Data               │
│    - Customer info (income)          │
│    - Account balances                │
│    - Transactions (6 months)         │
│    - Active loans                    │
│    - Payment history                 │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 2. Calculate Individual Factors      │
│                                      │
│ Income Stability (20%):              │
│   - Consistency of income            │
│   - Income volatility (std dev)      │
│   → Score: 0-100                     │
│                                      │
│ Liquidity (25%):                     │
│   - Current balance / safe balance   │
│   - Emergency fund months            │
│   → Score: 0-100                     │
│                                      │
│ Debt Burden (25%):                   │
│   - Debt-to-income ratio             │
│   - EMI-to-income ratio              │
│   → Score: 0-100                     │
│                                      │
│ Payment Behavior (15%):              │
│   - On-time payment rate             │
│   - Late/missed payments             │
│   → Score: 0-100                     │
│                                      │
│ Credit Utilization (15%):            │
│   - Total debt vs income             │
│   - Loan utilization                 │
│   → Score: 0-100                     │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 3. Calculate Composite Score         │
│                                      │
│ Risk Score = Σ(factor_score × weight)│
│                                      │
│ Risk Score = 68.5                    │
│                                      │
│ Category:                            │
│   0-30:  Critical                    │
│   31-50: At Risk                     │
│   51-70: Watch    ← Current          │
│   71-100: Healthy                    │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 4. Generate Explanations             │
│                                      │
│ Risk Factors:                        │
│   - Debt burden: HIGH impact         │
│     "DTI ratio 3.6x, above 2.0x      │
│      threshold"                      │
│   - Liquidity: MEDIUM impact         │
│     "Emergency fund 3 months,        │
│      recommended 6 months"           │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 5. (Optional) AI Enhancement         │
│                                      │
│ Send structured data to LLM:         │
│   {                                  │
│     "score": 68.5,                   │
│     "category": "watch",             │
│     "factors": [...]                 │
│   }                                  │
│                                      │
│ LLM generates natural explanation:   │
│ "Your score of 68.5 indicates..."   │
└──────────┬───────────────────────────┘
           ↓
Return JSON response to frontend
       ↓
Frontend displays:
  - Score gauge
  - Factor breakdown
  - AI explanation
  - Trend chart
```

### 3.2 Cash Flow Forecast Flow

```
User visits forecast page
       ↓
Frontend: GET /api/v1/forecast?days=90
       ↓
Backend: Forecast API Endpoint
       ↓
Forecast Engine Service
       ↓
┌──────────────────────────────────────┐
│ 1. Analyze Historical Transactions   │
│    (Past 6 months)                   │
│                                      │
│ Income Pattern Detection:            │
│   - Identify salary transactions     │
│   - Calculate average amount: ₹50K   │
│   - Detect frequency: Monthly        │
│   - Identify typical date: 1st       │
│                                      │
│ Expense Pattern Detection:           │
│   - Categorize expenses              │
│   - Identify recurring bills:        │
│     * Rent: ₹15K (5th of month)      │
│     * Utilities: ₹2K (10th)          │
│     * Groceries: ₹8K (weekly)        │
│     * EMI: ₹10K (5th)                │
│   - Calculate average discretionary  │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 2. Project Daily Balance (90 days)  │
│                                      │
│ Starting Balance: ₹95,000            │
│                                      │
│ For each day:                        │
│   Expected Inflows:                  │
│     - Salary on 1st: +₹50,000        │
│                                      │
│   Expected Outflows:                 │
│     - Rent on 5th: -₹15,000          │
│     - EMI on 5th: -₹10,000           │
│     - Daily expenses: -₹1,000 avg    │
│                                      │
│   Projected Balance:                 │
│     balance = prev_balance           │
│               + inflows              │
│               - outflows             │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 3. Identify Critical Dates           │
│                                      │
│ Low Balance Alerts:                  │
│   Date: Sept 28                      │
│   Projected Balance: ₹4,500          │
│   Reason: "Before salary, after      │
│            all monthly expenses"     │
│                                      │
│ Negative Balance: None               │
│                                      │
│ Confidence: HIGH                     │
│   (Based on consistent patterns)     │
└──────────┬───────────────────────────┘
           ↓
Return forecast data
       ↓
Frontend displays:
  - Timeline chart (90 days)
  - Daily balance line
  - Income/expense markers
  - Alert indicators
  - Critical date highlights
```

### 3.3 Loan Comparison Flow

```
User enters loan requirements:
  - Amount: ₹200,000
  - Tenure: 24 months
  - Type: Personal loan
       ↓
Frontend: POST /api/v1/loans/compare
       ↓
Backend: Loan Comparison API
       ↓
Loan Engine Service
       ↓
┌──────────────────────────────────────┐
│ 1. Fetch Customer Financial Profile │
│                                      │
│   - Monthly income: ₹50,000          │
│   - Current EMI: ₹15,000             │
│   - Risk score: 68.5                 │
│   - DTI ratio: 3.6                   │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 2. Fetch Eligible Loan Products     │
│    (From loan_products table)        │
│                                      │
│ Filters:                             │
│   - Loan type = personal             │
│   - Amount in range                  │
│   - Tenure supported                 │
│   - Customer meets eligibility       │
│                                      │
│ Found: 8 products                    │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 3. Calculate for Each Product        │
│                                      │
│ Product: HDFC Personal Loan Premium  │
│                                      │
│ EMI Calculation:                     │
│   P = ₹200,000                       │
│   r = 11.5% annual = 0.958% monthly  │
│   n = 24 months                      │
│   EMI = P×r×(1+r)^n / ((1+r)^n - 1) │
│   EMI = ₹9,427                       │
│                                      │
│ Total Interest:                      │
│   = (EMI × n) - P                    │
│   = ₹26,248                          │
│                                      │
│ Total Cost:                          │
│   = Total repayment + processing fee │
│   = ₹226,248 + ₹2,000                │
│   = ₹228,248                         │
│                                      │
│ Affordability Check:                 │
│   New Total EMI = ₹15,000 + ₹9,427  │
│                 = ₹24,427            │
│   EMI-to-Income = 24,427 / 50,000   │
│                 = 0.489 (48.9%)      │
│   Affordable? No (>40% threshold)    │
│                                      │
│ Risk Impact:                         │
│   New DTI = (180K + 200K) / 50K     │
│          = 7.6                       │
│   Projected Risk Score: 58.0         │
│   Change: -10.5 points               │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 4. Score Each Product                │
│                                      │
│ Multi-Criteria Scoring:              │
│                                      │
│ HDFC Product Scores:                 │
│   Total Cost (30%):                  │
│     Lowest cost among options        │
│     Score: 85/100                    │
│                                      │
│   Affordability (25%):               │
│     EMI-to-income 48.9% (high)       │
│     Score: 45/100                    │
│                                      │
│   Resilience Impact (20%):           │
│     Risk score drops 10.5 points     │
│     Score: 40/100                    │
│                                      │
│   Tenure Suitability (10%):          │
│     Matches requested tenure         │
│     Score: 100/100                   │
│                                      │
│   Fees (5%):                         │
│     Processing fee 1% (low)          │
│     Score: 88/100                    │
│                                      │
│   Flexibility (10%):                 │
│     Prepayment allowed               │
│     Score: 80/100                    │
│                                      │
│ Composite Score:                     │
│   = Σ(score × weight)                │
│   = 65.3/100                         │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 5. Rank Products                     │
│                                      │
│ Sort by composite score DESC         │
│                                      │
│ Alternative: Increase Tenure         │
│   Product: Same HDFC, 36 months     │
│   EMI: ₹6,850 (lower)                │
│   Total Cost: ₹246,600 (higher)      │
│   EMI-to-Income: 43.7%               │
│   Affordability: Better              │
│   Composite Score: 78.5              │
│   Rank: 1 (BEST FIT)                │
│                                      │
│ Recommendation:                      │
│   "Best fit: HDFC 36-month option    │
│    Better affordability despite      │
│    higher total interest"            │
└──────────┬───────────────────────────┘
           ↓
Return ranked comparison
       ↓
Frontend displays:
  - Comparison table
  - Best-fit highlight
  - Detailed breakdowns
  - Affordability indicators
  - Impact visualization
```

### 3.4 Intervention Trigger Flow

```
Scheduled Task (Daily) or
Risk Score Update Event
       ↓
Intervention Engine
       ↓
┌──────────────────────────────────────┐
│ 1. Identify At-Risk Customers        │
│                                      │
│ Query customers where:               │
│   - Risk score < 60 (threshold)      │
│   - Score declined > 5 points        │
│   - No active intervention           │
│                                      │
│ Found: Customer John Doe             │
│   - Risk Score: 68.5 → 58.0          │
│   - Trigger: Score dropped 10.5 pts  │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 2. Analyze Financial Situation       │
│                                      │
│ Gather data:                         │
│   - Cash flow forecast               │
│   - Expense breakdown                │
│   - Debt obligations                 │
│   - Upcoming EMIs                    │
│                                      │
│ Findings:                            │
│   - Discretionary spending: ₹12K/mo  │
│     (High compared to others)        │
│   - Upcoming cash gap on Sept 28     │
│   - DTI ratio: 3.6 (high)            │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 3. Evaluate Intervention Hierarchy   │
│                                      │
│ Level 1: Spending Adjustment?        │
│   Can reduce discretionary by ₹3K    │
│   Would improve score by 2 points    │
│   → RECOMMEND                        │
│                                      │
│ Level 2: Repayment Restructuring?    │
│   EMI burden high (48%)              │
│   Could extend tenure                │
│   → RECOMMEND as alternative         │
│                                      │
│ Level 3: Short-term Overdraft?       │
│   Cash gap in 25 days                │
│   Need: ₹10K for 3 days              │
│   Customer eligible                  │
│   → RECOMMEND for liquidity          │
│                                      │
│ Level 4: New Loan?                   │
│   Not needed if above steps taken    │
│   → DO NOT RECOMMEND                 │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 4. Generate Recommendations          │
│                                      │
│ Intervention 1: Spending Adjustment  │
│   Priority: HIGH                     │
│   Title: "Reduce discretionary..."   │
│   Expected Impact: +2 points         │
│   Explanation: "Your discretionary   │
│     spending increased 25% in 3      │
│     months. Reducing by ₹3K would    │
│     improve your resilience."        │
│                                      │
│ Intervention 2: Overdraft            │
│   Priority: MEDIUM                   │
│   Title: "Bridge cash gap with..."   │
│   Expected Impact: Prevent default   │
│   Offer: ₹10K for 3 days             │
│                                      │
│ Intervention 3: Loan Restructure     │
│   Priority: MEDIUM                   │
│   Title: "Extend loan tenure to..."  │
│   Expected Impact: +5 points         │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 5. (Optional) AI Enhancement         │
│                                      │
│ Send to LLM for personalization:     │
│   "Generate friendly explanation     │
│    for spending adjustment           │
│    recommendation..."                │
│                                      │
│ LLM Response:                        │
│   "Hi John, I noticed your dining    │
│    and entertainment expenses have   │
│    increased. Small adjustments      │
│    now can prevent bigger issues..." │
└──────────┬───────────────────────────┘
           ↓
Save interventions to database
       ↓
Notify customer
       ↓
Customer sees interventions
on dashboard
```

---

## 4. Algorithm Design

### 4.1 EMI Calculation Algorithm

**Formula:** EMI = [P × r × (1 + r)^n] / [(1 + r)^n – 1]

Where:
- P = Principal loan amount
- r = Monthly interest rate (annual rate / 12 / 100)
- n = Number of months

**Implementation:**

```python
def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """
    Calculate Equated Monthly Installment (EMI).
    
    Args:
        principal: Loan principal amount in rupees
        annual_rate: Annual interest rate as percentage (e.g., 12.5 for 12.5%)
        tenure_months: Loan tenure in months
        
    Returns:
        Monthly EMI amount rounded to 2 decimal places
        
    Example:
        >>> calculate_emi(200000, 11.5, 24)
        9427.00
    """
    if principal <= 0 or annual_rate < 0 or tenure_months <= 0:
        raise ValueError("Invalid input parameters")
    
    # Convert annual rate to monthly decimal
    monthly_rate = (annual_rate / 12) / 100
    
    # Handle zero interest rate case
    if monthly_rate == 0:
        return round(principal / tenure_months, 2)
    
    # EMI formula
    numerator = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)
    denominator = ((1 + monthly_rate) ** tenure_months) - 1
    
    emi = numerator / denominator
    
    return round(emi, 2)


def generate_amortization_schedule(
    principal: float,
    annual_rate: float,
    tenure_months: int
) -> list[dict]:
    """
    Generate complete amortization schedule.
    
    Returns:
        List of dicts with month, emi, principal, interest, balance
    """
    emi = calculate_emi(principal, annual_rate, tenure_months)
    monthly_rate = (annual_rate / 12) / 100
    
    schedule = []
    balance = principal
    
    for month in range(1, tenure_months + 1):
        interest = balance * monthly_rate
        principal_payment = emi - interest
        balance -= principal_payment
        
        # Handle final month rounding
        if month == tenure_months:
            principal_payment += balance
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

### 4.2 Risk Score Calculation Algorithm

```python
def calculate_risk_score(customer_data: dict, weights: dict) -> dict:
    """
    Calculate composite risk score from multiple factors.
    
    Args:
        customer_data: Dict with customer financial data
        weights: Dict with factor weights (must sum to 1.0)
        
    Returns:
        Dict with score, category, factors, explanations
    """
    # Calculate individual factor scores (each 0-100)
    income_stability = calculate_income_stability_score(customer_data)
    liquidity = calculate_liquidity_score(customer_data)
    debt_burden = calculate_debt_burden_score(customer_data)
    payment_behavior = calculate_payment_behavior_score(customer_data)
    credit_utilization = calculate_credit_utilization_score(customer_data)
    
    # Calculate weighted composite score
    composite_score = (
        income_stability * weights['income_stability'] +
        liquidity * weights['liquidity'] +
        debt_burden * weights['debt_burden'] +
        payment_behavior * weights['payment_behavior'] +
        credit_utilization * weights['credit_utilization']
    )
    
    # Determine category
    if composite_score >= 71:
        category = "healthy"
    elif composite_score >= 51:
        category = "watch"
    elif composite_score >= 31:
        category = "at_risk"
    else:
        category = "critical"
    
    # Generate explanations for low-scoring factors
    risk_factors = []
    
    if debt_burden < 60:
        dti_ratio = customer_data['total_debt'] / customer_data['monthly_income']
        risk_factors.append({
            "factor": "debt_burden",
            "impact": "high" if debt_burden < 40 else "medium",
            "description": f"Debt-to-income ratio is {dti_ratio:.1f}x, above healthy threshold of 2.0x"
        })
    
    if liquidity < 60:
        emergency_months = customer_data['emergency_fund_months']
        risk_factors.append({
            "factor": "liquidity",
            "impact": "medium",
            "description": f"Emergency fund covers only {emergency_months:.1f} months, recommended is 6 months"
        })
    
    # ... more factor explanations
    
    return {
        "risk_score": round(composite_score, 2),
        "risk_category": category,
        "factors": {
            "income_stability_score": round(income_stability, 2),
            "liquidity_score": round(liquidity, 2),
            "debt_burden_score": round(debt_burden, 2),
            "payment_behavior_score": round(payment_behavior, 2),
            "credit_utilization_score": round(credit_utilization, 2)
        },
        "weights": weights,
        "risk_factors": risk_factors
    }


def calculate_debt_burden_score(customer_data: dict) -> float:
    """
    Calculate debt burden score (0-100).
    Higher score = lower burden = healthier
    """
    dti_ratio = customer_data['total_debt'] / customer_data['monthly_income']
    emi_ratio = customer_data['total_emi'] / customer_data['monthly_income']
    
    # DTI scoring (ideal: <2.0, critical: >5.0)
    if dti_ratio <= 2.0:
        dti_score = 100
    elif dti_ratio >= 5.0:
        dti_score = 0
    else:
        # Linear interpolation between 2.0 and 5.0
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

### 4.3 Cash Flow Projection Algorithm

```python
def project_cash_flow(customer_data: dict, days: int = 90) -> dict:
    """
    Project daily cash flow for specified number of days.
    
    Args:
        customer_data: Customer financial history
        days: Number of days to project
        
    Returns:
        Dict with daily projections and alerts
    """
    # Analyze historical patterns
    income_pattern = detect_income_pattern(customer_data['transactions'])
    expense_patterns = detect_expense_patterns(customer_data['transactions'])
    
    current_balance = customer_data['current_balance']
    start_date = date.today()
    
    projections = []
    low_balance_alerts = []
    
    for day in range(days):
        projection_date = start_date + timedelta(days=day)
        
        # Calculate expected inflows for this day
        inflows = 0
        if is_salary_day(projection_date, income_pattern):
            inflows += income_pattern['average_amount']
        
        # Calculate expected outflows for this day
        outflows = 0
        for pattern in expense_patterns:
            if is_expense_day(projection_date, pattern):
                outflows += pattern['average_amount']
        
        # Add average daily discretionary expenses
        outflows += expense_patterns['daily_discretionary']
        
        # Calculate projected balance
        projected_balance = current_balance + inflows - outflows
        
        # Check for low balance
        if projected_balance < customer_data['minimum_safe_balance']:
            low_balance_alerts.append({
                "date": projection_date.isoformat(),
                "projected_balance": round(projected_balance, 2),
                "reason": determine_low_balance_reason(
                    projection_date, income_pattern, expense_patterns
                )
            })
        
        projections.append({
            "date": projection_date.isoformat(),
            "projected_balance": round(projected_balance, 2),
            "inflows": round(inflows, 2),
            "outflows": round(outflows, 2)
        })
        
        # Update balance for next iteration
        current_balance = projected_balance
    
    # Calculate summary statistics
    balances = [p['projected_balance'] for p in projections]
    min_balance = min(balances)
    min_balance_date = projections[balances.index(min_balance)]['date']
    
    return {
        "forecast_generated_at": datetime.now().isoformat(),
        "forecast_start_date": start_date.isoformat(),
        "forecast_end_date": (start_date + timedelta(days=days-1)).isoformat(),
        "current_balance": customer_data['current_balance'],
        "daily_projections": projections,
        "summary": {
            "minimum_balance": min_balance,
            "minimum_balance_date": min_balance_date,
            "average_balance": round(sum(balances) / len(balances), 2),
            "negative_balance_days": sum(1 for b in balances if b < 0),
            "low_balance_alerts": low_balance_alerts
        },
        "confidence_level": determine_confidence(income_pattern, expense_patterns)
    }
```

### 4.4 Loan Comparison Scoring Algorithm

```python
def score_loan_products(
    products: list[dict],
    customer_profile: dict,
    weights: dict
) -> list[dict]:
    """
    Score and rank loan products using multi-criteria analysis.
    
    Args:
        products: List of loan product details
        customer_profile: Customer financial profile
        weights: Scoring weights for each criterion
        
    Returns:
        List of products with scores, sorted by composite score DESC
    """
    scored_products = []
    
    # Calculate scores for each product
    for product in products:
        # 1. Total Cost Score (lower cost = higher score)
        total_cost = product['total_repayment'] + product['processing_fee']
        cost_score = calculate_cost_score(total_cost, products)
        
        # 2. Affordability Score
        new_emi_ratio = (
            (customer_profile['total_emi'] + product['emi']) /
            customer_profile['monthly_income']
        )
        affordability_score = calculate_affordability_score(new_emi_ratio)
        
        # 3. Resilience Impact Score
        projected_risk_score = project_risk_score_with_loan(
            customer_profile, product
        )
        current_risk = customer_profile['risk_score']
        impact_score = calculate_impact_score(
            current_risk, projected_risk_score
        )
        
        # 4. Tenure Suitability Score
        tenure_score = calculate_tenure_score(
            product['tenure_months'],
            customer_profile['preferred_tenure']
        )
        
        # 5. Fees Score
        fee_percent = (product['processing_fee'] / product['loan_amount']) * 100
        fees_score = calculate_fees_score(fee_percent)
        
        # 6. Flexibility Score
        flexibility_score = calculate_flexibility_score(product['features'])
        
        # Calculate weighted composite score
        composite_score = (
            cost_score * weights['total_cost'] +
            affordability_score * weights['affordability'] +
            impact_score * weights['resilience_impact'] +
            tenure_score * weights['tenure_suitability'] +
            fees_score * weights['fees'] +
            flexibility_score * weights['flexibility']
        )
        
        scored_products.append({
            **product,
            "scores": {
                "total_cost_score": round(cost_score, 2),
                "affordability_score": round(affordability_score, 2),
                "resilience_impact_score": round(impact_score, 2),
                "tenure_score": round(tenure_score, 2),
                "fees_score": round(fees_score, 2),
                "flexibility_score": round(flexibility_score, 2),
                "composite_score": round(composite_score, 2)
            }
        })
    
    # Sort by composite score (descending)
    scored_products.sort(key=lambda x: x['scores']['composite_score'], reverse=True)
    
    # Add rank and best_fit flag
    for i, product in enumerate(scored_products):
        product['rank'] = i + 1
        product['is_best_fit'] = (i == 0)
        
        if i == 0:
            product['recommendation_reason'] = generate_recommendation_reason(product)
    
    return scored_products


def calculate_affordability_score(emi_ratio: float) -> float:
    """
    Score affordability based on EMI-to-income ratio.
    
    Ideal: <30% = 100 points
    Acceptable: 30-40% = 70-100 points
    Risky: 40-50% = 30-70 points
    Unaffordable: >50% = 0-30 points
    """
    if emi_ratio <= 0.30:
        return 100
    elif emi_ratio <= 0.40:
        return 100 - ((emi_ratio - 0.30) / 0.10) * 30
    elif emi_ratio <= 0.50:
        return 70 - ((emi_ratio - 0.40) / 0.10) * 40
    else:
        return max(0, 30 - ((emi_ratio - 0.50) / 0.10) * 30)
```

---

## 5. Database Design Details

### 5.1 Key Relationships

```
customers
    ↓ 1:N
accounts
    ↓ 1:N
transactions

customers
    ↓ 1:N
financial_snapshots (time series)

customers
    ↓ 1:N
risk_assessments (time series)

customers
    ↓ 1:N
cashflow_forecasts (time series)

customers
    ↓ 1:N
interventions
    ↓ 1:N
recommendations

customers
    ↓ 1:N
loans
    ↓ 1:N
loan_payments

lenders
    ↓ 1:N
loan_products

customers
    ↓ 1:N
loan_comparisons
    ↓ M:N
loan_products (via JSONB)
```

### 5.2 Indexing Strategy

**Query Pattern: Fetch customer risk score**
```sql
SELECT * FROM risk_assessments
WHERE customer_id = ?
ORDER BY assessment_date DESC
LIMIT 1;
```
**Index:** `idx_risk_customer` on `(customer_id, assessment_date DESC)`

**Query Pattern: Fetch recent transactions**
```sql
SELECT * FROM transactions
WHERE customer_id = ?
  AND transaction_date >= ?
ORDER BY transaction_date DESC;
```
**Index:** `idx_transactions_customer` on `(customer_id, transaction_date DESC)`

**Query Pattern: Find at-risk customers (Officer dashboard)**
```sql
SELECT c.*, ra.risk_score
FROM customers c
JOIN risk_assessments ra ON ra.customer_id = c.id
WHERE c.assigned_officer_id = ?
  AND ra.risk_category IN ('critical', 'at_risk')
  AND ra.assessment_date = (
    SELECT MAX(assessment_date)
    FROM risk_assessments
    WHERE customer_id = c.id
  );
```
**Indexes:**
- `idx_customers_assigned_officer` on `assigned_officer_id`
- `idx_risk_category` on `risk_category`

### 5.3 Data Consistency Patterns

**Transaction Processing with Balance Update:**
```python
async def create_transaction(transaction_data: dict, db: Session):
    """
    Create transaction and update account balance atomically.
    """
    async with db.begin():  # Start transaction
        # 1. Create transaction record
        transaction = Transaction(**transaction_data)
        db.add(transaction)
        
        # 2. Update account balance
        account = db.query(Account).filter(
            Account.id == transaction_data['account_id']
        ).with_for_update().first()  # Row lock
        
        if transaction_data['transaction_type'] == 'credit':
            account.current_balance += transaction_data['amount']
        else:
            account.current_balance -= transaction_data['amount']
        
        # 3. Set balance_after on transaction
        transaction.balance_after = account.current_balance
        
        # 4. Commit (automatic with context manager)
    
    return transaction
```

---

## 6. UI/UX Design Patterns

### 6.1 Component Structure

**ResilienceScoreCard Component:**
```typescript
interface ResilienceScoreCardProps {
  score: number;
  category: 'critical' | 'at_risk' | 'watch' | 'healthy';
  previousScore?: number;
  trend?: 'improving' | 'stable' | 'declining';
  factors: RiskFactor[];
  aiExplanation?: string;
}

// Visual Design:
// ┌─────────────────────────────────────────┐
// │  Financial Resilience Score             │
// │                                         │
// │       ╭─────────╮                       │
// │      │    68.5  │  ↓ -3.5               │
// │       ╰─────────╯                       │
// │         Watch                           │
// │                                         │
// │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
// │  0    30       50      70         100  │
// │       ●────────●────── ●──────────●     │
// │   Critical At Risk Watch Healthy       │
// │                                         │
// │  Key Factors:                           │
// │  • Debt burden: High impact             │
// │  • Liquidity: Medium impact             │
// │                                         │
// │  [View Details →]                       │
// └─────────────────────────────────────────┘
```

**CashFlowChart Component:**
```typescript
interface CashFlowChartProps {
  projections: Array<{
    date: string;
    projectedBalance: number;
    inflows: number;
    outflows: number;
  }>;
  currentBalance: number;
  minimumSafeBalance: number;
  alerts: Array<{
    date: string;
    balance: number;
    reason: string;
  }>;
}

// Visual Design: Area chart with:
// - Green area for balance above safe threshold
// - Yellow area for balance below threshold
// - Red markers for critical dates
// - Income/expense event markers
```

### 6.2 Color System

```typescript
const colorSystem = {
  // Risk Categories
  risk: {
    critical: '#DC2626',   // Red-600
    atRisk: '#F59E0B',     // Amber-500
    watch: '#3B82F6',      // Blue-500
    healthy: '#10B981',    // Green-500
  },
  
  // Financial States
  financial: {
    positive: '#10B981',   // Green-500
    negative: '#DC2626',   // Red-600
    neutral: '#6B7280',    // Gray-500
    warning: '#F59E0B',    // Amber-500
  },
  
  // UI Elements
  ui: {
    primary: '#3B82F6',    // Blue-500
    secondary: '#8B5CF6',  // Violet-500
    success: '#10B981',    // Green-500
    error: '#DC2626',      // Red-600
    warning: '#F59E0B',    // Amber-500
    info: '#3B82F6',       // Blue-500
  },
  
  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',  // Gray-50
    tertiary: '#F3F4F6',   // Gray-100
  }
};
```

### 6.3 Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: '640px',    // sm
  tablet: '768px',    // md
  desktop: '1024px',  // lg
  wide: '1280px',     // xl
};

// Layout Strategy:
// Mobile: Single column, stacked cards
// Tablet: 2-column grid
// Desktop: 3-column grid with sidebar
// Wide: 4-column grid with wider sidebar
```

### 6.4 Loading States

```typescript
// Skeleton Loading Pattern
<Card>
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
    <div className="h-3 bg-gray-200 rounded w-full mb-1" />
    <div className="h-3 bg-gray-200 rounded w-5/6" />
  </div>
</Card>

// Progressive Loading
1. Show skeleton
2. Load critical data (risk score)
3. Load secondary data (factors)
4. Load tertiary data (AI explanation)
```

---

## 7. Security Design

### 7.1 Authentication Flow

```
1. User submits login credentials
       ↓
2. Frontend sends to Supabase Auth
       ↓
3. Supabase validates credentials
       ↓
4. Supabase returns JWT token
       ↓
5. Frontend stores token (httpOnly cookie + localStorage)
       ↓
6. All API requests include: Authorization: Bearer {token}
       ↓
7. Backend middleware validates token with Supabase
       ↓
8. Backend extracts user_id and role from token
       ↓
9. Backend enforces Row-Level Security at DB level
       ↓
10. Response returned only if authorized
```

### 7.2 Row-Level Security Implementation

```sql
-- Customer can only see own data
CREATE POLICY customer_access ON transactions
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM customers
    WHERE user_id = auth.uid()
  )
);

-- Officer can see assigned customers
CREATE POLICY officer_access ON customers
FOR SELECT
USING (
  assigned_officer_id = auth.uid()
  OR
  auth.jwt()->>'role' = 'admin'
);

-- Prevent data modification across customers
CREATE POLICY prevent_cross_customer_update ON transactions
FOR UPDATE
USING (
  customer_id IN (
    SELECT id FROM customers
    WHERE user_id = auth.uid()
  )
);
```

### 7.3 Input Validation Pattern

```python
from pydantic import BaseModel, Field, validator

class LoanComparisonRequest(BaseModel):
    loan_amount: float = Field(..., ge=10000, le=5000000)
    tenure_months: int = Field(..., ge=6, le=120)
    loan_type: str = Field(..., regex="^(personal|home|auto|education)$")
    
    @validator('loan_amount')
    def validate_amount(cls, v):
        if v % 1000 != 0:
            raise ValueError("Loan amount must be in multiples of 1000")
        return v
    
    @validator('tenure_months')
    def validate_tenure(cls, v):
        if v % 6 != 0:
            raise ValueError("Tenure must be in multiples of 6 months")
        return v
```

---

## 8. Performance Optimization

### 8.1 Caching Strategy

```python
from functools import lru_cache
from redis import Redis

# In-memory cache for frequently accessed data
@lru_cache(maxsize=1000)
def get_loan_products(loan_type: str, is_active: bool = True):
    """Cache loan products by type."""
    return db.query(LoanProduct).filter(
        LoanProduct.loan_type == loan_type,
        LoanProduct.is_active == is_active
    ).all()

# Redis cache for expensive calculations
async def get_risk_score(customer_id: str, cache: Redis):
    """Get risk score with caching."""
    cache_key = f"risk_score:{customer_id}"
    
    # Check cache
    cached = await cache.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Calculate
    risk_score = calculate_risk_score(customer_id)
    
    # Cache for 1 hour
    await cache.setex(cache_key, 3600, json.dumps(risk_score))
    
    return risk_score
```

### 8.2 Database Query Optimization

```python
# Bad: N+1 query problem
customers = db.query(Customer).all()
for customer in customers:
    risk_score = db.query(RiskAssessment).filter(
        RiskAssessment.customer_id == customer.id
    ).order_by(RiskAssessment.assessment_date.desc()).first()

# Good: Join with subquery
latest_assessments = (
    db.query(
        RiskAssessment.customer_id,
        func.max(RiskAssessment.assessment_date).label('latest_date')
    )
    .group_by(RiskAssessment.customer_id)
    .subquery()
)

customers_with_risk = (
    db.query(Customer, RiskAssessment)
    .join(latest_assessments, Customer.id == latest_assessments.c.customer_id)
    .join(
        RiskAssessment,
        and_(
            RiskAssessment.customer_id == Customer.id,
            RiskAssessment.assessment_date == latest_assessments.c.latest_date
        )
    )
    .all()
)
```

---

## 9. Error Handling Design

### 9.1 Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

// Example errors:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid loan amount",
    "details": {
      "field": "loan_amount",
      "constraint": "Must be between ₹10,000 and ₹50,00,000"
    }
  },
  "timestamp": "2026-09-03T16:30:00Z"
}
```

### 9.2 Frontend Error Handling

```typescript
async function fetchRiskScore(customerId: string): Promise<RiskScore> {
  try {
    const response = await apiClient.get(`/risk/score`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
      router.push('/login');
    } else if (error.response?.status === 403) {
      // Show permission denied
      toast.error("You don't have permission to view this data");
    } else if (error.response?.status >= 500) {
      // Server error
      toast.error("Service temporarily unavailable. Please try again.");
      // Log to monitoring service
      logError(error);
    } else {
      // Client error
      toast.error(error.response?.data?.error?.message || "An error occurred");
    }
    throw error;
  }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Test Examples

```python
# Test EMI calculation
def test_emi_calculation():
    emi = calculate_emi(principal=200000, annual_rate=12, tenure_months=24)
    assert emi == 9415.84, f"Expected 9415.84, got {emi}"
    
    # Test edge cases
    assert calculate_emi(100000, 0, 12) == 8333.33  # Zero interest
    
    with pytest.raises(ValueError):
        calculate_emi(-100000, 12, 24)  # Negative principal
        
    with pytest.raises(ValueError):
        calculate_emi(100000, 12, 0)  # Zero tenure

# Test risk score calculation
def test_risk_score():
    customer_data = {
        'monthly_income': 50000,
        'total_debt': 100000,
        'total_emi': 10000,
        'current_balance': 50000,
        # ... more data
    }
    
    result = calculate_risk_score(customer_data, DEFAULT_WEIGHTS)
    
    assert 0 <= result['risk_score'] <= 100
    assert result['risk_category'] in ['critical', 'at_risk', 'watch', 'healthy']
    assert len(result['factors']) == 5
```

### 10.2 Integration Test Examples

```python
# Test API endpoint
async def test_get_risk_score(client: TestClient, auth_token: str):
    response = await client.get(
        "/api/v1/risk/score",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data['success'] is True
    assert 'risk_score' in data['data']
    assert 'risk_category' in data['data']
```

### 10.3 E2E Test Examples

```typescript
// Playwright test
test('complete loan comparison flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to loan comparison
  await page.click('text=Compare Loans');
  
  // Fill form
  await page.fill('input[name="amount"]', '200000');
  await page.selectOption('select[name="tenure"]', '24');
  await page.click('button:has-text("Compare")');
  
  // Verify results
  await page.waitForSelector('.loan-comparison-results');
  const bestFit = await page.textContent('.best-fit-badge');
  expect(bestFit).toContain('Best Fit');
});
```

---

## 11. Deployment Design

### 11.1 Environment Configuration

```yaml
# Production Environment
Frontend (Vercel):
  - Auto-deploy from main branch
  - Environment variables:
    * NEXT_PUBLIC_API_URL
    * NEXT_PUBLIC_SUPABASE_URL
    * NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Edge functions for SSR
  - CDN caching

Backend (Render/Railway):
  - Auto-deploy from main branch
  - Environment variables:
    * DATABASE_URL
    * SUPABASE_SERVICE_KEY
    * OPENAI_API_KEY
    * JWT_SECRET
  - Health check: /health
  - Auto-scaling: 1-3 instances
  
Database (Supabase):
  - Managed PostgreSQL
  - Daily automated backups
  - Point-in-time recovery
  - Connection pooling
```

### 11.2 CI/CD Pipeline

```yaml
# .github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Run tests
        run: pytest backend/tests
      - name: Check coverage
        run: pytest --cov=backend --cov-report=xml
  
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
      - name: Build
        run: cd frontend && npm run build
  
  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy to Render
        run: render deploy --service=finshield-api
```

---

## 12. Monitoring & Observability

### 12.1 Logging Format

```python
import structlog

logger = structlog.get_logger()

# Structured logging
logger.info(
    "risk_score_calculated",
    customer_id=customer_id,
    risk_score=68.5,
    risk_category="watch",
    calculation_time_ms=234,
    factors={
        "income_stability": 75.0,
        "liquidity": 65.0,
        # ...
    }
)
```

### 12.2 Key Metrics to Track

```python
# Application Metrics
- API response time (p50, p95, p99)
- Error rate by endpoint
- Request throughput
- Active users

# Business Metrics
- Risk score distribution
- Intervention acceptance rate
- Loan comparison usage
- Average time to decision

# Infrastructure Metrics
- CPU usage
- Memory usage
- Database connections
- Query execution time
```

---

## Document Control

- **Version:** 1.0
- **Last Updated:** September 3, 2026
- **Sync With:** requirements.md, architecture.md, tasks.md
- **Next Review:** During implementation
