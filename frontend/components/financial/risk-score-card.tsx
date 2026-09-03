"use client";
import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, riskColors, riskLabels, formatDate } from "@/lib/utils";
import type { RiskScore, RiskCategory } from "@/types";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const categoryVariant: Record<RiskCategory, "critical" | "warning" | "info" | "success"> = {
  critical: "critical",
  at_risk: "warning",
  watch: "info",
  healthy: "success",
};

function ScoreGauge({ score, category }: { score: number; category: RiskCategory }) {
  const color = riskColors[category];
  const data = [{ value: score, fill: color }, { value: 100 - score, fill: "#e5e7eb" }];
  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="70%" outerRadius="90%"
          startAngle={90} endAngle={-270}
          data={data}
          barSize={12}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
}

interface Props {
  data: RiskScore;
  compact?: boolean;
}

export function RiskScoreCard({ data, compact = false }: Props) {
  const { risk_score, risk_category, score_change, trend, risk_factors, assessment_date } = data;

  const TrendIcon = trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Minus;
  const trendColor =
    trend === "improving" ? "text-green-600" : trend === "declining" ? "text-red-600" : "text-gray-500";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Financial Resilience Score</CardTitle>
          <Badge variant={categoryVariant[risk_category]}>{riskLabels[risk_category]}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">As of {formatDate(assessment_date)}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ScoreGauge score={Math.round(risk_score)} category={risk_category} />
          <div className="flex-1 space-y-4">
            {/* Trend */}
            {score_change !== undefined && (
              <div className={cn("flex items-center gap-1.5 text-sm font-medium", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span>
                  {score_change >= 0 ? "+" : ""}{score_change.toFixed(1)} pts since last month
                </span>
              </div>
            )}

            {/* Factor bars */}
            <div className="space-y-2">
              {Object.entries({
                "Income": data.factors.income_stability_score,
                "Liquidity": data.factors.liquidity_score,
                "Debt": data.factors.debt_burden_score,
                "Payments": data.factors.payment_behavior_score,
                "Credit": data.factors.credit_utilization_score,
              }).map(([label, score]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${score}%`,
                        backgroundColor: score >= 70 ? "#10B981" : score >= 50 ? "#3B82F6" : score >= 30 ? "#F59E0B" : "#DC2626",
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{Math.round(score)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk factors */}
        {!compact && risk_factors.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Risk Factors</p>
            {risk_factors.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertCircle
                  className={cn(
                    "h-3.5 w-3.5 mt-0.5 shrink-0",
                    f.impact === "high" ? "text-red-500" : f.impact === "medium" ? "text-amber-500" : "text-blue-500"
                  )}
                />
                <span className="text-gray-600 leading-tight">{f.description}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
