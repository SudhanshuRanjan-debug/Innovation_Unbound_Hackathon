"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useBanking } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Sparkles, ShieldCheck, AlertTriangle, ArrowRight,
  TrendingDown, Zap, ChevronRight, MessageSquare,
  Shield, CheckCircle2, ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { AIExplanationModal } from "@/components/experience/AIExplanationModal";

interface Props {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function CopilotPanel({ isCollapsed, onToggleCollapse }: Props) {
  const { resilienceScore, riskCategory, accounts, monthlyOverview, activeInterventionPlan } = useBanking();
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const primaryAcc = accounts[0];

  if (isCollapsed) {
    return (
      <aside className="hidden 2xl:flex flex-col items-center justify-between py-6 px-2 bg-obsidian-950/80 border-l border-white/10 w-14 sticky top-0 h-screen shrink-0 backdrop-blur-xl z-20">
        <button
          onClick={() => {
            sounds.click();
            onToggleCollapse();
          }}
          className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all"
          title="Expand FinShield Copilot"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-glow-cyan/30">
            {Math.round(resilienceScore)}
          </div>
          <span className="[writing-mode:vertical-lr] text-[10px] font-bold text-slate-400 tracking-wider uppercase rotate-180">
            Copilot Active
          </span>
        </div>

        <button
          onClick={() => {
            sounds.click();
            setAiModalOpen(true);
          }}
          className="p-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
          title="Neural AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <>
      <aside className="hidden 2xl:flex flex-col justify-between p-5 bg-obsidian-950/90 border-l border-white/10 w-80 sticky top-0 h-screen shrink-0 backdrop-blur-2xl z-20 overflow-y-auto space-y-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-obsidian-950 shadow-glow-cyan/40">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white tracking-wide uppercase">
                  FinShield Copilot
                </h3>
                <span className="text-[10px] text-cyan-400 font-medium">Neural Financial Intelligence</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.click();
                onToggleCollapse();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              title="Collapse Panel"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Resilience Status Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-obsidian-900 to-cyan-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Resilience Score</span>
              <Badge
                variant={riskCategory === "healthy" ? "success" : riskCategory === "critical" ? "critical" : "warning"}
                className="text-[10px] uppercase"
              >
                {riskCategory}
              </Badge>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-cyan-400 font-mono">
                {resilienceScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>

            <div className="h-1.5 bg-obsidian-950 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${resilienceScore}%` }}
              />
            </div>
          </div>

          {/* Proactive Copilot Insight */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-[10px] tracking-wider">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Copilot Cash Flow Insight</span>
            </div>

            <p className="text-slate-200 leading-relaxed text-[11px]">
              "You have enough money today (<strong className="text-white">{formatCurrency(primaryAcc?.availableBalance || 48500)}</strong>), but your balance may become tight before your next salary."
            </p>

            <div className="p-2.5 rounded-xl bg-obsidian-950/90 border border-white/5 flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Projected Low:</span>
              <span className="font-bold text-amber-400 font-mono text-xs">₹4,280 in 5 days</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <Link
                href="/forecast"
                onClick={() => sounds.click()}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-500 text-obsidian-950 font-bold text-[11px] shadow-glow-amber/20 hover:brightness-105"
              >
                <span>Understand Why</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/interventions"
                onClick={() => sounds.click()}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-[11px] border border-white/10"
              >
                <span>Explore Safe Options</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Active Intervention Plan Status */}
          {activeInterventionPlan ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>ACTIVE CALIBRATION</span>
              </div>
              <p className="text-[11px] text-white font-medium">{activeInterventionPlan}</p>
              <p className="text-[10px] text-slate-300">Targeting +₹5,000 monthly reserve cushion.</p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-obsidian-900 border border-white/5 space-y-2 text-xs">
              <p className="font-bold text-white text-[11px]">Suggested Actions</p>
              <div className="space-y-1 text-[11px]">
                <Link
                  href="/overdraft"
                  onClick={() => sounds.click()}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-cyan-300"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-cyan-400" />
                    Pre-Salary Liquidity Bridge
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/simulator"
                  onClick={() => sounds.click()}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-teal-400" />
                    Simulate Next Decision
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Neural AI Advisory Trigger */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => {
              sounds.click();
              setAiModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 font-bold text-xs shadow-glow-cyan/20 transition-all"
          >
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Ask FinShield Copilot</span>
          </button>
        </div>
      </aside>

      <AIExplanationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="financial_health"
        contextData={{ risk_score: resilienceScore, risk_category: riskCategory }}
      />
    </>
  );
}
