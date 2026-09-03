// ─── Shared ────────────────────────────────────────────────────────────────
export type RiskCategory = "critical" | "at_risk" | "watch" | "healthy";
export type Trend = "improving" | "stable" | "declining";

// ─── Customer ──────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  monthly_income: number;
  employment_status: string;
  customer_since: string;
  status: string;
}

// ─── Risk ───────────────────────────────────────────────────────────────────
export interface RiskFactor {
  factor: string;
  impact: "high" | "medium" | "low";
  description: string;
}

export interface RiskFactors {
  income_stability_score: number;
  liquidity_score: number;
  debt_burden_score: number;
  payment_behavior_score: number;
  credit_utilization_score: number;
}

export interface RiskScore {
  assessment_date: string;
  risk_score: number;
  risk_category: RiskCategory;
  previous_score?: number;
  score_change?: number;
  trend?: Trend;
  factors: RiskFactors;
  weights: Record<string, number>;
  risk_factors: RiskFactor[];
  ml_distress_probability?: number;
}

export interface RiskHistory {
  assessment_date: string;
  risk_score: number;
  risk_category: RiskCategory;
}

// ─── Financial Health ───────────────────────────────────────────────────────
export interface FinancialHealth {
  snapshot_date: string;
  monthly_income: number;
  total_balance: number;
  average_balance: number;
  total_debt: number;
  total_emi: number;
  debt_to_income_ratio: number;
  emi_to_income_ratio: number;
  monthly_expenses: number;
  essential_expenses: number;
  discretionary_expenses: number;
  savings_rate: number;
  emergency_fund_months: number;
}

// ─── Forecast ───────────────────────────────────────────────────────────────
export interface DailyProjection {
  date: string;
  projected_balance: number;
  inflows: number;
  outflows: number;
  notes?: string;
}

export interface LowBalanceAlert {
  date: string;
  projected_balance: number;
  reason: string;
}

export interface ForecastSummary {
  minimum_balance: number;
  minimum_balance_date: string;
  average_balance: number;
  negative_balance_days: number;
  low_balance_alerts: LowBalanceAlert[];
}

export interface CashFlowForecast {
  forecast_generated_at: string;
  forecast_period: { start_date: string; end_date: string };
  current_balance: number;
  daily_projections: DailyProjection[];
  summary: ForecastSummary;
  confidence_level: "high" | "medium" | "low";
}

// ─── Interventions ──────────────────────────────────────────────────────────
export type InterventionType =
  | "spending_adjustment"
  | "repayment_restructure"
  | "overdraft"
  | "loan"
  | "emergency_fund";

export interface Intervention {
  id: string;
  intervention_type: InterventionType;
  trigger_reason: string;
  trigger_score?: number;
  recommendation_text: string;
  expected_impact?: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  priority: "low" | "medium" | "high" | "critical";
  recommended_date: string;
  expiry_date?: string;
  metadata?: Record<string, unknown>;
}

// ─── Overdraft ──────────────────────────────────────────────────────────────
export interface OverdraftOffer {
  eligible: boolean;
  required_amount: number;
  approved_amount: number;
  duration_days: number;
  daily_interest_rate: number;
  processing_fee: number;
  total_interest: number;
  total_repayment: number;
  expected_repayment_date: string;
  eligibility_check: Record<string, boolean>;
  impact: { monthly_cost: number; impact_on_risk_score: number };
}

// ─── Loans ──────────────────────────────────────────────────────────────────
export interface Loan {
  id: string;
  loan_number: string;
  loan_type: string;
  lender_name: string;
  product_name?: string;
  principal_amount: number;
  outstanding_principal: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  next_emi_date?: string;
  status: string;
}

export interface LoanProductScore {
  total_cost_score: number;
  affordability_score: number;
  resilience_impact_score: number;
  tenure_score: number;
  fees_score: number;
  flexibility_score: number;
  composite_score: number;
}

export interface LoanProductResult {
  product_id: string;
  lender_name: string;
  product_name: string;
  interest_rate: number;
  emi: number;
  total_interest: number;
  total_repayment: number;
  processing_fee: number;
  total_cost: number;
  affordability: {
    emi_to_income_ratio: number;
    monthly_surplus_after_emi: number;
    affordable: boolean;
  };
  impact: {
    new_debt_to_income_ratio: number;
    projected_risk_score: number;
    risk_score_change: number;
  };
  scores: LoanProductScore;
  rank: number;
  is_best_fit: boolean;
  recommendation_reason?: string;
}

export interface LoanComparison {
  comparison_id: string;
  loan_amount: number;
  tenure_months: number;
  products: LoanProductResult[];
  best_fit_product_id: string;
  weights_used: Record<string, number>;
}

// ─── Simulator ──────────────────────────────────────────────────────────────
export interface SimulatorResult {
  simulation_id: string;
  inputs: {
    loan_amount: number;
    interest_rate: number;
    tenure_months: number;
    processing_fee: number;
  };
  calculations: {
    emi: number;
    total_interest: number;
    total_repayment: number;
    total_cost: number;
  };
  current_state: {
    monthly_income: number;
    total_emi: number;
    emi_to_income_ratio: number;
    risk_score: number;
    monthly_surplus: number;
  };
  projected_state: {
    total_emi: number;
    emi_to_income_ratio: number;
    risk_score: number;
    monthly_surplus: number;
  };
  impact: {
    emi_increase: number;
    risk_score_change: number;
    surplus_change: number;
    affordability: string;
    recommendation: string;
  };
}

export interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

// ─── API Wrapper ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
  timestamp: string;
}
