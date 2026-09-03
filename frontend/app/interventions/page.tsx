"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { InterventionCard } from "@/components/financial/intervention-card";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

const FILTERS = [
  { label: "All",      value: undefined,    icon: AlertTriangle },
  { label: "Pending",  value: "pending",    icon: Clock         },
  { label: "Accepted", value: "accepted",   icon: CheckCircle   },
  { label: "Rejected", value: "rejected",   icon: XCircle       },
] as const;

export default function InterventionsPage() {
  const [filter, setFilter] = useState<string | undefined>("pending");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["interventions", filter],
    queryFn:  () => api.getInterventions(filter),
  });

  const items = Array.isArray(data) ? data : [];

  return (
    <Shell
      title="Interventions"
      description="Recommended actions to improve your financial resilience"
    >
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {FILTERS.map(({ label, value, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No {filter || ""} interventions</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "pending"
                ? "You're all caught up — no action needed right now."
                : "Nothing to show here."}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((intervention) => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              onStatusChange={refetch}
            />
          ))}
        </div>
      )}
    </Shell>
  );
}
