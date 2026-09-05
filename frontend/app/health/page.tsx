"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { useBanking } from "@/lib/banking-store";
import { SceneCanvas } from "@/components/3d/SceneCanvas";
import { RiskEnergyField } from "@/components/3d/RiskEnergyField";
import { WebGLFallback } from "@/components/layout/WebGLFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  HeartPulse, Sparkles, Activity, ShieldCheck, TrendingUp,
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, X,
  HelpCircle, Sliders,
} from "lucide-react";
import Link from "next/link";

interface FactorDetail {
  id: string;
  name: string;
  score: number;
  weight: string;
  status: "Optimal" | "Moderate" | "Vulnerable" | "Critical";
  why: string;
  affectedBy: string;
  action: string;
  actionLink: string;
}

const FACTOR_DETAILS: Record<string, FactorDetail> = {
  income_stability_score: {
    id: "income_stability_score",
    name: "Income Stability",
    score: 92,
    weight: "20%",
    status: "Optimal",
    why: "Evaluates the consistency, employer credibility, and variance of your monthly income deposits.",
    affectedBy: "Verified direct salary deposit from Tech Corp India Pvt Ltd credited regularly on the 1st of every month.",
    action: "Maintain direct salary credit to keep this factor in the optimal 90+ zone.",
    actionLink: "/accounts",
  },
  liquidity_score: {
    id: "liquidity_score",
    name: "Liquidity Reserves",
    score: 54,
    weight: "25%",
    status: "Moderate",
    why: "Measures whether your liquid buffer can absorb unexpected outflows before your next pay cycle.",
    affectedBy: "Upcoming rent (₹18,000) and personal loan EMI (₹7,800) due in 7 days reduces projected balance to ₹4,280.",
    action: "Consider a temporary liquidity bridge or spending calibration to protect your buffer.",
    actionLink: "/overdraft",
  },
  debt_burden_score: {
    id: "debt_burden_score",
    name: "Debt Burden (DTI / EMI)",
    score: 48,
    weight: "25%",
    status: "Vulnerable",
    why: "Measures what percentage of your regular income is pre-committed to monthly loan installments.",
    affectedBy: "Personal loan EMI of ₹7,800/mo accounts for 25.9% of your net monthly earnings.",
    action: "Explore repayment restructuring to lower monthly installment burden.",
    actionLink: "/interventions",
  },
  payment_behavior_score: {
    id: "payment_behavior_score",
    name: "Payment Behavior",
    score: 78,
    weight: "15%",
    status: "Optimal",
    why: "Tracks on-time payment track record across utilities, credit lines, and recurring auto-debits.",
    affectedBy: "Zero missed payments or auto-debit bounces over the past 180 days.",
    action: "Keep auto-debit active for upcoming Bescom and rent payments.",
    actionLink: "/payments",
  },
  credit_utilization_score: {
    id: "credit_utilization_score",
    name: "Credit Utilization",
    score: 65,
    weight: "15%",
    status: "Moderate",
    why: "Measures active card spend against total available limits across all revolving lines.",
    affectedBy: "Current revolving credit usage stands at 35.2% of total credit ceiling.",
    action: "Adjust daily transaction limits on your debit card to prevent unplanned spikes.",
    actionLink: "/cards",
  },
};

