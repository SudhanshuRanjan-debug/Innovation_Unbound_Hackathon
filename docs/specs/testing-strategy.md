# FinShield — Testing Strategy

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

Testing philosophy, test types, coverage targets, and toolchain for FinShield.

---

## 2. Testing Philosophy

> **"Calculate once, verify always."**

Financial calculations must be deterministic. Every formula that touches money, risk, or a recommendation gets a unit test before any other code depends on it.

---

## 3. Test Pyramid

```
              ┌──────────┐
              │   E2E    │  ~10 tests  (Playwright)
              │  Tests   │
           ┌──┴──────────┴──┐
           │  Integration   │  ~30 tests  (pytest + TestClient)
           │     Tests      │
        ┌──┴────────────────┴──┐
        │      Unit Tests      │  ~120 tests  (pytest)
        │  Financial · Risk    │
        │  Forecast · Loans    │
        └──────────────────────┘
```

**Coverage targets:**
- Unit tests: **≥ 90%** on all engine modules
- Integration tests: **≥ 70%** on API endpoints
- E2E tests: cover the **5 critical user journeys**

---

## 4. Unit Tests

### 4.1 Financial Engine

```python
# tests/unit/test_financial_engine.py
import pytest
from app.services.financial_engine.emi import calculate_emi, generate_amortization_schedule

class TestEMICalculator:
    def test_standard_loan(self):
        emi = calculate_emi(principal=200_000, annual_rate=12.0, tenure_months=24)
        assert emi == 9_415.84, f"Expected 9415.84, got {emi}"

    def test_zero_interest(self):
        emi = calculate_emi(principal=120_000, annual_rate=0.0, tenure_months=12)
        assert emi == 10_000.00

    def test_single_month(self):
        emi = calculate_emi(principal=10_000, annual_rate=18.0, tenure_months=1)
        assert emi == 10_150.00

    def test_negative_principal_raises(self):
        with pytest.raises(ValueError, match="Invalid parameters"):
            calculate_emi(principal=-1_000, annual_rate=12.0, tenure_months=12)

    def test_zero_tenure_raises(self):
        with pytest.raises(ValueError):
            calculate_emi(principal=100_000, annual_rate=12.0, tenure_months=0)

    def test_amortization_schedule_length(self):
        schedule = generate_amortization_schedule(100_000, 12.0, 12)
        assert len(schedule) == 12

    def test_amortization_final_balance_zero(self):
        schedule = generate_amortization_schedule(100_000, 12.0, 24)
        assert schedule[-1]['balance'] == 0.0

    def test_amortization_principal_sums_to_original(self):
        schedule = generate_amortization_schedule(100_000, 10.0, 12)
        total_principal = sum(row['principal'] for row in schedule)
        assert abs(total_principal - 100_000) < 0.10  # ₹0.10 rounding tolerance
```

### 4.2 Risk Engine

```python
# tests/unit/test_risk_engine.py
class TestRiskEngine:
    def test_score_is_within_bounds(self, sample_customer):
        score = calculate_risk_score(sample_customer, DEFAULT_WEIGHTS)
        assert 0 <= score['risk_score'] <= 100

    def test_healthy_customer_gets_high_score(self, healthy_customer):
        score = calculate_risk_score(healthy_customer, DEFAULT_WEIGHTS)
        assert score['risk_score'] >= 71
        assert score['risk_category'] == 'healthy'

    def test_critical_customer_gets_low_score(self, critical_customer):
        score = calculate_risk_score(critical_customer, DEFAULT_WEIGHTS)
        assert score['risk_score'] <= 30
        assert score['risk_category'] == 'critical'

    def test_weights_must_sum_to_one(self):
        bad_weights = {'income_stability': 0.5, 'liquidity': 0.5, 'debt_burden': 0.5, 'payment_behavior': 0.1, 'credit_utilization': 0.1}
        with pytest.raises(ValueError, match="Weights must sum to 1.0"):
            validate_weights(bad_weights)

    def test_high_dti_lowers_score(self, base_customer):
        base_customer['debt_to_income_ratio'] = 6.0
        score = calculate_risk_score(base_customer, DEFAULT_WEIGHTS)
        assert score['factors']['debt_burden_score'] < 20

    def test_risk_factors_list_is_non_empty_for_at_risk(self, at_risk_customer):
        result = calculate_risk_score(at_risk_customer, DEFAULT_WEIGHTS)
        assert len(result['risk_factors']) > 0
```

