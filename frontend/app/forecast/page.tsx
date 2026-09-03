"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { CashFlowChart } from "@/components/financial/cashflow-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { AlertTriangle, TrendingDown, TrendingUp, Calendar } from "lucide-react";

export default function ForecastPage() {
  const [days, setDays] = useState(90);
  const { data, isLoading } = useQuery({
    queryKey: ["forecast", days],
    queryFn:  () => api.getForecast(days),
  });

  // Build monthly inflow/outflow summary
  const monthlySummary = React.useMemo(() => {
    if (!data) return [];
    const map: Record<string, { month: string; inflows: number; outflows: number }> = {};
    for (const p of data.daily_projections) {
      const month = p.date.slice(0, 7);
      if (!map[month]) map[month] = { month, inflows: 0, outflows: 0 };
      map[month].inflows  += p.inflows;
      map[month].outflows += p.outflows;
    }
    return Object.values(map).map((m) => ({
      ...m,
      inflows:  Math.round(m.inflows),
      outflows: Math.round(m.outflows),
    }));
  }, [data]);

  return (
    <Shell title="Cash Flow Forecast" description="Projected balance and liquidity gaps over the next 90 days">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Forecast period:</span>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {/* Summary stats */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(data.current_balance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Min. Projected</p>
                <p className={`text-xl font-bold ${data.summary.minimum_balance < 0 ? "text-red-600" : data.summary.minimum_balance < 5000 ? "text-amber-600" : "text-gray-900"}`}>
                  {formatCurrency(data.summary.minimum_balance)}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(data.summary.minimum_balance_date)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Avg. Balance</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(data.summary.average_balance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Low Balance Days</p>
                <p className={`text-xl font-bold ${data.summary.negative_balance_days > 0 ? "text-red-600" : "text-green-600"}`}>
                  {data.summary.negative_balance_days}
                </p>
                <p className="text-xs text-muted-foreground">days below zero</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main chart */}
        {isLoading
          ? <div className="h-80 bg-gray-50 rounded-xl animate-pulse" />
          : data && <CashFlowChart data={data} />
        }

        {/* Monthly bar chart */}
        {monthlySummary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlySummary} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCurrency(v, true)} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
                  <Tooltip
                    formatter={(v: number, name: string) => [formatCurrency(v), name === "inflows" ? "Income" : "Expenses"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="inflows"  name="Income"   fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflows" name="Expenses" fill="#F87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {data && Array.isArray(data.summary.low_balance_alerts) && data.summary.low_balance_alerts.length > 0 && (
          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base text-amber-800">Low Balance Alerts</CardTitle>
                <Badge variant="warning">{data.summary.low_balance_alerts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.summary.low_balance_alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50 rounded-lg p-3">
                  <Calendar className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">{formatDate(alert.date)}</p>
                    <p className="text-sm text-amber-700">
                      Balance drops to <span className="font-semibold">{formatCurrency(alert.projected_balance)}</span>
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">{alert.reason}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
