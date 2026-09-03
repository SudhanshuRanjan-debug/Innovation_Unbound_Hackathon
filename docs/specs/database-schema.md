# FinShield — Database Schema Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026  
**Status:** Draft

This document defines the complete database schema for FinShield.

---

## 2. Schema Design Principles

- **Normalization:** Third Normal Form (3NF) for transactional data
- **Data Integrity:** Foreign keys, check constraints, and triggers
- **Audit Trail:** created_at, updated_at timestamps on all tables
- **Soft Deletes:** deleted_at for logical deletion
- **Indexing:** Strategic indexes for query performance
- **Types:** DECIMAL for money, TIMESTAMP WITH TIME ZONE for dates
- **Constraints:** NOT NULL where appropriate, CHECK constraints for business rules

---

## 3. Core Entities

### 3.1 Users and Authentication

```sql
-- Managed by Supabase Auth
-- We reference auth.users(id) in our tables
```

### 3.2 customers

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    
    -- Employment Information
    employment_status VARCHAR(50), -- employed, self_employed, unemployed, retired
    employer_name VARCHAR(200),
    occupation VARCHAR(100),
    monthly_income DECIMAL(15, 2),
    
    -- KYC Information (for demo)
    pan_number VARCHAR(10),
    aadhar_number VARCHAR(12),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(10),
    
    -- Account Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    customer_since DATE DEFAULT CURRENT_DATE,
    
    -- Relationship Manager
    assigned_officer_id UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_employment_status CHECK (
        employment_status IN ('employed', 'self_employed', 'unemployed', 'retired')
    ),
    CONSTRAINT valid_status CHECK (
        status IN ('active', 'inactive', 'suspended')
    )
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_assigned_officer ON customers(assigned_officer_id);
CREATE INDEX idx_customers_status ON customers(status) WHERE deleted_at IS NULL;
```

---

### 3.3 accounts

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Account Details
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type VARCHAR(50) NOT NULL, -- savings, current, salary
    account_name VARCHAR(200) NOT NULL,
    
    -- Balance Information
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    available_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Account Status
    status VARCHAR(20) DEFAULT 'active', -- active, frozen, closed
    
    -- Bank Details
    branch_code VARCHAR(20),
    ifsc_code VARCHAR(11),
    
    -- Timestamps
    opened_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_account_type CHECK (
        account_type IN ('savings', 'current', 'salary')
    ),
    CONSTRAINT valid_account_status CHECK (
        status IN ('active', 'frozen', 'closed')
    ),
    CONSTRAINT positive_balance CHECK (current_balance >= 0)
);

CREATE INDEX idx_accounts_customer ON accounts(customer_id);
CREATE INDEX idx_accounts_number ON accounts(account_number);
CREATE INDEX idx_accounts_status ON accounts(status) WHERE deleted_at IS NULL;
```

---

### 3.4 transactions

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    transaction_type VARCHAR(20) NOT NULL, -- debit, credit
    amount DECIMAL(15, 2) NOT NULL,
    
    -- Categorization
    category VARCHAR(100) NOT NULL, -- salary, rent, groceries, emi, etc.
    sub_category VARCHAR(100),
    is_recurring BOOLEAN DEFAULT FALSE,
    
    -- Description
    description TEXT,
    reference_number VARCHAR(100),
    
    -- Balance After Transaction
    balance_after DECIMAL(15, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_transaction_type CHECK (
        transaction_type IN ('debit', 'credit')
    ),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Partition by month for performance
CREATE INDEX idx_transactions_customer ON transactions(customer_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id, transaction_date DESC);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
```

---

### 3.5 income_records

```sql
CREATE TABLE income_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Income Details
    income_date DATE NOT NULL,
    income_type VARCHAR(50) NOT NULL, -- salary, business, investment, other
    amount DECIMAL(15, 2) NOT NULL,
    source VARCHAR(200),
    
    -- Regularity
    is_regular BOOLEAN DEFAULT TRUE,
    expected_next_date DATE,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_income_type CHECK (
        income_type IN ('salary', 'business', 'investment', 'other')
    ),
    CONSTRAINT positive_income CHECK (amount > 0)
);

