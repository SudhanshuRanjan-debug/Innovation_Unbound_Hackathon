# FinShield — Implementation Tasks

## Task Overview

This document provides a comprehensive, actionable task list for implementing FinShield during the hackathon. Tasks are organized by phase and include checkboxes, time estimates, and assignee suggestions.

**Total Estimated Time:** 48-72 hours  
**Last Updated:** September 3, 2026  
**Status:** Ready for Implementation

---

## Task Legend

- **Priority:** 🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low
- **Time Estimate:** In hours (e.g., 2h, 4h)
- **Dependencies:** Tasks that must complete first
- **Assignee:** Suggested role (BE=Backend, FE=Frontend, FS=Full-Stack, DevOps)

---

## Phase 0: Setup & Infrastructure (4-6 hours)

### 0.1 Project Initialization 🔴

- [ ] **T001** - Initialize Git repository (0.5h) — DevOps
  - Create GitHub repository
  - Add .gitignore (Python, Node, IDE files)
  - Create initial commit
  - Set up branch protection

- [ ] **T002** - Create project directory structure (0.5h) — FS
  - Create `/frontend`, `/backend`, `/database`, `/docs`, `/tests` directories
  - Follow structure from `project-structure.md`
  - Add README.md files to each major directory

- [ ] **T003** - Set up environment files (0.5h) — FS
  - Copy `.env.example` to `.env` (backend)
  - Copy `.env.example` to `.env.local` (frontend)
  - Document required API keys

### 0.2 Database Setup 🔴

- [ ] **T004** - Create Supabase project (1h) — BE/DevOps
  - Sign up/log in to Supabase
  - Create new project
  - Note database credentials
  - Configure connection pooling

- [ ] **T005** - Implement database schema (2h) — BE
  - Dependencies: T004
  - Create migration files from `database-schema.md`
  - Implement all 19 tables
  - Add indexes and constraints
  - Test schema creation

- [ ] **T006** - Set up Row-Level Security (1h) — BE
  - Dependencies: T005
  - Configure Supabase Auth
  - Implement RLS policies from `database-schema.md`
  - Create user roles (customer, officer, admin)
  - Test data isolation

- [ ] **T007** - Create database functions and triggers (1h) — BE
  - Dependencies: T005
  - Implement updated_at trigger
  - Implement account balance update trigger
  - Test triggers

### 0.3 Backend Setup 🔴

- [ ] **T008** - Initialize FastAPI project (1h) — BE
  - Create Python virtual environment
  - Install dependencies (FastAPI, SQLAlchemy, Pydantic, etc.)
  - Create `requirements.txt` from needs
  - Set up project structure from `project-structure.md`

- [ ] **T009** - Configure database connection (0.5h) — BE
  - Dependencies: T004, T008
  - Set up SQLAlchemy engine
  - Configure connection pool
  - Create database session dependency
  - Test connection

- [ ] **T010** - Create base ORM models (1h) — BE
  - Dependencies: T005, T009
  - Create SQLAlchemy Base
  - Define Customer, Account, Transaction models
  - Test model creation

- [ ] **T011** - Set up logging and middleware (0.5h) — BE
  - Configure structured logging
  - Add CORS middleware
  - Add request logging middleware
  - Add error handling middleware

- [ ] **T012** - Create health check endpoint (0.5h) — BE
  - Dependencies: T008
  - Implement GET /health
  - Test database connectivity
  - Return system status

### 0.4 Frontend Setup 🔴

- [ ] **T013** - Initialize Next.js project (1h) — FE
  - Create Next.js 14 app with TypeScript
  - Install dependencies (Tailwind, shadcn/ui, Recharts)
  - Configure Tailwind CSS
  - Set up folder structure from `project-structure.md`

- [ ] **T014** - Configure shadcn/ui (0.5h) — FE
  - Dependencies: T013
  - Run shadcn/ui init
  - Install base components (button, card, input, etc.)
  - Test component rendering

