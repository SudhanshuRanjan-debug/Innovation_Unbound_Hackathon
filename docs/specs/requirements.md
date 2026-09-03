# FinShield — Requirements Specification

## 1. Document Overview

**Version:** 1.0  
**Date:** September 3, 2026  
**Status:** Draft

This document defines the functional and non-functional requirements for FinShield, an intelligent banking financial-resilience platform.

---

## 2. Executive Summary

FinShield proactively detects financial health deterioration, explains causes, predicts cash-flow problems, and recommends safe, suitable interventions following a responsible lending hierarchy.

**Key Principle:** Detect problems early and recommend the least invasive solution first.

---

## 3. Functional Requirements

### 3.1 Financial Resilience Scoring (FR-001)

**FR-001.1** The system SHALL calculate a Financial Resilience Score from 0-100 for each customer.

**FR-001.2** The score SHALL be based on:
- Income stability (weight: 20%)
- Liquidity/cash buffer (weight: 25%)
- Debt burden (weight: 25%)
- Payment behavior (weight: 15%)
- Credit utilization (weight: 15%)

**FR-001.3** Score categories SHALL be:
- 0-30: Critical
- 31-50: At Risk
- 51-70: Watch
- 71-100: Healthy

**FR-001.4** The system SHALL provide explainable factor contributions for each score.

**FR-001.5** Scoring weights SHALL be configurable without code changes.

**FR-001.6** The system SHALL recalculate scores when new transaction data is available.

**FR-001.7** Score calculation SHALL be deterministic (same inputs = same output).

---

### 3.2 Cash-Flow Forecasting (FR-002)

**FR-002.1** The system SHALL predict customer balance for the next 90 days.

**FR-002.2** Forecasting SHALL consider:
- Historical income patterns
- Historical expense patterns
- Recurring bills and their due dates
- EMI schedules
- Current account balance
- Salary/income dates

**FR-002.3** The system SHALL identify dates when balance may go negative or critically low.

**FR-002.4** Critical low balance SHALL be configurable (default: ₹5,000).

**FR-002.5** The system SHALL display daily projected balance in visual timeline.

**FR-002.6** Forecast SHALL update when new transactions are recorded.

**FR-002.7** The system SHALL distinguish between essential and discretionary expenses.

---

### 3.3 Financial Distress Prediction (FR-003)

**FR-003.1** The system SHALL predict probability of financial distress using ML.

**FR-003.2** The ML model SHALL be Logistic Regression (interpretable).

**FR-003.3** Model features SHALL include:
- Income trend (past 6 months)
- Income volatility
- Expense growth rate
- Cash buffer adequacy
- Debt-to-income ratio
- EMI burden percentage
- Credit utilization rate
- Late/missed payment history

**FR-003.4** The system SHALL provide feature importance/contribution.

**FR-003.5** Prediction threshold SHALL be configurable (default: 0.6).

**FR-003.6** The system SHALL re-train the model periodically with new data.

**FR-003.7** Predictions SHALL supplement, not replace, deterministic risk scoring.

---

### 3.4 Intervention Engine (FR-004)

**FR-004.1** The system SHALL evaluate interventions in this hierarchy:
1. Spending/savings adjustment
2. Repayment restructuring
3. Short-term liquidity support (overdraft)
4. New loan (only if necessary)

**FR-004.2** The system SHALL NOT recommend loans if the problem can be solved without borrowing.

**FR-004.3** Each intervention SHALL include:
- Description
- Expected impact on resilience score
- Pros and cons
- Estimated outcome

**FR-004.4** Intervention rules SHALL be configurable.

**FR-004.5** The system SHALL trigger interventions when resilience score drops below threshold (default: 60).

**FR-004.6** Critical interventions SHALL trigger when score drops below 40.

**FR-004.7** The system SHALL log all intervention recommendations.

---

### 3.5 Overdraft/Short-Term Liquidity (FR-005)

**FR-005.1** The system SHALL detect temporary liquidity gaps.

**FR-005.2** A temporary gap is defined as:
- Current balance critically low
- Expected salary within 30 days
- Income history demonstrates repayment capacity

**FR-005.3** The system SHALL calculate:
- Required overdraft amount
- Expected salary date
- Total repayment amount (principal + interest + fees)
- Daily interest rate
- Processing fee

**FR-005.4** Overdraft eligibility SHALL require:
- Minimum monthly income (configurable, default: ₹20,000)
- Regular salary pattern
- No recent defaults
- Maximum overdraft limit (configurable, default: ₹50,000)

**FR-005.5** The system SHALL show impact on financial resilience.

**FR-005.6** Overdraft SHALL NOT be automatically approved; it's a recommendation.

---

### 3.6 Loan Comparison Engine (FR-006)

**FR-006.1** The system SHALL compare multiple loan products from multiple lenders.

**FR-006.2** Loan data SHALL include:
- Lender name
- Product name
- Interest rate
- Processing fee
- Prepayment charges
- Tenure options
- Eligibility criteria
- Loan amount range

