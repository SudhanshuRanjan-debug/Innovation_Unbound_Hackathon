"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { RiskScoreCard } from "@/components/financial/risk-score-card";
import { CashFlowChart } from "@/components/financial/cashflow-chart";
import { InterventionCard } from "@/components/financial/intervention-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowUpRight, ArrowDownRight, Wallet,
  TrendingUp, AlertTriangle, IndianRupee,
} from "lucide-react";

function StatCard({
  label, value, sub, icon: Icon, trend,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`rounded-lg p-2 ${
            trend === "up" ? "bg-green-50" : trend === "down" ? "bg-red-50" : "bg-blue-50"
          }`}>
            <Icon className={`h-5 w-5 ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-blue-600"
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: riskData, isLoading: riskLoading }         = useQuery({ queryKey: ["risk"],         queryFn: api.getRiskScore });
  const { data: forecastData, isLoading: forecastLoading } = useQuery({ queryKey: ["forecast"],     queryFn: () => api.getForecast(90) });
  const { data: interventions, isLoading: intLoading, refetch: refetchInt } =
    useQuery({ queryKey: ["interventions"], queryFn: () => api.getInterventions("pending") });
  const { data: healthData } = useQuery({ queryKey: ["health"], queryFn: api.getFinancialHealth });
  const { data: txnData }    = useQuery({ queryKey: ["txns"],   queryFn: () => api.getLoans() });

  const pendingCount = Array.isArray(interventions) ? interventions.length : 0;

  return (
    <Shell title="Dashboard" description="Your financial health overview">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Current Balance"
          value={healthData ? formatCurrency(healthData.total_balance) : "—"}
          sub="Primary account"
          icon={Wallet}
          trend="neutral"
        />
        <StatCard
          label="Monthly Income"
          value={healthData ? formatCurrency(healthData.monthly_income) : "—"}
          sub="Net credited"
          icon={IndianRupee}
          trend="up"
        />
        <StatCard
          label="Total EMI"
          value={healthData ? formatCurrency(healthData.total_emi) : "—"}
          sub={healthData ? `${(healthData.emi_to_income_ratio * 100).toFixed(0)}% of income` : "—"}
          icon={ArrowDownRight}
          trend={healthData && healthData.emi_to_income_ratio > 0.4 ? "down" : "neutral"}
        />
        <StatCard
          label="Savings Rate"
          value={healthData ? `${(healthData.savings_rate * 100).toFixed(1)}%` : "—"}
          sub={`Emergency: ${healthData ? healthData.emergency_fund_months.toFixed(1) : "—"} months`}
          icon={TrendingUp}
          trend={healthData && healthData.savings_rate > 0.1 ? "up" : "down"}
        />
      </div>

      {/* Main two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {riskLoading
          ? <Card className="h-72 animate-pulse bg-gray-50" />
          : riskData && <RiskScoreCard data={riskData} compact />
        }
        {forecastLoading
          ? <Card className="h-72 animate-pulse bg-gray-50" />
          : forecastData && <CashFlowChart data={forecastData} compact />
        }
      </div>

      {/* Interventions strip */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-900">Active Recommendations</h2>
          {pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} pending</Badge>
          )}
        </div>

        {intLoading && (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        )}

        {!intLoading && Array.isArray(interventions) && interventions.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              No pending recommendations — your finances look stable.
            </CardContent>
          </Card>
        )}

        {!intLoading && Array.isArray(interventions) && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {interventions.slice(0, 3).map((int) => (
              <InterventionCard
                key={int.id}
                intervention={int}
                compact
                onStatusChange={refetchInt}
              />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
