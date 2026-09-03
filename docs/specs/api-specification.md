# FinShield — API Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026  
**Status:** Draft

**Base URL:** `http://localhost:8000/api/v1` (Development)  
**Production URL:** `https://api.finshield.example.com/api/v1`

---

## 2. API Design Principles

- **RESTful** — Resource-based URLs, standard HTTP methods
- **JSON** — All requests and responses use JSON
- **Versioned** — `/api/v1/` prefix for version control
- **Authenticated** — Most endpoints require JWT token
- **Consistent** — Standard response format across all endpoints
- **Documented** — Auto-generated docs at `/docs` (FastAPI Swagger)

---

## 3. Authentication

### Auth Header

```http
Authorization: Bearer <JWT_TOKEN>
```

### Getting a Token

Use Supabase Auth to obtain JWT tokens. Backend validates with Supabase.

---

## 4. Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "timestamp": "2026-09-03T16:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": { /* additional error info */ }
  },
  "timestamp": "2026-09-03T16:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity (validation failed) |
| 500 | Internal Server Error |

---

## 5. API Endpoints

### 5.1 Health & System

#### GET /health

Health check endpoint.

**Authentication:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "version": "1.0.0"
  }
}
```

---

### 5.2 Authentication

Authentication is handled by Supabase. Backend validates JWT tokens.

#### POST /auth/validate

Validate JWT token and return user info.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

---

### 5.3 Customers

#### GET /customers/me

Get current customer profile.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+91-9876543210",
    "monthly_income": 50000.00,
    "employment_status": "employed",
    "customer_since": "2025-01-15",
    "status": "active"
  }
}
```

#### PUT /customers/me

Update current customer profile.

**Authentication:** Required

**Request Body:**
```json
{
  "phone": "+91-9876543210",
  "monthly_income": 55000.00
}
```

**Response:** Updated customer object

---

### 5.4 Accounts

#### GET /accounts

Get all accounts for current customer.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "account_number": "1234567890",
        "account_type": "savings",
        "current_balance": 45000.00,
        "available_balance": 45000.00,
        "status": "active"
      }
    ]
  }
}
```

#### GET /accounts/{account_id}

Get specific account details.

**Authentication:** Required

**Response:** Single account object

---

### 5.5 Transactions

#### GET /transactions

Get transactions for current customer.

**Authentication:** Required

**Query Parameters:**
- `account_id` (optional): Filter by account
- `start_date` (optional): ISO 8601 date
- `end_date` (optional): ISO 8601 date
- `category` (optional): Filter by category
- `limit` (default: 50, max: 500)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "account_id": "uuid",
        "transaction_date": "2026-09-01T10:30:00Z",
        "transaction_type": "credit",
        "amount": 50000.00,
        "category": "salary",
        "description": "Monthly salary",
        "balance_after": 95000.00
      }
    ],
    "total_count": 234,
    "limit": 50,
    "offset": 0
  }
}
```

#### POST /transactions

Create a new transaction (demo purposes).

**Authentication:** Required

**Request Body:**
```json
{
  "account_id": "uuid",
  "transaction_type": "debit",
  "amount": 5000.00,
  "category": "groceries",
  "description": "Monthly groceries"
}
```

**Response:** Created transaction object

---

### 5.6 Financial Health

#### GET /financial-health

Get complete financial health snapshot.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "snapshot_date": "2026-09-03",
    "monthly_income": 50000.00,
    "total_balance": 95000.00,
    "average_balance": 87000.00,
    "total_debt": 180000.00,
    "total_emi": 15000.00,
    "debt_to_income_ratio": 3.6,
    "emi_to_income_ratio": 0.30,
    "monthly_expenses": 30000.00,
    "essential_expenses": 20000.00,
    "discretionary_expenses": 10000.00,
    "savings_rate": 0.10,
    "emergency_fund_months": 3.17
  }
}
```

---

### 5.7 Risk Assessment

#### GET /risk/score

Get current risk score.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "assessment_date": "2026-09-03T16:30:00Z",
    "risk_score": 68.5,
    "risk_category": "watch",
    "previous_score": 72.0,
    "score_change": -3.5,
    "trend": "declining",
    "factors": {
      "income_stability_score": 75.0,
      "liquidity_score": 65.0,
      "debt_burden_score": 55.0,
      "payment_behavior_score": 80.0,
      "credit_utilization_score": 70.0
    },
    "weights": {
      "income_stability": 0.20,
      "liquidity": 0.25,
      "debt_burden": 0.25,
      "payment_behavior": 0.15,
      "credit_utilization": 0.15
    },
    "risk_factors": [
      {
        "factor": "debt_burden",
        "impact": "high",
        "description": "Debt-to-income ratio is 3.6x, above healthy threshold of 2.0x"
      },
      {
        "factor": "liquidity",
        "impact": "medium",
        "description": "Emergency fund covers only 3 months, recommended is 6 months"
      }
    ]
  }
}
```

