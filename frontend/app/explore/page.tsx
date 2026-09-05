"use client";
import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { HeroExperience } from "@/components/experience/HeroExperience";
import { DistressNarrative } from "@/components/experience/DistressNarrative";
import { InterventionDecisionMatrix } from "@/components/experience/InterventionDecisionMatrix";
import { OverdraftInteractiveCard } from "@/components/experience/OverdraftInteractiveCard";
import { SceneCanvas } from "@/components/3d/SceneCanvas";
import { TransactionUniverse } from "@/components/3d/TransactionUniverse";
import { RiskScoreCard } from "@/components/financial/risk-score-card";
import { CashFlowChart } from "@/components/financial/cashflow-chart";
import { InterventionCard } from "@/components/financial/intervention-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Sparkles, Compass, ShieldCheck, TrendingUp,
  Activity, ArrowRight, Layers, Brain,
  ChevronRight, Calculator,
} from "lucide-react";
import Link from "next/link";

export default function MasterJourneyPage() {
  const universeRef = useRef<HTMLDivElement>(null);
  const distressRef = useRef<HTMLDivElement>(null);
  const interventionsRef = useRef<HTMLDivElement>(null);

  const { data: riskData } = useQuery({ queryKey: ["risk"], queryFn: () => api.getRiskScore() });
  const { data: healthData } = useQuery({ queryKey: ["health"], queryFn: () => api.getFinancialHealth() });
  const { data: forecastData } = useQuery({ queryKey: ["forecast"], queryFn: () => api.getForecast(90) });
  const { data: interventions, refetch: refetchInt } = useQuery({
    queryKey: ["interventions"],
    queryFn: () => api.getInterventions("pending"),
  });

  const scrollToUniverse = () => {
    universeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-foreground overflow-x-hidden">
      {/* Floating Spatial Navigation */}
      <Navigation />

      {/* ── 1. HERO SECTION: 3D Financial Health Core ── */}
      <HeroExperience
        riskData={riskData}
        healthData={healthData}
        onExploreClick={scrollToUniverse}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-12">
        {/* ── 2. FINANCIAL UNIVERSE 3D ORBITAL EXPLORER ── */}
        <section ref={universeRef} className="space-y-6 pt-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>INTERACTIVE 3D DATA UNIVERSE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your Entire Financial Life in <span className="text-gradient-cyan">Spatial 3D</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Hover and rotate through active spending categories, debt obligations, and recurring inflows. Connected filaments illustrate dynamic cash flow velocity.
            </p>
          </div>

          <div className="w-full h-[420px] sm:h-[480px] rounded-3xl overflow-hidden glass-panel-glow border-cyan-500/30 relative shadow-2xl">
            <SceneCanvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <TransactionUniverse />
            </SceneCanvas>

            {/* Hint pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-1.5 rounded-full border border-white/10 text-xs text-slate-300 pointer-events-none">
              Hover over category nodes to inspect volume & trend
            </div>
          </div>
        </section>

        {/* ── 3. HEALTH & CASH FLOW HORIZON DUAL PANELS ── */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <Layers className="h-3.5 w-3.5 text-teal-400" />
                <span>INTELLIGENT TELEMETRY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                Resilience Engine & 90-Day Cash Trajectory
              </h2>
            </div>
            <Link href="/auth">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sounds.click()}
                className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300"
              >
                <span>Customer Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {riskData && <RiskScoreCard data={riskData} />}
            {forecastData && <CashFlowChart data={forecastData} />}
          </div>
        </section>

        {/* ── 4. LIQUIDITY DISTRESS DEEP DIVE NARRATIVE ── */}
        <section ref={distressRef}>
          <DistressNarrative />
        </section>

        {/* ── 5. PROACTIVE INTERVENTION DECISION MATRIX ── */}
        <section ref={interventionsRef} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Brain className="h-3.5 w-3.5 text-amber-400" />
                <span>FINANCIAL COPILOT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                Recommended Action Plans
              </h2>
            </div>
            <Link href="/auth">
              <Button
                size="sm"
                onClick={() => sounds.click()}
                className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold"
              >
                Launch FinShield Banking
              </Button>
            </Link>
          </div>

          <InterventionDecisionMatrix />
        </section>

        {/* ── 6. DYNAMIC OVERDRAFT / LIQUIDITY BRIDGE SECTION ── */}
        <section className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>RESPONSIBLE LIQUIDITY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Non-Predatory Micro Liquidity Bridge
            </h2>
          </div>

          <OverdraftInteractiveCard />
        </section>
      </div>
    </div>
  );
}
