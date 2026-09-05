"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/audio";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle, TrendingDown, ArrowRight,
  ShieldAlert, Sparkles, CheckCircle2, ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Props {
  onExploreOptions?: () => void;
}

export function DistressNarrative({ onExploreOptions }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s < 4 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="glass-panel-glow border-amber-500/30 overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Intelligent Distress Detection
                <Badge variant="warning" className="text-xs">Early Warning</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Continuous AI analysis of transaction cadence</p>
            </div>
          </div>
          <button
            onClick={() => {
              setStep(4);
              sounds.click();
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Show Full Diagnostic
          </button>
        </div>

        {/* Narrative Flow Sequence */}
        <div className="space-y-4">
          <AnimatePresence>
            {step >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-amber-200/90 flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>FinShield detected an emerging cash-flow shift in your spending pattern.</span>
              </motion.div>
            )}

            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
              >
                <div className="bg-obsidian-900/60 p-3.5 rounded-xl border border-white/5">
                  <p className="text-[11px] text-muted-foreground uppercase">Discretionary Surge</p>
                  <p className="text-lg font-bold text-red-400 mt-0.5">+28%</p>
                  <p className="text-[11px] text-slate-400">Dining & Lifestyle spend</p>
                </div>

                <div className="bg-obsidian-900/60 p-3.5 rounded-xl border border-white/5">
                  <p className="text-[11px] text-muted-foreground uppercase">Buffer Reduction</p>
                  <p className="text-lg font-bold text-amber-400 mt-0.5">2.4m → 1.38m</p>
                  <p className="text-[11px] text-slate-400">Emergency fund months</p>
                </div>

                <div className="bg-obsidian-900/60 p-3.5 rounded-xl border border-white/5">
                  <p className="text-[11px] text-muted-foreground uppercase">EMI Obligation</p>
                  <p className="text-lg font-bold text-cyan-400 mt-0.5">25.9%</p>
                  <p className="text-[11px] text-slate-400">Approaching 30% ceiling</p>
                </div>
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-obsidian-900/80 p-4 rounded-xl border border-cyan-500/20 text-sm space-y-1"
              >
                <p className="text-xs text-cyan-300 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Projected Pre-Salary Liquidity Trajectory
                </p>
                <p className="text-sm text-slate-200 pt-1 font-mono">
                  Current: <span className="text-emerald-400 font-bold">{formatCurrency(48500)}</span> → Day 12: <span className="text-slate-300">{formatCurrency(18200)}</span> → Day 18: <span className="text-amber-400 font-bold">{formatCurrency(3800)}</span>
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                  A temporary ₹3,800 liquidity dip is forecast before salary arrives on the 1st.
                </p>
              </motion.div>
            )}

            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>FinShield has prepared 3 proactive, non-debt interventions.</span>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/overdraft">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sounds.click()}
                      className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs"
                    >
                      Simulate Overdraft
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    onClick={() => {
                      sounds.click();
                      onExploreOptions ? onExploreOptions() : null;
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-obsidian-950 font-bold text-xs"
                  >
                    <span>Explore Interventions</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
