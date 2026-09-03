# FinShield — Architecture Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026  
**Status:** Draft

This document defines the high-level architecture of the FinShield platform.

---

## 2. Architecture Principles

### 2.1 Core Principles

1. **Deterministic Financial Calculations** — Money calculations must be predictable and accurate
2. **Explainable AI** — All recommendations must be traceable and explainable
3. **AI Assists, Not Decides** — LLM explains; engines calculate and decide
4. **Responsible Lending** — Minimize unnecessary borrowing
5. **Security by Design** — Data isolation and access control built-in
6. **Modular Monolith** — Simple architecture for fast iteration
7. **Configuration Over Code** — Business rules externalized
8. **Test-Driven Quality** — Critical paths must be tested

### 2.2 Design Philosophy

- **Separation of Concerns** — Each engine has single responsibility
- **Data Flow Transparency** — Clear lineage from data → calculation → explanation
- **Fail-Safe Defaults** — Conservative recommendations when uncertain
- **Progressive Enhancement** — System works without LLM if needed

---

## 3. High-Level Architecture

### 3.1 System Context Diagram

```
┌─────────────┐
│  Customer   │
└──────┬──────┘
       │
       │ HTTPS
       │
┌──────▼──────────────────────────────────────────────┐
│              FinShield Platform                      │
│                                                      │
│  ┌────────────────┐         ┌──────────────────┐   │
│  │  Next.js       │         │   FastAPI        │   │
│  │  Frontend      │◄───────►│   Backend        │   │
│  │                │   REST   │                  │   │
│  └────────────────┘         └────────┬─────────┘   │
│                                      │              │
│                             ┌────────▼─────────┐   │
│                             │   PostgreSQL     │   │
│                             │   (Supabase)     │   │
│                             └──────────────────┘   │
└──────────────────────────────────────┬─────────────┘
                                       │
                          ┌────────────▼──────────────┐
                          │   External Services       │
                          │  - OpenAI/Anthropic LLM   │
                          │  - Email (future)         │
                          └───────────────────────────┘
```

### 3.2 Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Internet                            │
└────────────┬──────────────────────┬──────────────────┘
             │                      │
    ┌────────▼──────────┐  ┌───────▼────────────┐
    │   Vercel CDN      │  │  Render/Railway    │
    │   (Frontend)      │  │  (Backend API)     │
    │                   │  │                    │
    │  - Next.js App    │  │  - FastAPI         │
    │  - Static Assets  │  │  - Python Services │
    │  - Edge Functions │  │  - ML Models       │
    └───────────────────┘  └──────────┬─────────┘
                                      │
                            ┌─────────▼──────────┐
                            │   Supabase         │
                            │                    │
                            │  - PostgreSQL DB   │
                            │  - Auth Service    │
                            │  - Row-Level Sec   │
                            └────────────────────┘
