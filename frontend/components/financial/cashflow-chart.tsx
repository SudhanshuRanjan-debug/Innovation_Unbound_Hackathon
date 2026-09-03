"use client";
import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { CashFlowForecast } from "@/types";

const MIN_SAFE_BALANCE = 5000;

// Subsample to ~30 data points for readability
function subsample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const step = Math.floor(arr.length / n);
  return arr.filter((_, i) => i % step === 0);
}

interface Props { data: CashFlowForecast; compact?: boolean }

export function CashFlowChart({ data, compact = false }: Props) {
  const { daily_projections, summary, current_balance } = data;
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
      <div className="bg-white rounded-lg border shadow-lg p-3 text-sm space-y-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-700">Balance: <span className="font-semibold">{formatCurrency(d.balance)}</span></p>
        {d.inflows > 0 && <p className="text-green-600">+{formatCurrency(d.inflows)}</p>}
        {d.outflows > 0 && <p className="text-red-500">-{formatCurrency(d.outflows)}</p>}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Cash Flow Forecast</CardTitle>
            <CardDescription>90-day projected balance</CardDescription>
          </div>
          {summary.low_balance_alerts.length > 0 && (
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {summary.low_balance_alerts.length} alert{summary.low_balance_alerts.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 mb-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Current</p>
            <p className="font-semibold text-gray-900">{formatCurrency(current_balance)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Min. Projected</p>
            <p className={`font-semibold ${summary.minimum_balance < MIN_SAFE_BALANCE ? "text-red-600" : "text-gray-900"}`}>
              {formatCurrency(summary.minimum_balance)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Avg. Balance</p>
            <p className="font-semibold text-gray-900">{formatCurrency(summary.average_balance)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={compact ? 160 : 260}>
          <AreaChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v, true)}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={MIN_SAFE_BALANCE}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              label={{ value: "Safe min", position: "insideTopRight", fontSize: 10, fill: "#F59E0B" }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#balanceGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Alerts */}
        {!compact && summary.low_balance_alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Low Balance Alerts</p>
            {summary.low_balance_alerts.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm bg-amber-50 rounded-lg p-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-amber-900">{formatDateShort(a.date)}</span>
                  <span className="text-amber-700"> — Balance drops to {formatCurrency(a.projected_balance)}</span>
                  <p className="text-amber-600 text-xs mt-0.5">{a.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
