"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/audio";
import {
  Scissors, RefreshCw, CreditCard, ShieldCheck,
  TrendingUp, ArrowRight, CheckCircle2, ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface DecisionTier {
  id: string;
  tier: number;
  name: string;
  badge: string;
  icon: any;
  color: string;
  borderColor: string;
  summary: string;
  details: string;
  scoreGain: string;
  riskLevel: "Safe" | "Low Impact" | "Temporary Debt";
  actionHref: string;
  actionText: string;
}

const TIERS: DecisionTier[] = [
  {
    id: "spending",
    tier: 1,
    name: "1. Discretionary Calibration",
    badge: "Recommended First Step",
    icon: Scissors,
    color: "text-emerald-400 bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    summary: "Trim dining & shopping expenses by ₹4,000/month without altering fixed obligations.",
    details: "Zero-cost, zero-debt intervention that restores your 2.4-month cash reserve in under 60 days.",
    scoreGain: "+4.2 pts",
    riskLevel: "Safe",
    actionHref: "/interventions",
    actionText: "Apply Spending Budget",
  },
  {
    id: "restructure",
    tier: 2,
    name: "2. Repayment Restructuring",
    badge: "Cash Flow Relief",
    icon: RefreshCw,
    color: "text-purple-400 bg-purple-500/10",
    borderColor: "border-purple-500/30",
    summary: "Extend your 36m personal loan tenure to 48m to reduce monthly EMI from ₹10,200 to ₹7,800.",
    details: "Frees up ₹2,400 monthly free cash flow immediately, reducing your EMI burden ratio to 22.8%.",
    scoreGain: "+3.1 pts",
    riskLevel: "Low Impact",
    actionHref: "/interventions",
    actionText: "Review Restructuring",
  },
  {
    id: "overdraft",
    tier: 3,
    name: "3. Temporary Liquidity Bridge",
    badge: "Pre-Salary Support",
    icon: CreditCard,
    color: "text-cyan-400 bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    summary: "Bridge the 5-day gap before salary with a ₹15,000 micro-overdraft (total cost: ₹187).",
    details: "Prevents auto-debit bounces and protects credit profile until salary credit on the 1st.",
    scoreGain: "Protects Score",
    riskLevel: "Temporary Debt",
    actionHref: "/overdraft",
    actionText: "Simulate Overdraft",
  },
  {
    id: "loans",
    tier: 4,
    name: "4. Best-Fit Loan Comparison",
    badge: "Capital Requirement",
    icon: ShieldCheck,
    color: "text-blue-400 bg-blue-500/10",
    borderColor: "border-blue-500/30",
    summary: "If additional capital is genuinely needed, compare lenders ranked by composite resilience fit.",
    details: "Evaluates fee structure, prepayment flexibility, and total cost rather than just headline interest rate.",
    scoreGain: "Evaluated Live",
    riskLevel: "Temporary Debt",
    actionHref: "/loans",
    actionText: "Compare Loan Products",
  },
];

export function InterventionDecisionMatrix() {
  const [activeTier, setActiveTier] = useState<string>("spending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Intervention Decision Space
            <Badge variant="info" className="text-xs">Exhausts Safe Options First</Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            FinShield prioritizes zero-cost lifestyle adjustments and restructuring before recommending debt.
          </p>
        </div>
      </div>

      {/* 4 Interactive Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => {
          const isSelected = activeTier === tier.id;
          const Icon = tier.icon;

          return (
            <Card
              key={tier.id}
              onClick={() => {
                setActiveTier(tier.id);
                sounds.hover();
              }}
              className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? `glass-panel-glow ${tier.borderColor} ring-1 ring-cyan-500/50 scale-[1.02]`
                  : "glass-panel hover:border-cyan-500/30"
              }`}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${tier.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant={tier.riskLevel === "Safe" ? "success" : "info"} className="text-[10px]">
                      {tier.riskLevel}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-white text-base leading-snug">{tier.name}</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{tier.summary}</p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Expected Resilience:</span>
                    <span className="text-emerald-400 font-bold">{tier.scoreGain}</span>
                  </div>

                  <Link href={tier.actionHref} className="block w-full">
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.click();
                      }}
                      className="w-full text-xs h-8 mt-1"
                    >
                      <span>{tier.actionText}</span>
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