```

---

## 4. Backend Architecture

### 4.1 Service Layer Organization

```
backend/
├── main.py                    # FastAPI application entry
├── config/
│   ├── settings.py           # Configuration management
│   └── constants.py          # Business rule constants
├── models/
│   ├── database.py           # SQLAlchemy models
│   └── schemas.py            # Pydantic request/response models
├── api/
│   ├── v1/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── customers.py      # Customer management
│   │   ├── accounts.py       # Account endpoints
│   │   ├── transactions.py   # Transaction endpoints
│   │   ├── financial_health.py
│   │   ├── risk.py
│   │   ├── forecast.py
│   │   ├── interventions.py
│   │   ├── overdraft.py
│   │   ├── loans.py
│   │   ├── simulator.py
│   │   └── recommendations.py
│   └── dependencies.py       # Shared dependencies
├── services/
│   ├── financial_engine/
│   │   ├── __init__.py
│   │   ├── calculator.py     # Core financial math
│   │   ├── emi.py           # EMI calculations
│   │   └── ratios.py        # Financial ratios
│   ├── risk_engine/
│   │   ├── __init__.py
│   │   ├── scorer.py         # Risk score calculation
│   │   ├── factors.py        # Individual risk factors
│   │   └── weights.py        # Configurable weights
│   ├── forecast_engine/
│   │   ├── __init__.py
│   │   ├── predictor.py      # Cash-flow prediction
│   │   ├── patterns.py       # Pattern detection
│   │   └── projections.py    # Balance projections
│   ├── intervention_engine/
│   │   ├── __init__.py
│   │   ├── evaluator.py      # Intervention logic
│   │   ├── hierarchy.py      # Intervention ordering
│   │   └── rules.py          # Business rules
│   ├── overdraft_engine/
│   │   ├── __init__.py
│   │   ├── eligibility.py    # Eligibility checks
│   │   └── calculator.py     # Cost calculations
│   ├── loan_engine/
│   │   ├── __init__.py
│   │   ├── comparator.py     # Loan comparison
│   │   ├── scorer.py         # Loan scoring
│   │   └── eligibility.py    # Loan eligibility
│   ├── recommendation_engine/
│   │   ├── __init__.py
│   │   ├── ranker.py         # Recommendation ranking
│   │   └── explainer.py      # Reason generation
│   └── ai_service/
│       ├── __init__.py
│       ├── llm_client.py     # LLM API wrapper
│       ├── prompts.py        # Prompt templates
│       └── explainer.py      # Explanation generation
├── ml/
│   ├── model.py              # ML model wrapper
│   ├── trainer.py            # Model training
│   └── features.py           # Feature engineering
├── utils/
│   ├── logging.py
│   ├── validators.py
│   └── formatters.py
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

### 4.2 Service Communication Pattern

```
API Endpoint
     ↓
Controller (route handler)
     ↓
Service Orchestration Layer
     ↓
┌──────────────┬──────────────┬──────────────┐
│              │              │              │
▼              ▼              ▼              ▼
Financial    Risk         Forecast      Intervention
Engine       Engine       Engine        Engine
     ↓            ↓            ↓              ↓
        Data Access Layer (Repository Pattern)
                    ↓
               Database
```

### 4.3 Data Flow Example: Risk Score Calculation

```
1. API Request: GET /api/v1/risk/{customer_id}
              ↓
2. Route Handler (api/v1/risk.py)
              ↓
3. Risk Engine Service
              ↓
4. Fetch customer data (accounts, transactions, loans)
              ↓
5. Calculate individual risk factors:
   - Income Stability Factor
   - Liquidity Factor
   - Debt Burden Factor
   - Payment Behavior Factor
   - Credit Utilization Factor
              ↓
6. Apply configurable weights
              ↓
7. Calculate composite score
              ↓
8. Generate explanation structure
              ↓
9. (Optional) LLM enriches explanation
              ↓
10. Return response with score + explanations
```

---

## 5. Frontend Architecture

### 5.1 Application Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (customer)/
│   │   ├── dashboard/
│   │   ├── health/
│   │   ├── forecast/
│   │   ├── interventions/
│   │   ├── loans/
│   │   └── simulator/
│   ├── (officer)/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   └── reports/
│   └── (admin)/
│       ├── dashboard/
│       ├── lenders/
│       └── settings/
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── charts/                   # Recharts wrappers
│   ├── financial/                # Financial widgets
│   │   ├── ResilienceScoreCard.tsx
│   │   ├── CashFlowChart.tsx
│   │   ├── RiskFactorBreakdown.tsx
│   │   └── LoanComparison.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api/                      # API client functions
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   └── supabase/                 # Supabase client
├── types/
│   └── index.ts                  # TypeScript definitions
└── styles/
    └── globals.css               # Global styles