### 4.3 Loan Engine

```python
# tests/unit/test_loan_engine.py
class TestLoanScoring:
    def test_best_fit_is_not_always_cheapest(self, products, customer):
        """The cheapest loan must not always rank first if it is unaffordable."""
        ranked = score_and_rank_products(products, customer, DEFAULT_WEIGHTS)
        cheapest = min(products, key=lambda p: p['costs']['total_cost'])
        best_fit = ranked[0]
        # Best fit may differ from cheapest
        assert isinstance(best_fit['rank'], int)

    def test_unaffordable_loan_scores_low(self, customer):
        # EMI would be 65% of income — should score near 0 on affordability
        score = score_affordability(emi_to_income_ratio=0.65)
        assert score < 10

    def test_zero_fees_scores_100(self):
        assert score_fees(0.0) == 100.0

    def test_composite_scores_are_bounded(self, products, customer):
        ranked = score_and_rank_products(products, customer, DEFAULT_WEIGHTS)
        for p in ranked:
            assert 0 <= p['scores']['composite_score'] <= 100
```

### 4.4 Forecast Engine

```python
# tests/unit/test_forecast_engine.py
class TestForecastEngine:
    def test_projection_length_matches_requested_days(self, customer_data):
        result = project_balance(customer_data, days=90)
        assert len(result) == 90

    def test_salary_reflected_on_correct_day(self, customer_data):
        result = project_balance(customer_data, days=35)
        # Salary expected on the 1st; find it
        salary_day = next(p for p in result if p['inflows'] > 0)
        assert datetime.fromisoformat(salary_day['date']).day == 1

    def test_low_balance_alert_raised(self, customer_with_gap):
        projections = project_balance(customer_with_gap, days=90)
        alerts = identify_alerts(projections, min_safe_balance=5_000)
        assert len(alerts) > 0
```

---

## 5. Integration Tests

```python
# tests/integration/test_api_risk.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_risk_score_authenticated(client: AsyncClient, customer_token: str):
    response = await client.get(
        "/api/v1/risk/score",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data['success'] is True
    assert 'risk_score' in data['data']
    assert 'risk_category' in data['data']
    assert 'risk_factors' in data['data']

@pytest.mark.asyncio
async def test_get_risk_score_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/risk/score")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_customer_cannot_see_another_customers_risk(
    client: AsyncClient, customer_a_token: str, customer_b_id: str
):
    # Customer A tries to query Customer B's risk
    response = await client.get(
        f"/api/v1/risk/score?customer_id={customer_b_id}",
        headers={"Authorization": f"Bearer {customer_a_token}"}
    )
    # Should return Customer A's own score (RLS enforces this)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_loan_comparison_returns_ranked_products(
    client: AsyncClient, customer_token: str
):
    payload = {"loan_amount": 200_000, "tenure_months": 24, "loan_type": "personal"}
    response = await client.post(
        "/api/v1/loans/compare",
        json=payload,
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 200
    products = response.json()['data']['products']
    assert len(products) > 0
    assert products[0]['is_best_fit'] is True
    assert products[0]['rank'] == 1
    # Verify ranks are sequential and unique
    ranks = [p['rank'] for p in products]
    assert ranks == list(range(1, len(products) + 1))
```

---

## 6. End-to-End Tests (Playwright)

