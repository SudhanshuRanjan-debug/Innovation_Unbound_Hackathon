"use client";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/audio";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CreditCard, ShieldCheck, AlertCircle, Sparkles,
  ArrowRight, CheckCircle2, Clock,
} from "lucide-react";
import confetti from "canvas-confetti";

import { useBanking } from "@/lib/banking-store";

export function OverdraftInteractiveCard() {
  const { accounts, requestLiquidityBridge, activeLiquidityBridge } = useBanking();
  const [amount, setAmount] = useState(15000);
  const [days, setDays] = useState(25);
  const [applied, setApplied] = useState(!!activeLiquidityBridge);

  const primaryAcc = accounts[0];

  const calc = useMemo(() => {
    const dailyRate = 0.05 / 100; // 0.05% per day
    const interest = Math.round(amount * dailyRate * days);
    const fee = 100;
    const totalRepayment = amount + interest + fee;
    const currentBalance = primaryAcc ? primaryAcc.availableBalance : 48500;
    const projectedBalanceWithBridge = currentBalance + amount;

    return {
      interest,
      fee,
      totalRepayment,
      projectedBalanceWithBridge,
      dailyCost: (interest / days).toFixed(1),
    };
  }, [amount, days, primaryAcc]);

  const handleSimulateApply = () => {
    requestLiquidityBridge(amount, days);
    setApplied(true);
  };

  return (
    <Card className="glass-panel-glow border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                Pre-Salary Liquidity Bridge Simulator
                <Badge variant="info" className="text-xs">Micro-Overdraft</Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Bridge short-term cash flow gaps until your next verified salary credit
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-[11px] bg-obsidian-900 border border-white/10 text-cyan-300">
            Simulated Assessment
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Dynamic Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-200">Required Bridge Amount</span>
              <span className="font-bold text-cyan-400 text-base">{formatCurrency(amount)}</span>
            </div>
            <input
              type="range"
              min={2000}
              max={50000}
              step={1000}
              value={amount}
              onChange={(e) => {
                setAmount(Number(e.target.value));
                sounds.tick(500);
              }}
              className="w-full h-2 rounded-full appearance-none bg-obsidian-800 accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>₹2,000 (Min)</span>
              <span>₹50,000 (Pre-approved cap)</span>
            </div>
          </div>

          {/* Days to Salary Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-200">Bridge Duration until Salary</span>
              <span className="font-bold text-cyan-400 text-base">{days} Days</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                sounds.tick(600);
              }}
              className="w-full h-2 rounded-full appearance-none bg-obsidian-800 accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>3 Days</span>
              <span>30 Days (Auto-debit on salary credit)</span>
            </div>
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-obsidian-900/80 p-3.5 rounded-xl border border-white/5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Daily Interest</p>
            <p className="text-base font-bold text-white mt-0.5">₹{calc.dailyCost}/day</p>
            <p className="text-[10px] text-slate-400">0.05% per diem</p>
          </div>

          <div className="bg-obsidian-900/80 p-3.5 rounded-xl border border-white/5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total Interest</p>
            <p className="text-base font-bold text-amber-400 mt-0.5">{formatCurrency(calc.interest)}</p>
            <p className="text-[10px] text-slate-400">Over {days} days</p>
          </div>

          <div className="bg-obsidian-900/80 p-3.5 rounded-xl border border-white/5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Processing Fee</p>
            <p className="text-base font-bold text-slate-200 mt-0.5">{formatCurrency(calc.fee)}</p>
            <p className="text-[10px] text-slate-400">Flat one-time</p>
          </div>

          <div className="bg-obsidian-900/80 p-3.5 rounded-xl border border-cyan-500/30">
            <p className="text-[11px] uppercase tracking-wider text-cyan-300">Total Repayment</p>
            <p className="text-base font-bold text-cyan-400 mt-0.5">{formatCurrency(calc.totalRepayment)}</p>
            <p className="text-[10px] text-emerald-400">On salary day</p>
          </div>
        </div>

        {/* Regulatory & Safety Clarification */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-obsidian-900/60 border border-white/5 text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Pre-qualification Status: Eligible</p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Verified salary credit of ₹85,000/mo qualifies for zero-collateral micro-liquidity up to ₹50,000. This is an interactive financial simulation.
            </p>
          </div>
        </div>

        {/* Simulation Submission Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            Automatic settlement on 1st of month
          </span>

          <Button
            onClick={handleSimulateApply}
            disabled={applied}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-obsidian-950 font-bold px-6"
          >
            {applied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Simulated Bridge Activated
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Activate Simulated Overdraft
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
