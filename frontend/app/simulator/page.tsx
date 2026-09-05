"use client";
import React, { useState, useMemo } from "react";
import { Shell } from "@/components/layout/shell";
import { useBanking } from "@/lib/banking-store";
import { SceneCanvas } from "@/components/3d/SceneCanvas";
import { SimulatorVisualizer3D } from "@/components/3d/SimulatorVisualizer3D";
import { WebGLFallback } from "@/components/layout/WebGLFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { formatCurrency } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Calculator, Sparkles, ArrowRight, TrendingDown,
  ShieldAlert, ShieldCheck, Award, Layers, Zap,
  RotateCcw, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function SimulatorPage() {
  const { resilienceScore, monthlyOverview, loans } = useBanking();

  // Slider inputs
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(12.5);
  const [tenureMonths, setTenureMonths] = useState(36);

  // Real-time financial calculations
  const sim = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenureMonths;
    const monthlyEMI = Math.round(
      (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    );
    const totalRepayment = monthlyEMI * n;
    const totalInterest = totalRepayment - loanAmount;

    const currentIncome = monthlyOverview.income; // 85,000
    const currentSpent = monthlyOverview.spent; // 42,800
    const currentEMI = loans.reduce((acc, l) => acc + l.emiAmount, 0); // 7,800
    const currentSurplus = currentIncome - currentSpent - currentEMI; // 34,400

    const newTotalEMI = currentEMI + monthlyEMI;
    const newSurplus = Math.max(0, currentIncome - currentSpent - newTotalEMI);

    // Dynamic Resilience impact
    const emiRatio = newTotalEMI / currentIncome;
    const scoreDeduction = Math.round((emiRatio - 0.1) * 45);
    const simulatedResilience = Math.max(
      15,
      Number((resilienceScore - Math.max(0, scoreDeduction)).toFixed(1))
    );

    const isDistressed = simulatedResilience < 50 || newSurplus < 8000;

    return {
      monthlyEMI,
      totalRepayment,
      totalInterest,
      currentEMI,
      newTotalEMI,
      currentSurplus,
      newSurplus,
      simulatedResilience,
      scoreDelta: (resilienceScore - simulatedResilience).toFixed(1),
      isDistressed,
    };
  }, [loanAmount, interestRate, tenureMonths, resilienceScore, monthlyOverview, loans]);

  const handleReset = () => {
    sounds.click();
    setLoanAmount(300000);
    setInterestRate(12.5);
    setTenureMonths(36);
  };

  return (
    <Shell
      title="What-If Decision Simulator"
      description="Interactive 3D borrowing consequence engine, stress chamber, and cash-surplus telemetry"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-white/10 text-slate-300 text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Sliders</span>
          </Button>
          <Link href="/loans">
            <Button size="sm" onClick={() => sounds.click()} className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs gap-1.5">
              <Award className="h-3.5 w-3.5" />
              <span>Compare Market Loans</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* 3-COLUMN WORKSTATION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Column 1: Interactive Control Sliders (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Calculator className="h-4 w-4 text-cyan-400" />
                Borrowing Parameters
              </h3>
              <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300">
                Live Input
              </Badge>
            </div>

            {/* Slider 1: Loan Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Principal Amount</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={1500000}
                step={10000}
                value={loanAmount}
                onChange={(e) => {
                  setLoanAmount(parseInt(e.target.value, 10));
                  sounds.tick();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>₹20,000</span>
                <span>₹15,00,000</span>
              </div>
            </div>

            {/* Slider 2: Interest Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Interest Rate (p.a.)</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {interestRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={8.5}
                max={24.0}
                step={0.25}
                value={interestRate}
                onChange={(e) => {
                  setInterestRate(parseFloat(e.target.value));
                  sounds.tick();
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>8.5%</span>
                <span>24.0%</span>
              </div>
            </div>

            {/* Slider 3: Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Tenure (Months)</span>
                <span className="text-base font-bold font-mono text-teal-400">
                  {tenureMonths} Months ({Math.round(tenureMonths / 12)} Yrs)
                </span>
              </div>
              <input
                type="range"
                min={6}
                max={60}
                step={6}
                value={tenureMonths}
                onChange={(e) => {
                  setTenureMonths(parseInt(e.target.value, 10));
                  sounds.tick();
                }}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>6 Months</span>
                <span>60 Months</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1 text-xs">
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Total Interest Payable</span>
            <p className="text-lg font-bold text-slate-200 font-mono">{formatCurrency(sim.totalInterest)}</p>
          </div>
        </div>

        {/* Column 2: 3D Pressure Chamber Spatial Visualizer (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-cyan-950/30 border border-cyan-500/30 p-5 flex flex-col justify-between relative overflow-hidden glass-panel-glow min-h-[380px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              3D Cash-Pressure Chamber
            </span>
            <Badge variant={sim.isDistressed ? "critical" : "success"} className="text-[9px] uppercase">
              {sim.isDistressed ? "High Strain" : "Manageable"}
            </Badge>
          </div>

          <div className="w-full h-[270px]">
            <SceneCanvas
              camera={{ position: [0, 0, 4.5], fov: 45 }}
              fallback2D={<WebGLFallback score={sim.simulatedResilience} category={sim.isDistressed ? "critical" : "watch"} />}
            >
              <SimulatorVisualizer3D
                monthlySurplus={sim.newSurplus}
                totalEmi={sim.newTotalEMI}
                projectedScore={sim.simulatedResilience}
                scoreDelta={parseFloat(sim.scoreDelta)}
              />
            </SceneCanvas>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
            <span>Left: Surplus Cushion</span>
            <span>Right: Debt Pressure</span>
          </div>
        </div>

        {/* Column 3: Telemetry Impact & Consequence Analysis (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Projected Consequence
              </h3>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                -{sim.scoreDelta} Pts
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Simulated New EMI</span>
                  <p className="text-base font-bold text-amber-400 font-mono mt-0.5">
                    +{formatCurrency(sim.monthlyEMI)} / mo
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Total: {formatCurrency(sim.newTotalEMI)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Free Monthly Surplus</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {formatCurrency(sim.newSurplus)}
                  </p>
                </div>
                <span className="text-[10px] text-rose-400 font-mono">Was {formatCurrency(sim.currentSurplus)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Projected Resilience</span>
                  <p className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                    {sim.simulatedResilience} / 100
                  </p>
                </div>
                <Badge variant={sim.isDistressed ? "critical" : "warning"} className="text-[9px]">
                  {sim.isDistressed ? "CRITICAL" : "WATCH"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <Link href="/loans" className="w-full block">
              <Button size="sm" onClick={() => sounds.click()} className="w-full bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs">
                Explore Lower-Cost Alternatives →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* BEFORE VS AFTER DETAILED ASSESSMENT PANEL */}
      <div className="rounded-3xl bg-gradient-to-r from-obsidian-900 via-obsidian-950 to-cyan-950/20 border border-white/10 p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
            FinShield Decision Assessment
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <p className="font-bold text-white">
              {sim.isDistressed
                ? "⚠ Warning: This borrowing scenario significantly compresses your monthly safety buffer."
                : "✓ Manageable: This installment structure leaves acceptable liquid surplus."}
            </p>
            <p className="text-slate-300 leading-relaxed text-xs">
              Borrowing <strong className="text-white">{formatCurrency(loanAmount)}</strong> at <strong className="text-amber-300">{interestRate}%</strong> over {tenureMonths} months reduces your resilience score by <strong className="text-cyan-400">{sim.scoreDelta} points</strong> and leaves a free surplus of <strong className="text-emerald-400">{formatCurrency(sim.newSurplus)}/month</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/loans">
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white text-xs">
                Compare Fixed EMI Lenders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