- [ ] **T015** - Set up Supabase client (0.5h) — FE
  - Dependencies: T013
  - Install Supabase JS client
  - Configure client and server clients
  - Test connection

- [ ] **T016** - Create base layout (1h) — FE
  - Dependencies: T013
  - Create root layout with providers
  - Create basic header/footer
  - Set up routing structure
  - Test navigation

- [ ] **T017** - Set up API client (1h) — FE
  - Dependencies: T013
  - Create API client utility
  - Configure base URL and headers
  - Implement request/response interceptors
  - Add error handling

### 0.5 Integration Testing 🟡

- [ ] **T018** - Test full stack connectivity (1h) — FS
  - Dependencies: T012, T017
  - Test frontend → backend connection
  - Test backend → database connection
  - Verify CORS configuration
  - Test authentication flow end-to-end

---

## Phase 1: Core Data & Authentication (6-8 hours)

### 1.1 Authentication Implementation 🔴

- [ ] **T019** - Implement login page (2h) — FE
  - Dependencies: T015
  - Create login form with validation
  - Integrate Supabase Auth
  - Handle success/error states
  - Redirect after login
  - Test authentication flow

- [ ] **T020** - Implement registration page (2h) — FE
  - Dependencies: T015
  - Create registration form
  - Validate inputs (email, password)
  - Create customer record after signup
  - Test registration flow

- [ ] **T021** - Create auth middleware (1h) — BE
  - Dependencies: T008
  - Validate JWT tokens with Supabase
  - Extract user info from token
  - Create authentication dependency
  - Test protected endpoints

- [ ] **T022** - Implement role-based access (1h) — BE
  - Dependencies: T021
  - Create role checking utilities
  - Implement permission decorators
  - Test access control

### 1.2 Customer Management 🔴

- [ ] **T023** - Create Customer ORM models (1h) — BE
  - Dependencies: T010
  - Complete Customer model
  - Add relationships (accounts, loans)
  - Test model queries

- [ ] **T024** - Create Customer Pydantic schemas (1h) — BE
  - Dependencies: T023
  - Create CustomerCreate, CustomerUpdate, CustomerResponse
  - Add validation rules
  - Test schema validation

- [ ] **T025** - Create Customer repository (1h) — BE
  - Dependencies: T023
  - Implement CRUD operations
  - Add query methods (by_user_id, by_email)
  - Test repository methods

- [ ] **T026** - Implement Customer API endpoints (2h) — BE
  - Dependencies: T024, T025
  - Implement GET /customers/me
  - Implement PUT /customers/me
  - Add error handling
  - Test endpoints

- [ ] **T027** - Create customer profile page (2h) — FE
  - Dependencies: T026
  - Create profile display component
  - Create profile edit form
  - Connect to API
  - Test CRUD operations

### 1.3 Account & Transaction Management 🔴

- [ ] **T028** - Create Account/Transaction models (1h) — BE
  - Dependencies: T010
  - Complete Account and Transaction models
  - Add relationships
  - Test models

- [ ] **T029** - Create Account/Transaction schemas (1h) — BE
  - Dependencies: T028
  - Create all Pydantic schemas
  - Add validation
  - Test schemas

- [ ] **T030** - Create Account/Transaction repositories (1h) — BE
  - Dependencies: T028
  - Implement CRUD operations
  - Add query methods
  - Test repositories

- [ ] **T031** - Implement Account/Transaction APIs (2h) — BE
  - Dependencies: T029, T030
  - Implement GET /accounts, GET /accounts/{id}
  - Implement GET /transactions with filters
  - Implement POST /transactions
  - Test endpoints

- [ ] **T032** - Create transaction list component (2h) — FE
  - Dependencies: T031
  - Create transaction table/list
  - Add filtering (date, category, type)
  - Add pagination
  - Connect to API

### 1.4 Synthetic Data Generation 🟡

