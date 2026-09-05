"use client";
import React, { useState, useMemo } from "react";
import { Shell } from "@/components/layout/shell";
import { useBanking } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Zap, ShieldCheck, ArrowRight, CheckCircle2, Clock,
  Sparkles, RotateCcw, AlertCircle, ArrowDownLeft,
  Calendar, Check,
} from "lucide-react";
import Link from "next/link";

export default function OverdraftPage() {
  const { requestLiquidityBridge, monthlyOverview, accounts } = useBanking();
  const [amount, setAmount] = useState(15000);
  const [days, setDays] = useState(5);
  const [applied, setApplied] = useState(false);

  const primaryAcc = accounts[0];

  const bridgeCalc = useMemo(() => {
    const flatFee = 100;
    const dailyInterest = amount * 0.0005 * days; // 0.05% per day
    const totalRepay = Math.round(amount + flatFee + dailyInterest);

    const salaryIncome = monthlyOverview.income; // 85,000
    const remainingAfterRepay = salaryIncome - totalRepay;

    return {
      flatFee,
      dailyInterest: Math.round(dailyInterest),
      totalRepay,
      salaryIncome,
      remainingAfterRepay,
    };
  }, [amount, days, monthlyOverview]);

  const handleRequestBridge = () => {
    sounds.success();
    requestLiquidityBridge(amount, days);
    setApplied(true);
  };

  return (
    <Shell
      title="Temporary Liquidity Bridge"
      description="Zero-penalty pre-salary micro-liquidity advance to protect bills and avoid overdraft charges"
      actions={
        <Link href="/forecast">
          <Button variant="outline" size="sm" onClick={() => sounds.click()} className="border-white/10 text-xs">
            Review Cash Flow Gap
          </Button>
        </Link>
      }
    >
      {/* 1. PRODUCT HERO BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/60 via-obsidian-900 to-cyan-950/30 border border-cyan-500/40 p-6 sm:p-7 space-y-2 glass-panel-glow">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[10px] uppercase font-bold bg-cyan-500 text-obsidian-950">
            Micro-Liquidity Cushion
          </Badge>
          <span className="text-xs text-slate-400 font-mono">· Automated Salary Auto-Settlement</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          "Need to bridge a short-term gap before your salary arrives?"
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Access an instant buffer into your Primary Salary Account to clear rent and utility commitments without high-cost personal loans, compounding late fees, or credit score penalties.
        </p>
      </div>

      {/* 2. 2-COLUMN WORKSPACE: PRODUCT CONFIGURATOR + REPAYMENT FLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Sliders (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              Configure Micro-Bridge
            </h3>

            {/* Slider 1: Advance Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Advance Amount</span>
                <span className="text-xl font-black font-mono text-cyan-400">
                  {formatCurrency(amount)}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={amount}
                onChange={(e) => {
                  setAmount(parseInt(e.target.value, 10));
                  sounds.tick();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>₹2,000</span>
                <span>₹50,000 (Max Limit)</span>
              </div>
            </div>

            {/* Slider 2: Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Duration Before Salary</span>
                <span className="text-xl font-black font-mono text-teal-400">
                  {days} Days
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={days}
                onChange={(e) => {
                  setDays(parseInt(e.target.value, 10));
                  sounds.tick();
                }}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>3 Days</span>
                <span>30 Days</span>
              </div>
            </div>
          </div>

          {/* Pricing Transparent Breakdown */}
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Principal Draw:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Flat Platform Fee:</span>
              <span className="font-mono font-bold text-white">₹{bridgeCalc.flatFee}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Daily Micro-Interest (0.05%/day):</span>
              <span className="font-mono font-bold text-teal-400">₹{bridgeCalc.dailyInterest}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/5 text-sm">
              <span className="font-bold text-white">Total Auto-Settlement:</span>
              <span className="font-black text-amber-400 font-mono">{formatCurrency(bridgeCalc.totalRepay)}</span>
            </div>
          </div>
        </div>

        {/* Right: Repayment Flow Pipeline & Action (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-cyan-950/20 border border-white/10 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              Automated Salary Repayment Flow
            </h3>

            {/* Dynamic Step Visualization */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Step 1: Next Salary Deposit</span>
                    <p className="font-bold text-white text-sm">Oct 01</p>
                  </div>
                </div>
                <span className="font-black text-emerald-400 font-mono text-base">
                  +{formatCurrency(bridgeCalc.salaryIncome)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Step 2: Auto-Settlement</span>
                    <p className="font-bold text-white text-sm">Principal + ₹{bridgeCalc.flatFee + bridgeCalc.dailyInterest} fee</p>
                  </div>
                </div>
                <span className="font-black text-amber-400 font-mono text-base">
                  -{formatCurrency(bridgeCalc.totalRepay)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Step 3: Remaining Take-Home</span>
                    <p className="font-bold text-white text-sm">Net Free Salary</p>
                  </div>
                </div>
                <span className="font-black text-cyan-400 font-mono text-base">
                  {formatCurrency(bridgeCalc.remainingAfterRepay)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <Button
              onClick={handleRequestBridge}
              disabled={applied}
              className={`w-full h-11 rounded-2xl font-bold text-xs ${
                applied
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 shadow-glow-cyan"
              }`}
            >
              {applied ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Bridge Activated · {formatCurrency(amount)} Credited to Primary Account
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Draw {formatCurrency(amount)} Liquidity Bridge Now
                </span>
              )}
            </Button>

            <p className="text-[10px] text-slate-500 text-center font-mono">
              Transparent banking terms · Instant credit to {primaryAcc?.maskedNumber}
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
