"use client";
import React, { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Users, ShieldAlert, AlertTriangle, ArrowRight,
  TrendingDown, CheckCircle2, Search, Filter, ShieldCheck,
  Zap, Clock, FileText,
} from "lucide-react";

interface CustomerRiskProfile {
  id: string;
  name: string;
  account: string;
  resilienceScore: number;
  riskCategory: "healthy" | "watch" | "critical";
  projectedDip: number;
  dipDate: string;
  recommendedIntervention: string;
  status: "Pending Triage" | "Intervention Sent" | "Resolved";
}

const DEMO_PORTFOLIO: CustomerRiskProfile[] = [
  {
    id: "cust-1",
    name: "Arjun Mehta",
    account: "•••• 4821",
    resilienceScore: 63.5,
    riskCategory: "watch",
    projectedDip: 4280,
    dipDate: "Sept 25",
    recommendedIntervention: "Discretionary Spending Calibration / Micro-Bridge",
    status: "Pending Triage",
  },
  {
    id: "cust-2",
    name: "Rajesh Verma",
    account: "•••• 9104",
    resilienceScore: 38.2,
    riskCategory: "critical",
    projectedDip: -3400,
    dipDate: "Sept 18",
    recommendedIntervention: "Loan EMI Restructure (Extend 12m)",
    status: "Pending Triage",
  },
  {
    id: "cust-3",
    name: "Priya Sharma",
    account: "•••• 3320",
    resilienceScore: 88.0,
    riskCategory: "healthy",
    projectedDip: 32000,
    dipDate: "None",
    recommendedIntervention: "Wealth SIP Accumulation",
    status: "Resolved",
  },
  {
    id: "cust-4",
    name: "Vikram Malhotra",
    account: "•••• 7712",
    resilienceScore: 56.4,
    riskCategory: "watch",
    projectedDip: 6100,
    dipDate: "Sept 28",
    recommendedIntervention: "Pre-Salary Micro-Overdraft (₹10k)",
    status: "Intervention Sent",
  },
];

export default function OfficerPage() {
  const [portfolio, setPortfolio] = useState<CustomerRiskProfile[]>(DEMO_PORTFOLIO);
  const [selectedCust, setSelectedCust] = useState<CustomerRiskProfile | null>(DEMO_PORTFOLIO[0]);
  const [search, setSearch] = useState("");

  const filtered = portfolio.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.account.includes(search)
  );

  const handleTriageAction = (custId: string) => {
    sounds.success();
    setPortfolio((prev) =>
      prev.map((c) =>
        c.id === custId ? { ...c, status: "Intervention Sent" } : c
      )
    );
    if (selectedCust && selectedCust.id === custId) {
      setSelectedCust({ ...selectedCust, status: "Intervention Sent" });
    }
  };

  return (
    <Shell
      title="Bank Risk Command Center"
      description="Portfolio vulnerability triage queue, early distress intervention dispatcher, and supervisory oversight"
    >
      {/* Portfolio Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/10 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Customers Monitored</span>
          <p className="text-2xl font-black text-white font-mono">1,420</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-amber-500/30 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Early Watchlist Queue</span>
          <p className="text-2xl font-black text-amber-400 font-mono">48 Cases</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-rose-500/30 space-y-1">
          <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Critical Distress Risk</span>
          <p className="text-2xl font-black text-rose-400 font-mono">12 Cases</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Proactive Recovery Rate</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">92.4%</p>
        </div>
      </div>

      {/* 2-Column Triage Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Customer Triage Queue (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Early Intervention Triage Queue
            </h3>
            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-1.5 px-3 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2.5">
            {filtered.map((cust) => {
              const isSelected = selectedCust?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    sounds.tick();
                    setSelectedCust(cust);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-500/60 shadow-glow-cyan/20"
                      : "bg-obsidian-950/80 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{cust.name}</p>
                      <Badge
                        variant={
                          cust.riskCategory === "healthy"
                            ? "success"
                            : cust.riskCategory === "critical"
                            ? "critical"
                            : "warning"
                        }
                        className="text-[8px] uppercase py-0"
                      >
                        {cust.riskCategory}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">{cust.account}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Resilience</span>
                    <span className="text-base font-bold font-mono text-cyan-400">{cust.resilienceScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Customer Deep-Dive & Action (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-5">
          {selectedCust ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedCust.name}</h4>
                  <span className="text-xs text-muted-foreground font-mono">{selectedCust.account}</span>
                </div>
                <Badge
                  variant={
                    selectedCust.status === "Resolved"
                      ? "success"
                      : selectedCust.status === "Intervention Sent"
                      ? "default"
                      : "warning"
                  }
                  className="text-[9px]"
                >
                  {selectedCust.status}
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/5 flex justify-between">
                  <span className="text-muted-foreground">Projected Minimum Dip:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {selectedCust.projectedDip < 0 ? "-" : ""}
                    {formatCurrency(Math.abs(selectedCust.projectedDip))}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/5 flex justify-between">
                  <span className="text-muted-foreground">Expected Date of Dip:</span>
                  <span className="font-mono font-bold text-white">{selectedCust.dipDate}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    Algorithmic Recommendation
                  </span>
                  <p className="text-white font-medium text-xs leading-relaxed">
                    {selectedCust.recommendedIntervention}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleTriageAction(selectedCust.id)}
                  disabled={selectedCust.status !== "Pending Triage"}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs h-10 rounded-xl gap-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>
                    {selectedCust.status === "Pending Triage"
                      ? "Dispatch Proactive In-App Offer"
                      : "Intervention Already Dispatched"}
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-12 text-center">Select a customer from the queue</p>
          )}
        </div>
      </div>
    </Shell>
  );
}
