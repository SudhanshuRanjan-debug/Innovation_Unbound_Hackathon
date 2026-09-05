"use client";
import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SceneCanvas } from "@/components/3d/SceneCanvas";
import { FinancialCore } from "@/components/3d/FinancialCore";
import { WebGLFallback } from "@/components/layout/WebGLFallback";
import { cn, riskLabels, formatDate } from "@/lib/utils";
import type { RiskScore, RiskCategory } from "@/types";

const categoryVariant: Record<RiskCategory, "critical" | "warning" | "info" | "success"> = {
  critical: "critical",
  at_risk: "warning",
  watch: "info",
  healthy: "success",
};

interface Props {
  data?: RiskScore;
  compact?: boolean;
}

export function RiskScoreCard({ data, compact = false }: Props) {
  const risk_score = data?.risk_score ?? 63.5;
  const risk_category = data?.risk_category ?? "watch";
  const score_change = data?.score_change ?? 0;
  const trend = data?.trend ?? "stable";
  const risk_factors = Array.isArray(data?.risk_factors) ? data.risk_factors : [];
  const assessment_date = data?.assessment_date ?? new Date().toISOString();

  const factors = {
    Income: data?.factors?.income_stability_score ?? 78,
    Liquidity: data?.factors?.liquidity_score ?? 55,
    Debt: data?.factors?.debt_burden_score ?? 58,
    Payments: data?.factors?.payment_behavior_score ?? 82,
    Credit: data?.factors?.credit_utilization_score ?? 52,
  };

  const TrendIcon = trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Minus;
  const trendColor =
    trend === "improving" ? "text-emerald-400" : trend === "declining" ? "text-red-400" : "text-slate-400";

  return (
    <Card className="glass-panel-glow border-cyan-500/30 h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            Financial Resilience Score
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </CardTitle>
          <Badge variant={categoryVariant[risk_category]}>{riskLabels[risk_category]}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">As of {formatDate(assessment_date)}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* 3D Core Mini Canvas */}
          <div className="sm:col-span-5 h-[160px] relative flex items-center justify-center">
            <SceneCanvas
              camera={{ position: [0, 0, 3.5], fov: 45 }}
              fallback2D={<WebGLFallback score={risk_score} category={risk_category} />}
            >
              <FinancialCore score={risk_score} category={risk_category} scale={1.0} />
            </SceneCanvas>

            {/* Score Overlay Pill */}
            <div className="absolute bottom-1 bg-obsidian-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 text-xs font-bold text-cyan-300 pointer-events-none">
              <AnimatedCounter value={risk_score} decimals={1} suffix="/100" />
            </div>
          </div>

          {/* Factor Bars & Trends */}
          <div className="sm:col-span-7 space-y-3">
            {score_change !== undefined && (
              <div className={cn("flex items-center gap-1.5 text-xs font-semibold", trendColor)}>
                <TrendIcon className="h-4 w-4 shrink-0" />
                <span>
                  {score_change >= 0 ? "+" : ""}
                  {score_change.toFixed(1)} pts {trend === "improving" ? "improvement" : "shift"} this cycle
                </span>
              </div>
            )}

            <div className="space-y-2">
              {Object.entries(factors).map(([label, score]) => {
                const color =
                  score >= 70 ? "#10B981" : score >= 50 ? "#06B6D4" : score >= 30 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-300 w-16 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-obsidian-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${score}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[11px] font-bold w-7 text-right text-slate-200">{Math.round(score)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Risk Factors Breakdown */}
        {!compact && risk_factors.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Neural Risk Observations
            </p>
            {risk_factors.slice(0, 2).map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-obsidian-900/60 p-2 rounded-lg border border-white/5">
                <AlertCircle
                  className={cn(
                    "h-3.5 w-3.5 mt-0.5 shrink-0",
                    f.impact === "high" ? "text-red-400" : f.impact === "medium" ? "text-amber-400" : "text-cyan-400"
                  )}
                />
                <span className="text-slate-300 leading-tight">{f.description}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
