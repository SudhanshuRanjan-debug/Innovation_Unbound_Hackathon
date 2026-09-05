"use client";
import React, { useState } from "react";
import {
  ArrowDownCircle, RefreshCw, CreditCard, Wallet,
  TrendingUp, CheckCircle, XCircle, ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { sounds } from "@/lib/audio";
import confetti from "canvas-confetti";
import type { Intervention } from "@/types";

import { useBanking } from "@/lib/banking-store";

const typeConfig = {
  spending_adjustment: { icon: ArrowDownCircle, label: "Spending Calibration", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  repayment_restructure: { icon: RefreshCw, label: "Repayment Restructure", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  overdraft: { icon: CreditCard, label: "Short-term Overdraft", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  loan: { icon: CreditCard, label: "Best-Fit Loan Recommendation", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  emergency_fund: { icon: Wallet, label: "Emergency Reserve Fund", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" },
};

const priorityVariant: Record<string, "critical" | "warning" | "info" | "secondary"> = {
  critical: "critical", high: "warning", medium: "info", low: "secondary",
};

interface Props {
  intervention: Intervention;
  onStatusChange?: () => void;
  compact?: boolean;
}

export function InterventionCard({ intervention, onStatusChange, compact = false }: Props) {
  const { applyInterventionPlan } = useBanking();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const cfg = typeConfig[intervention.intervention_type] || typeConfig.loan;
  const Icon = cfg.icon;

  const handleAccept = async () => {
    sounds.click();
    setLoading("accept");
    try {
      await api.acceptIntervention(intervention.id);
      applyInterventionPlan(intervention.recommendation_text || cfg.label, 5000, 8.5);
      onStatusChange?.();
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    sounds.click();
    setLoading("reject");
    try {
      await api.rejectIntervention(intervention.id);
      onStatusChange?.();
    } finally {
      setLoading(null);
    }
  };

  const isPending = intervention.status === "pending";

  return (
    <Card
      className={cn(
        "glass-panel hover:border-cyan-500/40 transition-all duration-300",
        intervention.status !== "pending" && "opacity-60 bg-obsidian-900/40"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className={cn("rounded-xl p-2.5 shrink-0 border", cfg.color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm text-white">{cfg.label}</p>
              <Badge variant={priorityVariant[intervention.priority] || "secondary"} className="text-[10px] py-0 px-2">
                {intervention.priority.charAt(0).toUpperCase() + intervention.priority.slice(1)} Priority
              </Badge>
              {intervention.status !== "pending" && (
                <Badge variant={intervention.status === "accepted" ? "success" : "secondary"} className="text-[10px] py-0 px-2 capitalize">
                  {intervention.status}
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              {intervention.recommendation_text}
            </p>

            {intervention.expected_impact && !compact && (
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{intervention.expected_impact}</span>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-2">{formatDate(intervention.recommended_date)}</p>
          </div>
        </div>

        {isPending && !compact && (
          <div className="flex gap-2.5 mt-4 pt-3 border-t border-white/10 sm:pl-12">
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={!!loading}
              className="h-8 text-xs bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-bold"
            >
              {loading === "accept" ? "Applying..." : <><CheckCircle className="h-3.5 w-3.5 mr-1" />Accept Intervention</>}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={!!loading}
              className="h-8 text-xs border-white/15 text-slate-400 hover:text-white"
            >
              {loading === "reject" ? "Dismissing..." : <><XCircle className="h-3.5 w-3.5 mr-1" />Dismiss</>}
            </Button>
          </div>
        )}

        {compact && isPending && (
          <div className="flex justify-end mt-2">
            <ChevronRight className="h-4 w-4 text-cyan-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