CREATE INDEX idx_income_customer ON income_records(customer_id, income_date DESC);
CREATE INDEX idx_income_date ON income_records(income_date DESC);
```

---

### 3.6 expenses

```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Expense Details
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    
    -- Classification
    is_essential BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_frequency VARCHAR(20), -- daily, weekly, monthly, yearly
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_expense CHECK (amount > 0)
);

CREATE INDEX idx_expenses_customer ON expenses(customer_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
```

---

### 3.7 loans

```sql
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Loan Details
    loan_number VARCHAR(50) UNIQUE NOT NULL,
    loan_type VARCHAR(50) NOT NULL, -- personal, home, auto, education
    lender_name VARCHAR(200) NOT NULL,
    product_name VARCHAR(200),
    
    -- Amount Details
    principal_amount DECIMAL(15, 2) NOT NULL,
    sanctioned_amount DECIMAL(15, 2) NOT NULL,
    outstanding_principal DECIMAL(15, 2) NOT NULL,
    
    -- Terms
    interest_rate DECIMAL(5, 2) NOT NULL, -- Annual percentage
    tenure_months INTEGER NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    
    -- Dates
    disbursement_date DATE,
    first_emi_date DATE,
    last_emi_date DATE,
    maturity_date DATE,
    
    -- Fees
    processing_fee DECIMAL(15, 2) DEFAULT 0,
    prepayment_charges_percent DECIMAL(5, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, closed, defaulted
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_loan_type CHECK (
        loan_type IN ('personal', 'home', 'auto', 'education', 'business')
    ),
    CONSTRAINT valid_loan_status CHECK (
        status IN ('active', 'closed', 'defaulted', 'pending')
    ),
    CONSTRAINT positive_amounts CHECK (
        principal_amount > 0 AND
        sanctioned_amount > 0 AND
        outstanding_principal >= 0 AND
        emi_amount > 0
    ),
    CONSTRAINT valid_interest_rate CHECK (interest_rate >= 0 AND interest_rate <= 100)
);

CREATE INDEX idx_loans_customer ON loans(customer_id);
CREATE INDEX idx_loans_status ON loans(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_loans_emi_date ON loans(first_emi_date);
```

---

### 3.8 loan_payments

```sql
CREATE TABLE loan_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Payment Details
    due_date DATE NOT NULL,
    payment_date DATE,
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2),
    
    -- Breakdown
    principal_component DECIMAL(15, 2),
    interest_component DECIMAL(15, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, partial
    days_overdue INTEGER DEFAULT 0,
    
    -- Late Fee
    late_fee DECIMAL(15, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_payment_status CHECK (
        status IN ('pending', 'paid', 'overdue', 'partial')
    ),
    CONSTRAINT positive_amounts CHECK (
        amount_due > 0 AND
        (amount_paid IS NULL OR amount_paid >= 0)
    )
);

CREATE INDEX idx_loan_payments_loan ON loan_payments(loan_id, due_date);
CREATE INDEX idx_loan_payments_customer ON loan_payments(customer_id);
CREATE INDEX idx_loan_payments_due_date ON loan_payments(due_date);
CREATE INDEX idx_loan_payments_status ON loan_payments(status);
```

---

### 3.9 financial_snapshots

```sql
CREATE TABLE financial_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Snapshot Date
    snapshot_date DATE NOT NULL,
    
    -- Income Metrics
    monthly_income DECIMAL(15, 2),
    income_stability_score DECIMAL(5, 2), -- 0-100
    
    -- Balance Metrics
    total_balance DECIMAL(15, 2),
    average_balance DECIMAL(15, 2),
    minimum_balance DECIMAL(15, 2),
    
    -- Debt Metrics
    total_debt DECIMAL(15, 2),
    total_emi DECIMAL(15, 2),
    debt_to_income_ratio DECIMAL(5, 2),
    emi_to_income_ratio DECIMAL(5, 2),
    
    -- Expense Metrics
    monthly_expenses DECIMAL(15, 2),
    essential_expenses DECIMAL(15, 2),
    discretionary_expenses DECIMAL(15, 2),
    
    -- Savings Metrics
    savings_rate DECIMAL(5, 2), -- percentage
    emergency_fund_months DECIMAL(5, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_snapshots_customer ON financial_snapshots(customer_id, snapshot_date DESC);
CREATE UNIQUE INDEX idx_snapshots_customer_date ON financial_snapshots(customer_id, snapshot_date);
```

---

### 3.10 risk_assessments

```sql
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Assessment Date
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Risk Score
    risk_score DECIMAL(5, 2) NOT NULL, -- 0-100
    risk_category VARCHAR(20) NOT NULL, -- critical, at_risk, watch, healthy
    
    -- Factor Scores (0-100 each)
    income_stability_score DECIMAL(5, 2),
    liquidity_score DECIMAL(5, 2),
    debt_burden_score DECIMAL(5, 2),
    payment_behavior_score DECIMAL(5, 2),
    credit_utilization_score DECIMAL(5, 2),
    
    -- Factor Weights Used
    weights JSONB,
    
    -- Contributing Factors
    risk_factors JSONB, -- Array of {factor, impact, description}
    
    -- ML Prediction
    ml_distress_probability DECIMAL(5, 4), -- 0-1
    ml_features JSONB,
    
    -- Comparison
    previous_score DECIMAL(5, 2),
    score_change DECIMAL(5, 2),
    trend VARCHAR(20), -- improving, stable, declining
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT valid_risk_category CHECK (
        risk_category IN ('critical', 'at_risk', 'watch', 'healthy')
    )
);

CREATE INDEX idx_risk_customer ON risk_assessments(customer_id, assessment_date DESC);
CREATE INDEX idx_risk_category ON risk_assessments(risk_category);
CREATE INDEX idx_risk_score ON risk_assessments(risk_score);
```

---

### 3.11 cashflow_forecasts

```sql
CREATE TABLE cashflow_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Forecast Metadata
    forecast_generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    forecast_start_date DATE NOT NULL,
    forecast_end_date DATE NOT NULL,
    
    -- Current State
    current_balance DECIMAL(15, 2) NOT NULL,
    
    -- Forecast Data
    daily_projections JSONB NOT NULL, -- Array of {date, projected_balance, inflows, outflows}
    
    -- Critical Dates
    low_balance_dates JSONB, -- Array of {date, projected_balance, reason}
    negative_balance_dates JSONB,
    
    -- Summary
    minimum_projected_balance DECIMAL(15, 2),
    minimum_balance_date DATE,
    average_projected_balance DECIMAL(15, 2),
    
    -- Confidence
    confidence_level VARCHAR(20), -- high, medium, low
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_forecast_customer ON cashflow_forecasts(customer_id, forecast_generated_at DESC);
```

---

### 3.12 interventions

```sql
CREATE TABLE interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Intervention Details
    intervention_type VARCHAR(50) NOT NULL, -- spending_adjustment, repayment_restructure, overdraft, loan
    trigger_reason VARCHAR(200) NOT NULL,
    trigger_score DECIMAL(5, 2),
    
    -- Recommendation
    recommendation_text TEXT NOT NULL,
    expected_impact TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, expired
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Dates
    recommended_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    action_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB, -- Additional intervention-specific data
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_intervention_type CHECK (
        intervention_type IN (
            'spending_adjustment', 'repayment_restructure', 
            'overdraft', 'loan', 'emergency_fund', 'debt_consolidation'
        )
    ),
    CONSTRAINT valid_intervention_status CHECK (
        status IN ('pending', 'accepted', 'rejected', 'expired')
    ),
    CONSTRAINT valid_priority CHECK (
        priority IN ('low', 'medium', 'high', 'critical')
    )
);

CREATE INDEX idx_interventions_customer ON interventions(customer_id, recommended_date DESC);
CREATE INDEX idx_interventions_status ON interventions(status);
CREATE INDEX idx_interventions_priority ON interventions(priority);
```

---

### 3.13 overdraft_offers

```sql
CREATE TABLE overdraft_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    intervention_id UUID REFERENCES interventions(id),
    
    -- Overdraft Details
    required_amount DECIMAL(15, 2) NOT NULL,
    approved_amount DECIMAL(15, 2),
    
    -- Terms
    daily_interest_rate DECIMAL(5, 4) NOT NULL,
    processing_fee DECIMAL(15, 2) DEFAULT 0,
    duration_days INTEGER NOT NULL,
    
    -- Repayment
    expected_repayment_date DATE NOT NULL,
    expected_income_date DATE,
    expected_income_amount DECIMAL(15, 2),
    
    -- Calculations
    total_interest DECIMAL(15, 2),
    total_repayment DECIMAL(15, 2),
    
    -- Eligibility
    eligibility_check JSONB, -- {eligible, reasons, checks}
    
    -- Status
    status VARCHAR(20) DEFAULT 'offered', -- offered, accepted, rejected, expired, repaid
    
    -- Timestamps
    offered_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    acceptance_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_amounts CHECK (
        required_amount > 0 AND
        (approved_amount IS NULL OR approved_amount > 0)
    ),
    CONSTRAINT valid_overdraft_status CHECK (
        status IN ('offered', 'accepted', 'rejected', 'expired', 'repaid')
    )
);

