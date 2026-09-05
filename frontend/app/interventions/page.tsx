"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { useBanking } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  TrendingUp, AlertTriangle, Zap, Layers, RefreshCw,
  Award, HelpCircle, Check,
} from "lucide-react";
import Link from "next/link";

interface PlanOption {
  id: string;
  name: string;
  category: "Low Risk" | "Moderate" | "Short Term" | "Credit Line";
  badgeVariant: "success" | "warning" | "default" | "critical";
  monthlySaving: number;
  scoreGain: number;
  headline: string;
  description: string;
  steps: string[];
}

const INTERVENTION_PLANS: PlanOption[] = [
  {
    id: "plan-spend",
    name: "Discretionary Spending Calibration",
    category: "Low Risk",
    badgeVariant: "success",
    monthlySaving: 3200,
    scoreGain: 4.5,
    headline: "Trim non-essential dining and shopping subscriptions for 30 days",
    description: "Pause recurring OTT subscriptions and cap weekend dining out to preserve ₹3,200 in liquid reserves before your next salary cycle.",
    steps: [
      "Cap non-essential food delivery spend at ₹1,500 for this cycle.",
      "Pause 2 unused recurring digital entertainment subscriptions.",
      "Saves ₹3,200 directly into Primary Salary Account buffer.",
    ],
  },
  {
    id: "plan-rebalance",
    name: "Repayment Tenure Restructuring",
    category: "Moderate",
    badgeVariant: "warning",
    monthlySaving: 2400,
    scoreGain: 6.0,
    headline: "Extend loan tenure by 12 months to reduce monthly EMI burden",
    description: "Restructure existing personal loan from 24 to 36 months to immediately lower your mandatory monthly installment from ₹7,800 to ₹5,400.",
    steps: [
      "Lowers monthly mandatory debt commitment by ₹2,400.",
      "Increases monthly free cash surplus immediately.",
      "Improves Debt-to-Income (DTI) ratio from 25.9% to 17.8%.",
    ],
  },
  {
    id: "plan-bridge",
    name: "Pre-Salary Liquidity Bridge",
    category: "Short Term",
    badgeVariant: "default",
    monthlySaving: 0,
    scoreGain: 3.0,
    headline: "Zero-penalty micro-overdraft to bridge the 5-day pre-salary dip",
    description: "Draw a ₹15,000 micro-liquidity buffer to comfortably clear rent and utility auto-debits, auto-repaid when your salary arrives on the 1st.",
    steps: [
      "Protects against auto-debit bounce fees and credit score penalties.",
      "Transparent flat ₹100 fee with 0.05% daily rate.",
      "Auto-settles upon next salary direct deposit.",
    ],
  },
];

export default function InterventionsPage() {
  const { resilienceScore, activeInterventionPlan, applyInterventionPlan } = useBanking();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-spend");
  const [appliedId, setAppliedId] = useState<string | null>(activeInterventionPlan ? "plan-spend" : null);

  const activePlan = INTERVENTION_PLANS.find((p) => p.id === selectedPlanId) || INTERVENTION_PLANS[0];

  const handleApply = (plan: PlanOption) => {
    sounds.success();
    applyInterventionPlan(plan.name, plan.monthlySaving, plan.scoreGain);
    setAppliedId(plan.id);
  };

  return (
    <Shell
      title="Intervention Decision Engine"
      description="Proactive recommendation architecture for resolving cash flow gaps without high-cost debt"
      actions={
        <Link href="/simulator">
          <Button size="sm" onClick={() => sounds.click()} className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simulate What-If First</span>
          </Button>
        </Link>
      }
    >
      {/* 1. Contextual Recommendation Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-obsidian-900 to-cyan-950/20 border border-amber-500/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-[10px] uppercase font-bold">
              Proactive Recommendation Engine
            </Badge>
            <span className="text-xs text-slate-400 font-mono">· 3 Evaluated Pathways</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            "Your projected balance becomes tight (₹4,280) before next salary on Oct 01."
          </h2>
          <p className="text-xs text-slate-300">
            FinShield identified 3 non-predatory interventions to restore your resilience buffer without high-interest borrowing.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/5 text-right">
            <span className="text-[9px] text-muted-foreground uppercase font-bold">Resilience</span>
            <p className="text-xl font-black text-cyan-400 font-mono">{resilienceScore.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* 2. 2-COLUMN DECISION SYSTEM: RANKED PATHWAYS + PLAN INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Ranked Intervention Options (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">
            Ranked Recommended Options
          </p>

          <div className="space-y-3">
            {INTERVENTION_PLANS.map((plan, idx) => {
              const isSelected = selectedPlanId === plan.id;
              const isCurrentApplied = appliedId === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    sounds.tick();
                    setSelectedPlanId(plan.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-500/60 shadow-glow-cyan/20"
                      : "bg-obsidian-900/80 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      OPTION #{idx + 1}
                    </span>
                    <Badge variant={plan.badgeVariant} className="text-[9px] uppercase">
                      {plan.category}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">{plan.name}</h3>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {plan.headline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="text-emerald-400 font-semibold font-mono">
                      +{plan.scoreGain} Pts Resilience
                    </span>
                    {isCurrentApplied ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Active Plan
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Inspect →</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Option Deep-Dive & Execution (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={activePlan.badgeVariant} className="text-[10px] uppercase font-bold">
                  {activePlan.category}
                </Badge>
                <h3 className="text-lg font-bold text-white">{activePlan.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activePlan.headline}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Score Gain</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">+{activePlan.scoreGain} Pts</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-200 leading-relaxed">
              {activePlan.description}
            </p>

            {/* Implementation Steps */}
            <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Execution Blueprint
              </span>
              <div className="space-y-2">
                {activePlan.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
              {activePlan.id === "plan-bridge" ? (
                <Link href="/overdraft" className="w-full sm:w-auto">
                  <Button onClick={() => sounds.click()} className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs">
                    <Zap className="h-4 w-4 mr-1.5" />
                    Configure Liquidity Bridge →
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => handleApply(activePlan)}
                  disabled={appliedId === activePlan.id}
                  className={`w-full sm:w-auto font-bold text-xs ${
                    appliedId === activePlan.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-cyan-500 hover:bg-cyan-400 text-obsidian-950"
                  }`}
                >
                  {appliedId === activePlan.id ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-400" />
                      Intervention Applied & Active
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Apply This Intervention Plan
                    </>
                  )}
                </Button>
              )}

              <Link href="/simulator">
                <Button variant="outline" size="sm" onClick={() => sounds.click()} className="border-white/10 text-xs">
                  Simulate Consequence First
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