- [ ] **T033** - Create synthetic data script (3h) — BE
  - Create script to generate:
    - 100 sample customers
    - Account per customer
    - 6 months of transactions per customer
    - Income patterns (monthly salary)
    - Expense patterns (rent, utilities, groceries, EMI)
  - Follow patterns from `synthetic-data-spec.md` concepts

- [ ] **T034** - Seed lenders and loan products (1h) — BE
  - Create 5-10 lenders (HDFC, ICICI, Bajaj, etc.)
  - Create 20-30 loan products with varying terms
  - Load into database
  - Test queries

- [ ] **T035** - Load synthetic data (0.5h) — BE
  - Dependencies: T033, T034
  - Run data generation scripts
  - Verify data integrity
  - Test queries

---

## Phase 2: Financial Intelligence Engines (10-12 hours)

### 2.1 Financial Calculation Engine 🔴

- [ ] **T036** - Implement EMI calculator (1h) — BE
  - Create financial_engine/emi.py
  - Implement EMI formula: `P * r * (1+r)^n / ((1+r)^n - 1)`
  - Add amortization schedule generator
  - Write unit tests
  - Test with various scenarios

- [ ] **T037** - Implement financial ratios (1h) — BE
  - Create financial_engine/ratios.py
  - Implement debt-to-income ratio
  - Implement EMI-to-income ratio
  - Implement savings rate
  - Write unit tests

- [ ] **T038** - Create financial calculator service (1h) — BE
  - Dependencies: T036, T037
  - Create financial_engine/calculator.py
  - Integrate all calculations
  - Add helper methods
  - Test service

### 2.2 Risk Scoring Engine 🔴

- [ ] **T039** - Implement income stability factor (1.5h) — BE
  - Create risk_engine/factors.py
  - Calculate income consistency (past 6 months)
  - Calculate income volatility (standard deviation)
  - Score on 0-100 scale
  - Write unit tests

- [ ] **T040** - Implement liquidity factor (1h) — BE
  - Dependencies: T039
  - Calculate current balance vs minimum safe balance
  - Calculate emergency fund coverage (months)
  - Score on 0-100 scale
  - Write unit tests

- [ ] **T041** - Implement debt burden factor (1h) — BE
  - Dependencies: T037
  - Calculate debt-to-income ratio impact
  - Calculate EMI burden
  - Score on 0-100 scale
  - Write unit tests

- [ ] **T042** - Implement payment behavior factor (1h) — BE
  - Calculate on-time payment rate
  - Calculate late payment count
  - Calculate default history
  - Score on 0-100 scale
  - Write unit tests

- [ ] **T043** - Implement credit utilization factor (1h) — BE
  - Calculate total debt vs income
  - Calculate loan utilization
  - Score on 0-100 scale
  - Write unit tests

- [ ] **T044** - Implement composite risk scorer (2h) — BE
  - Dependencies: T039-T043
  - Create risk_engine/scorer.py
  - Load configurable weights from environment
  - Calculate weighted composite score
  - Determine risk category
  - Generate explanation structure
  - Write unit tests

- [ ] **T045** - Create Risk API endpoints (1.5h) — BE
  - Dependencies: T044
  - Implement GET /risk/score
  - Implement GET /risk/history
  - Add caching for recent calculations
  - Test endpoints

### 2.3 Cash Flow Forecast Engine 🔴

- [ ] **T046** - Implement transaction pattern detection (2h) — BE
  - Create forecast_engine/patterns.py
  - Detect recurring income (salary dates)
  - Detect recurring expenses (rent, utilities, EMI)
  - Calculate average expense by category
  - Identify expense trends
  - Write unit tests

- [ ] **T047** - Implement balance projection (2h) — BE
  - Dependencies: T046
  - Create forecast_engine/projections.py
  - Project daily balance for 90 days
  - Factor in expected income
  - Factor in expected expenses
  - Identify low balance dates
  - Write unit tests

