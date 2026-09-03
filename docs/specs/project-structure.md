# FinShield — Project Structure

## Complete Directory Layout

```
finshield/
├── .git/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
│
├── docs/
│   ├── specs/                          # All specification documents
│   │   ├── requirements.md
│   │   ├── architecture.md
│   │   ├── system-design.md
│   │   ├── database-schema.md
│   │   ├── api-specification.md
│   │   ├── frontend-specification.md
│   │   ├── backend-specification.md
│   │   ├── financial-engine-spec.md
│   │   ├── risk-engine-spec.md
│   │   ├── forecast-engine-spec.md
│   │   ├── intervention-engine-spec.md
│   │   ├── overdraft-engine-spec.md
│   │   ├── loan-engine-spec.md
│   │   ├── recommendation-engine-spec.md
│   │   ├── ai-service-spec.md
│   │   ├── authentication-security-spec.md
│   │   ├── testing-strategy.md
│   │   ├── synthetic-data-spec.md
│   │   ├── deployment-spec.md
│   │   └── implementation-plan.md
│   ├── architecture/
│   │   ├── diagrams/
│   │   └── decisions/              # ADRs
│   └── api/
│       └── openapi.yaml            # OpenAPI 3.0 spec
│
├── frontend/
│   ├── .next/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (customer)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── health/
│   │   │   │   └── page.tsx
│   │   │   ├── forecast/
│   │   │   │   └── page.tsx
│   │   │   ├── interventions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── loans/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── compare/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── simulator/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── (officer)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── health/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── interventions/
│   │   │   │           └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   └── (admin)/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── lenders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       └── settings/
│   │           └── page.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   └── ...
│   │   ├── charts/
│   │   │   ├── AreaChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── GaugeChart.tsx
│   │   ├── financial/
│   │   │   ├── ResilienceScoreCard.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── RiskFactorBreakdown.tsx
│   │   │   ├── CashFlowChart.tsx
│   │   │   ├── CashFlowTimeline.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── LoanCard.tsx
│   │   │   ├── LoanComparison.tsx
│   │   │   ├── EMICalculator.tsx
│   │   │   ├── InterventionCard.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   └── FinancialSummary.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── ConfirmDialog.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── customers.ts
│   │   │   ├── financial-health.ts
│   │   │   ├── risk.ts
│   │   │   ├── forecast.ts
│   │   │   ├── interventions.ts
│   │   │   ├── loans.ts
│   │   │   └── simulator.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCustomer.ts
│   │   │   ├── useRiskScore.ts
│   │   │   ├── useCashFlow.ts
│   │   │   ├── useInterventions.ts
│   │   │   └── useLoans.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── calculations.ts
│   │   │   └── date-utils.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── customer.ts
│   │   ├── financial.ts
│   │   ├── risk.ts
│   │   └── loan.ts
│   ├── styles/
│   │   └── globals.css
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── favicon.ico
│   ├── .env.local
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── components.json          # shadcn/ui config
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py      # Environment config
│   │   │   └── constants.py     # Business constants
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── database.py      # SQLAlchemy Base & Session
│   │   │   ├── customer.py      # ORM Models
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── loan.py
│   │   │   ├── risk.py
│   │   │   ├── intervention.py
│   │   │   └── ...
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── customer.py      # Pydantic schemas
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── financial.py
│   │   │   ├── risk.py
│   │   │   ├── loan.py
│   │   │   └── ...
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── dependencies.py  # Shared dependencies
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py    # Main API router
│   │   │       ├── auth.py
│   │   │       ├── customers.py
│   │   │       ├── accounts.py
│   │   │       ├── transactions.py
│   │   │       ├── financial_health.py
│   │   │       ├── risk.py
│   │   │       ├── forecast.py
│   │   │       ├── interventions.py
│   │   │       ├── overdraft.py
│   │   │       ├── loans.py
│   │   │       ├── loan_comparison.py
│   │   │       ├── simulator.py
│   │   │       ├── recommendations.py
│   │   │       └── ai.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── financial_engine/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── calculator.py
│   │   │   │   ├── emi.py
│   │   │   │   └── ratios.py
│   │   │   ├── risk_engine/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── scorer.py
│   │   │   │   ├── factors.py
│   │   │   │   └── weights.py
│   │   │   ├── forecast_engine/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── predictor.py
│   │   │   │   ├── patterns.py
│   │   │   │   └── projections.py
│   │   │   ├── intervention_engine/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── evaluator.py
│   │   │   │   ├── hierarchy.py
│   │   │   │   └── rules.py
│   │   │   ├── overdraft_engine/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── eligibility.py
│   │   │   │   └── calculator.py
│   │   │   ├── loan_engine/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── comparator.py
│   │   │   │   ├── scorer.py
│   │   │   │   └── eligibility.py
│   │   │   ├── recommendation_engine/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── ranker.py
│   │   │   │   └── explainer.py
│   │   │   └── ai_service/
│   │   │       ├── __init__.py
│   │   │       ├── llm_client.py
│   │   │       ├── prompts.py
│   │   │       └── explainer.py
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── model.py         # ML model wrapper
│   │   │   ├── trainer.py       # Model training
│   │   │   ├── features.py      # Feature engineering
│   │   │   └── predictor.py     # Prediction logic
│   │   ├── repository/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── customer.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── loan.py
│   │   │   └── ...
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── logging.py
│   │       ├── validators.py
│   │       ├── formatters.py
│   │       └── exceptions.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── unit/
│   │   │   ├── test_financial_engine.py
│   │   │   ├── test_risk_engine.py
│   │   │   ├── test_forecast_engine.py
│   │   │   └── ...
│   │   ├── integration/
│   │   │   ├── test_api_customers.py
│   │   │   ├── test_api_risk.py
│   │   │   └── ...
│   │   └── fixtures/
│   │       ├── customer_data.py
│   │       └── transaction_data.py
│   ├── scripts/
│   │   ├── seed_data.py
│   │   ├── generate_synthetic_data.py
│   │   ├── train_ml_model.py
│   │   └── migrate_db.py
│   ├── models/                  # Trained ML models
│   │   └── distress_predictor.pkl
│   ├── logs/
│   │   └── .gitkeep
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   ├── pyproject.toml
│   └── README.md
│
├── database/
│   ├── migrations/
│   │   ├── V001__initial_schema.sql
│   │   ├── V002__add_interventions.sql
│   │   ├── V003__add_rls_policies.sql
│   │   └── ...
│   ├── seed/
│   │   ├── 01_lenders.sql
│   │   ├── 02_loan_products.sql
│   │   └── 03_sample_customers.sql
│   └── README.md
│
├── tests/
│   ├── e2e/
│   │   ├── playwright.config.ts
│   │   ├── auth.spec.ts
│   │   ├── customer-dashboard.spec.ts
│   │   ├── risk-assessment.spec.ts
│   │   ├── loan-comparison.spec.ts
│   │   └── simulator.spec.ts
│   └── README.md
│
├── .gitignore
├── .env.example
├── README.md
├── LICENSE
└── package.json             # Root package.json for scripts
```

## Key Directories Explained

### `/docs/specs/`
Complete project specifications organized by domain (requirements, architecture, engines, etc.)

### `/frontend/`
Next.js 14 application with App Router, TypeScript, Tailwind CSS, and shadcn/ui components

### `/backend/`
FastAPI Python application with modular service architecture

### `/database/`
SQL migration scripts and seed data for database setup

### `/tests/e2e/`
End-to-end tests using Playwright

## File Naming Conventions

- **Python:** `snake_case.py`
- **TypeScript/React:** `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **SQL:** `V{version}__{description}.sql` for migrations
- **Tests:** `test_{module}.py` or `{feature}.spec.ts`

## Important Files

| File | Purpose |
|------|---------|
| `frontend/.env.local` | Frontend environment variables |
| `backend/.env` | Backend environment variables |
| `frontend/components.json` | shadcn/ui configuration |
| `backend/requirements.txt` | Python dependencies |
| `database/migrations/` | Database version control |
| `README.md` | Project overview and setup instructions |

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