**FR-006.3** Comparison SHALL calculate for each loan:
- Monthly EMI
- Total interest payable
- Total repayment amount
- Impact on DTI ratio
- Impact on resilience score
- Monthly surplus after EMI

**FR-006.4** The system SHALL rank loans using composite score:
- Total cost (30%)
- EMI affordability (25%)
- Resilience impact (20%)
- Tenure suitability (10%)
- Fees (5%)
- Repayment flexibility (10%)

**FR-006.5** Weights SHALL be configurable.

**FR-006.6** The system SHALL highlight the "Best Fit" loan, not just cheapest.

**FR-006.7** The system SHALL explain why a loan is recommended.

---

### 3.7 What-If Simulator (FR-007)

**FR-007.1** The system SHALL provide interactive loan simulator.

**FR-007.2** Users SHALL be able to adjust:
- Loan amount
- Interest rate
- Tenure
- Prepayment amount

**FR-007.3** The simulator SHALL instantly calculate:
- Monthly EMI
- Total interest
- Total repayment
- Monthly surplus
- Projected minimum balance
- Impact on resilience score
- Time to score recovery

**FR-007.4** The simulator SHALL work without saving data.

**FR-007.5** The simulator SHALL show side-by-side before/after comparison.

**FR-007.6** Users SHALL be able to save simulations for later review.

---

### 3.8 AI Explanation Layer (FR-008)

**FR-008.1** The system SHALL use LLM for natural language explanations only.

**FR-008.2** LLM SHALL NOT calculate financial values.

**FR-008.3** LLM SHALL receive structured facts from financial engines.

**FR-008.4** LLM SHALL generate:
- Risk score explanations
- Intervention recommendations
- Forecast summaries
- Loan comparison summaries
- Personalized financial advice

**FR-008.5** LLM temperature SHALL be low (default: 0.3) for consistency.

**FR-008.6** LLM responses SHALL be logged for quality review.

**FR-008.7** The system SHALL function without LLM if API is unavailable.

---

### 3.9 User Roles and Permissions (FR-009)

**FR-009.1** The system SHALL support three user roles:

**Customer:**
- View own financial health
- View own cash-flow forecast
- View own risk factors
- Receive intervention recommendations
- Simulate loans
- Compare loan options
- View personalized explanations

**Bank Officer/Relationship Manager:**
- View customer portfolio (assigned customers only)
- See at-risk customer list
- View customer financial profiles
- View recommended interventions
- Generate customer reports

**Admin:**
- Manage synthetic lender/loan data
- Configure risk weights
- Configure intervention rules
- Manage system settings
- View system analytics
- Access all customer data (for demo purposes)

**FR-009.2** Customers SHALL only access their own data.

**FR-009.3** Bank Officers SHALL only access assigned customers.

**FR-009.4** All data access SHALL be logged.

---

### 3.10 Dashboard and Reporting (FR-010)

**FR-010.1** Customer dashboard SHALL display:
- Current resilience score with trend
- Score factor breakdown
- 90-day cash-flow forecast
- Active interventions
- Recommended actions
- Recent transactions summary

**FR-010.2** Bank Officer dashboard SHALL display:
- Portfolio overview
- At-risk customers list
- Customers by risk category
- Intervention summary
- Alerts and notifications

**FR-010.3** Admin dashboard SHALL display:
- System health
- User statistics
- Loan product performance
- ML model performance metrics

**FR-010.4** All charts SHALL be interactive and exportable.

---

### 3.11 Transaction Management (FR-011)

**FR-011.1** The system SHALL record customer transactions with:
- Date
- Amount
- Type (income/expense)
- Category
- Description
- Account

**FR-011.2** The system SHALL categorize transactions automatically.

**FR-011.3** Users SHALL be able to edit transaction categories.

**FR-011.4** The system SHALL detect recurring transactions.

**FR-011.5** Transaction data SHALL update risk scores and forecasts.

---

### 3.12 Notification System (FR-012)

**FR-012.1** The system SHALL notify customers when:
- Resilience score drops significantly (>10 points)
- Financial distress predicted
- Cash-flow will be critically low
- New intervention recommended
- Loan payment due soon

**FR-012.2** Notifications SHALL be configurable per user.

**FR-012.3** Bank Officers SHALL be notified when:
- Assigned customer enters critical risk
- Intervention requires review

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-001)

**NFR-001.1** Risk score calculation SHALL complete within 2 seconds.

**NFR-001.2** Cash-flow forecast SHALL generate within 3 seconds.

**NFR-001.3** Loan comparison SHALL complete within 5 seconds.

**NFR-001.4** Dashboard SHALL load within 3 seconds.

**NFR-001.5** API response time SHALL be <500ms for 95% of requests.

**NFR-001.6** The system SHALL support 100 concurrent users (MVP).

---

### 4.2 Security (NFR-002)

**NFR-002.1** All authentication SHALL use Supabase Auth.

