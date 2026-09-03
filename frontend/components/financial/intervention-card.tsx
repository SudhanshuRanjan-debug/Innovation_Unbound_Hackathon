"use client";
import React, { useState } from "react";
import {
  ArrowDownCircle, RefreshCw, CreditCard, Wallet,
  TrendingUp, CheckCircle, XCircle, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Intervention } from "@/types";

const typeConfig = {
  spending_adjustment: { icon: ArrowDownCircle, label: "Spending Adjustment", color: "text-blue-600 bg-blue-50" },
  repayment_restructure: { icon: RefreshCw, label: "Repayment Restructure", color: "text-purple-600 bg-purple-50" },
  overdraft: { icon: CreditCard, label: "Short-term Overdraft", color: "text-amber-600 bg-amber-50" },
  loan: { icon: CreditCard, label: "Loan Recommendation", color: "text-gray-600 bg-gray-50" },
  emergency_fund: { icon: Wallet, label: "Emergency Fund", color: "text-green-600 bg-green-50" },
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
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const cfg = typeConfig[intervention.intervention_type] || typeConfig.loan;
  const Icon = cfg.icon;

  const handleAccept = async () => {
    setLoading("accept");
    try { await api.acceptIntervention(intervention.id); onStatusChange?.(); }
    finally { setLoading(null); }
  };
  const handleReject = async () => {
    setLoading("reject");
    try { await api.rejectIntervention(intervention.id); onStatusChange?.(); }
    finally { setLoading(null); }
  };

  const isPending = intervention.status === "pending";

  return (
    <Card className={cn("transition-all", intervention.status !== "pending" && "opacity-70")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("rounded-lg p-2 shrink-0", cfg.color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-gray-900">{cfg.label}</p>
              <Badge variant={priorityVariant[intervention.priority] || "secondary"} className="text-xs">
                {intervention.priority.charAt(0).toUpperCase() + intervention.priority.slice(1)}
              </Badge>
              {intervention.status !== "pending" && (
                <Badge variant={intervention.status === "accepted" ? "success" : "secondary"} className="text-xs capitalize">
                  {intervention.status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-snug">{intervention.recommendation_text}</p>
            {intervention.expected_impact && !compact && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-green-700">
                <TrendingUp className="h-3 w-3" />
                <span>{intervention.expected_impact}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{formatDate(intervention.recommended_date)}</p>
          </div>
        </div>

        {isPending && !compact && (
          <div className="flex gap-2 mt-3 pl-11">
            <Button size="sm" onClick={handleAccept} disabled={!!loading} className="h-7 text-xs">
              {loading === "accept" ? "…" : <><CheckCircle className="h-3 w-3 mr-1" />Accept</>}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReject} disabled={!!loading} className="h-7 text-xs">
              {loading === "reject" ? "…" : <><XCircle className="h-3 w-3 mr-1" />Dismiss</>}
            </Button>
          </div>
        )}

        {compact && isPending && (
          <div className="flex justify-end mt-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