#### GET /risk/history

Get risk score history.

**Authentication:** Required

**Query Parameters:**
- `days` (default: 90): Number of days of history

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "assessment_date": "2026-09-03",
        "risk_score": 68.5,
        "risk_category": "watch"
      },
      {
        "assessment_date": "2026-08-03",
        "risk_score": 72.0,
        "risk_category": "healthy"
      }
    ]
  }
}
```

#### GET /risk/prediction

Get ML-based distress prediction.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "distress_probability": 0.35,
    "risk_level": "medium",
    "confidence": 0.82,
    "contributing_features": [
      {
        "feature": "emi_to_income_ratio",
        "value": 0.30,
        "importance": 0.28
      },
      {
        "feature": "income_volatility",
        "value": 0.15,
        "importance": 0.22
      }
    ]
  }
}
```

---

### 5.8 Cash Flow Forecast

#### GET /forecast

Get cash flow forecast.

**Authentication:** Required

**Query Parameters:**
- `days` (default: 90, max: 180): Forecast period

**Response:**
```json
{
  "success": true,
  "data": {
    "forecast_generated_at": "2026-09-03T16:30:00Z",
    "forecast_period": {
      "start_date": "2026-09-04",
      "end_date": "2026-12-02"
    },
    "current_balance": 95000.00,
    "daily_projections": [
      {
        "date": "2026-09-04",
        "projected_balance": 93000.00,
        "inflows": 0.00,
        "outflows": 2000.00,
        "notes": "Rent payment"
      },
      {
        "date": "2026-09-05",
        "projected_balance": 78000.00,
        "inflows": 0.00,
        "outflows": 15000.00,
        "notes": "EMI payment"
      }
    ],
    "summary": {
      "minimum_balance": 4500.00,
      "minimum_balance_date": "2026-09-28",
      "average_balance": 65000.00,
      "negative_balance_days": 0,
      "low_balance_alerts": [
        {
          "date": "2026-09-28",
          "projected_balance": 4500.00,
          "reason": "Before salary, after all monthly expenses"
        }
      ]
    },
    "confidence_level": "high"
  }
}
```

---

### 5.9 Interventions

#### GET /interventions

Get recommended interventions.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): pending, accepted, rejected, expired

**Response:**
```json
{
  "success": true,
  "data": {
    "interventions": [
      {
        "id": "uuid",
        "intervention_type": "overdraft",
        "trigger_reason": "Upcoming cash flow gap detected",
        "trigger_score": 68.5,
        "recommendation_text": "Short-term overdraft to bridge gap until salary",
        "expected_impact": "Avoid payment defaults, maintain credit score",
        "status": "pending",
        "priority": "high",
        "recommended_date": "2026-09-03T16:30:00Z",
        "expiry_date": "2026-09-10T23:59:59Z"
      }
    ]
  }
}
```

#### GET /interventions/{intervention_id}

Get specific intervention details.

**Authentication:** Required

**Response:** Single intervention object with additional details

#### POST /interventions/{intervention_id}/accept

Accept an intervention.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "intervention_id": "uuid",
    "status": "accepted",
    "action_date": "2026-09-03T16:35:00Z",
    "next_steps": "Visit branch or complete online application"
  }
}
```

#### POST /interventions/{intervention_id}/reject

Reject an intervention.

**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Optional rejection reason"
}
```

**Response:** Updated intervention object

---

### 5.10 Overdraft

#### POST /overdraft/calculate

Calculate overdraft offer.

**Authentication:** Required

**Request Body:**
```json
{
  "required_amount": 10000.00,
  "expected_repayment_date": "2026-09-30"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "required_amount": 10000.00,
    "approved_amount": 10000.00,
    "duration_days": 27,
    "daily_interest_rate": 0.0005,
    "processing_fee": 100.00,
    "total_interest": 135.00,
    "total_repayment": 10235.00,
    "expected_repayment_date": "2026-09-30",
    "eligibility_check": {
      "minimum_income_met": true,
      "regular_salary_pattern": true,
      "no_recent_defaults": true,
      "within_limit": true
    },
    "impact": {
      "monthly_cost": 235.00,
      "impact_on_risk_score": -2.0
    }
  }
}
```

#### POST /overdraft/apply

Apply for overdraft.

