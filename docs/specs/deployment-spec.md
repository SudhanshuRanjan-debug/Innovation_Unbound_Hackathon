# FinShield — Deployment Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

Deployment architecture, environment configuration, CI/CD, and launch checklist.

---

## 2. Infrastructure Overview

| Layer | Service | Plan |
|-------|---------|------|
| Frontend | Vercel | Hobby (free) |
| Backend API | Render | Free (or Railway Starter) |
| Database + Auth | Supabase | Free tier |
| Source control | GitHub | Free |
| LLM API | OpenAI | Pay-per-use |

No additional infrastructure is needed for the hackathon MVP.

---

## 3. Deployment Architecture

```
GitHub (main branch)
       │
       ├── Push → Vercel                ← Auto-deploy frontend
       │             │
       │         Next.js App (SSR + Static)
       │         Custom domain: finshield.vercel.app
       │
       └── Push → Render/Railway        ← Auto-deploy backend
                     │
                 FastAPI (Gunicorn + Uvicorn workers)
                 Custom domain: api.finshield.onrender.com
                         │
                    Supabase PostgreSQL
                    + Supabase Auth
                    Region: ap-south-1 (Mumbai)
```

---

## 4. Frontend Deployment (Vercel)

### 4.1 Setup Steps

1. Push repository to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Set root directory to `frontend/`
4. Vercel auto-detects Next.js — no build config needed

### 4.2 Build Settings

```
Framework:         Next.js
Root Directory:    frontend/
Build Command:     npm run build
Output Directory:  .next
Install Command:   npm install
```

### 4.3 Environment Variables (Vercel Dashboard)

```
NEXT_PUBLIC_API_URL              = https://api.finshield.onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL         = https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    = <anon key from Supabase dashboard>
```

### 4.4 Preview Deployments

Every Pull Request gets an automatic preview URL. Use this to test before merging to main.

---

## 5. Backend Deployment (Render)

### 5.1 Setup Steps

1. Create new **Web Service** at [render.com](https://render.com)
2. Connect GitHub repository
3. Set root directory to `backend/`

### 5.2 Build Settings

```
Environment:       Python 3
Root Directory:    backend/
Build Command:     pip install -r requirements.txt
Start Command:     uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

### 5.3 Environment Variables (Render Dashboard)

```
DATABASE_URL             = postgresql://...  (from Supabase → Settings → Database)
SUPABASE_URL             = https://<project>.supabase.co
SUPABASE_SERVICE_KEY     = <service_role key>
OPENAI_API_KEY           = sk-...
JWT_SECRET               = <random 64-char string>
CORS_ORIGINS             = https://finshield.vercel.app
ENVIRONMENT              = production
LOG_LEVEL                = INFO

# Risk engine weights
RISK_WEIGHT_INCOME_STABILITY   = 0.20
RISK_WEIGHT_LIQUIDITY          = 0.25
RISK_WEIGHT_DEBT_BURDEN        = 0.25
RISK_WEIGHT_PAYMENT_BEHAVIOR   = 0.15
RISK_WEIGHT_CREDIT_UTILIZATION = 0.15
```

### 5.4 Alternative: Railway

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
```

---

## 6. Database Setup (Supabase)

### 6.1 One-Time Setup

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link to remote project
supabase link --project-ref <project-ref>

# 4. Run migrations against remote database
supabase db push

# 5. Seed demo data
psql "$DATABASE_URL" < database/seed/01_lenders.sql
psql "$DATABASE_URL" < database/seed/02_loan_products.sql
psql "$DATABASE_URL" < database/seed/03_demo_customers.sql
```

### 6.2 Auth Configuration (Supabase Dashboard)

- Enable **Email Auth**
- Disable **Email Confirm** (for demo convenience)
- Set Site URL to `https://finshield.vercel.app`
- Add Redirect URLs: `https://finshield.vercel.app/auth/callback`

### 6.3 Connection Pooling

Use **Transaction mode** pooler URL (port 6543) for the backend — not the direct connection — to support multiple Render instances.

```
# In Render env vars, use the pooler URL:
DATABASE_URL = postgresql://postgres.<ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

---

## 7. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: CI / CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r backend/requirements-dev.txt
      - run: ruff check backend/app          # Linter
      - run: pytest backend/tests -q        # Tests
        env:
          DATABASE_URL: sqlite+aiosqlite:///:memory:

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_URL: https://api.finshield.onrender.com/api/v1
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  # Deployment is triggered automatically:
  # - Vercel watches the GitHub repo (frontend auto-deploys on push to main)
  # - Render watches the GitHub repo (backend auto-deploys on push to main)
```

---

## 8. Environment Tiers

| Tier | Frontend URL | Backend URL | Database |
|------|-------------|-------------|----------|
| Local | localhost:3000 | localhost:8000 | Local Postgres / Supabase |
| Preview | vercel.app/preview | N/A | Supabase (same project) |
| Production | finshield.vercel.app | api.finshield.onrender.com | Supabase (same project) |

For the hackathon MVP, **preview and production share the same Supabase project**. Separate projects should be used in a real deployment.

---

## 9. Health Monitoring

### 9.1 Backend Health Endpoint

```python
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    # Check database
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }
```

### 9.2 Uptime Monitoring

Use [UptimeRobot](https://uptimerobot.com) (free tier):
- Monitor `GET https://api.finshield.onrender.com/health` every 5 minutes
- Alert via email if down for > 2 consecutive checks

---

## 10. Pre-Demo Checklist

### T-24 hours
- [ ] Backend deployed and `/health` returns 200
- [ ] Frontend deployed and loads at Vercel URL
- [ ] Database migrations applied
- [ ] Seed data loaded; 5 demo profiles exist
- [ ] CORS set correctly (Vercel URL → Render URL)
- [ ] LLM API key is valid and has credit

### T-2 hours
- [ ] Walk through full demo flow end-to-end on production URL
- [ ] Check all 5 demo customer profiles load correctly
- [ ] Verify risk score, forecast, loan comparison, and simulator work
- [ ] Verify bank officer dashboard shows customers
- [ ] Check mobile responsiveness

### T-0 (demo day)
- [ ] Open tabs for each demo step in advance
- [ ] Disable browser extensions that may block requests
- [ ] Have a backup plan if LLM is unavailable (fallback explanations already coded)
- [ ] Share Vercel URL with judges / audience

---

## 11. Rollback Procedure

If production deployment breaks:

1. In Render dashboard → Deployments → select last working deploy → **Redeploy**
2. In Vercel dashboard → Deployments → select last working deploy → **Promote to Production**
3. Database changes are forward-only migrations; contact Supabase support for restore if data corruption occurs

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: architecture.md, implementation-plan.md (Phase 7)