**NFR-002.2** All API endpoints SHALL require authentication.

**NFR-002.3** Customer data SHALL be isolated using Row-Level Security.

**NFR-002.4** Passwords SHALL NOT be stored; use OAuth/SSO.

**NFR-002.5** API SHALL implement rate limiting (60 requests/minute/user).

**NFR-002.6** Sensitive data SHALL be encrypted at rest.

**NFR-002.7** All data access SHALL be logged for audit.

**NFR-002.8** Sessions SHALL timeout after 30 minutes of inactivity.

---

### 4.3 Reliability (NFR-003)

**NFR-003.1** The system SHALL have 99% uptime (excluding planned maintenance).

**NFR-003.2** Database backups SHALL occur daily.

**NFR-003.3** The system SHALL gracefully handle LLM API failures.

**NFR-003.4** The system SHALL retry failed ML predictions.

**NFR-003.5** Transaction processing SHALL be idempotent.

---

### 4.4 Usability (NFR-004)

**NFR-004.1** The UI SHALL be responsive (mobile, tablet, desktop).

**NFR-004.2** The UI SHALL follow WCAG 2.1 AA guidelines.

**NFR-004.3** All financial terms SHALL have tooltips/explanations.

**NFR-004.4** Charts SHALL be color-blind friendly.

**NFR-004.5** Error messages SHALL be user-friendly, not technical.

---

### 4.5 Maintainability (NFR-005)

**NFR-005.1** Code SHALL follow PEP 8 (Python) and Airbnb (TypeScript) style guides.

**NFR-005.2** All financial calculations SHALL have unit tests.

**NFR-005.3** API endpoints SHALL have integration tests.

**NFR-005.4** Critical flows SHALL have end-to-end tests.

**NFR-005.5** Code coverage SHALL be >80%.

**NFR-005.6** All configuration SHALL be externalized (environment variables).

---

### 4.6 Scalability (NFR-006)

**NFR-006.1** Database schema SHALL support 10,000+ customers.

**NFR-006.2** Transaction history SHALL be partitioned by date.

**NFR-006.3** API SHALL be horizontally scalable.

**NFR-006.4** Caching SHALL be implemented for expensive calculations.

---

### 4.7 Data Quality (NFR-007)

**NFR-007.1** All financial calculations SHALL be accurate to 2 decimal places.

**NFR-007.2** EMI calculations SHALL match standard banking formulas.

**NFR-007.3** All monetary values SHALL use appropriate data types (DECIMAL, not FLOAT).

**NFR-007.4** Date calculations SHALL handle timezones correctly.

**NFR-007.5** All inputs SHALL be validated.

---

### 4.8 Compliance (NFR-008)

**NFR-008.1** The system SHALL use synthetic data only (no real customer data).

**NFR-008.2** Data retention policies SHALL be configurable.

**NFR-008.3** Users SHALL be able to export their data.

**NFR-008.4** The system SHALL support data deletion requests.

---

## 5. Constraints

**C-001** This is a hackathon MVP prototype, not a production banking system.

**C-002** The system uses synthetic customer and lender data.

**C-003** Loan approvals are simulated; no real financial transactions occur.

**C-004** The system should be implementable by a small team in 48-72 hours.

**C-005** All technologies must be free/open-source or have free tiers.

---

## 6. Assumptions

**A-001** Customer transaction data is available in structured format.

**A-002** Income and expense categorization can be rule-based initially.

**A-003** LLM API (OpenAI/Anthropic) is available.

**A-004** Internet connectivity is reliable.

**A-005** Users have basic financial literacy.

---

## 7. Dependencies

**D-001** Supabase for database and authentication

**D-002** OpenAI or Anthropic API for LLM explanations

**D-003** Vercel for frontend hosting

**D-004** Render/Railway for backend hosting

---

## 8. Success Criteria

**S-001** System accurately calculates financial resilience scores.

**S-002** System correctly predicts cash-flow shortfalls.

**S-003** System recommends interventions following hierarchy.

**S-004** System ranks loans by best-fit, not just rate.

**S-005** UI is intuitive and professional.

**S-006** Demo flow completes without errors.

**S-007** All critical calculations have test coverage.

**S-008** Customer data is properly isolated by role.

---

## 9. Out of Scope (v1.0)

- Real banking integrations
- Real-time transaction feeds
- Mobile native apps
- Multi-language support
- Advanced ML models (deep learning)
- Credit score integration with bureaus
- Actual loan disbursement
- Payment processing
- Document verification
- KYC/AML compliance
- Investment recommendations
- Insurance products

---

## 10. Future Enhancements

- Integration with bank core systems
- Real-time transaction streaming
- Advanced ML models (XGBoost, neural networks)
- Mobile applications
- Multi-tenancy for multiple banks
- Credit bureau integration
- Open banking API connections
- Personalized financial coaching
- Goal-based planning
- Family account linking

---

## 11. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Technical Lead | | | |
| Security Lead | | | |

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Next Review: Post-MVP Implementation