- [ ] **T048** - Create Forecast API endpoint (1.5h) — BE
  - Dependencies: T047
  - Implement GET /forecast
  - Return daily projections
  - Highlight critical dates
  - Test endpoint

### 2.4 ML Distress Predictor 🟡

- [ ] **T049** - Implement feature engineering (2h) — BE
  - Create ml/features.py
  - Extract features from customer data:
    - Income trend (6 months)
    - Income volatility
    - Expense growth rate
    - Cash buffer adequacy
    - Debt ratios
    - Payment history
  - Test feature extraction

- [ ] **T050** - Train Logistic Regression model (2h) — BE
  - Dependencies: T049, T035
  - Create ml/trainer.py
  - Generate training labels (synthetic distress flags)
  - Train scikit-learn LogisticRegression
  - Evaluate model (accuracy, precision, recall)
  - Save model to disk

- [ ] **T051** - Implement prediction service (1h) — BE
  - Dependencies: T050
  - Create ml/predictor.py
  - Load trained model
  - Make predictions
  - Return probability + contributing features
  - Write tests

- [ ] **T052** - Create ML Prediction API (1h) — BE
  - Dependencies: T051
  - Implement GET /risk/prediction
  - Test endpoint

---

## Phase 3: Intervention & Loan Systems (8-10 hours)

### 3.1 Intervention Engine 🔴

- [ ] **T053** - Implement spending adjustment evaluator (1.5h) — BE
  - Create intervention_engine/evaluator.py
  - Check if discretionary spending is high
  - Calculate potential savings
  - Determine if adjustment solves problem
  - Write tests

- [ ] **T054** - Implement repayment restructuring evaluator (1h) — BE
  - Dependencies: T053
  - Check if EMI burden is high
  - Evaluate restructuring feasibility
  - Write tests

- [ ] **T055** - Implement overdraft evaluator (1.5h) — BE
  - Dependencies: T053
  - Detect temporary liquidity gaps
  - Check if overdraft is appropriate
  - Write tests

- [ ] **T056** - Implement loan need evaluator (1h) — BE
  - Dependencies: T053-T055
  - Check if other interventions are insufficient
  - Determine loan necessity
  - Write tests

- [ ] **T057** - Create intervention hierarchy logic (2h) — BE
  - Dependencies: T053-T056
  - Create intervention_engine/hierarchy.py
  - Implement decision tree
  - Generate recommendations
  - Write tests

- [ ] **T058** - Create Interventions API (1.5h) — BE
  - Dependencies: T057
  - Implement GET /interventions
  - Implement GET /interventions/{id}
  - Implement POST /interventions/{id}/accept
  - Implement POST /interventions/{id}/reject
  - Test endpoints

### 3.2 Overdraft Engine 🟡

- [ ] **T059** - Implement overdraft eligibility checker (1.5h) — BE
  - Create overdraft_engine/eligibility.py
  - Check minimum income requirement
  - Check regular salary pattern
  - Check no recent defaults
  - Check within limit
  - Write tests

- [ ] **T060** - Implement overdraft calculator (1h) — BE
  - Create overdraft_engine/calculator.py
  - Calculate daily interest
  - Calculate processing fee
  - Calculate total repayment
  - Write tests

- [ ] **T061** - Create Overdraft API (1.5h) — BE
  - Dependencies: T059, T060
  - Implement POST /overdraft/calculate
  - Implement POST /overdraft/apply
  - Test endpoints

### 3.3 Loan Comparison Engine 🔴

- [ ] **T062** - Implement loan eligibility checker (1h) — BE
  - Create loan_engine/eligibility.py
  - Check income requirements
  - Check age requirements
  - Check employment type
  - Filter eligible products
  - Write tests

- [ ] **T063** - Implement loan cost calculator (1.5h) — BE
  - Dependencies: T036
  - Create loan_engine/comparator.py
  - Calculate EMI for each product
  - Calculate total interest
  - Calculate total cost (including fees)
  - Write tests