**Authentication:** Required

**Request Body:**
```json
{
  "required_amount": 10000.00,
  "expected_repayment_date": "2026-09-30"
}
```

**Response:** Created overdraft offer

---

### 5.11 Loans

#### GET /loans

Get customer's existing loans.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "loans": [
      {
        "id": "uuid",
        "loan_number": "PL123456",
        "loan_type": "personal",
        "lender_name": "HDFC Bank",
        "principal_amount": 200000.00,
        "outstanding_principal": 180000.00,
        "interest_rate": 12.5,
        "tenure_months": 24,
        "emi_amount": 10000.00,
        "next_emi_date": "2026-10-05",
        "status": "active"
      }
    ]
  }
}
```

#### GET /loans/{loan_id}

Get specific loan details.

**Authentication:** Required

**Response:** Single loan object with payment history

---

### 5.12 Loan Comparison

#### POST /loans/compare

Compare loan products.

**Authentication:** Required

**Request Body:**
```json
{
  "loan_amount": 200000.00,
  "tenure_months": 24,
  "loan_type": "personal",
  "purpose": "debt_consolidation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison_id": "uuid",
    "loan_amount": 200000.00,
    "tenure_months": 24,
    "products": [
      {
        "product_id": "uuid",
        "lender_name": "HDFC Bank",
        "product_name": "Personal Loan Premium",
        "interest_rate": 11.5,
        "emi": 9427.00,
        "total_interest": 26248.00,
        "total_repayment": 226248.00,
        "processing_fee": 2000.00,
        "total_cost": 228248.00,
        "affordability": {
          "emi_to_income_ratio": 0.189,
          "monthly_surplus_after_emi": 5573.00,
          "affordable": true
        },
        "impact": {
          "new_debt_to_income_ratio": 4.53,
          "projected_risk_score": 65.0,
          "risk_score_change": -3.5
        },
        "scores": {
          "total_cost_score": 85.0,
          "affordability_score": 90.0,
          "resilience_impact_score": 70.0,
          "tenure_score": 80.0,
          "fees_score": 88.0,
          "flexibility_score": 75.0,
          "composite_score": 82.3
        },
        "rank": 1,
        "is_best_fit": true,
        "recommendation_reason": "Best balance of low cost and manageable EMI with minimal risk impact"
      },
      {
        "product_id": "uuid",
        "lender_name": "ICICI Bank",
        "product_name": "QuickCash Personal Loan",
        "interest_rate": 12.0,
        "emi": 9496.00,
        "total_interest": 27904.00,
        "total_repayment": 227904.00,
        "processing_fee": 3000.00,
        "total_cost": 230904.00,
        "scores": {
          "composite_score": 79.5
        },
        "rank": 2,
        "is_best_fit": false
      }
    ],
    "best_fit_product_id": "uuid",
    "weights_used": {
      "total_cost": 0.30,
      "affordability": 0.25,
      "resilience_impact": 0.20,
      "tenure": 0.10,
      "fees": 0.05,
      "flexibility": 0.10
    }
  }
}
```

#### GET /loans/compare/{comparison_id}

Retrieve saved comparison.

**Authentication:** Required

**Response:** Same as POST response

---

### 5.13 Loan Products (Admin)

#### GET /loan-products

Get all loan products.

**Authentication:** Required (Admin/Officer)

**Query Parameters:**
- `lender_id` (optional)
- `loan_type` (optional)
- `is_active` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "lender_id": "uuid",
        "lender_name": "HDFC Bank",
        "product_name": "Personal Loan Premium",
        "loan_type": "personal",
        "min_loan_amount": 50000.00,
        "max_loan_amount": 2000000.00,
        "min_interest_rate": 10.5,
        "max_interest_rate": 16.0,
        "min_tenure_months": 12,
        "max_tenure_months": 60,
        "processing_fee_percent": 1.0,
        "is_active": true
      }
    ]
  }
}
```

---

### 5.14 Simulator

#### POST /simulator/loan

Simulate loan impact.

**Authentication:** Required

