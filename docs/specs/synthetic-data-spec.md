# FinShield — Synthetic Data Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026

Rules and scripts for generating realistic synthetic customer, transaction, and lender data for the MVP. No real customer data is ever used.

---

## 2. Customer Profiles

Generate **5 archetypal demo customers** (for the demo narrative) plus **100 random customers** (for realistic data density).

### 2.1 Demo Archetypes

| Profile | Name | Score | Scenario |
|---------|------|-------|----------|
| `healthy` | Priya Sharma | 85 | High income, low debt, full emergency fund |
| `watch` | Arjun Mehta | 65 | Rising EMI burden, moderate cash buffer |
| `at_risk` | Kavya Reddy | 45 | Multiple loans, thin cash buffer |
| `critical` | Suresh Iyer | 28 | Near-zero balance, salary due in 5 days |
| `recovering` | Neha Gupta | 72→78 | Previously at risk, improving trend |

### 2.2 Customer Data Fields

```python
# scripts/generate_synthetic_data.py
import random
import uuid
from faker import Faker

fake = Faker('en_IN')

EMPLOYMENT_TYPES = ['employed', 'self_employed']
CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'Hyderabad', 'Pune']

def generate_customer(profile: str = 'random') -> dict:
    profiles = {
        'healthy':    {'income': 80_000, 'balance': 4_80_000, 'total_debt': 1_00_000, 'total_emi': 8_000},
        'watch':      {'income': 55_000, 'balance': 85_000,   'total_debt': 2_50_000, 'total_emi': 18_000},
        'at_risk':    {'income': 35_000, 'balance': 18_000,   'total_debt': 3_00_000, 'total_emi': 18_000},
        'critical':   {'income': 40_000, 'balance': 800,      'total_debt': 2_00_000, 'total_emi': 15_000},
        'recovering': {'income': 60_000, 'balance': 1_20_000, 'total_debt': 1_80_000, 'total_emi': 14_000},
    }
    base = profiles.get(profile, {
        'income':     random.randint(25_000, 1_50_000),
        'balance':    random.randint(5_000, 5_00_000),
        'total_debt': random.randint(0, 10_00_000),
        'total_emi':  random.randint(0, 40_000),
    })

    return {
        'id': str(uuid.uuid4()),
        'first_name': fake.first_name(),
        'last_name': fake.last_name(),
        'email': fake.unique.email(),
        'phone': fake.phone_number(),
        'date_of_birth': fake.date_of_birth(minimum_age=22, maximum_age=60).isoformat(),
        'employment_status': random.choice(EMPLOYMENT_TYPES),
        'employer_name': fake.company(),
        'monthly_income': base['income'],
        'city': random.choice(CITIES),
        'state': fake.state(),
        'status': 'active',
    }
```

---

## 3. Transaction Generation

Generate **6 months** of realistic transactions per customer, matching income and expense patterns.

### 3.1 Transaction Categories

| Category | Type | Frequency | Amount Range |
|----------|------|-----------|--------------|
| `salary` | credit | Monthly (1st) | Monthly income |
| `rent` | debit | Monthly (5th) | 25-35% of income |
| `emi` | debit | Monthly (5th) | Per loan schedule |
| `groceries` | debit | Weekly | ₹2,000–₹5,000 |
| `utilities` | debit | Monthly (10th) | ₹1,500–₹4,000 |
| `dining` | debit | 3–5×/week | ₹200–₹800 |
| `fuel` | debit | Weekly | ₹1,000–₹3,000 |
| `shopping` | debit | 2–4×/month | ₹1,000–₹8,000 |
| `entertainment` | debit | Weekly | ₹300–₹1,500 |
| `medical` | debit | 0–2×/month | ₹500–₹5,000 |
| `insurance` | debit | Monthly (15th) | ₹2,000–₹5,000 |

### 3.2 Generation Logic

