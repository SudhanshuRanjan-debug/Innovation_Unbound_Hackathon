# FinShield — System Design Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026  
**Status:** Design Specification

This document provides detailed system design including component interactions, data flows, and sequence diagrams.

---

## 2. Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐               │
│  │ Dashboard  │  │   Health   │  │    Loans    │  + More Pages  │
│  │   Pages    │  │   Pages    │  │    Pages    │               │
│  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘               │
│        │                │                │                       │
│        └────────────────┴────────────────┘                       │
│                         │                                        │
│                  ┌──────▼──────┐                                │
│                  │  API Client │                                 │
│                  └──────┬──────┘                                │
└─────────────────────────┼─────────────────────────────────────┘
                          │ HTTP/JSON
┌─────────────────────────▼─────────────────────────────────────┐
│                     Backend Layer                               │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              API Router (FastAPI)                      │    │
│  │  /customers  /risk  /forecast  /loans  /interventions │    │
│  └────┬────────┬────────┬────────┬────────┬─────────────┘    │
│       │        │        │        │        │                    │
│  ┌────▼────────▼────────▼────────▼────────▼─────────────┐    │
│  │           Service Orchestration Layer                  │    │
│  └────┬─────────┬─────────┬─────────┬─────────┬─────────┘    │
│       │         │         │         │         │                │
│  ┌────▼───┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐         │
│  │Financial│ │ Risk  │ │Forecast│ │Interv.│ │ Loan  │         │
│  │ Engine  │ │Engine │ │ Engine │ │Engine │ │Engine │         │
│  └────┬───┘ └──┬────┘ └──┬────┘ └──┬────┘ └──┬────┘         │
│       │        │         │         │         │                │
│  ┌────▼────────▼─────────▼─────────▼─────────▼─────────┐    │
│  │           Repository/Data Access Layer                │    │
│  └────────────────────────┬──────────────────────────────┘    │
└───────────────────────────┼───────────────────────────────────┘
                            │ SQL
┌───────────────────────────▼───────────────────────────────────┐
│                    PostgreSQL Database                          │
│  Customers | Accounts | Transactions | Loans | Risk Scores    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Sequence Diagrams

### 3.1 User Login Flow

```
User          Frontend       Supabase       Backend        Database
 │                │              │              │              │
 │─Login Form────>│              │              │              │
 │                │              │              │              │
 │                │─Auth Request>│              │              │
 │                │              │              │              │
 │                │<─JWT Token───│              │              │
 │                │              │              │              │
 │<─Redirect─────│              │              │              │
 │  Dashboard    │              │              │              │
 │                │              │              │              │
 │                │─GET /customers/me─────────>│              │
 │                │   (with JWT)               │              │
 │                │              │              │              │
 │                │              │<─Validate───│              │
 │                │              │   JWT       │              │
 │                │              │              │              │
 │                │              │──────────────│─Query────────>│
 │                │              │              │   Customer   │
 │                │              │              │<─Data────────│
 │                │              │              │              │
 │                │<─Customer Data──────────────│              │
 │                │              │              │              │
 │<─Display──────│              │              │              │
 │  Dashboard    │              │              │              │
```

### 3.2 Risk Score Calculation Flow

```
Frontend       Backend       Risk Engine    Repository    Database
 │                │              │              │              │
 │─GET /risk/────>│              │              │              │
 │  score        │              │              │              │
 │                │              │              │              │
 │                │─Calculate───>│              │              │
 │                │  Risk Score  │              │              │
 │                │              │              │              │
 │                │              │─Fetch Data──>│              │
 │                │              │              │              │
 │                │              │              │─Query────────>│
 │                │              │              │ Transactions,│
 │                │              │              │ Loans, etc.  │
 │                │              │              │<─Data────────│
 │                │              │<─Data────────│              │
 │                │              │              │              │
 │                │              │─Calculate────│              │
 │                │              │ Factors      │              │
 │                │              │              │              │
 │                │              │─Weight &─────│              │
 │                │              │ Composite    │              │
 │                │              │              │              │
 │                │              │─Generate─────│              │
 │                │              │ Explanations │              │
 │                │              │              │              │
 │                │              │─Save Result─>│              │
 │                │              │              │              │
 │                │              │              │─INSERT───────>│
 │                │              │              │ risk_        │
 │                │              │              │ assessments  │
 │                │<─Risk Score──│              │              │
 │                │  + Factors   │              │              │
 │                │              │              │              │
 │<─JSON Response─│              │              │              │
```

### 3.3 Loan Comparison Flow

