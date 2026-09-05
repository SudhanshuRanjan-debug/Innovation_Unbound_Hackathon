"use client";
import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingUp, Box, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SceneCanvas } from "@/components/3d/SceneCanvas";
import { CashFlow3DTimeline } from "@/components/3d/CashFlow3DTimeline";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import type { CashFlowForecast } from "@/types";

const MIN_SAFE_BALANCE = 5000;

function subsample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const step = Math.floor(arr.length / n);
  return arr.filter((_, i) => i % step === 0);
}

interface Props {
  data?: CashFlowForecast;
  compact?: boolean;
  allow3DToggle?: boolean;
}

export function CashFlowChart({ data, compact = false, allow3DToggle = true }: Props) {
  const [view3D, setView3D] = useState(false);

  const daily_projections = data?.daily_projections ?? [];
  const summary = data?.summary ?? {
    minimum_balance: 0,
    minimum_balance_date: "",
    average_balance: 0,
    negative_balance_days: 0,
    low_balance_alerts: [],
  };
  const current_balance = data?.current_balance ?? 0;
  const low_balance_alerts = Array.isArray(summary.low_balance_alerts) ? summary.low_balance_alerts : [];

  const points = subsample(daily_projections, compact ? 20 : 45).map((p) => ({
    date: formatDateShort(p.date),
    balance: p.projected_balance,
    inflows: p.inflows,
    outflows: p.outflows,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-obsidian-900/95 rounded-xl border border-cyan-500/30 shadow-2xl p-3 text-xs space-y-1 backdrop-blur-md">
        <p className="font-bold text-white">{label}</p>
        <p className="text-slate-300">
          Balance: <span className="font-bold text-cyan-400">{formatCurrency(d.balance)}</span>
        </p>
        {d.inflows > 0 && <p className="text-emerald-400">+{formatCurrency(d.inflows)} (Inflow)</p>}
        {d.outflows > 0 && <p className="text-red-400">-{formatCurrency(d.outflows)} (Outflow)</p>}
      </div>
    );
  };

  return (
    <Card className="glass-panel-glow border-cyan-500/30 h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              Cash Flow & Liquidity Horizon
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              90-day projected balance trajectory
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {allow3DToggle && (
              <button
                onClick={() => {
                  sounds.click();
                  setView3D(!view3D);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  view3D
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:text-white"
                }`}
              >
                {view3D ? <Box className="h-3.5 w-3.5 text-cyan-400" /> : <BarChart3 className="h-3.5 w-3.5" />}
                <span>{view3D ? "3D Spatial" : "2D Curve"}</span>
              </button>
            )}

            {low_balance_alerts.length > 0 && (
              <Badge variant="warning" className="flex items-center gap-1 text-[10px]">
                <AlertTriangle className="h-3 w-3" />
                {low_balance_alerts.length} Alert
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Ribbons */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-obsidian-900/60 p-2.5 rounded-xl border border-white/5">
            <p className="text-muted-foreground text-[10px] uppercase">Current</p>
            <p className="font-bold text-white mt-0.5">{formatCurrency(current_balance)}</p>
          </div>
          <div className="bg-obsidian-900/60 p-2.5 rounded-xl border border-white/5">
            <p className="text-muted-foreground text-[10px] uppercase">Lowest Point</p>
            <p
              className={`font-bold mt-0.5 ${
                summary.minimum_balance < MIN_SAFE_BALANCE ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {formatCurrency(summary.minimum_balance)}
            </p>
          </div>
          <div className="bg-obsidian-900/60 p-2.5 rounded-xl border border-white/5">
            <p className="text-muted-foreground text-[10px] uppercase">Avg. Balance</p>
            <p className="font-bold text-cyan-300 mt-0.5">{formatCurrency(summary.average_balance)}</p>
          </div>
        </div>

        {/* Visualization Canvas: 3D Spatial Timeline vs 2D Area Chart */}
        {view3D && data ? (
          <div className="w-full h-[220px] rounded-xl overflow-hidden bg-obsidian-950/60 border border-cyan-500/20">
            <SceneCanvas camera={{ position: [0, 0, 7.5], fov: 40 }}>
              <CashFlow3DTimeline forecast={data} />
            </SceneCanvas>
          </div>
        ) : (
          <div className="w-full h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="balanceGradCyber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  tickFormatter={(v) => formatCurrency(v, true)}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={MIN_SAFE_BALANCE}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  label={{ value: "₹5K Safe Min", position: "insideTopRight", fontSize: 10, fill: "#F59E0B" }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fill="url(#balanceGradCyber)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Low balance alert notification */}
        {!compact && low_balance_alerts.length > 0 && (
          <div className="space-y-1.5 pt-2">
            {low_balance_alerts.slice(0, 1).map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5"
              >
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-amber-300">{formatDateShort(a.date)}</span>
                  <span className="text-amber-200/90"> — Projected balance dips to {formatCurrency(a.projected_balance)}</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{a.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