- [ ] **T064** - Implement affordability checker (1h) — BE
  - Dependencies: T063
  - Check EMI-to-income ratio
  - Calculate monthly surplus
  - Determine affordability
  - Write tests

- [ ] **T065** - Implement loan scoring algorithm (2h) — BE
  - Dependencies: T063, T064
  - Create loan_engine/scorer.py
  - Load configurable weights
  - Score each loan:
    - Total cost (30%)
    - Affordability (25%)
    - Resilience impact (20%)
    - Tenure suitability (10%)
    - Fees (5%)
    - Flexibility (10%)
  - Rank loans by composite score
  - Write tests

- [ ] **T066** - Create Loan Comparison API (2h) — BE
  - Dependencies: T065
  - Implement POST /loans/compare
  - Implement GET /loans/compare/{id}
  - Return ranked products with explanations
  - Test endpoints

### 3.4 What-If Simulator 🟡

- [ ] **T067** - Implement loan simulator (2h) — BE
  - Create simulator service
  - Calculate EMI impact
  - Calculate risk score impact
  - Calculate cash flow impact
  - Return before/after comparison
  - Write tests

- [ ] **T068** - Create Simulator API (1h) — BE
  - Dependencies: T067
  - Implement POST /simulator/loan
  - Implement POST /simulator/emi
  - Test endpoints

---

## Phase 4: AI Explanation Layer (4-6 hours)

### 4.1 LLM Integration 🟡

- [ ] **T069** - Set up OpenAI/Anthropic client (1h) — BE
  - Create ai_service/llm_client.py
  - Configure API key
  - Implement retry logic
  - Implement timeout handling
  - Test connection

- [ ] **T070** - Create prompt templates (2h) — BE
  - Dependencies: T069
  - Create ai_service/prompts.py
  - Create risk score explanation prompt
  - Create intervention recommendation prompt
  - Create loan comparison prompt
  - Create forecast summary prompt
  - Test prompts with sample data

- [ ] **T071** - Implement explainer service (2h) — BE
  - Dependencies: T070
  - Create ai_service/explainer.py
  - Implement structured data → LLM flow
  - Parse and format LLM responses
  - Implement fallback for API failures
  - Add caching for common explanations
  - Write tests

- [ ] **T072** - Create AI API endpoint (1h) — BE
  - Dependencies: T071
  - Implement POST /ai/explain
  - Test endpoint

- [ ] **T073** - Integrate AI with existing endpoints (1h) — BE
  - Dependencies: T072
  - Add AI explanations to risk score response
  - Add AI explanations to interventions
  - Add AI explanations to loan comparison
  - Test integration

---

## Phase 5: Frontend Development (12-16 hours)

### 5.1 Shared Components 🔴

- [ ] **T074** - Create financial display components (3h) — FE
  - Create ResilienceScoreCard component
  - Create ScoreGauge component
  - Create RiskFactorBreakdown component
  - Create FinancialSummary component
  - Style with Tailwind
  - Test rendering

- [ ] **T075** - Create chart components (2h) — FE
  - Create CashFlowChart (Recharts wrapper)
  - Create CashFlowTimeline component
  - Create AreaChart wrapper
  - Create BarChart wrapper
  - Test with sample data

- [ ] **T076** - Create layout components (2h) — FE
  - Create Header with navigation
  - Create Sidebar with menu
  - Create responsive layout
  - Add user menu
  - Test navigation

### 5.2 Customer Dashboard 🔴

- [ ] **T077** - Create dashboard page (4h) — FE
  - Dependencies: T074, T075, T076, T045, T048, T058
  - Create app/(customer)/dashboard/page.tsx
  - Fetch risk score
  - Fetch cash flow forecast
  - Fetch interventions
  - Display ResilienceScoreCard
  - Display CashFlowChart
  - Display active interventions
  - Display quick actions
  - Test with real API