```
User      Frontend    Backend     Loan Engine   Repository   Database
 │           │           │              │            │            │
 │─Enter────>│           │              │            │            │
 │ Loan Req  │           │              │            │            │
 │           │           │              │            │            │
 │           │─POST /loans/compare─────>│            │            │
 │           │  {amount, tenure}        │            │            │
 │           │           │              │            │            │
 │           │           │─Compare─────>│            │            │
 │           │           │              │            │            │
 │           │           │              │─Fetch─────>│            │
 │           │           │              │ Customer   │            │
 │           │           │              │ Profile    │            │
 │           │           │              │            │─Query─────>│
 │           │           │              │            │<─Data──────│
 │           │           │              │<─Profile───│            │
 │           │           │              │            │            │
 │           │           │              │─Fetch─────>│            │
 │           │           │              │ Eligible   │            │
 │           │           │              │ Products   │            │
 │           │           │              │            │─Query─────>│
 │           │           │              │            │<─Products──│
 │           │           │              │<─Products──│            │
 │           │           │              │            │            │
 │           │           │              │─For Each───│            │
 │           │           │              │ Product:   │            │
 │           │           │              │ Calculate  │            │
 │           │           │              │ EMI, Cost, │            │
 │           │           │              │ Score      │            │
 │           │           │              │            │            │
 │           │           │              │─Rank by────│            │
 │           │           │              │ Composite  │            │
 │           │           │              │ Score      │            │
 │           │           │              │            │            │
 │           │           │              │─Save──────>│            │
 │           │           │              │ Comparison │            │
 │           │           │              │            │─INSERT────>│
 │           │           │<─Ranked Products──────────│            │
 │           │           │              │            │            │
 │           │<─Comparison Results──────│            │            │
 │           │           │              │            │            │
 │<─Display──│           │              │            │            │
 │ Results   │           │              │            │            │
```

---

## 4. Data Flow Patterns

### 4.1 Read-Heavy Operations

**Pattern:** Cache → Database → Response

```python
async def get_risk_score(customer_id: str, cache: Cache, db: Session):
    # 1. Check cache first
    cached = await cache.get(f"risk:{customer_id}")
    if cached:
        return cached
    
    # 2. Query database
    risk_score = calculate_and_fetch_from_db(customer_id, db)
    
    # 3. Cache result
    await cache.set(f"risk:{customer_id}", risk_score, ttl=3600)
    
    return risk_score
```

### 4.2 Write Operations with Side Effects

**Pattern:** Validate → Write → Update Dependent Data → Notify

```python
async def create_transaction(transaction_data: dict, db: Session):
    # 1. Validate transaction
    validate_transaction(transaction_data)
    
    # 2. Start database transaction
    async with db.begin():
        # 3. Create transaction record
        transaction = Transaction(**transaction_data)
        db.add(transaction)
        
        # 4. Update account balance
        update_account_balance(transaction)
        
        # 5. Commit transaction
        await db.commit()
    
    # 6. Trigger side effects (outside DB transaction)
    await invalidate_cache(customer_id)
    await trigger_risk_recalculation(customer_id)
    await check_for_interventions(customer_id)
    
    return transaction
```

---

## 5. State Management

### 5.1 Frontend State Architecture

```typescript
// Global State (Context API)
interface GlobalState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

// Server State (React Query)
interface ServerState {
  riskScore: UseQueryResult<RiskScore>;
  cashFlowForecast: UseQueryResult<Forecast>;
  loans: UseQueryResult<Loan[]>;
  // ... more server data
}

// Local Component State (useState)
// Form inputs, UI toggles, etc.
```

### 5.2 Backend State Management

```python
# Stateless API Design
# All state stored in:
# 1. Database (persistent)
# 2. Cache (temporary)
# 3. JWT tokens (session)

# No in-memory state between requests
# Enables horizontal scaling
```

---

## 6. Integration Patterns

### 6.1 External LLM Integration

```python
class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.fallback_enabled = True
        self.cache = TTLCache(maxsize=1000, ttl=3600)
    
    async def explain(self, context_type: str, data: dict) -> str:
        # 1. Check cache
        cache_key = f"{context_type}:{hash(json.dumps(data))}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # 2. Try LLM API with retries
        try:
            explanation = await self._call_llm_with_retry(context_type, data)
            self.cache[cache_key] = explanation
            return explanation
        
        except Exception as e:
            # 3. Fallback to structured explanation
            if self.fallback_enabled:
                return self._generate_fallback_explanation(context_type, data)
            else:
                raise
    
    async def _call_llm_with_retry(self, context_type, data, max_retries=3):
        for attempt in range(max_retries):
            try:
                prompt = self.prompt_builder.build(context_type, data)
                response = await self.client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    max_tokens=500,
                    timeout=30
                )
                return response.choices[0].message.content
            
            except Timeout:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

---

## 7. Scalability Design

### 7.1 Horizontal Scaling Strategy

```
Load Balancer
     │
     ├──> Backend Instance 1
     │         │
     ├──> Backend Instance 2
     │         │
     └──> Backend Instance 3
               │
          ┌────┴────┐
          │         │
     PostgreSQL   Redis
     (Primary)    Cache
          │
     PostgreSQL
     (Replica)
     Read-only
```

### 7.2 Database Scaling

**Phase 1 (MVP - Current):**
- Single PostgreSQL instance
- Connection pooling
- Strategic indexes

**Phase 2 (100K users):**
- Read replicas for queries
- Write to primary only
- Cache layer (Redis)

**Phase 3 (1M+ users):**
- Sharding by customer_id
- Separate databases for:
  - Transactional data (PostgreSQL)
  - Analytics data (TimescaleDB)
  - Cache (Redis Cluster)

---

## 8. Error Handling Architecture

### 8.1 Error Propagation

```
Error Occurs
     │
     ├──> Log Error (structured logging)
     │
     ├──> Map to User-Friendly Message
     │
     ├──> Determine HTTP Status Code
     │
     ├──> Return Standard Error Response
     │
     └──> (If Critical) Alert Monitoring System
