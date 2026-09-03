import axios from "axios";
import type {
  Customer, RiskScore, RiskHistory, FinancialHealth,
  CashFlowForecast, Intervention, OverdraftOffer,
  Loan, LoanComparison, SimulatorResult, AmortizationRow,
  ApiResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// For demo we use a hardcoded customer_id so we can skip auth pages
export const DEMO_CUSTOMER_ID = "demo-customer-1";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function get<T>(path: string): Promise<T> {
  const res = await client.get<ApiResponse<T>>(path);
  return res.data.data;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await client.post<ApiResponse<T>>(path, body);
  return res.data.data;
}

// ─── Customer ─────────────────────────────────────────────────────────────────
export const api = {
  // Customer
  getCustomer: () => get<Customer>(`/customers/${DEMO_CUSTOMER_ID}`),

  // Financial Health
  getFinancialHealth: () => get<FinancialHealth>(`/customers/${DEMO_CUSTOMER_ID}/financial-health`),

  // Risk
  getRiskScore: () => get<RiskScore>(`/customers/${DEMO_CUSTOMER_ID}/risk/score`),
  getRiskHistory: (days = 180) =>
    get<RiskHistory[]>(`/customers/${DEMO_CUSTOMER_ID}/risk/history?days=${days}`),

  // Forecast
  getForecast: (days = 90) =>
    get<CashFlowForecast>(`/customers/${DEMO_CUSTOMER_ID}/forecast?days=${days}`),

  // Interventions
  getInterventions: (status?: string) =>
    get<Intervention[]>(
      `/customers/${DEMO_CUSTOMER_ID}/interventions${status ? `?status=${status}` : ""}`
    ),
  acceptIntervention: (id: string) =>
    post<{ status: string }>(`/interventions/${id}/accept`, {}),
  rejectIntervention: (id: string, reason?: string) =>
    post<{ status: string }>(`/interventions/${id}/reject`, { reason }),

  // Overdraft
  calculateOverdraft: (amount: number, repaymentDate: string) =>
    post<OverdraftOffer>(`/customers/${DEMO_CUSTOMER_ID}/overdraft/calculate`, {
      required_amount: amount,
      expected_repayment_date: repaymentDate,
    }),

  // Loans
  getLoans: () => get<Loan[]>(`/customers/${DEMO_CUSTOMER_ID}/loans`),
  compareLoans: (amount: number, tenure: number, loanType = "personal") =>
    post<LoanComparison>(`/loans/compare`, {
      customer_id: DEMO_CUSTOMER_ID,
      loan_amount: amount,
      tenure_months: tenure,
      loan_type: loanType,
    }),

  // Simulator
  simulateLoan: (amount: number, rate: number, tenure: number, fee = 0) =>
    post<SimulatorResult>(`/simulator/loan`, {
      customer_id: DEMO_CUSTOMER_ID,
      loan_amount: amount,
      interest_rate: rate,
      tenure_months: tenure,
      processing_fee: fee,
    }),
  calculateEMI: (principal: number, rate: number, tenure: number) =>
    post<{ emi: number; total_interest: number; total_repayment: number; amortization_schedule: AmortizationRow[] }>(
      `/simulator/emi`,
      { principal, interest_rate: rate, tenure_months: tenure }
    ),

  // AI
  getAIExplanation: (contextType: string, contextData: Record<string, unknown>) =>
    post<{ explanation: string; is_fallback: boolean }>(
      `/ai/explain`,
      { context_type: contextType, context_data: contextData }
    ),
};
