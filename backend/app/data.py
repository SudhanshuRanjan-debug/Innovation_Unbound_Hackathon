"""
In-memory synthetic data store.
No database needed for MVP — all data lives here.
swap_out: replace with real DB queries without touching the API layer.
"""
from datetime import date, datetime, timedelta
import random, math

# ─── helpers ────────────────────────────────────────────────────────────────

def _iso(d: date) -> str:
    return d.isoformat()

def _dt(d: datetime) -> str:
    return d.isoformat() + "Z"

TODAY = date.today()
NOW   = datetime.utcnow()


# ─── customers ──────────────────────────────────────────────────────────────

CUSTOMERS = {
    "demo-customer-1": {
        "id": "demo-customer-1",
        "first_name": "Arjun",
        "last_name": "Mehta",
        "email": "arjun.mehta@example.com",
        "phone": "+91-9876543210",
        "date_of_birth": "1992-04-15",
        "employment_status": "employed",
        "employer_name": "Infosys Ltd",
        "occupation": "Software Engineer",
        "monthly_income": 85000.0,
        "customer_since": "2023-01-10",
        "status": "active",
        "city": "Bengaluru",
        "current_balance": 48500.0,
        "total_emi": 22000.0,
        "total_debt": 480000.0,
        "monthly_expenses": 54000.0,
    },
}


# ─── accounts ───────────────────────────────────────────────────────────────

ACCOUNTS = {
    "demo-customer-1": [
        {
            "id": "acc-1",
            "customer_id": "demo-customer-1",
            "account_number": "1234567890",
            "account_type": "salary",
            "account_name": "Salary Account",
            "current_balance": 48500.0,
            "available_balance": 48500.0,
            "status": "active",
            "opened_date": "2023-01-10",
        }
    ]
}


# ─── transactions (6 months) ────────────────────────────────────────────────

def _build_transactions(customer_id: str) -> list[dict]:
    c = CUSTOMERS[customer_id]
    txns = []
    balance = 60000.0
    start = TODAY - timedelta(days=180)
    random.seed(42)

    RECURRING_EXPENSES = [
        ("rent",        15000, 5),
        ("emi",         22000, 5),
        ("utilities",    3500, 10),
        ("insurance",    2500, 15),
    ]
    CATEGORIES = ["groceries", "dining", "fuel", "entertainment", "shopping", "medical"]
    AMOUNTS     = [2500, 800, 1500, 600, 3000, 1200]

    for day_offset in range(180):
        d = start + timedelta(days=day_offset)

        # Salary on 1st
        if d.day == 1:
            txns.append({
                "id": f"txn-sal-{day_offset}",
                "account_id": "acc-1",
                "customer_id": customer_id,
                "transaction_date": _iso(d),
                "transaction_type": "credit",
                "amount": c["monthly_income"],
                "category": "salary",
                "sub_category": None,
                "description": "Monthly salary — Infosys Ltd",
                "is_recurring": True,
                "balance_after": balance + c["monthly_income"],
            })
            balance += c["monthly_income"]

        # Recurring debits
        for cat, amt, day in RECURRING_EXPENSES:
            if d.day == day:
                txns.append({
                    "id": f"txn-{cat}-{day_offset}",
                    "account_id": "acc-1",
                    "customer_id": customer_id,
                    "transaction_date": _iso(d),
                    "transaction_type": "debit",
                    "amount": float(amt),
                    "category": cat,
                    "sub_category": None,
                    "description": f"{cat.title()} payment",
                    "is_recurring": True,
                    "balance_after": balance - amt,
                })
                balance -= amt

        # 2-3 random daily spends
        if random.random() < 0.65:
            idx = random.randint(0, len(CATEGORIES) - 1)
            amt = AMOUNTS[idx] * random.uniform(0.5, 1.8)
            amt = round(amt, 0)
            txns.append({
                "id": f"txn-rand-{day_offset}-{idx}",
                "account_id": "acc-1",
                "customer_id": customer_id,
                "transaction_date": _iso(d),
                "transaction_type": "debit",
                "amount": amt,
                "category": CATEGORIES[idx],
                "sub_category": None,
                "description": f"{CATEGORIES[idx].title()} expense",
                "is_recurring": False,
                "balance_after": balance - amt,
            })
            balance -= amt

    # sort newest-first and cap balance drift
    txns.sort(key=lambda x: x["transaction_date"], reverse=True)
    return txns


_TXN_CACHE: dict[str, list[dict]] = {}

