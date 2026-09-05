"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { useBanking } from "@/lib/banking-store";
import { CashFlowChart } from "@/components/financial/cashflow-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle, TrendingDown, TrendingUp, Calendar, Clock, Sparkles,
  Zap, ArrowRight, Layers, HelpCircle, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function ForecastPage() {
  const { accounts, monthlyOverview } = useBanking();
  const [days, setDays] = useState(90);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>("low-dip");

  const { data, isLoading } = useQuery({
    queryKey: ["forecast", days],
    queryFn: () => api.getForecast(days),
  });

  const primaryAcc = accounts[0];

  // Milestone events along the timeline
  const milestones = [
    {
      id: "today",
      date: "Today",
      label: "Opening Liquidity",
      amount: primaryAcc ? primaryAcc.availableBalance : 48500,
      type: "neutral",
      desc: "Starting liquid buffer in Primary Salary Account.",
    },
    {
      id: "bescom",
      date: "Sept 10",
      label: "Electricity & Utilities",
      amount: -1240,
      type: "outflow",
      desc: "Bescom State Electricity Auto-Debit.",
    },
    {
      id: "emi",
      date: "Sept 11",
      label: "Personal Loan EMI",
      amount: -7800,
      type: "outflow",
      desc: "Monthly loan repayment installment.",
    },
    {
      id: "rent",
      date: "Sept 15",
      label: "Apartment Rent",
      amount: -18000,
      type: "outflow",
      desc: "Monthly housing obligation.",
    },
    {
      id: "low-dip",
      date: "Sept 25",
      label: "Projected Low Dip",
      amount: 4280,
      type: "critical",
      desc: "Projected minimum buffer threshold prior to salary.",
    },
    {
      id: "salary",
      date: "Oct 01",
      label: "Salary Direct Deposit",
      amount: 85000,
      type: "inflow",
      desc: "Tech Corp India verified payroll deposit.",
    },
  ];

  return (
    <Shell
      title="Cash Flow & Horizon"
      description="90-day predictive balance modeling, cadence detection, and early liquidity gap prevention"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Window:</span>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => {
                sounds.click();
                setDays(d);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                days === d
                  ? "bg-cyan-500 text-obsidian-950 font-bold shadow-glow-cyan"
                  : "bg-obsidian-900 border border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      }
    >
      {/* 1. HORIZON SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/10 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Balance</span>
          <p className="text-2xl font-black text-white font-mono">{formatCurrency(primaryAcc?.availableBalance || 48500)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-amber-500/30 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Projected Minimum</span>
          <p className="text-2xl font-black text-amber-400 font-mono">₹4,280</p>
          <p className="text-[10px] text-slate-400">Occurs Sept 25 (5 days pre-salary)</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Next Salary Deposit</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">+{formatCurrency(monthlyOverview.income)}</p>
          <p className="text-[10px] text-slate-400">Scheduled Oct 01</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-cyan-500/30 space-y-1">
          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Model Confidence</span>
          <p className="text-2xl font-black text-cyan-300 font-mono">98.4%</p>
          <p className="text-[10px] text-slate-400">Based on 180-day recurring payroll</p>
        </div>
      </div>

      {/* 2. SPATIAL INTERACTIVE MILESTONE TIMELINE */}
      <div className="rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-cyan-950/20 border border-cyan-500/30 p-6 space-y-4 glass-panel-glow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Interactive Cash Flow Milestone Track
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click milestone beacons to inspect obligation impacts along your pay cycle
            </p>
          </div>
        </div>

        {/* Milestone Node Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {milestones.map((m) => {
            const isSelected = selectedMilestone === m.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  sounds.tick();
                  setSelectedMilestone(m.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500/60 shadow-glow-cyan/30 scale-[1.02]"
                    : "bg-obsidian-950/80 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{m.date}</span>
                  <Badge
                    variant={m.type === "critical" ? "critical" : m.type === "inflow" ? "success" : "outline"}
                    className="text-[8px] py-0 px-1 uppercase"
                  >
                    {m.type}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-bold text-white truncate">{m.label}</p>
                  <p
                    className={`text-sm font-black font-mono mt-0.5 ${
                      m.type === "critical"
                        ? "text-amber-400"
                        : m.type === "inflow"
                        ? "text-emerald-400"
                        : m.type === "outflow"
                        ? "text-rose-400"
                        : "text-white"
                    }`}
                  >
                    {m.amount > 0 && m.type === "inflow" ? "+" : ""}
                    {formatCurrency(m.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Milestone Inspection Panel */}
        {selectedMilestone && (
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-white">
                {milestones.find((m) => m.id === selectedMilestone)?.label} · {milestones.find((m) => m.id === selectedMilestone)?.date}
              </p>
              <p className="text-slate-300 text-xs mt-0.5">
                {milestones.find((m) => m.id === selectedMilestone)?.desc}
              </p>
            </div>

            {selectedMilestone === "low-dip" && (
              <div className="flex items-center gap-2">
                <Link href="/overdraft">
                  <Button size="sm" onClick={() => sounds.click()} className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs h-8 px-3">
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Bridge with Micro-Liquidity
                  </Button>
                </Link>
                <Link href="/interventions">
                  <Button variant="outline" size="sm" onClick={() => sounds.click()} className="border-white/10 text-xs h-8 px-3">
                    Adjust Spending
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 2D / 3D CASH FLOW FORECAST VISUALIZATION */}
      <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
        {isLoading ? (
          <div className="h-80 rounded-2xl bg-obsidian-950 animate-pulse" />
        ) : (
          data && <CashFlowChart data={data} />
        )}
      </div>
    </Shell>
  );
}
