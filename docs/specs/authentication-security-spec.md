# FinShield — Authentication & Security Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

Authentication flows, authorisation model, Row-Level Security policies, and security controls.

---

## 2. Authentication Architecture

FinShield delegates all authentication to **Supabase Auth**. The backend validates JWTs issued by Supabase and applies its own role-based authorisation on top.

```
Browser / Client
       │
       │  1. POST /auth/v1/token (email + password)
       ▼
Supabase Auth
       │
       │  2. JWT (access_token + refresh_token)
       ▼
Frontend (stores tokens)
       │
       │  3. Authorization: Bearer <access_token>
       ▼
FastAPI Backend
       │
       │  4. Validate JWT signature with Supabase JWKS
       │  5. Extract user_id, role from JWT claims
       ▼
PostgreSQL (Row-Level Security)
       │
       │  6. RLS evaluates auth.uid() on every query
       ▼
Response (only authorised rows returned)
```

---

## 3. User Roles

| Role | Set In | Description |
|------|--------|-------------|
| `customer` | Supabase user metadata | End-user, sees only own data |
| `bank_officer` | Supabase user metadata | Sees assigned customers only |
| `admin` | Supabase user metadata | Full read access for demo |

Role is stored in `auth.users.raw_user_meta_data->>'role'` and embedded in the JWT.

---

## 4. FastAPI Authentication Dependency

```python
# api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Validate JWT and return user payload."""
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        return {
            'id': user.id,
            'email': user.email,
            'role': user.user_metadata.get('role', 'customer')
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

def require_role(*roles: str):
    """Dependency factory that enforces a role check."""
    async def _checker(user: dict = Depends(get_current_user)):
        if user['role'] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
    return _checker

# Usage
@router.get("/officer/customers")
async def list_customers(user = Depends(require_role('bank_officer', 'admin'))):
    ...
```

---

## 5. Row-Level Security Policies

All tables with customer data have RLS enabled. Supabase automatically applies `auth.uid()` to every query.

```sql
-- ── customers ──────────────────────────────────────────────────
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Customer: own row only
CREATE POLICY customer_select_own ON customers
  FOR SELECT
  USING (user_id = auth.uid());

-- Officer: assigned customers
CREATE POLICY officer_select_assigned ON customers
  FOR SELECT
  USING (
    assigned_officer_id = auth.uid()
    OR (auth.jwt()->>'role' = 'admin')
  );

-- ── transactions ────────────────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_customer ON transactions
  FOR ALL
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

-- ── risk_assessments ────────────────────────────────────────────
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_customer ON risk_assessments
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
    OR auth.jwt()->>'role' IN ('bank_officer', 'admin')
  );
```

---

## 6. Token Handling

| Token | Storage | Lifetime | Notes |
|-------|---------|----------|-------|
| Access token | Memory / httpOnly cookie | 1 hour | Short-lived, used for API calls |
| Refresh token | httpOnly cookie | 7 days | Used to obtain new access token silently |

- Tokens are **never** stored in `localStorage`
- Refresh happens automatically via Supabase JS client
- Session invalidated on logout by revoking refresh token

---

## 7. API Security Controls

### 7.1 Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/risk/score")
@limiter.limit("60/minute")
async def get_risk_score(request: Request, ...):
    ...
```

### 7.2 CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,   # e.g. ["https://finshield.vercel.app"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### 7.3 Input Validation

All incoming data is validated by Pydantic models before reaching service layer. No raw SQL string interpolation — SQLAlchemy ORM and parameterised queries only.

---

## 8. Sensitive Data Handling

| Data Type | Storage | Notes |
|-----------|---------|-------|
| Passwords | Never stored | Delegated to Supabase Auth (bcrypt) |
| JWT tokens | httpOnly cookies | Server sets, JS cannot read |
| PAN / Aadhaar | Encrypted at rest | PostgreSQL `pgcrypto` or Supabase Vault |
| API keys | Environment variables | Never committed to Git |
| LLM prompt content | Not logged | Only metadata (type, latency) logged |

---

## 9. Audit Logging

Every data-access and mutation event writes a row to `audit_logs`:

```python
async def log_audit_event(
    db: Session,
    user_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    ip_address: str | None = None
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        ip_address=ip_address,
        created_at=datetime.utcnow()
    )
    db.add(log)
    await db.commit()
```

---

## 10. Security Checklist

### Development
- [ ] No secrets in source code or `.env` committed to Git
- [ ] `.env` in `.gitignore`
- [ ] Dependencies pinned to exact versions (`requirements.txt`, `package-lock.json`)

### Database
- [ ] RLS enabled on all tables containing customer data
- [ ] Service role key never exposed to the frontend
- [ ] Connection uses SSL (`?sslmode=require`)

### API
- [ ] All endpoints require authentication except `/health`
- [ ] Role checks on officer and admin endpoints
- [ ] Rate limiting enabled
- [ ] CORS restricted to known origins

### Frontend
- [ ] Tokens stored in httpOnly cookies, not localStorage
- [ ] Sensitive values never logged to console in production

### Infrastructure
- [ ] Environment variables set in hosting platform, not in repo
- [ ] HTTPS enforced (Vercel and Render handle this automatically)
- [ ] Supabase service key restricted to backend only

---

## 11. Acceptance Criteria

- [ ] A customer cannot access another customer's data even with a valid JWT
- [ ] An officer cannot access customers outside their assignment
- [ ] Accessing any protected endpoint without a token returns 401
- [ ] Accessing an officer endpoint with a customer token returns 403
- [ ] All mutations are traceable in `audit_logs`
- [ ] Refresh token rotation is enabled in Supabase dashboard

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: architecture.md, database-schema.md