### 6.1 Toolchain Setup

```typescript
// tests/e2e/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  retries: 1,
});
```

### 6.2 Critical User Journeys

```typescript
// tests/e2e/customer-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Customer Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_CUSTOMER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_CUSTOMER_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('shows resilience score', async ({ page }) => {
    await expect(page.locator('[data-testid="resilience-score"]')).toBeVisible();
    const score = await page.textContent('[data-testid="resilience-score"]');
    expect(Number(score)).toBeGreaterThanOrEqual(0);
    expect(Number(score)).toBeLessThanOrEqual(100);
  });

  test('shows cash flow chart', async ({ page }) => {
    await expect(page.locator('[data-testid="cashflow-chart"]')).toBeVisible();
  });
});

// tests/e2e/loan-comparison.spec.ts
test.describe('Loan Comparison', () => {
  test('completes loan comparison and shows best fit', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/loans/compare');
    await page.fill('input[name="amount"]', '200000');
    await page.selectOption('select[name="tenure"]', '24');
    await page.selectOption('select[name="type"]', 'personal');
    await page.click('[data-testid="compare-button"]');
    await page.waitForSelector('[data-testid="comparison-results"]');
    await expect(page.locator('[data-testid="best-fit-badge"]')).toBeVisible();
  });
});

// tests/e2e/simulator.spec.ts
test.describe('What-If Simulator', () => {
  test('updates EMI in real time when amount changes', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/simulator');
    await page.fill('input[name="loan_amount"]', '100000');
    const emi1 = await page.textContent('[data-testid="emi-value"]');
    await page.fill('input[name="loan_amount"]', '200000');
    const emi2 = await page.textContent('[data-testid="emi-value"]');
    expect(Number(emi2)).toBeGreaterThan(Number(emi1));
  });
});
```

---

## 7. Test Fixtures

```python
# tests/fixtures/customer_data.py
import pytest
from datetime import date, timedelta

@pytest.fixture
def healthy_customer():
    return {
        'monthly_income': 80_000,
        'current_balance': 480_000,
        'total_debt': 100_000,
        'total_emi': 8_000,
        'monthly_expenses': 40_000,
        'missed_payments': 0,
        'late_payments': 0,
        'income_history': [78_000, 80_000, 82_000, 80_000, 80_000, 80_000],
    }

@pytest.fixture
def critical_customer():
    return {
        'monthly_income': 25_000,
        'current_balance': 2_000,
        'total_debt': 300_000,
        'total_emi': 18_000,
        'monthly_expenses': 22_000,
        'missed_payments': 3,
        'late_payments': 5,
        'income_history': [25_000, 0, 25_000, 25_000, 20_000, 25_000],
    }
```

---

## 8. CI Pipeline Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements-dev.txt
      - run: pytest backend/tests --cov=backend/app --cov-report=xml --cov-fail-under=80
        working-directory: .

  e2e-tests:
    runs-on: ubuntu-latest
    needs: backend-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
        working-directory: frontend
      - run: npx playwright install --with-deps
      - run: npx playwright test
        working-directory: tests/e2e
        env:
          E2E_BASE_URL: ${{ secrets.STAGING_URL }}
```

---

## 9. What NOT to Test

- **Supabase Auth internals** — Trust the vendor
- **Third-party LLM responses** — Mock the LLM client; test prompt construction and fallback logic
- **Database connectivity** — Covered by integration tests; don't replicate in unit tests
- **UI pixel-perfect rendering** — Functional correctness only

---

## 10. Acceptance Criteria

- [ ] `pytest` runs without error from `backend/` with `python -m pytest`
- [ ] All financial calculation tests pass
- [ ] Coverage report shows ≥ 80% on engine modules
- [ ] At least one integration test per API endpoint group
- [ ] E2E tests pass against the staging deployment before demo

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: implementation-plan.md (Phase 6), requirements.md (NFR-005)
