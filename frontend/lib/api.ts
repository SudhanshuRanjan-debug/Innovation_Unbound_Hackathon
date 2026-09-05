import axios from "axios";
import type {
  Customer, RiskScore, RiskHistory, FinancialHealth,
  CashFlowForecast, Intervention, OverdraftOffer,
  Loan, LoanComparison, SimulatorResult, AmortizationRow,
  ApiResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export let ACTIVE_CUSTOMER_ID = "demo-customer-1";

export function setActiveCustomerId(id: string) {
  ACTIVE_CUSTOMER_ID = id;
}

export const DEMO_PROFILES = [
  { id: "demo-customer-1", name: "Arjun Mehta", role: "Software Engineer", status: "Watchlist (Emerging Stress)", riskScore: 63.5, category: "watch" },
  { id: "demo-customer-2", name: "Priya Sharma", role: "Product Designer", status: "Resilient & Optimal", riskScore: 84.0, category: "healthy" },
  { id: "demo-customer-3", name: "Rajesh Verma", role: "Business Consultant", status: "Critical Distress", riskScore: 28.0, category: "critical" },
];

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 8_000,
});

const USE_LIVE_BACKEND = process.env.NEXT_PUBLIC_USE_LIVE_BACKEND === "true";

// ─── Helpers with Fallback Resilience ─────────────────────────────────────────
async function get<T>(path: string, fallbackGenerator?: () => T): Promise<T> {
  if (!USE_LIVE_BACKEND && fallbackGenerator) {
    return fallbackGenerator();
  }
  try {
    const res = await client.get<ApiResponse<T>>(path);
    return res.data.data;
  } catch (err) {
    if (fallbackGenerator) {
      return fallbackGenerator();
    }
    throw err;
  }
}

async function post<T>(path: string, body: unknown, fallbackGenerator?: () => T): Promise<T> {
  if (!USE_LIVE_BACKEND && fallbackGenerator) {
    return fallbackGenerator();
  }
  try {
    const res = await client.post<ApiResponse<T>>(path, body);
    return res.data.data;
  } catch (err) {
    if (fallbackGenerator) {
      return fallbackGenerator();
    }
    throw err;
  }
}

// ─── Fallback Generators ──────────────────────────────────────────────────────
function getMockCustomer(id: string): Customer {
  if (id === "demo-customer-2") {
    return {
      id: "demo-customer-2",
      first_name: "Priya",
      last_name: "Sharma",
      email: "priya.sharma@example.com",
      phone: "+91-9811223344",
      monthly_income: 120000,
      employment_status: "employed",
      customer_since: "2022-03-15",
      status: "active",
    };
  }
  if (id === "demo-customer-3") {
    return {
      id: "demo-customer-3",
      first_name: "Rajesh",
      last_name: "Verma",
      email: "rajesh.verma@example.com",
      phone: "+91-9877665544",
      monthly_income: 60000,
      employment_status: "self_employed",
      customer_since: "2021-08-20",
      status: "active",
    };
  }
  return {
    id: "demo-customer-1",
    first_name: "Arjun",
    last_name: "Mehta",
    email: "arjun.mehta@example.com",
    phone: "+91-9876543210",
    monthly_income: 85000,
    employment_status: "employed",
    customer_since: "2023-01-10",
    status: "active",
  };
}

function getMockFinancialHealth(id: string): FinancialHealth {
  if (id === "demo-customer-2") {
    return {
      snapshot_date: new Date().toISOString(),
      monthly_income: 120000,
      total_balance: 185000,
      average_balance: 140000,
      total_debt: 200000,
      total_emi: 15000,
      debt_to_income_ratio: 1.67,
      emi_to_income_ratio: 0.125,
      monthly_expenses: 50000,
      essential_expenses: 32000,
      discretionary_expenses: 18000,
      savings_rate: 0.45,
      emergency_fund_months: 5.8,
    };
  }
  if (id === "demo-customer-3") {
    return {
      snapshot_date: new Date().toISOString(),
      monthly_income: 60000,
      total_balance: 4200,
      average_balance: 6500,
      total_debt: 850000,
      total_emi: 34000,
      debt_to_income_ratio: 14.1,
      emi_to_income_ratio: 0.56,
      monthly_expenses: 58000,
      essential_expenses: 42000,
      discretionary_expenses: 16000,
      savings_rate: -0.05,
      emergency_fund_months: 0.1,
    };
  }
  return {
    snapshot_date: new Date().toISOString(),
    monthly_income: 85000,
    total_balance: 48500,
    average_balance: 38200,
    total_debt: 480000,
    total_emi: 22000,
    debt_to_income_ratio: 5.65,
    emi_to_income_ratio: 0.259,
    monthly_expenses: 54000,
    essential_expenses: 35000,
    discretionary_expenses: 19000,
    savings_rate: 0.106,
    emergency_fund_months: 1.38,
  };
}