```

### 5.2 State Management

**Approach:** React Server Components + Client Components with hooks

- **Server Components:** Fetch data on server for initial page load
- **Client Components:** Interactive UI with local state
- **React Query (TanStack Query):** API caching and synchronization
- **Context API:** Global state (user, theme)

### 5.3 Component Hierarchy Example: Dashboard

```
DashboardPage (Server Component)
├── DashboardLayout
│   ├── Header
│   │   ├── UserMenu
│   │   └── Notifications
│   ├── Sidebar
│   │   └── Navigation
│   └── MainContent
│       ├── ResilienceScoreCard (Client)
│       │   ├── ScoreGauge
│       │   ├── TrendIndicator
│       │   └── FactorBreakdown
│       ├── CashFlowForecastCard (Client)
│       │   ├── TimelineChart
│       │   ├── AlertIndicators
│       │   └── DetailView
│       ├── InterventionsCard (Client)
│       │   └── InterventionList
│       └── QuickActionsCard (Client)
│           ├── SimulateLoanButton
│           └── CompareLoanButton
```

---

## 6. Database Architecture

### 6.1 Schema Design Principles

- **Normalization:** 3NF for transactional data
- **Denormalization:** Calculated snapshots for performance
- **Partitioning:** Transaction tables by date
- **Indexing:** Strategic indexes on query patterns
- **Constraints:** Foreign keys, check constraints for data integrity
- **Timestamps:** Created/updated timestamps on all tables
- **Soft Deletes:** Logical deletes with deleted_at column

### 6.2 Core Entity Relationships

```
customers (1) ──── (n) accounts
customers (1) ──── (n) financial_snapshots
customers (1) ──── (n) risk_assessments
customers (1) ──── (n) interventions

accounts (1) ──── (n) transactions

customers (1) ──── (n) loans
loans (1) ──── (n) loan_payments

customers (1) ──── (n) cashflow_forecasts
customers (1) ──── (n) overdraft_offers

interventions (1) ──── (n) recommendations
```

### 6.3 Data Access Patterns

**Read-Heavy Operations:**
- Dashboard loading
- Risk score retrieval
- Cash-flow forecast display

**Optimization Strategy:**
- Materialized views for aggregations
- Caching layer (Redis for production)
- Pre-calculated snapshots

**Write Operations:**
- Transaction recording
- Score updates
- Intervention logging

**Consistency Requirements:**
- Strong consistency for financial calculations
- Eventual consistency acceptable for analytics

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
1. User enters credentials
              ↓
2. Frontend sends to Supabase Auth
              ↓
3. Supabase returns JWT token
              ↓
4. Frontend stores token (httpOnly cookie)
              ↓
5. All API requests include token in header
              ↓
6. Backend validates JWT with Supabase
              ↓
7. Backend extracts user_id and role
              ↓
8. Row-Level Security enforced at DB level
```

### 7.2 Authorization Model

**Role-Based Access Control (RBAC):**

| Role | Permissions |
|------|-------------|
| Customer | Own data only (enforced by RLS) |
| Bank Officer | Assigned customers only |
| Admin | All data (for demo purposes) |

**Row-Level Security Policies:**

```sql
-- Customers can only see their own data
CREATE POLICY customer_isolation ON transactions
  FOR SELECT
  USING (customer_id = auth.uid());

-- Bank officers can see assigned customers
CREATE POLICY officer_access ON customers
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT officer_id FROM customer_assignments
      WHERE customer_id = customers.id
    )
  );
```

### 7.3 Data Protection

- **Encryption at Rest:** PostgreSQL encryption
- **Encryption in Transit:** TLS 1.3
- **Token Storage:** httpOnly cookies
- **API Rate Limiting:** 60 requests/minute/user
- **Input Validation:** Pydantic models
- **SQL Injection Prevention:** Parameterized queries
- **XSS Prevention:** React auto-escaping

---

## 8. Integration Architecture

### 8.1 External Service Integration

**LLM API (OpenAI/Anthropic):**
- **Pattern:** Request/Response with retry logic
- **Timeout:** 30 seconds
- **Fallback:** System works without LLM
- **Caching:** Cache common explanations

**Email Service (Future):**
- **Pattern:** Async queue
- **Provider:** SendGrid/AWS SES

### 8.2 API Design

**RESTful Principles:**
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- Standard status codes
- JSON payloads
- Versioned (/api/v1/)