CREATE INDEX idx_overdraft_customer ON overdraft_offers(customer_id);
CREATE INDEX idx_overdraft_status ON overdraft_offers(status);
```

---

### 3.14 lenders

```sql
CREATE TABLE lenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Lender Information
    lender_name VARCHAR(200) NOT NULL UNIQUE,
    lender_type VARCHAR(50) NOT NULL, -- bank, nbfc, fintech
    
    -- Contact
    website VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_lender_type CHECK (
        lender_type IN ('bank', 'nbfc', 'fintech', 'cooperative')
    )
);

CREATE INDEX idx_lenders_active ON lenders(is_active);
```

---

### 3.15 loan_products

```sql
CREATE TABLE loan_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
    
    -- Product Details
    product_name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50),
    loan_type VARCHAR(50) NOT NULL, -- personal, home, auto, education
    
    -- Amount Range
    min_loan_amount DECIMAL(15, 2) NOT NULL,
    max_loan_amount DECIMAL(15, 2) NOT NULL,
    
    -- Interest Rate
    min_interest_rate DECIMAL(5, 2) NOT NULL,
    max_interest_rate DECIMAL(5, 2) NOT NULL,
    interest_type VARCHAR(20) DEFAULT 'reducing', -- reducing, flat
    
    -- Tenure
    min_tenure_months INTEGER NOT NULL,
    max_tenure_months INTEGER NOT NULL,
    
    -- Fees
    processing_fee_percent DECIMAL(5, 2) DEFAULT 0,
    processing_fee_fixed DECIMAL(15, 2) DEFAULT 0,
    prepayment_charges_percent DECIMAL(5, 2) DEFAULT 0,
    
    -- Eligibility
    min_monthly_income DECIMAL(15, 2),
    min_credit_score INTEGER,
    max_age INTEGER,
    min_age INTEGER,
    employment_types TEXT[], -- Array of accepted employment types
    
    -- Features
    features JSONB, -- {instant_approval, flexible_repayment, etc}
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_loan_type CHECK (
        loan_type IN ('personal', 'home', 'auto', 'education', 'business')
    ),
    CONSTRAINT valid_amount_range CHECK (max_loan_amount >= min_loan_amount),
    CONSTRAINT valid_rate_range CHECK (max_interest_rate >= min_interest_rate),
    CONSTRAINT valid_tenure_range CHECK (max_tenure_months >= min_tenure_months)
);

