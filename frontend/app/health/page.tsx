"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { RiskScoreCard } from "@/components/financial/risk-score-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, riskColors, riskLabels } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { RiskCategory } from "@/types";

const factorLabels: Record<string, string> = {
  income_stability_score:   "Income Stability",
  liquidity_score:          "Liquidity",
  debt_burden_score:        "Debt Burden",
  payment_behavior_score:   "Payment Behavior",
  credit_utilization_score: "Credit Utilization",
};

const factorWeights: Record<string, string> = {
  income_stability_score:   "20%",
  liquidity_score:          "25%",
  debt_burden_score:        "25%",
  payment_behavior_score:   "15%",
  credit_utilization_score: "15%",
};

function FactorBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  const color = score >= 70 ? "#10B981" : score >= 50 ? "#3B82F6" : score >= 30 ? "#F59E0B" : "#DC2626";
  const level = score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Weak" : "Poor";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-800">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">weight {weight}</span>
          <span className="font-semibold" style={{ color }}>{Math.round(score)}/100</span>
          <Badge
            className="text-xs px-1.5 py-0"
            style={{ backgroundColor: color + "20", color, border: `1px solid ${color}40` }}
          >
            {level}
          </Badge>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function HealthPage() {
  const { data: riskData,    isLoading: riskLoading }    = useQuery({ queryKey: ["risk"],         queryFn: api.getRiskScore });
  const { data: historyData, isLoading: historyLoading } = useQuery({ queryKey: ["risk-history"], queryFn: () => api.getRiskHistory(180) });
  const { data: healthData } = useQuery({ queryKey: ["health"], queryFn: api.getFinancialHealth });

  const historyChartData = historyData
    ? [...historyData].reverse().map((h) => ({
        date:     h.assessment_date,
        score:    h.risk_score,
        category: h.risk_category,
      }))
    : [];

  return (
    <Shell title="Financial Health" description="Deep dive into your resilience score and contributing factors">
      <div className="space-y-6">
        {/* Score card + metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {riskLoading
              ? <div className="h-80 rounded-xl bg-gray-100 animate-pulse" />
              : riskData && <RiskScoreCard data={riskData} />
            }
          </div>

          <div className="lg:col-span-2 space-y-4">
            {[
              { label: "Debt-to-Income Ratio", value: healthData ? `${healthData.debt_to_income_ratio}x` : "—", sub: "Healthy < 2.0x", bad: healthData && healthData.debt_to_income_ratio > 3.5 },
              { label: "EMI / Income",          value: healthData ? `${(healthData.emi_to_income_ratio * 100).toFixed(1)}%` : "—", sub: "Healthy < 30%", bad: healthData && healthData.emi_to_income_ratio > 0.4 },
              { label: "Savings Rate",          value: healthData ? `${(healthData.savings_rate * 100).toFixed(1)}%` : "—", sub: "Target > 20%", bad: healthData && healthData.savings_rate < 0.1 },
              { label: "Emergency Fund",        value: healthData ? `${healthData.emergency_fund_months.toFixed(1)} months` : "—", sub: "Target 6+ months", bad: healthData && healthData.emergency_fund_months < 3 },
            ].map(({ label, value, sub, bad }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-xl font-bold mt-0.5 ${bad ? "text-red-600" : "text-gray-900"}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${bad ? "bg-red-500" : "bg-green-500"}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Factor breakdown */}
        {riskData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Factor Breakdown</CardTitle>
              <CardDescription>How each factor contributes to your overall resilience score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {Object.entries(riskData.factors).map(([key, score]) => (
                <FactorBar
                  key={key}
                  label={factorLabels[key] || key}
                  score={score}
                  weight={factorWeights[key] || "—"}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* History chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score History (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading
              ? <div className="h-48 bg-gray-50 animate-pulse rounded-lg" />
              : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historyChartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                    <Tooltip
                      formatter={(v: number) => [`${v}`, "Score"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Line
                      type="monotone" dataKey="score"
                      stroke="#3B82F6" strokeWidth={2}
                      dot={{ r: 4, fill: "#3B82F6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            }
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