def get_transactions(customer_id: str) -> list[dict]:
    if customer_id not in _TXN_CACHE:
        _TXN_CACHE[customer_id] = _build_transactions(customer_id)
    return _TXN_CACHE[customer_id]


# ─── loans ───────────────────────────────────────────────────────────────────

LOANS = {
    "demo-customer-1": [
        {
            "id": "loan-1",
            "customer_id": "demo-customer-1",
            "loan_number": "PL-2024-001",
            "loan_type": "personal",
            "lender_name": "HDFC Bank",
            "product_name": "Personal Loan Premium",
            "principal_amount": 300000.0,
            "sanctioned_amount": 300000.0,
            "outstanding_principal": 240000.0,
            "interest_rate": 13.5,
            "tenure_months": 36,
            "emi_amount": 10200.0,
            "disbursement_date": "2024-01-05",
            "first_emi_date": "2024-02-05",
            "maturity_date": "2027-01-05",
            "processing_fee": 3000.0,
            "prepayment_charges_percent": 2.0,
            "status": "active",
        },
        {
            "id": "loan-2",
            "customer_id": "demo-customer-1",
            "loan_number": "HL-2022-007",
            "loan_type": "home",
            "lender_name": "ICICI Bank",
            "product_name": "Home Loan Standard",
            "principal_amount": 3500000.0,
            "sanctioned_amount": 3500000.0,
            "outstanding_principal": 3150000.0,
            "interest_rate": 8.7,
            "tenure_months": 240,
            "emi_amount": 11800.0,
            "disbursement_date": "2022-06-01",
            "first_emi_date": "2022-07-01",
            "maturity_date": "2042-06-01",
            "processing_fee": 10000.0,
            "prepayment_charges_percent": 0.0,
            "status": "active",
        },
    ]
}


# ─── lenders & loan products ─────────────────────────────────────────────────

LOAN_PRODUCTS = [
    {
        "id": "prod-1", "lender_id": "l1",
        "lender_name": "HDFC Bank", "product_name": "Personal Loan Premium",
        "loan_type": "personal",
        "min_loan_amount": 50000, "max_loan_amount": 4000000,
        "min_interest_rate": 10.5, "max_interest_rate": 21.0,
        "interest_rate": 11.5,
        "min_tenure_months": 12, "max_tenure_months": 60,
        "processing_fee_percent": 1.0, "processing_fee_fixed": 0,
        "prepayment_charges_percent": 2.0,
        "min_monthly_income": 25000,
        "employment_types": ["employed", "self_employed"],
        "features": {"prepayment_allowed": True, "flexible_repayment": False, "top_up_available": True},
        "is_active": True,
    },
    {
        "id": "prod-2", "lender_id": "l2",
        "lender_name": "ICICI Bank", "product_name": "QuickCash Personal Loan",
        "loan_type": "personal",
        "min_loan_amount": 50000, "max_loan_amount": 2500000,
        "min_interest_rate": 10.75, "max_interest_rate": 19.0,
        "interest_rate": 12.0,
        "min_tenure_months": 12, "max_tenure_months": 60,
        "processing_fee_percent": 1.0, "processing_fee_fixed": 500,
        "prepayment_charges_percent": 2.5,
        "min_monthly_income": 25000,
        "employment_types": ["employed", "self_employed"],
        "features": {"prepayment_allowed": True, "flexible_repayment": True, "top_up_available": False},
        "is_active": True,
    },
    {
        "id": "prod-3", "lender_id": "l3",
        "lender_name": "Axis Bank", "product_name": "Instant Personal Loan",
        "loan_type": "personal",
        "min_loan_amount": 25000, "max_loan_amount": 1500000,
        "min_interest_rate": 10.49, "max_interest_rate": 22.0,
        "interest_rate": 13.0,
        "min_tenure_months": 6, "max_tenure_months": 48,
        "processing_fee_percent": 0.0, "processing_fee_fixed": 999,
        "prepayment_charges_percent": 4.0,
        "min_monthly_income": 20000,
        "employment_types": ["employed"],
        "features": {"prepayment_allowed": True, "flexible_repayment": False, "top_up_available": False},
        "is_active": True,
    },
    {
        "id": "prod-4", "lender_id": "l4",
        "lender_name": "Bajaj Finserv", "product_name": "Flexi Personal Loan",
        "loan_type": "personal",
        "min_loan_amount": 25000, "max_loan_amount": 2500000,
        "min_interest_rate": 11.0, "max_interest_rate": 26.0,
        "interest_rate": 13.5,
        "min_tenure_months": 12, "max_tenure_months": 60,
        "processing_fee_percent": 3.99, "processing_fee_fixed": 0,
        "prepayment_charges_percent": 4.0,
        "min_monthly_income": 20000,
        "employment_types": ["employed", "self_employed"],
        "features": {"prepayment_allowed": True, "flexible_repayment": True, "top_up_available": True},
        "is_active": True,
    },
    {
        "id": "prod-5", "lender_id": "l5",
        "lender_name": "IDFC FIRST Bank", "product_name": "Personal Loan Express",
        "loan_type": "personal",
        "min_loan_amount": 20000, "max_loan_amount": 1000000,
        "min_interest_rate": 10.49, "max_interest_rate": 23.0,
        "interest_rate": 10.99,
        "min_tenure_months": 6, "max_tenure_months": 60,
        "processing_fee_percent": 0.0, "processing_fee_fixed": 0,
        "prepayment_charges_percent": 5.0,
        "min_monthly_income": 20000,
        "employment_types": ["employed"],
        "features": {"prepayment_allowed": False, "flexible_repayment": False, "top_up_available": False},
        "is_active": True,
    },
    {
        "id": "prod-6", "lender_id": "l6",
        "lender_name": "KreditBee", "product_name": "KreditBee Personal Loan",
        "loan_type": "personal",
        "min_loan_amount": 10000, "max_loan_amount": 500000,
        "min_interest_rate": 13.0, "max_interest_rate": 36.0,
        "interest_rate": 15.0,
        "min_tenure_months": 3, "max_tenure_months": 24,
        "processing_fee_percent": 2.0, "processing_fee_fixed": 0,
        "prepayment_charges_percent": 0.0,
        "min_monthly_income": 15000,
        "employment_types": ["employed", "self_employed"],
        "features": {"prepayment_allowed": True, "flexible_repayment": True, "top_up_available": False},
        "is_active": True,
    },
]