CREATE INDEX idx_loan_products_lender ON loan_products(lender_id);
CREATE INDEX idx_loan_products_type ON loan_products(loan_type);
CREATE INDEX idx_loan_products_active ON loan_products(is_active);
```

---

### 3.16 loan_comparisons

```sql
CREATE TABLE loan_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Comparison Parameters
    loan_amount DECIMAL(15, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    purpose VARCHAR(100),
    
    -- Comparison Results
    products_compared JSONB NOT NULL, -- Array of product analysis
    best_fit_product_id UUID REFERENCES loan_products(id),
    best_fit_reason TEXT,
    
    -- Scoring Weights
    weights_used JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, converted, expired
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT positive_loan_amount CHECK (loan_amount > 0),
    CONSTRAINT valid_tenure CHECK (tenure_months > 0)
);

CREATE INDEX idx_loan_comparisons_customer ON loan_comparisons(customer_id, created_at DESC);
```

---

### 3.17 recommendations

```sql
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    intervention_id UUID REFERENCES interventions(id),
    
    -- Recommendation Details
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Impact Analysis
    current_risk_score DECIMAL(5, 2),
    projected_risk_score DECIMAL(5, 2),
    impact_summary TEXT,
    
    -- Priority
    priority INTEGER DEFAULT 1, -- Lower is higher priority
    confidence DECIMAL(5, 2), -- 0-100
    
    -- AI Explanation
    ai_explanation TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, dismissed, actioned
    
    -- Timestamps
    recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    actioned_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_recommendation_status CHECK (
        status IN ('active', 'dismissed', 'actioned')
    )
);