**Response Format:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message",
  "timestamp": "2026-09-03T16:30:00Z"
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "User-friendly error message",
    "details": { /* validation errors */ }
  },
  "timestamp": "2026-09-03T16:30:00Z"
}
```

---

## 9. Scalability Considerations

### 9.1 Current Architecture (MVP)

- **Users:** 100 concurrent
- **Data:** 1,000 customers, 100K transactions
- **Infrastructure:** Single backend instance, managed database

### 9.2 Future Scaling Path

**Phase 1: Vertical Scaling**
- Increase server resources
- Optimize queries
- Add database indexes
- Implement caching

**Phase 2: Horizontal Scaling**
- Multiple backend instances
- Load balancer
- Redis for session/cache
- Database read replicas

**Phase 3: Microservices**
- Split engines into separate services
- Message queue (RabbitMQ/Kafka)
- Service mesh
- Distributed tracing

---

## 10. Monitoring and Observability

### 10.1 Logging Strategy

**Log Levels:**
- ERROR: System errors requiring immediate attention
- WARN: Unexpected conditions that don't break functionality
- INFO: Important business events
- DEBUG: Detailed diagnostic information

**Log Structure:**
```json
{
  "timestamp": "2026-09-03T16:30:00Z",
  "level": "INFO",
  "service": "risk_engine",
  "event": "risk_score_calculated",
  "customer_id": "123",
  "score": 68,
  "duration_ms": 234
}
```

### 10.2 Metrics

**Application Metrics:**
- API response times
- Error rates
- Request throughput
- ML model prediction latency

**Business Metrics:**
- Risk score distribution
- Intervention effectiveness
- Loan comparison usage
- User engagement

### 10.3 Alerts

- Backend error rate > 5%
- API response time > 2s (p95)
- Database connection failures
- LLM API failures

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

- **Database:** Daily automated backups (Supabase)
- **Retention:** 30 days
- **Testing:** Monthly restore testing

### 11.2 Recovery Procedures

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours

---

## 12. Technology Justification

### 12.1 Why Next.js?
- Server-side rendering for SEO and performance
- File-based routing
- API routes for BFF pattern
- Excellent developer experience
- Vercel deployment integration

### 12.2 Why FastAPI?
- Fast development
- Automatic API documentation
- Type safety with Pydantic
- Async support
- Python ecosystem for financial/ML

### 12.3 Why PostgreSQL?
- ACID compliance for financial data
- Rich query capabilities
- JSON support for flexible schemas
- Excellent tooling
- Supabase managed service

### 12.4 Why Modular Monolith?
- Simpler deployment for MVP
- Lower operational complexity
- Faster development
- Easier testing
- Can migrate to microservices later

---

## 13. Architecture Decision Records (ADRs)

### ADR-001: Use Deterministic Risk Scoring
**Context:** Need explainable financial decisions  
**Decision:** Use weighted factor model, not black-box ML  
**Consequences:** More transparent but potentially less accurate

### ADR-002: LLM for Explanation Only
**Context:** Need natural language but ensure accuracy  
**Decision:** LLM receives calculated facts, doesn't compute  
**Consequences:** Adds complexity but maintains accuracy

### ADR-003: Monolithic Backend
**Context:** Limited team size, tight timeline  
**Decision:** Single FastAPI application, not microservices  
**Consequences:** Simpler but may need refactoring later

### ADR-004: Supabase for Auth + DB
**Context:** Need managed infrastructure  
**Decision:** Use Supabase for PostgreSQL and auth  
**Consequences:** Faster setup but vendor lock-in

---

## 14. Architecture Review

**Strengths:**
- Clear separation of concerns
- Scalable design
- Security built-in
- Modern tech stack
- Fast development path

**Risks:**
- LLM API dependency
- Single point of failure (monolith)
- Supabase vendor lock-in

**Mitigations:**
- LLM fallback logic
- Comprehensive testing
- Database export capabilities

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Next Review: Post-MVP Implementation