# ─── interventions ───────────────────────────────────────────────────────────

INTERVENTIONS = {
    "demo-customer-1": [
        {
            "id": "int-1",
            "customer_id": "demo-customer-1",
            "intervention_type": "spending_adjustment",
            "trigger_reason": "Discretionary spending increased 28% over last 3 months",
            "trigger_score": 63.5,
            "recommendation_text": "Reduce dining and entertainment spending by ₹4,000/month to rebuild your cash buffer and improve your resilience score.",
            "expected_impact": "Improves resilience score by ~4 points within 60 days",
            "status": "pending",
            "priority": "high",
            "recommended_date": _dt(NOW - timedelta(days=1)),
            "expiry_date": _dt(NOW + timedelta(days=14)),
            "metadata": {"potential_saving": 4000, "category": "dining+entertainment"},
        },
        {
            "id": "int-2",
            "customer_id": "demo-customer-1",
            "intervention_type": "overdraft",
            "trigger_reason": "Balance projected to drop below ₹5,000 before next salary",
            "trigger_score": 63.5,
            "recommendation_text": "A short-term overdraft of ₹15,000 can bridge the cash gap until your salary on the 1st. Total repayment: ₹15,187.",
            "expected_impact": "Prevents payment default, protects credit score",
            "status": "pending",
            "priority": "critical",
            "recommended_date": _dt(NOW - timedelta(hours=3)),
            "expiry_date": _dt(NOW + timedelta(days=7)),
            "metadata": {
                "required_amount": 15000,
                "duration_days": 25,
                "total_repayment": 15187,
                "expected_salary_date": _iso(TODAY.replace(day=1) + timedelta(days=32) - timedelta(days=TODAY.day - 1)),
            },
        },
        {
            "id": "int-3",
            "customer_id": "demo-customer-1",
            "intervention_type": "repayment_restructure",
            "trigger_reason": "EMI-to-income ratio at 25.9% — approaching the 30% warning threshold",
            "trigger_score": 63.5,
            "recommendation_text": "Extending your personal loan tenure from 36 to 48 months reduces your EMI from ₹10,200 to ₹7,800, giving you ₹2,400/month of additional breathing room.",
            "expected_impact": "Reduces EMI burden, improves monthly surplus by ₹2,400",
            "status": "pending",
            "priority": "medium",
            "recommended_date": _dt(NOW - timedelta(days=2)),
            "expiry_date": _dt(NOW + timedelta(days=30)),
            "metadata": {"current_emi": 10200, "proposed_emi": 7800, "emi_saving": 2400},
        },
    ]
}
