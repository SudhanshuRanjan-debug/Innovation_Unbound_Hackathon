"use client";
import React, { useState, useMemo } from "react";
import { Shell } from "@/components/layout/shell";
import { useBanking } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Award, Sparkles, ArrowRight, ShieldCheck, Check,
  AlertTriangle, Filter, Calculator, HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface LenderProduct {
  id: string;
  lenderName: string;
  interestRate: number;
  emiAmount: number;
  tenureMonths: number;
  processingFee: number;
  resilienceImpact: "Minimal" | "Moderate" | "Significant";
  badgeVariant: "success" | "warning" | "critical";
  isBestFit: boolean;
  bestFitReason?: string;
}

export default function LoansPage() {
  const { resilienceScore } = useBanking();
  const [amount, setAmount] = useState(300000);
  const [tenure, setTenure] = useState(36);
  const [purpose, setPurpose] = useState<"debt-consolidation" | "emergency" | "home-renovation">("debt-consolidation");

  const lenders: LenderProduct[] = useMemo(() => {
    return [
      {
        id: "lender-1",
        lenderName: "HDFC Bank Personal Loan",
        interestRate: 10.25,
        emiAmount: 9715,
        tenureMonths: tenure,
        processingFee: 1500,
        resilienceImpact: "Minimal",
        badgeVariant: "success",
        isBestFit: true,
        bestFitReason: "Lowest annualized interest rate and minimal resilience score impact (-3.5 pts). Leaves ₹24,685 in liquid monthly surplus.",
      },
      {
        id: "lender-2",
        lenderName: "ICICI Bank Flexi Credit",
        interestRate: 11.5,
        emiAmount: 9890,
        tenureMonths: tenure,
        processingFee: 999,
        resilienceImpact: "Moderate",
        badgeVariant: "warning",
        isBestFit: false,
      },
      {
        id: "lender-3",
        lenderName: "Bajaj Finserv Instant Loan",
        interestRate: 13.75,
        emiAmount: 10218,
        tenureMonths: tenure,
        processingFee: 2999,
        resilienceImpact: "Significant",
        badgeVariant: "critical",
        isBestFit: false,
      },
      {
        id: "lender-4",
        lenderName: "Axis Bank Express Credit",
        interestRate: 11.9,
        emiAmount: 9945,
        tenureMonths: tenure,
        processingFee: 1200,
        resilienceImpact: "Moderate",
        badgeVariant: "warning",
        isBestFit: false,
      },
    ];
  }, [amount, tenure, purpose]);

  const bestFit = lenders.find((l) => l.isBestFit) || lenders[0];

  return (
    <Shell
      title="Responsible Loan Marketplace"
      description="Multi-factor loan comparison weighted by financial health resilience and debt-to-income limits"
      actions={
        <Link href="/simulator">
          <Button size="sm" onClick={() => sounds.click()} className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            <span>Simulate in 3D First</span>
          </Button>
        </Link>
      }
    >
      {/* 1. FILTER & PURPOSE BAR */}
      <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Loan Principal Required</label>
            <div className="p-2.5 rounded-2xl bg-obsidian-950 border border-white/10 flex items-center justify-between">
              <span className="font-mono font-bold text-white text-sm">{formatCurrency(amount)}</span>
              <span className="text-[10px] text-cyan-400 font-mono">₹20k - ₹15L</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Tenure (Months)</label>
            <div className="flex items-center gap-1.5 p-1 bg-obsidian-950 rounded-2xl border border-white/10 text-xs font-semibold">
              {[12, 24, 36, 48].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    sounds.tick();
                    setTenure(t);
                  }}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    tenure === t
                      ? "bg-cyan-500 text-obsidian-950 font-bold shadow-glow-cyan/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}M
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Primary Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as any)}
              className="w-full p-2.5 bg-obsidian-950 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="debt-consolidation">Debt Consolidation / Restructure</option>
              <option value="emergency">Medical / Emergency Gap</option>
              <option value="home-renovation">Home Improvement</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. BEST FIT HIGHLIGHT SURFACE */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-obsidian-900 to-cyan-950/30 border border-emerald-500/40 p-6 sm:p-7 space-y-3 glass-panel-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              FINSHIELD BEST FIT RECOMMENDATION
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">{bestFit.interestRate}% p.a.</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">{bestFit.lenderName}</h3>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              {bestFit.bestFitReason}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Estimated Monthly EMI</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(bestFit.emiAmount)} / mo
            </p>
          </div>
        </div>
      </div>

      {/* 3. FULL COMPARISON MATRIX TABLE */}
      <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
        <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
          Marketplace Comparison Table
        </h3>

        <div className="space-y-2.5">
          {lenders.map((lender) => (
            <div
              key={lender.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                lender.isBestFit
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-obsidian-950 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm">{lender.lenderName}</p>
                  {lender.isBestFit && (
                    <Badge variant="success" className="text-[8px] py-0">
                      Best Fit
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing Fee: <strong className="text-slate-300">₹{lender.processingFee}</strong> · Tenure: <strong className="text-slate-300">{lender.tenureMonths} Months</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Interest</span>
                  <p className="font-bold text-white font-mono text-sm">{lender.interestRate}%</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Monthly EMI</span>
                  <p className="font-bold text-amber-400 font-mono text-sm">{formatCurrency(lender.emiAmount)}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Resilience Impact</span>
                  <Badge variant={lender.badgeVariant} className="text-[9px] block mt-0.5">
                    {lender.resilienceImpact}
                  </Badge>
                </div>

                <Link href="/simulator">
                  <Button size="sm" onClick={() => sounds.click()} className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 px-3">
                    Simulate →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