- [ ] **T078** - Add loading and error states (1h) — FE
  - Dependencies: T077
  - Add skeleton loaders
  - Add error boundaries
  - Add empty states
  - Test error handling

### 5.3 Financial Health Page 🔴

- [ ] **T079** - Create health page (3h) — FE
  - Dependencies: T074, T045
  - Create app/(customer)/health/page.tsx
  - Display detailed risk score
  - Display factor breakdown with explanations
  - Display score history chart
  - Display AI explanation
  - Connect to APIs
  - Test interactivity

### 5.4 Cash Flow Forecast Page 🔴

- [ ] **T080** - Create forecast page (3h) — FE
  - Dependencies: T075, T048
  - Create app/(customer)/forecast/page.tsx
  - Display timeline visualization
  - Display balance projection chart
  - Display alert indicators for low balance dates
  - Display income/expense breakdown
  - Connect to API
  - Test with various scenarios

### 5.5 Interventions Page 🟡

- [ ] **T081** - Create interventions list page (2h) — FE
  - Dependencies: T058
  - Create app/(customer)/interventions/page.tsx
  - Display intervention cards
  - Add filtering by status
  - Add priority indicators
  - Connect to API
  - Test display

- [ ] **T082** - Create intervention detail page (2h) — FE
  - Dependencies: T081
  - Create app/(customer)/interventions/[id]/page.tsx
  - Display full intervention details
  - Add accept/reject buttons
  - Show expected impact
  - Test actions

### 5.6 Loan Comparison Page 🔴

- [ ] **T083** - Create loan comparison form (2h) — FE
  - Create app/(customer)/loans/compare/page.tsx
  - Create form for loan parameters
  - Add validation
  - Test form submission

- [ ] **T084** - Create loan comparison results (4h) — FE
  - Dependencies: T083, T066
  - Display comparison table
  - Create loan product cards
  - Highlight best-fit loan
  - Add sorting/filtering
  - Show detailed breakdown
  - Connect to API
  - Test with various amounts

### 5.7 What-If Simulator 🟡

- [ ] **T085** - Create simulator page (4h) — FE
  - Dependencies: T068
  - Create app/(customer)/simulator/page.tsx
  - Create form with interactive sliders
  - Display real-time EMI calculation
  - Display before/after comparison
  - Display impact visualization
  - Connect to API
  - Test interactivity

### 5.8 Bank Officer Dashboard 🟡

- [ ] **T086** - Create officer dashboard (3h) — FE
  - Create app/(officer)/dashboard/page.tsx
  - Display at-risk customers list
  - Display portfolio overview
  - Add customer search/filter
  - Connect to API
  - Test display

- [ ] **T087** - Create customer detail view for officers (2h) — FE
  - Dependencies: T086
  - Create app/(officer)/customers/[id]/page.tsx
  - Display customer financial profile
  - Display risk assessment
  - Display interventions
  - Test access control

### 5.9 Admin Panel 🟢

- [ ] **T088** - Create lender management page (2h) — FE
  - Create app/(admin)/lenders/page.tsx
  - Display lenders list
  - Add create/edit forms
  - Connect to API (create if needed)
  - Test CRUD

- [ ] **T089** - Create loan product management (2h) — FE
  - Dependencies: T088
  - Create app/(admin)/products/page.tsx
  - Display products list
  - Add create/edit forms
  - Connect to API
  - Test CRUD

---

## Phase 6: Testing & Refinement (6-8 hours)

### 6.1 Unit Testing 🔴

- [ ] **T090** - Write financial calculation tests (2h) — BE
  - Test EMI calculator with various scenarios
  - Test financial ratios
  - Test edge cases (zero amounts, negative values)
  - Achieve >90% coverage

- [ ] **T091** - Write risk engine tests (2h) — BE
  - Test each risk factor calculation
  - Test composite scoring
  - Test weight configuration
  - Test explanation generation
  - Achieve >90% coverage