export default function HealthPage() {
  const { resilienceScore, riskCategory } = useBanking();
  const { data: riskData } = useQuery({ queryKey: ["risk"], queryFn: () => api.getRiskScore() });
  const { data: historyData } = useQuery({ queryKey: ["risk-history"], queryFn: () => api.getRiskHistory(180) });
  const { data: healthData } = useQuery({ queryKey: ["health"], queryFn: () => api.getFinancialHealth() });

  const [selectedFactor, setSelectedFactor] = useState<FactorDetail>(FACTOR_DETAILS.liquidity_score);

  const historyChartData = historyData
    ? [...historyData].map((h) => ({
        date: formatDate(h.assessment_date),
        score: h.risk_score,
        category: h.risk_category,
      }))
    : [];

  const factors = riskData?.factors || {
    income_stability_score: 92,
    liquidity_score: 54,
    debt_burden_score: 48,
    payment_behavior_score: 78,
    credit_utilization_score: 65,
  };

  return (
    <Shell
      title="Resilience Diagnostics"
      description="Interactive multi-factor health explorer, gyroscopic 3D field, and 6-month stability telemetry"
      actions={
        <Link href="/forecast">
          <Button size="sm" onClick={() => sounds.click()} className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            View Cash Flow Horizon
          </Button>
        </Link>
      }
    >
      {/* 1. TOP SPATIAL WORKSPACE: 3D FIELD + FACTOR SELECTORS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Center-Left 3D Gyroscopic Resilience Field (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-cyan-950/30 border border-cyan-500/30 p-6 flex flex-col justify-between min-h-[400px] relative overflow-hidden glass-panel-glow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Spatial Gyroscopic Diagnostics
              </span>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                Resilience Energy Field
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {resilienceScore.toFixed(1)}
              </span>
              <Badge
                variant={riskCategory === "healthy" ? "success" : riskCategory === "critical" ? "critical" : "warning"}
                className="uppercase text-[10px]"
              >
                {riskCategory}
              </Badge>
            </div>
          </div>

          {/* Canvas */}
          <div className="w-full h-[270px]">
            <SceneCanvas
              camera={{ position: [0, 0, 4.8], fov: 45 }}
              fallback2D={<WebGLFallback score={resilienceScore} category={riskCategory} />}
            >
              <RiskEnergyField factors={factors} score={resilienceScore} category={riskCategory} />
            </SceneCanvas>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
            <span>Outer: Income Stability (20%)</span>
            <span>Middle: Liquidity & Debt (50%)</span>
            <span>Inner: Credit & Payments (30%)</span>
          </div>
        </div>

        {/* Right 5 Cols: Factor Selection Matrix */}
        <div className="lg:col-span-5 rounded-3xl bg-obsidian-900/90 border border-white/10 p-5 flex flex-col justify-between space-y-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pb-2">
              Select Factor To Inspect
            </p>
            <div className="space-y-2">
              {Object.entries(FACTOR_DETAILS).map(([key, item]) => {
                const isSelected = selectedFactor.id === item.id;
                const score = (factors as any)[key] || item.score;
                const color = score >= 70 ? "#10B981" : score >= 50 ? "#06B6D4" : score >= 30 ? "#F59E0B" : "#EF4444";

                return (
                  <div
                    key={key}
                    onClick={() => {
                      sounds.tick();
                      setSelectedFactor({ ...item, score });
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-500/50 shadow-glow-cyan/20"
                        : "bg-obsidian-950/80 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">({item.weight})</span>
                      </div>
                      <div className="w-28 h-1.5 bg-obsidian-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono" style={{ color }}>
                        {score}/100
                      </span>
                      <span className="text-[9px] text-slate-500 block uppercase">{item.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tap any factor above for diagnosis</span>
            <span className="text-cyan-400 font-bold">5 Factors Active</span>
          </div>
        </div>
      </div>

      {/* 2. SELECTED FACTOR DEEP-DIVE WORKSPACE */}
      <div className="rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-cyan-950/20 border border-cyan-500/40 p-6 sm:p-7 space-y-4 glass-panel-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{selectedFactor.name}</h3>
                <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-300">
                  Weight: {selectedFactor.weight}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Current Contribution Score: <strong className="text-cyan-400">{selectedFactor.score} / 100</strong> ({selectedFactor.status})
              </p>
            </div>
          </div>

          <Link href={selectedFactor.actionLink}>
            <Button size="sm" onClick={() => sounds.click()} className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs">
              <span>Take Action</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Why It Matters</span>
            <p className="text-slate-300 leading-relaxed">{selectedFactor.why}</p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">What Affected It</span>
            <p className="text-slate-300 leading-relaxed">{selectedFactor.affectedBy}</p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Recommended Action</span>
            <p className="text-slate-300 leading-relaxed">{selectedFactor.action}</p>
          </div>
        </div>
      </div>

      {/* 3. 6-MONTH HISTORICAL STABILITY CHART */}
      <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
              6-Month Resilience History
            </h3>
            <p className="text-xs text-slate-400">
              180-day historical score telemetry and recovery trajectory
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "16px",
                  fontSize: "11px",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#06B6D4"
                strokeWidth={2.5}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
}
