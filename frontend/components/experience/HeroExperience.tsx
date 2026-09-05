"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SceneCanvas } from "@/components/3d/SceneCanvas";
import { FinancialCore } from "@/components/3d/FinancialCore";
import { ParticleField } from "@/components/3d/ParticleField";
import { WebGLFallback } from "@/components/layout/WebGLFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/audio";
import { formatCurrency, riskLabels } from "@/lib/utils";
import type { RiskScore, FinancialHealth } from "@/types";
import {
  Volume2, VolumeX, Sparkles,
  Compass, Activity, ArrowRight,
} from "lucide-react";

interface Props {
  riskData?: RiskScore;
  healthData?: FinancialHealth;
  onExploreClick?: () => void;
}

export function HeroExperience({ riskData, healthData, onExploreClick }: Props) {
  const [muted, setMuted] = useState(() => sounds.getMuted());

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sounds.click();
  };

  const score = riskData?.risk_score ?? 63.5;
  const category = riskData?.risk_category ?? "watch";

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4 pt-12 pb-16">
      {/* Sound Toggle Floating Control */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleSound}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-850/80 border border-cyan-500/20 text-xs text-cyan-400 hover:border-cyan-400/50 hover:bg-obsidian-800 transition-all backdrop-blur-md shadow-glass-card"
          title="Toggle UI Audio Synthesis"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5 text-muted-foreground" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
          <span>{muted ? "Audio Muted" : "Spatial Audio"}</span>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Vision & Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 text-left space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>INTELLIGENT FINANCIAL RESILIENCE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your Financial Future,{" "}
            <span className="text-gradient-cyan">Understood Early.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            FinShield detects early stress patterns, forecasts upcoming liquidity gaps, and simulates responsible interventions before taking financial debt.
          </p>

          {/* Key Metric Telemetry Strip */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="glass-panel p-3.5 rounded-xl border-cyan-500/20">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Resilience Score</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-white">{Math.round(score)}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
              <Badge variant={category === "healthy" ? "success" : category === "critical" ? "critical" : "warning"} className="mt-1 text-[10px] py-0">
                {riskLabels[category]}
              </Badge>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border-cyan-500/20">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Monthly Inflow</p>
              <p className="text-xl font-bold text-white mt-1">
                {healthData ? formatCurrency(healthData.monthly_income, true) : "₹85.0K"}
              </p>
              <p className="text-[10px] text-emerald-400 mt-1">Net Credited</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border-cyan-500/20">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">EMI Ratio</p>
              <p className="text-xl font-bold text-white mt-1">
                {healthData ? `${(healthData.emi_to_income_ratio * 100).toFixed(0)}%` : "25.9%"}
              </p>
              <p className="text-[10px] text-amber-400 mt-1">Warning: 30%</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => {
                sounds.click();
                onExploreClick ? onExploreClick() : window.scrollTo({ top: 750, behavior: "smooth" });
              }}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-obsidian-950 font-bold px-7 shadow-glow-cyan"
            >
              <Compass className="h-4 w-4 mr-2" />
              Explore Financial Universe
            </Button>

            <Link href="/simulator">
              <Button
                variant="outline"
                size="lg"
                onClick={() => sounds.click()}
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 backdrop-blur-sm"
              >
                <Activity className="h-4 w-4 mr-2" />
                Live Decision Simulator
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Unified 3D Canvas (Financial Core + Ambient Particle Space) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
          className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[420px] lg:min-h-[500px]"
        >
          <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px]">
            <SceneCanvas
              camera={{ position: [0, 0, 4.8], fov: 42 }}
              fallback2D={<WebGLFallback score={score} category={category} />}
            >
              <ParticleField count={180} color="#06B6D4" speed={0.2} />
              <FinancialCore score={score} category={category} scale={1.25} />
            </SceneCanvas>

            {/* Floating Spatial Label Pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-full border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2 pointer-events-none shadow-glow-cyan/20 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>3D Financial Health Core · Reactive to Pointer</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Downward Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground flex flex-col items-center cursor-pointer"
        onClick={() => {
          sounds.click();
          window.scrollTo({ top: 750, behavior: "smooth" });
        }}
      >
        <span className="text-[11px] tracking-widest uppercase text-cyan-400/80 mb-1">Scroll to Navigate</span>
        <ArrowRight className="h-4 w-4 text-cyan-400 rotate-90" />
      </motion.div>
    </section>
  );
}