CREATE INDEX idx_recommendations_customer ON recommendations(customer_id, recommended_at DESC);
CREATE INDEX idx_recommendations_status ON recommendations(status);
```

---

### 3.18 simulations

```sql
CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Simulation Parameters
    simulation_type VARCHAR(50) NOT NULL, -- loan, emi, cashflow
    parameters JSONB NOT NULL,
    
    -- Results
    results JSONB NOT NULL,
    
    -- Impact
    impact_on_risk_score DECIMAL(5, 2),
    impact_on_monthly_surplus DECIMAL(15, 2),
    
    -- Status
    saved BOOLEAN DEFAULT FALSE,
    simulation_name VARCHAR(200),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_simulation_type CHECK (
        simulation_type IN ('loan', 'emi', 'cashflow', 'repayment')
    )
);

CREATE INDEX idx_simulations_customer ON simulations(customer_id, created_at DESC);
CREATE INDEX idx_simulations_saved ON simulations(customer_id, saved) WHERE saved = TRUE;
```

---

### 3.19 audit_logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Context
    user_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES customers(id),
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_customer ON audit_logs(customer_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

## 4. Views

### 4.1 customer_summary_view

```sql
CREATE OR REPLACE VIEW customer_summary_view AS
SELECT 
    c.id as customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.monthly_income,
    c.employment_status,
    
    -- Latest Risk Assessment
    ra.risk_score,
    ra.risk_category,
    ra.assessment_date,
    
    -- Financial Snapshot
    fs.total_balance,
    fs.total_debt,
    fs.total_emi,
    fs.debt_to_income_ratio,
    
    -- Counts
    (SELECT COUNT(*) FROM loans l WHERE l.customer_id = c.id AND l.status = 'active') as active_loans,
    (SELECT COUNT(*) FROM interventions i WHERE i.customer_id = c.id AND i.status = 'pending') as pending_interventions
    