- [ ] **T092** - Write forecast engine tests (2h) — BE
  - Test pattern detection
  - Test balance projections
  - Test edge cases
  - Achieve >80% coverage

- [ ] **T093** - Write intervention engine tests (1.5h) — BE
  - Test hierarchy logic
  - Test each evaluator
  - Test recommendation generation
  - Achieve >80% coverage

- [ ] **T094** - Write loan comparison tests (1.5h) — BE
  - Test eligibility checking
  - Test cost calculations
  - Test scoring algorithm
  - Test ranking
  - Achieve >80% coverage

### 6.2 Integration Testing 🟡

- [ ] **T095** - Write API integration tests (3h) — BE
  - Test authentication flow
  - Test customer CRUD
  - Test risk assessment flow
  - Test loan comparison flow
  - Test error responses

- [ ] **T096** - Test data flow (2h) — FS
  - Test transaction → forecast update
  - Test transaction → risk score update
  - Test intervention trigger
  - Test end-to-end scenarios

### 6.3 End-to-End Testing 🟡

- [ ] **T097** - Set up Playwright (1h) — FE
  - Install Playwright
  - Configure test environment
  - Create test helpers

- [ ] **T098** - Write critical flow E2E tests (4h) — FE
  - Dependencies: T097
  - Test user registration and login
  - Test dashboard loading and navigation
  - Test risk score viewing
  - Test loan comparison flow
  - Test simulator usage
  - Run test suite

### 6.4 Manual Testing 🟡

- [ ] **T099** - Manual test complete user journeys (3h) — All
  - Test customer journey (registration → dashboard → loan comparison)
  - Test officer journey (login → view customers → view risks)
  - Test admin journey (manage lenders and products)
  - Test on Chrome, Firefox, Safari
  - Test on mobile devices
  - Document bugs

### 6.5 Bug Fixing 🔴

- [ ] **T100** - Fix critical bugs (4h) — All
  - Prioritize bugs by severity
  - Fix calculation errors
  - Fix authentication issues
  - Fix API errors
  - Fix UI/UX issues
  - Retest after fixes

### 6.6 Performance Optimization 🟢

- [ ] **T101** - Optimize slow endpoints (2h) — BE
  - Profile API response times
  - Optimize database queries
  - Add database indexes
  - Implement caching
  - Test improvements

- [ ] **T102** - Optimize frontend performance (1h) — FE
  - Optimize component re-renders
  - Add loading states
  - Lazy load components
  - Test load times

---

## Phase 7: Demo Preparation (4-6 hours)

### 7.1 Demo Data 🔴

- [ ] **T103** - Create compelling demo profiles (2h) — BE/FS
  - Create 5 demo customer profiles:
    1. Healthy customer (score 85)
    2. Watch customer (score 65)
    3. At-risk customer (score 45)
    4. Critical customer (score 25) with cash flow gap
    5. Improving customer (score trend up)
  - Create realistic transaction histories
  - Seed into database
  - Test each profile

### 7.2 Demo Flow 🔴

- [ ] **T104** - Plan demo narrative (1h) — All
  - Define 10-minute demo script
  - Identify key features to showcase
  - Plan transitions between features
  - Create talking points

- [ ] **T105** - Practice demo (1h) — All
  - Dependencies: T104
  - Run through complete demo
  - Time each section
  - Refine flow
  - Prepare for questions

### 7.3 Documentation 🟡

- [ ] **T106** - Complete README.md (1h) — FS
  - Add setup instructions
  - Add API documentation links
  - Add architecture overview
  - Add screenshots

- [ ] **T107** - Create demo walkthrough guide (1h) — FS
  - Document demo steps
  - Add screenshots
  - Add explanation for each feature

### 7.4 Presentation 🟡

- [ ] **T108** - Create pitch deck (2h) — All
  - Problem statement slide
  - Solution overview slide
  - Architecture slide
  - Demo flow slide
  - Technical highlights slide
  - Impact slide

