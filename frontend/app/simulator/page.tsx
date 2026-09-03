"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { SimulatorResult, AmortizationRow } from "@/types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from "lucide-react";

const DEBOUNCE_MS = 600;

function ImpactRow({ label, before, after, format = "currency", inverse = false }: {
  label: string; before: number; after: number;
  format?: "currency" | "percent" | "score"; inverse?: boolean;
}) {
  const delta  = after - before;
  const better = inverse ? delta < 0 : delta > 0;
  const worse  = inverse ? delta > 0 : delta < 0;
  const Icon   = delta === 0 ? Minus : better ? TrendingUp : TrendingDown;
  const color  = delta === 0 ? "text-gray-500" : better ? "text-green-600" : "text-red-600";

  const fmt = (v: number) =>
    format === "currency" ? formatCurrency(v) :
    format === "percent"  ? `${(v * 100).toFixed(1)}%` :
    `${v.toFixed(1)}`;

  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{fmt(before)}</span>
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-sm font-semibold ${color}`}>{fmt(after)}</span>
        {delta !== 0 && (
          <span className={`text-xs ${color}`}>
            ({delta > 0 ? "+" : ""}{fmt(delta)})
          </span>
        )}
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const [amount,  setAmount]  = useState(200000);
  const [rate,    setRate]    = useState(12.0);
  const [tenure,  setTenure]  = useState(24);
  const [fee,     setFee]     = useState(0);
  const [result,  setResult]  = useState<SimulatorResult | null>(null);
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback(async () => {
    if (amount <= 0 || rate < 0 || tenure <= 0) return;
    setLoading(true);
    try {
      const [sim, emi] = await Promise.all([
        api.simulateLoan(amount, rate, tenure, fee),
        api.calculateEMI(amount, rate, tenure),
      ]);
      setResult(sim);
      setSchedule(emi.amortization_schedule);
    } catch { /* ignore during typing */ }
    finally { setLoading(false); }
  }, [amount, rate, tenure, fee]);

  // Debounced auto-simulate
  useEffect(() => {
    const t = setTimeout(simulate, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [simulate]);

  // Amortization area data (subsample)
  const areaData = schedule
    .filter((_, i) => i % Math.max(1, Math.floor(schedule.length / 24)) === 0)
    .map((r) => ({ month: r.month, Principal: r.principal, Interest: r.interest, Balance: r.balance }));

  const affordabilityConfig = {
    comfortable:  { color: "text-green-700", bg: "bg-green-50", icon: CheckCircle  },
    acceptable:   { color: "text-blue-700",  bg: "bg-blue-50",  icon: CheckCircle  },
    risky:        { color: "text-amber-700", bg: "bg-amber-50", icon: AlertTriangle },
    unaffordable: { color: "text-red-700",   bg: "bg-red-50",   icon: AlertTriangle },
  };
  const affCfg = result
    ? affordabilityConfig[result.impact.affordability as keyof typeof affordabilityConfig]
    : null;

  return (
    <Shell title="What-If Simulator" description="Model any loan scenario and see the impact before you decide">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Controls ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Loan Parameters</CardTitle>
              <CardDescription>Adjust sliders to see live impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Loan Amount", value: amount, min: 10000,  max: 2000000, step: 10000, set: setAmount, fmt: (v: number) => formatCurrency(v) },
                { label: "Interest Rate (%)", value: rate,  min: 8,      max: 30,     step: 0.25, set: setRate,   fmt: (v: number) => `${v}% p.a.` },
                { label: "Tenure (months)",  value: tenure, min: 6,      max: 120,    step: 6,    set: setTenure, fmt: (v: number) => `${v} months (${(v/12).toFixed(1)}yr)` },
                { label: "Processing Fee",   value: fee,    min: 0,      max: 50000,  step: 500,  set: setFee,    fmt: (v: number) => formatCurrency(v) },
              ].map(({ label, value, min, max, step, set, fmt }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-blue-600 font-semibold">{fmt(value)}</span>
                  </div>
                  <input
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={(e) => set(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>{fmt(min)}</span><span>{fmt(max)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick result */}
          {result && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly EMI</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(result.calculations.emi)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-medium text-red-600">{formatCurrency(result.calculations.total_interest)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-medium">{formatCurrency(result.calculations.total_cost)}</span>
                </div>
                {affCfg && (
                  <div className={`flex items-start gap-2 rounded-lg p-2.5 mt-2 ${affCfg.bg}`}>
                    <affCfg.icon className={`h-4 w-4 mt-0.5 shrink-0 ${affCfg.color}`} />
                    <p className={`text-xs leading-relaxed ${affCfg.color}`}>{result.impact.recommendation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Results ── */}
        <div className="lg:col-span-3 space-y-4">
          {loading && !result && (
            <div className="h-64 rounded-xl bg-gray-50 animate-pulse" />
          )}

          {result && (
            <>
              {/* Before / After comparison */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Before vs After</CardTitle>
                  <CardDescription>Impact of adding this loan to your finances</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImpactRow label="Monthly EMI"        before={result.current_state.total_emi}           after={result.projected_state.total_emi}           format="currency" inverse />
                  <ImpactRow label="EMI / Income"       before={result.current_state.emi_to_income_ratio} after={result.projected_state.emi_to_income_ratio} format="percent"  inverse />
                  <ImpactRow label="Monthly Surplus"    before={result.current_state.monthly_surplus}     after={result.projected_state.monthly_surplus}     format="currency" />
                  <ImpactRow label="Resilience Score"   before={result.current_state.risk_score}          after={result.projected_state.risk_score}          format="score" />
                </CardContent>
              </Card>

              {/* Amortization area chart */}
              {areaData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Principal vs Interest Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={areaData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="principal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="interest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#F87171" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#F87171" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} label={{ value: "Month", position: "insideBottomRight", fontSize: 10, offset: -4 }} />
                        <YAxis tickFormatter={(v) => formatCurrency(v, true)} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={52} />
                        <Tooltip
                          formatter={(v: number, name: string) => [formatCurrency(v), name]}
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="Principal" stroke="#3B82F6" fill="url(#principal)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Interest"  stroke="#F87171" fill="url(#interest)"  strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Resilience score impact pill */}
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Resilience Score Impact</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{result.current_state.risk_score.toFixed(1)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className={`text-lg font-bold ${result.projected_state.risk_score < result.current_state.risk_score ? "text-red-600" : "text-green-600"}`}>
                        {result.projected_state.risk_score.toFixed(1)}
                      </span>
                      <Badge
                        variant={result.impact.risk_score_change >= 0 ? "success" : "critical"}
                        className="ml-1"
                      >
                        {result.impact.risk_score_change >= 0 ? "+" : ""}{result.impact.risk_score_change.toFixed(1)} pts
                      </Badge>
                    </div>
                  </div>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${result.projected_state.risk_score}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