```

### 8.2 Circuit Breaker Pattern

```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.state = "closed"  # closed, open, half_open
        self.last_failure_time = None
    
    async def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "half_open"
            else:
                raise ServiceUnavailableError("Circuit breaker is open")
        
        try:
            result = await func(*args, **kwargs)
            
            if self.state == "half_open":
                self.state = "closed"
                self.failure_count = 0
            
            return result
        
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            
            raise

# Usage
llm_circuit_breaker = CircuitBreaker()

async def get_ai_explanation(data):
    return await llm_circuit_breaker.call(llm_service.explain, data)
```

---

## 9. Caching Strategy

### 9.1 Multi-Level Cache

```
Request
   │
   ├──> Browser Cache (static assets)
   │
   ├──> CDN Cache (Vercel edge)
   │
   ├──> API Response Cache (in-memory LRU)
   │
   ├──> Database Query Cache (Redis)
   │
   └──> Database
```

### 9.2 Cache Invalidation Rules

```python
# Cache TTLs by data type
CACHE_TTL = {
    "risk_score": 3600,          # 1 hour
    "forecast": 3600,            # 1 hour
    "loan_products": 86400,      # 24 hours
    "customer_profile": 1800,    # 30 minutes
    "ai_explanations": 3600,     # 1 hour
}

# Invalidation triggers
async def on_transaction_created(transaction):
    customer_id = transaction.customer_id
    
    # Invalidate affected caches
    await cache.delete(f"risk_score:{customer_id}")
    await cache.delete(f"forecast:{customer_id}")
    await cache.delete(f"financial_health:{customer_id}")
    
    # Trigger async recalculation
    await background_tasks.add(recalculate_risk_score, customer_id)
```

---

## 10. Background Job Architecture

### 10.1 Job Types

```python
# Immediate Jobs (< 5 seconds)
- Risk score calculation
- Cash flow forecast
- Loan comparison

# Scheduled Jobs (periodic)
- Daily: Check for interventions
- Daily: Generate financial snapshots
- Weekly: Retrain ML model
- Monthly: Archive old data

# Event-Driven Jobs
- Transaction created → Update balance
- Risk score drops → Check interventions
- Loan applied → Send notification
```

### 10.2 Job Queue Design (Future Enhancement)

```python
from celery import Celery

app = Celery('finshield', broker='redis://localhost:6379')

@app.task
def calculate_risk_scores_batch(customer_ids):
    """Calculate risk scores for multiple customers."""
    for customer_id in customer_ids:
        calculate_and_save_risk_score(customer_id)

@app.task
def check_interventions_daily():
    """Check all customers for intervention needs."""
    at_risk_customers = get_customers_below_threshold()
    for customer in at_risk_customers:
        evaluate_and_create_interventions(customer.id)

# Schedule periodic tasks
app.conf.beat_schedule = {
    'check-interventions-daily': {
        'task': 'check_interventions_daily',
        'schedule': crontab(hour=2, minute=0),
    },
}
```

---

## 11. Monitoring Architecture

### 11.1 Observability Stack

```
Application
     │
     ├──> Structured Logs → Log Aggregation (Future)
     │
     ├──> Metrics → Prometheus (Future)
     │
     ├──> Traces → Distributed Tracing (Future)
     │
     └──> Health Checks → Uptime Monitor
```

### 11.2 Key Metrics Dashboard

```python
# Application Metrics
metrics = {
    "api_requests_total": Counter("Total API requests by endpoint"),
    "api_request_duration": Histogram("API request duration in seconds"),
    "api_errors_total": Counter("Total API errors by type"),
    
    "risk_calculations_total": Counter("Total risk calculations"),
    "risk_calculation_duration": Histogram("Risk calculation duration"),
    
    "loan_comparisons_total": Counter("Total loan comparisons"),
    "loan_comparison_products": Histogram("Number of products compared"),
    
    "active_users": Gauge("Currently active users"),
    "db_connections": Gauge("Active database connections"),
}
```

---

## 12. Deployment Architecture

### 12.1 Production Environment

```
Internet
   │
   ├──> Vercel Edge Network
   │         │
   │         └──> Next.js Frontend (Serverless)
   │
   └──> Render/Railway Load Balancer
             │
             ├──> FastAPI Instance 1
             ├──> FastAPI Instance 2
             └──> FastAPI Instance 3
                      │
                      ├──> Supabase PostgreSQL
                      │
                      └──> Redis Cache (Future)
```

### 12.2 Development Environment

```
Localhost
   │
   ├──> Next.js Dev Server (port 3000)
   │
   ├──> FastAPI Dev Server (port 8000)
   │
   └──> PostgreSQL (Docker or Supabase)
```

---

## Document Control

- **Version:** 1.0
- **Last Updated:** September 3, 2026
- **Sync With:** architecture.md, design.md