function getMockRiskScore(id: string): RiskScore {
  if (id === "demo-customer-2") {
    return {
      assessment_date: new Date().toISOString(),
      risk_score: 84.0,
      risk_category: "healthy",
      previous_score: 81.5,
      score_change: 2.5,
      trend: "improving",
      factors: {
        income_stability_score: 92,
        liquidity_score: 88,
        debt_burden_score: 85,
        payment_behavior_score: 95,
        credit_utilization_score: 80,
      },
      weights: { income: 0.2, liquidity: 0.25, debt: 0.25, payment: 0.15, credit: 0.15 },
      risk_factors: [
        { factor: "High Cash Buffer", impact: "low", description: "Healthy 5.8-month emergency fund in place." },
      ],
      ml_distress_probability: 0.04,
    };
  }
  if (id === "demo-customer-3") {
    return {
      assessment_date: new Date().toISOString(),
      risk_score: 28.0,
      risk_category: "critical",
      previous_score: 36.0,
      score_change: -8.0,
      trend: "declining",
      factors: {
        income_stability_score: 35,
        liquidity_score: 15,
        debt_burden_score: 20,
        payment_behavior_score: 45,
        credit_utilization_score: 25,
      },
      weights: { income: 0.2, liquidity: 0.25, debt: 0.25, payment: 0.15, credit: 0.15 },
      risk_factors: [
        { factor: "Severe EMI Burden", impact: "high", description: "EMI obligations exceed 56% of net monthly income." },
        { factor: "Imminent Deficit", impact: "high", description: "Cash reserve is less than 5 days of essential expenses." },
        { factor: "Credit Over-utilization", impact: "high", description: "Credit card utilization is at 88%." },
      ],
      ml_distress_probability: 0.78,
    };
  }
  return {
    assessment_date: new Date().toISOString(),
    risk_score: 63.5,
    risk_category: "watch",
    previous_score: 68.0,
    score_change: -4.5,
    trend: "declining",
    factors: {
      income_stability_score: 78,
      liquidity_score: 55,
      debt_burden_score: 58,
      payment_behavior_score: 82,
      credit_utilization_score: 52,
    },
    weights: { income: 0.2, liquidity: 0.25, debt: 0.25, payment: 0.15, credit: 0.15 },
    risk_factors: [
      { factor: "Discretionary Spending Spike", impact: "high", description: "Dining & shopping expenses surged 28% in the last 60 days." },
      { factor: "Thin Liquidity Gap", impact: "medium", description: "Projected balance drops below ₹5,000 threshold prior to next salary." },
      { factor: "Approaching EMI Threshold", impact: "medium", description: "EMI-to-income ratio at 25.9% is approaching the 30% warning level." },
    ],
    ml_distress_probability: 0.27,
  };
}

function getMockForecast(days = 90): CashFlowForecast {
  const projections = [];
  const start = new Date();
  let bal = 48500;
  let minBal = bal;
  let minDate = start.toISOString();
  let negDays = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    let inflows = 0;
    let outflows = 0;

    // Salary on 1st of month
    if (d.getDate() === 1) {
      inflows += 85000;
    }
    // Rent on 5th
    if (d.getDate() === 5) {
      outflows += 15000;
    }
    // EMI on 5th
    if (d.getDate() === 5) {
      outflows += 22000;
    }
    // Utilities on 10th
    if (d.getDate() === 10) {
      outflows += 3500;
    }
    // Daily spends
    outflows += Math.round(700 + Math.sin(i) * 300);

    bal = bal + inflows - outflows;
    if (bal < minBal) {
      minBal = bal;
      minDate = d.toISOString();
    }
    if (bal < 0) negDays++;

    projections.push({
      date: d.toISOString().split("T")[0],
      projected_balance: bal,
      inflows,
      outflows,
      notes: d.getDate() === 1 ? "Salary Credit" : d.getDate() === 5 ? "Rent & EMI" : undefined,
    });
  }

  return {
    forecast_generated_at: new Date().toISOString(),
    forecast_period: {
      start_date: start.toISOString().split("T")[0],
      end_date: projections[projections.length - 1].date,
    },
    current_balance: 48500,
    daily_projections: projections,
    summary: {
      minimum_balance: minBal,
      minimum_balance_date: minDate,
      average_balance: 34200,
      negative_balance_days: negDays,
      low_balance_alerts: [
        {
          date: new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0],
          projected_balance: 3800,
          reason: "Pre-salary liquidity dip: balance drops to ₹3,800 before next credit.",
        },
      ],
    },
    confidence_level: "high",
  };
}