- [ ] **T109** - Prepare architecture diagram (1h) — FS
  - Create visual system diagram
  - Export as image
  - Add to presentation

### 7.5 Deployment 🔴

- [ ] **T110** - Deploy backend (2h) — DevOps
  - Set up Render/Railway account
  - Configure environment variables
  - Deploy FastAPI application
  - Verify health endpoint
  - Test API in production

- [ ] **T111** - Deploy frontend (1h) — DevOps
  - Dependencies: T110
  - Set up Vercel account
  - Connect GitHub repository
  - Configure environment variables
  - Deploy Next.js application
  - Verify deployment

- [ ] **T112** - Configure production database (1h) — DevOps
  - Verify Supabase production settings
  - Run migrations on production
  - Load demo data
  - Test connections

- [ ] **T113** - End-to-end production test (1h) — All
  - Dependencies: T110, T111, T112
  - Test complete flow in production
  - Verify all features work
  - Check performance
  - Document any issues

### 7.6 Polish 🟢

- [ ] **T114** - UI/UX polish (2h) — FE
  - Improve color scheme consistency
  - Add micro-animations
  - Improve button states
  - Add helpful tooltips
  - Improve spacing and alignment

- [ ] **T115** - Error message improvements (1h) — BE/FE
  - Make error messages user-friendly
  - Add helpful suggestions
  - Improve validation messages
  - Test error states

- [ ] **T116** - Add success feedback (1h) — FE
  - Add toast notifications
  - Add success animations
  - Add confirmation messages
  - Test user feedback

---

## Task Summary

### By Phase

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 0: Setup | T001-T018 | 4-6 hours |
| Phase 1: Core Data | T019-T035 | 6-8 hours |
| Phase 2: Engines | T036-T052 | 10-12 hours |
| Phase 3: Interventions | T053-T068 | 8-10 hours |
| Phase 4: AI | T069-T073 | 4-6 hours |
| Phase 5: Frontend | T074-T089 | 12-16 hours |
| Phase 6: Testing | T090-T102 | 6-8 hours |
| Phase 7: Demo | T103-T116 | 4-6 hours |
| **Total** | **116 tasks** | **54-72 hours** |

### By Priority

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 42 | Must complete for MVP |
| 🟡 High | 28 | Important for demo quality |
| 🟢 Medium | 20 | Nice to have |
| ⚪ Low | 26 | Can skip if time constrained |

### By Role

| Role | Estimated Tasks | Estimated Hours |
|------|-----------------|-----------------|
| Backend | 45-50 | 25-30 hours |
| Frontend | 35-40 | 18-24 hours |
| Full-Stack | 15-20 | 8-12 hours |
| DevOps | 8-10 | 4-6 hours |

---

## Critical Path

These tasks MUST be completed in order:

1. **T001-T018** — Setup (blocks everything)
2. **T019-T022** — Authentication (blocks protected features)
3. **T023-T032** — Core data models (blocks all engines)
4. **T036-T048** — Risk + Forecast engines (blocks dashboard)
5. **T077** — Customer dashboard (required for demo)
6. **T110-T113** — Deployment (required for presentation)

Everything else can be parallelized or adjusted based on team capacity.

---

## Task Tracking

Use this checklist to track progress. Update daily during standup.

**Progress Metrics:**
- Tasks completed: _____ / 116
- Critical tasks completed: _____ / 42
- Current phase: _____
- Blockers: _____

---

## Notes

- Task IDs are sequential for reference
- Time estimates include implementation + testing
- Dependencies must complete before starting dependent tasks
- Tasks within a phase can often be parallelized
- Adjust priorities based on team strengths
- Don't hesitate to drop low-priority tasks if time is tight

---

**Document Control:**
- Version: 1.0
- Last Updated: September 3, 2026
- Sync With: implementation-plan.md, design.md