```python
from datetime import date, timedelta

def generate_transactions(customer: dict, months: int = 6) -> list[dict]:
    transactions = []
    start_date = date.today() - timedelta(days=months * 30)
    balance = customer.get('initial_balance', 50_000)

    for day_offset in range(months * 30):
        txn_date = start_date + timedelta(days=day_offset)
        day = txn_date.day

        # Salary on 1st
        if day == 1:
            transactions.append(_make_txn(
                txn_date, 'credit', customer['monthly_income'], 'salary',
                'Monthly salary credit', balance
            ))
            balance += customer['monthly_income']

        # Rent on 5th
        if day == 5:
            rent = round(customer['monthly_income'] * random.uniform(0.25, 0.35))
            transactions.append(_make_txn(txn_date, 'debit', rent, 'rent', 'Rent payment', balance))
            balance -= rent

        # EMI on 5th
        if day == 5 and customer.get('total_emi', 0) > 0:
            transactions.append(_make_txn(
                txn_date, 'debit', customer['total_emi'], 'emi', 'Loan EMI', balance
            ))
            balance -= customer['total_emi']

        # Groceries weekly (Mon)
        if txn_date.weekday() == 0:
            amount = random.randint(2_000, 5_000)
            transactions.append(_make_txn(txn_date, 'debit', amount, 'groceries', 'Weekly groceries', balance))
            balance -= amount

        # Daily discretionary (30% chance)
        if random.random() < 0.30:
            amount = random.randint(200, 1_500)
            category = random.choice(['dining', 'entertainment', 'fuel'])
            transactions.append(_make_txn(txn_date, 'debit', amount, category, f'{category.title()} expense', balance))
            balance -= amount

    return transactions

def _make_txn(txn_date, txn_type, amount, category, description, balance_after) -> dict:
    return {
        'id': str(uuid.uuid4()),
        'transaction_date': txn_date.isoformat(),
        'transaction_type': txn_type,
        'amount': float(amount),
        'category': category,
        'description': description,
        'balance_after': float(balance_after),
        'is_recurring': category in ('salary', 'rent', 'emi', 'utilities'),
    }
```

---

## 4. Lender and Product Seed Data

### 4.1 Lenders

```sql
INSERT INTO lenders (lender_name, lender_type, website) VALUES
  ('HDFC Bank',      'bank',   'https://www.hdfcbank.com'),
  ('ICICI Bank',     'bank',   'https://www.icicibank.com'),
  ('Axis Bank',      'bank',   'https://www.axisbank.com'),
  ('Bajaj Finserv',  'nbfc',   'https://www.bajajfinserv.in'),
  ('IDFC FIRST',     'bank',   'https://www.idfcfirstbank.com'),
  ('MoneyTap',       'fintech','https://www.moneytap.com'),
  ('KreditBee',      'fintech','https://www.kreditbee.com');
```

### 4.2 Loan Products (Sample)

```sql
INSERT INTO loan_products
  (lender_id, product_name, loan_type, min_loan_amount, max_loan_amount,
   min_interest_rate, max_interest_rate, min_tenure_months, max_tenure_months,
   processing_fee_percent, prepayment_charges_percent, min_monthly_income,
   employment_types, is_active)
VALUES
  -- HDFC
  (<hdfc_id>, 'Personal Loan Premium', 'personal',  50000, 4000000, 10.5, 21.0, 12, 60, 1.0, 2.0, 25000, ARRAY['employed'], true),
  (<hdfc_id>, 'Salary Plus',           'personal',  25000, 1500000, 10.85,18.5, 6,  48, 0.5, 1.0, 20000, ARRAY['employed'], true),

  -- ICICI
  (<icici_id>,'QuickCash Personal',    'personal',  50000, 2500000, 10.75,19.0, 12, 60, 1.0, 2.5, 25000, ARRAY['employed','self_employed'], true),

  -- Bajaj Finserv
  (<bajaj_id>,'Flexi Personal Loan',   'personal',  25000, 2500000, 11.0, 26.0, 12, 60, 3.99,4.0, 20000, ARRAY['employed','self_employed'], true),

  -- IDFC FIRST
  (<idfc_id>, 'Instant Personal Loan', 'personal',  20000, 1000000, 10.49,23.0, 6,  48, 0.0, 5.0, 20000, ARRAY['employed'], true),

  -- MoneyTap
  (<moneytap_id>,'FlexiCredit',        'personal',  3000,  500000,  13.0, 36.0, 3,  36, 2.0, 0.0, 15000, ARRAY['employed','self_employed'], true);
```

---

## 5. Seed Script Execution Order

```bash
# Run in this order to respect foreign key dependencies
python scripts/generate_synthetic_data.py       # Generates JSON files
psql $DATABASE_URL < database/seed/01_lenders.sql
psql $DATABASE_URL < database/seed/02_loan_products.sql
psql $DATABASE_URL < database/seed/03_demo_customers.sql
psql $DATABASE_URL < database/seed/04_accounts.sql
psql $DATABASE_URL < database/seed/05_transactions.sql
psql $DATABASE_URL < database/seed/06_loans.sql
python scripts/calculate_initial_snapshots.py   # Compute initial risk scores
```

---

## 6. Data Quality Rules

- All monetary amounts are positive
- Salary always credited on the 1st of the month
- Balance never goes negative in seed data (demo looks clean)
- At least 3 months of history per customer
- `critical` profile customer has balance ₹800 and salary due in 5 days (drives overdraft demo)

---

## 7. Resetting Data

```bash
# Drop all customer data and re-seed (useful during development)
python scripts/reset_seed_data.py --confirm
```

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: database-schema.md, implementation-plan.md (Task T033-T035)