export const api = {
  // Customer
  getCustomer: (id = ACTIVE_CUSTOMER_ID) =>
    get<Customer>(`/customers/${id}`, () => getMockCustomer(id)),

  // Financial Health
  getFinancialHealth: (id = ACTIVE_CUSTOMER_ID) =>
    get<FinancialHealth>(`/customers/${id}/financial-health`, () => getMockFinancialHealth(id)),

  // Risk
  getRiskScore: (id = ACTIVE_CUSTOMER_ID) =>
    get<RiskScore>(`/customers/${id}/risk/score`, () => getMockRiskScore(id)),
  getRiskHistory: (days = 180, id = ACTIVE_CUSTOMER_ID) =>
    get<RiskHistory[]>(`/customers/${id}/risk/history?days=${days}`, () => [
      { assessment_date: "2026-04-01", risk_score: 74, risk_category: "healthy" },
      { assessment_date: "2026-05-01", risk_score: 72, risk_category: "healthy" },
      { assessment_date: "2026-06-01", risk_score: 69, risk_category: "watch" },
      { assessment_date: "2026-07-01", risk_score: 67, risk_category: "watch" },
      { assessment_date: "2026-08-01", risk_score: 68, risk_category: "watch" },
      { assessment_date: "2026-09-01", risk_score: 63.5, risk_category: "watch" },
    ]),

  // Forecast
  getForecast: (days = 90, id = ACTIVE_CUSTOMER_ID) =>
    get<CashFlowForecast>(`/customers/${id}/forecast?days=${days}`, () => getMockForecast(days)),

  // Transactions
  getTransactions: (id = ACTIVE_CUSTOMER_ID) =>
    get<{ transactions: any[]; total_count: number }>(`/customers/${id}/transactions`, () => ({
      transactions: [
        { id: "tx-1", transaction_date: "2026-09-01", amount: 85000, transaction_type: "credit", category: "salary", description: "Monthly Salary — Tech Corp" },
        { id: "tx-2", transaction_date: "2026-09-02", amount: 22000, transaction_type: "debit", category: "emi", description: "Home Loan EMI" },
        { id: "tx-3", transaction_date: "2026-09-02", amount: 15000, transaction_type: "debit", category: "rent", description: "Monthly Apartment Rent" },
        { id: "tx-4", transaction_date: "2026-09-03", amount: 3500, transaction_type: "debit", category: "utilities", description: "Electricity & Fiber Internet" },
        { id: "tx-5", transaction_date: "2026-09-03", amount: 2400, transaction_type: "debit", category: "dining", description: "Weekend Dining Out" },
        { id: "tx-6", transaction_date: "2026-09-04", amount: 4800, transaction_type: "debit", category: "shopping", description: "Electronics & Household" },
      ],
      total_count: 6,
    })),

  // Interventions
  getInterventions: (status?: string, id = ACTIVE_CUSTOMER_ID) =>
    get<Intervention[]>(
      `/customers/${id}/interventions${status ? `?status=${status}` : ""}`,
      () => [
        {
          id: "int-1",
          intervention_type: "spending_adjustment",
          trigger_reason: "Discretionary spending increased 28% over last 3 months",
          trigger_score: 63.5,
          recommendation_text: "Trim dining & discretionary entertainment by ₹4,000/mo to rebuild buffer without restricting lifestyle.",
          expected_impact: "Improves resilience score by +4.2 points in 60 days",
          status: "pending",
          priority: "high",
          recommended_date: new Date().toISOString(),
          metadata: { saving_potential: 4000 },
        },
        {
          id: "int-2",
          intervention_type: "overdraft",
          trigger_reason: "Projected balance drops below ₹5,000 safe buffer before next salary",
          trigger_score: 63.5,
          recommendation_text: "Micro-overdraft buffer of ₹15,000 can bridge cash gap seamlessly until 1st salary credit. Transparent flat fee of ₹187.",
          expected_impact: "Avoids bounce fees, protects CIBIL / resilience score",
          status: "pending",
          priority: "critical",
          recommended_date: new Date().toISOString(),
          metadata: { amount: 15000, fee: 187 },
        },
        {
          id: "int-3",
          intervention_type: "repayment_restructure",
          trigger_reason: "EMI burden is at 25.9% of total income (approaching 30% risk limit)",
          trigger_score: 63.5,
          recommendation_text: "Restructure 36m personal loan to 48m to release ₹2,400 monthly free cash flow.",
          expected_impact: "Reduces monthly EMI pressure by 23%",
          status: "pending",
          priority: "medium",
          recommended_date: new Date().toISOString(),
          metadata: { current_emi: 10200, new_emi: 7800 },
        },
      ]
    ),

  acceptIntervention: (id: string) =>
    post<{ status: string }>(`/interventions/${id}/accept`, {}, () => ({ status: "accepted" })),

  rejectIntervention: (id: string, reason?: string) =>
    post<{ status: string }>(`/interventions/${id}/reject`, { reason }, () => ({ status: "rejected" })),

  // Overdraft
  calculateOverdraft: (amount: number, repaymentDate: string, id = ACTIVE_CUSTOMER_ID) =>
    post<OverdraftOffer>(
      `/customers/${id}/overdraft/calculate`,
      { required_amount: amount, expected_repayment_date: repaymentDate },
      () => {
        const days = 25;
        const interest = Math.round(amount * 0.0005 * days);
        const fee = 100;
        return {
          eligible: amount <= 50000,
          required_amount: amount,
          approved_amount: Math.min(amount, 50000),
          duration_days: days,
          daily_interest_rate: 0.05,
          processing_fee: fee,
          total_interest: interest,
          total_repayment: amount + interest + fee,
          expected_repayment_date: repaymentDate,
          eligibility_check: {
            salary_account_verified: true,
            consistent_cash_inflow: true,
            debt_service_ratio_ok: true,
            kyc_verified: true,
          },
          impact: {
            monthly_cost: interest + fee,
            impact_on_risk_score: 1.5,
          },
        };
      }
    ),

  // Loans
  getLoans: (id = ACTIVE_CUSTOMER_ID) =>
    get<Loan[]>(`/customers/${id}/loans`, () => [
      {
        id: "loan-1",
        loan_number: "PL-2024-001",
        loan_type: "Personal Loan",
        lender_name: "HDFC Bank",
        product_name: "Personal Loan Premium",
        principal_amount: 300000,
        outstanding_principal: 240000,
        interest_rate: 13.5,
        tenure_months: 36,
        emi_amount: 10200,
        status: "active",
      },
      {
        id: "loan-2",
        loan_number: "HL-2022-007",
        loan_type: "Home Loan",
        lender_name: "ICICI Bank",
        product_name: "Home Loan Standard",
        principal_amount: 3500000,
        outstanding_principal: 3150000,
        interest_rate: 8.7,
        tenure_months: 240,
        emi_amount: 11800,
        status: "active",
      },
    ]),

  compareLoans: (amount: number, tenure: number, loanType = "personal", id = ACTIVE_CUSTOMER_ID) =>
    post<LoanComparison>(
      `/loans/compare`,
      { customer_id: id, loan_amount: amount, tenure_months: tenure, loan_type: loanType },
      () => {
        const calculateEmi = (p: number, r: number, t: number) => {
          const mRate = r / (12 * 100);
          return Math.round((p * mRate * Math.pow(1 + mRate, t)) / (Math.pow(1 + mRate, t) - 1));
        };

        const emi1 = calculateEmi(amount, 11.5, tenure);
        const emi2 = calculateEmi(amount, 10.99, tenure);
        const emi3 = calculateEmi(amount, 12.0, tenure);
        const emi4 = calculateEmi(amount, 13.5, tenure);

        return {
          comparison_id: `comp-${Date.now()}`,
          loan_amount: amount,
          tenure_months: tenure,
          products: [
            {
              product_id: "prod-1",
              lender_name: "HDFC Bank",
              product_name: "Personal Loan Premium",
              interest_rate: 11.5,
              emi: emi1,
              total_interest: Math.round(emi1 * tenure - amount),
              total_repayment: emi1 * tenure,
              processing_fee: Math.round(amount * 0.01),
              total_cost: Math.round(emi1 * tenure + amount * 0.01),
              affordability: {
                emi_to_income_ratio: emi1 / 85000,
                monthly_surplus_after_emi: 85000 - 54000 - emi1,
                affordable: emi1 / 85000 <= 0.35,
              },
              impact: {
                new_debt_to_income_ratio: 5.8,
                projected_risk_score: 61.2,
                risk_score_change: -2.3,
              },
              scores: {
                total_cost_score: 88,
                affordability_score: 91,
                resilience_impact_score: 87,
                tenure_score: 95,
                fees_score: 85,
                flexibility_score: 92,
                composite_score: 89.8,
              },
              rank: 1,
              is_best_fit: true,
              recommendation_reason:
                "Best fit composite score: Lowest processing fee, flexible prepayment with no lock-in, and minimal impact on your monthly liquidity buffer.",
            },
            {
              product_id: "prod-2",
              lender_name: "IDFC FIRST Bank",
              product_name: "Personal Loan Express",
              interest_rate: 10.99,
              emi: emi2,
              total_interest: Math.round(emi2 * tenure - amount),
              total_repayment: emi2 * tenure,
              processing_fee: 0,
              total_cost: emi2 * tenure,
              affordability: {
                emi_to_income_ratio: emi2 / 85000,
                monthly_surplus_after_emi: 85000 - 54000 - emi2,
                affordable: true,
              },
              impact: {
                new_debt_to_income_ratio: 5.75,
                projected_risk_score: 61.8,
                risk_score_change: -1.7,
              },
              scores: {
                total_cost_score: 94,
                affordability_score: 93,
                resilience_impact_score: 86,
                tenure_score: 84,
                fees_score: 95,
                flexibility_score: 70,
                composite_score: 87.2,
              },
              rank: 2,
              is_best_fit: false,
              recommendation_reason: "Lowest headline rate and ₹0 fee, but has strict prepayment penalties.",
            },
            {
              product_id: "prod-3",
              lender_name: "ICICI Bank",
              product_name: "QuickCash Loan",
              interest_rate: 12.0,
              emi: emi3,
              total_interest: Math.round(emi3 * tenure - amount),
              total_repayment: emi3 * tenure,
              processing_fee: 500,
              total_cost: emi3 * tenure + 500,
              affordability: {
                emi_to_income_ratio: emi3 / 85000,
                monthly_surplus_after_emi: 85000 - 54000 - emi3,
                affordable: true,
              },
              impact: {
                new_debt_to_income_ratio: 5.85,
                projected_risk_score: 60.5,
                risk_score_change: -3.0,
              },
              scores: {
                total_cost_score: 82,
                affordability_score: 85,
                resilience_impact_score: 80,
                tenure_score: 88,
                fees_score: 90,
                flexibility_score: 88,
                composite_score: 84.5,
              },
              rank: 3,
              is_best_fit: false,
            },
            {
              product_id: "prod-4",
              lender_name: "Bajaj Finserv",
              product_name: "Flexi Personal Loan",
              interest_rate: 13.5,
              emi: emi4,
              total_interest: Math.round(emi4 * tenure - amount),
              total_repayment: emi4 * tenure,
              processing_fee: Math.round(amount * 0.0399),
              total_cost: Math.round(emi4 * tenure + amount * 0.0399),
              affordability: {
                emi_to_income_ratio: emi4 / 85000,
                monthly_surplus_after_emi: 85000 - 54000 - emi4,
                affordable: emi4 / 85000 <= 0.4,
              },
              impact: {
                new_debt_to_income_ratio: 6.1,
                projected_risk_score: 58.0,
                risk_score_change: -5.5,
              },
              scores: {
                total_cost_score: 70,
                affordability_score: 75,
                resilience_impact_score: 72,
                tenure_score: 90,
                fees_score: 60,
                flexibility_score: 94,
                composite_score: 75.8,
              },
              rank: 4,
              is_best_fit: false,
            },
          ],
          best_fit_product_id: "prod-1",
          weights_used: { cost: 0.3, affordability: 0.25, risk_impact: 0.2, tenure: 0.1, fees: 0.1, flexibility: 0.05 },
        };
      }
    ),

  // Simulator
  simulateLoan: (amount: number, rate: number, tenure: number, fee = 0, id = ACTIVE_CUSTOMER_ID) =>
    post<SimulatorResult>(
      `/simulator/loan`,
      { customer_id: id, loan_amount: amount, interest_rate: rate, tenure_months: tenure, processing_fee: fee },
      () => {
        const mRate = rate / (12 * 100);
        const emi = Math.round((amount * mRate * Math.pow(1 + mRate, tenure)) / (Math.pow(1 + mRate, tenure) - 1));
        const totalRep = emi * tenure;
        const totalInt = totalRep - amount;
        const totalCost = totalRep + fee;

        const income = 85000;
        const currentEmi = 22000;
        const expenses = 54000;
        const currentSurplus = income - expenses - currentEmi;
        const newTotalEmi = currentEmi + emi;
        const newRatio = newTotalEmi / income;
        const newSurplus = income - expenses - newTotalEmi;

        const riskDelta = Math.max(0, (newRatio - 0.3) * 80);
        const projectedScore = Math.max(0, 63.5 - riskDelta);

        let affordability = "comfortable";
        if (newRatio > 0.5) affordability = "unaffordable";
        else if (newRatio > 0.4) affordability = "risky";
        else if (newRatio > 0.3) affordability = "acceptable";

        const recs: Record<string, string> = {
          comfortable: "This loan fits comfortably within your monthly cash flow buffer.",
          acceptable: "Manageable, but leaves limited headroom for unexpected emergencies.",
          risky: "This will strain your monthly liquidity. Consider a longer tenure to reduce EMI.",
          unaffordable: "Severe financial stress risk. Reduces your emergency buffer to unsafe levels.",
        };

        return {
          simulation_id: `sim-${Date.now()}`,
          inputs: { loan_amount: amount, interest_rate: rate, tenure_months: tenure, processing_fee: fee },
          calculations: { emi, total_interest: totalInt, total_repayment: totalRep, total_cost: totalCost },
          current_state: {
            monthly_income: income,
            total_emi: currentEmi,
            emi_to_income_ratio: currentEmi / income,
            risk_score: 63.5,
            monthly_surplus: currentSurplus,
          },
          projected_state: {
            total_emi: newTotalEmi,
            emi_to_income_ratio: newRatio,
            risk_score: projectedScore,
            monthly_surplus: newSurplus,
          },
          impact: {
            emi_increase: emi,
            risk_score_change: Number((projectedScore - 63.5).toFixed(1)),
            surplus_change: newSurplus - currentSurplus,
            affordability,
            recommendation: recs[affordability],
          },
        };
      }
    ),

  calculateEMI: (principal: number, rate: number, tenure: number) =>
    post<{ emi: number; total_interest: number; total_repayment: number; amortization_schedule: AmortizationRow[] }>(
      `/simulator/emi`,
      { principal, interest_rate: rate, tenure_months: tenure },
      () => {
        const mRate = rate / (12 * 100);
        const emi = Math.round((principal * mRate * Math.pow(1 + mRate, tenure)) / (Math.pow(1 + mRate, tenure) - 1));
        let balance = principal;
        const schedule: AmortizationRow[] = [];

        for (let m = 1; m <= tenure; m++) {
          const interest = Math.round(balance * mRate);
          const p = emi - interest;
          balance = Math.max(0, balance - p);
          schedule.push({ month: m, emi, principal: p, interest, balance });
        }

        return {
          emi,
          total_interest: emi * tenure - principal,
          total_repayment: emi * tenure,
          amortization_schedule: schedule,
        };
      }
    ),

  // AI Reasoning Explanation
  getAIExplanation: (contextType: string, contextData: Record<string, unknown>) =>
    post<{ explanation: string; is_fallback: boolean }>(
      `/ai/explain`,
      { context_type: contextType, context_data: contextData },
      () => {
        const score = Number(contextData.risk_score || 63.5);
        if (score < 50) {
          return {
            explanation:
              "FinShield AI Neural Diagnostic:\n\n• Score Shift: Down 8.0 points to Critical Range (28/100).\n• Root Drivers: Fixed debt obligations consume 56% of income, creating a negative monthly cash-flow trajectory.\n• Projection: Inflow gap will trigger overdraft on day 18 unless emergency restructuring is engaged.\n• FinShield Protocol: 1) Freeze discretionary credit lines, 2) Restructure 24m loans to 48m, 3) Bridge short-term gap via micro-liquidity buffer.",
            is_fallback: true,
          };
        }
        return {
          explanation:
            "FinShield AI Neural Diagnostic:\n\n• Score Status: Watchlist Level (63.5/100) — Moderate Resilience.\n• Root Drivers: Discretionary expenses increased by +28% in 60 days, reducing emergency reserve months from 2.4 to 1.38.\n• Projection: Liquidity will drop to ₹3,800 before next salary credit on 1st.\n• FinShield Protocol: Reduce non-essential dining/shopping by ₹4,000/mo to restore 70+ resilience grade within 60 days.",
          is_fallback: true,
        };
      }
    ),
};