**Request Body:**
```json
{
  "loan_amount": 200000.00,
  "interest_rate": 11.5,
  "tenure_months": 24,
  "processing_fee": 2000.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "uuid",
    "inputs": {
      "loan_amount": 200000.00,
      "interest_rate": 11.5,
      "tenure_months": 24,
      "processing_fee": 2000.00
    },
    "calculations": {
      "emi": 9427.00,
      "total_interest": 26248.00,
      "total_repayment": 226248.00,
      "total_cost": 228248.00
    },
    "current_state": {
      "monthly_income": 50000.00,
      "total_emi": 15000.00,
      "emi_to_income_ratio": 0.30,
      "risk_score": 68.5,
      "monthly_surplus": 5000.00
    },
    "projected_state": {
      "total_emi": 24427.00,
      "emi_to_income_ratio": 0.489,
      "risk_score": 58.0,
      "monthly_surplus": -4427.00
    },
    "impact": {
      "emi_increase": 9427.00,
      "risk_score_change": -10.5,
      "surplus_change": -9427.00,
      "affordability": "not_affordable",
      "recommendation": "This loan would significantly strain your finances. Consider a longer tenure or smaller amount."
    }
  }
}
```

#### POST /simulator/emi

Simulate EMI for different scenarios.

**Authentication:** Required

**Request Body:**
```json
{
  "principal": 200000.00,
  "interest_rate": 11.5,
  "tenure_months": 24
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emi": 9427.00,
    "total_interest": 26248.00,
    "total_repayment": 226248.00,
    "amortization_schedule": [
      {
        "month": 1,
        "emi": 9427.00,
        "principal": 7510.00,
        "interest": 1917.00,
        "balance": 192490.00
      }
      // ... more months
    ]
  }
}
```

---

### 5.15 Recommendations

#### GET /recommendations

Get personalized recommendations.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "uuid",
        "recommendation_type": "spending_adjustment",
        "title": "Reduce discretionary spending by ₹3,000/month",
        "description": "Your discretionary spending has increased by 25% in the last 3 months...",
        "current_risk_score": 68.5,
        "projected_risk_score": 72.0,
        "impact_summary": "Improves risk score by 3.5 points, increases emergency fund coverage",
        "priority": 1,
        "confidence": 85.0,
        "ai_explanation": "Based on your transaction history...",
        "status": "active",
        "recommended_at": "2026-09-03T16:30:00Z"
      }
    ]
  }
}
```

---

### 5.16 AI Explanations

#### POST /ai/explain

Get AI-generated explanation.

**Authentication:** Required

**Request Body:**
```json
{
  "context_type": "risk_score",
  "context_data": {
    "risk_score": 68.5,
    "factors": [ /* risk factors */ ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "Your financial resilience score of 68.5 indicates you're in the 'Watch' category. This means your financial situation requires attention. The main factors affecting your score are...",
    "generated_at": "2026-09-03T16:30:00Z"
  }
}
```

---

### 5.17 Bank Officer Endpoints

#### GET /officer/customers

Get customers assigned to officer.

**Authentication:** Required (Officer role)

**Query Parameters:**
- `risk_category` (optional): Filter by risk
- `limit`, `offset`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customer_id": "uuid",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "risk_score": 68.5,
        "risk_category": "watch",
        "pending_interventions": 2,
        "last_assessment_date": "2026-09-03"
      }
    ],
    "total_count": 45
  }
}
```

#### GET /officer/customers/{customer_id}/details

Get detailed customer view for officer.

**Authentication:** Required (Officer role)

**Response:** Complete customer financial profile

---

## 6. Error Codes

| Code | Description |
|------|-------------|
| AUTH_REQUIRED | Authentication token missing |
| AUTH_INVALID | Invalid or expired token |
| AUTH_FORBIDDEN | Insufficient permissions |
| VALIDATION_ERROR | Request validation failed |
| RESOURCE_NOT_FOUND | Requested resource doesn't exist |
| DUPLICATE_RESOURCE | Resource already exists |
| CALCULATION_ERROR | Financial calculation failed |
| ML_PREDICTION_ERROR | ML model prediction failed |
| LLM_API_ERROR | LLM service unavailable |
| DATABASE_ERROR | Database operation failed |
| EXTERNAL_API_ERROR | External service error |

---

## 7. Rate Limiting

- **Rate Limit:** 60 requests per minute per user
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: UTC timestamp of reset

**Response when rate limited:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 45
  }
}
```

---

## 8. Pagination

For endpoints returning lists:

**Query Parameters:**
- `limit` (default: 50, max: 500)
- `offset` (default: 0)

**Response includes:**
```json
{
  "data": {
    "items": [ /* array of items */ ],
    "total_count": 234,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 9. API Testing

**Swagger UI:** `http://localhost:8000/docs`  
**ReDoc:** `http://localhost:8000/redoc`

**Example using cURL:**

```bash
# Get risk score
curl -X GET "http://localhost:8000/api/v1/risk/score" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Compare loans
curl -X POST "http://localhost:8000/api/v1/loans/compare" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 200000,
    "tenure_months": 24,
    "loan_type": "personal"
  }'
```

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Next Review: Post-MVP Implementation
