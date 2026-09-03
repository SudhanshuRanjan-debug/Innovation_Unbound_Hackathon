"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { LoanProductResult } from "@/types";
import {
  Star, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  IndianRupee, Percent, Calendar, CircleCheck, CircleX,
} from "lucide-react";

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#DC2626";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="font-medium w-8 text-right" style={{ color }}>{Math.round(score)}</span>
    </div>
  );
}

function ProductCard({ product, index }: { product: LoanProductResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isBest = product.is_best_fit;
  const impactColor = product.impact.risk_score_change >= 0 ? "text-green-600" : "text-red-600";
  const ImpactIcon  = product.impact.risk_score_change >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className={`transition-all ${isBest ? "ring-2 ring-blue-500 shadow-md" : ""}`}>
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${
              isBest ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {index + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{product.lender_name}</p>
                {isBest && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                    <Star className="h-3 w-3 fill-blue-600" /> Best Fit
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{product.product_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(product.emi)}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="font-semibold text-sm text-gray-900">{product.interest_rate}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="font-semibold text-sm text-gray-900">{formatCurrency(product.total_cost, true)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Risk Impact</p>
            <p className={`font-semibold text-sm flex items-center justify-center gap-0.5 ${impactColor}`}>
              <ImpactIcon className="h-3 w-3" />
              {Math.abs(product.impact.risk_score_change).toFixed(1)} pts
            </p>
          </div>
        </div>

        {/* Composite score bar */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground shrink-0">Composite Score</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${product.scores.composite_score}%` }}
            />
          </div>
          <span className="text-sm font-bold text-blue-600">{product.scores.composite_score}</span>
        </div>

        {/* Affordability */}
        <div className={`flex items-center gap-1.5 text-xs mb-3 ${
          product.affordability.affordable ? "text-green-700" : "text-red-600"
        }`}>
          {product.affordability.affordable
            ? <CircleCheck className="h-3.5 w-3.5" />
            : <CircleX className="h-3.5 w-3.5" />
          }
          <span>
            EMI {(product.affordability.emi_to_income_ratio * 100).toFixed(0)}% of income
            {" · "}Monthly surplus: {formatCurrency(product.affordability.monthly_surplus_after_emi)}
          </span>
        </div>

        {isBest && product.recommendation_reason && (
          <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2.5 leading-relaxed">
            {product.recommendation_reason}
          </p>
        )}

        {/* Expand / collapse */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gray-700 mt-3"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Hide details" : "Show score breakdown"}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 pt-3 border-t">
            <ScoreBar label="Total Cost"      score={product.scores.total_cost_score} />
            <ScoreBar label="Affordability"   score={product.scores.affordability_score} />
            <ScoreBar label="Risk Impact"     score={product.scores.resilience_impact_score} />
            <ScoreBar label="Tenure Match"    score={product.scores.tenure_score} />
            <ScoreBar label="Fees"            score={product.scores.fees_score} />
            <ScoreBar label="Flexibility"     score={product.scores.flexibility_score} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoansPage() {
  const [amount,  setAmount]  = useState(200000);
  const [tenure,  setTenure]  = useState(24);
  const [type,    setType]    = useState("personal");
  const [results, setResults] = useState<LoanProductResult[] | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.compareLoans(amount, tenure, type),
    onSuccess:  (data) => setResults(data.products),
  });

  return (
    <Shell title="Loan Comparison" description="Find the best-fit loan — not just the cheapest rate">
      <div className="space-y-6">
        {/* Input form */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Loan Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  min={10000} max={5000000} step={10000}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(amount)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Tenure (months)</label>
                <input
                  type="number"
                  value={tenure}
                  min={6} max={120} step={6}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground mt-0.5">{tenure} months ({(tenure / 12).toFixed(1)} years)</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Loan Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="personal">Personal Loan</option>
                  <option value="home">Home Loan</option>
                  <option value="auto">Auto Loan</option>
                  <option value="education">Education Loan</option>
                </select>
              </div>
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full md:w-auto">
              {mutation.isPending ? "Comparing…" : "Compare Loan Products"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && results.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No eligible products found for your profile and requirements.
            </CardContent>
          </Card>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {results.length} products compared — ranked by best fit
              </p>
              <Badge variant="info">Weights: Cost 30% · Affordability 25% · Risk 20%</Badge>
            </div>
            {results.map((product, i) => (
              <ProductCard key={product.product_id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