FROM customers c
LEFT JOIN LATERAL (
    SELECT * FROM risk_assessments 
    WHERE customer_id = c.id 
    ORDER BY assessment_date DESC 
    LIMIT 1
) ra ON TRUE
LEFT JOIN LATERAL (
    SELECT * FROM financial_snapshots 
    WHERE customer_id = c.id 
    ORDER BY snapshot_date DESC 
    LIMIT 1
) fs ON TRUE
WHERE c.deleted_at IS NULL;
```

---

## 5. Functions and Triggers

### 5.1 Updated Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to other tables similarly
```

### 5.2 Account Balance Update Trigger

```sql
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'credit' THEN
        UPDATE accounts 
        SET current_balance = current_balance + NEW.amount,
            available_balance = available_balance + NEW.amount
        WHERE id = NEW.account_id;
    ELSE
        UPDATE accounts 
        SET current_balance = current_balance - NEW.amount,
            available_balance = available_balance - NEW.amount
        WHERE id = NEW.account_id;
    END IF;
    
    NEW.balance_after := (SELECT current_balance FROM accounts WHERE id = NEW.account_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_balance_update 
BEFORE INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance();
```

---

## 6. Row-Level Security Policies

### 6.1 Customer Data Isolation

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Customer can only see their own data
CREATE POLICY customer_isolation_policy ON customers
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY customer_accounts_policy ON accounts
    FOR SELECT
    USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY customer_transactions_policy ON transactions
    FOR SELECT
    USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

-- Bank officer can see assigned customers
CREATE POLICY officer_access_policy ON customers
    FOR SELECT
    USING (
        assigned_officer_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );
```

---

## 7. Indexes Summary

### 7.1 Performance-Critical Indexes

- **Customer lookups:** `idx_customers_user_id`, `idx_customers_email`
- **Transaction queries:** `idx_transactions_customer`, `idx_transactions_date`
- **Risk assessments:** `idx_risk_customer`, `idx_risk_score`
- **Loan queries:** `idx_loans_customer`, `idx_loans_status`
- **Cash flow:** `idx_forecast_customer`

---

## 8. Data Retention and Archival

### 8.1 Retention Policies

- **Transactions:** Retain for 7 years (regulatory requirement)
- **Risk Assessments:** Retain latest + historical for 2 years
- **Audit Logs:** Retain for 3 years
- **Simulations:** Retain for 90 days if not saved
- **Interventions:** Retain indefinitely for analysis

### 8.2 Archival Strategy

```sql
-- Archive old transactions to separate partition/table
CREATE TABLE transactions_archive (LIKE transactions INCLUDING ALL);

-- Move transactions older than 2 years
INSERT INTO transactions_archive
SELECT * FROM transactions
WHERE transaction_date < NOW() - INTERVAL '2 years';

DELETE FROM transactions
WHERE transaction_date < NOW() - INTERVAL '2 years';
```

---

## 9. Migration Strategy

### 9.1 Migration Tools

- **Flyway** or **Alembic** for version-controlled migrations
- Migrations numbered sequentially (V001, V002, etc.)
- Each migration must be idempotent

### 9.2 Seed Data Script

```sql
-- See synthetic-data-spec.md for detailed seed data generation
INSERT INTO lenders (lender_name, lender_type) VALUES
    ('HDFC Bank', 'bank'),
    ('ICICI Bank', 'bank'),
    ('Bajaj Finserv', 'nbfc'),
    ('MoneyTap', 'fintech');
```

---

## 10. Database Configuration

### 10.1 PostgreSQL Settings

```ini
# postgresql.conf optimizations
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection pooling
max_pool_size = 20
min_pool_size = 5
connection_timeout = 30s
```

---

## 11. Backup and Recovery

### 11.1 Backup Strategy

- **Full backup:** Daily at 2 AM UTC
- **Incremental backup:** Every 6 hours
- **Point-in-time recovery:** Enabled
- **Retention:** 30 days
- **Storage:** Supabase automatic backups

### 11.2 Recovery Procedures

1. Identify failure point
2. Select appropriate backup
3. Restore to staging environment
4. Verify data integrity
5. Promote to production
6. Verify application functionality

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Next Review: Post-MVP Implementation
