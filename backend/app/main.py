from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    customers, financial_health, transactions,
    risk, forecast, interventions,
    overdraft, simulator,
)
from app.routers.loans import customer_router as loans_customer_router, root_router as loans_root_router

app = FastAPI(
    title="FinShield API",
    description="Intelligent banking financial-resilience platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health():
    return {"status": "healthy", "version": "1.0.0"}


# ── All routes scoped to a customer (/api/v1/customers/{customer_id}/...) ────
CUST = "/api/v1/customers"

app.include_router(customers.router,            prefix=CUST, tags=["customers"])
app.include_router(financial_health.router,     prefix=CUST, tags=["financial-health"])
app.include_router(transactions.router,         prefix=CUST, tags=["transactions"])
app.include_router(risk.router,                 prefix=CUST, tags=["risk"])
app.include_router(forecast.router,             prefix=CUST, tags=["forecast"])
app.include_router(interventions.router,        prefix=CUST, tags=["interventions"])
app.include_router(overdraft.router,            prefix=CUST, tags=["overdraft"])
app.include_router(loans_customer_router,       prefix=CUST, tags=["loans"])

# ── Top-level routes (/api/v1/...) ───────────────────────────────────────────
ROOT = "/api/v1"

app.include_router(loans_root_router,           prefix=ROOT, tags=["loans"])
app.include_router(simulator.router,            prefix=ROOT, tags=["simulator"])

# ── Cross-customer intervention actions ──────────────────────────────────────
app.include_router(interventions.router,        prefix=ROOT, tags=["interventions"])
