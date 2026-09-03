import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency Formatting ────────────────────────────────────────────────────
export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 10_00_000) return `₹${(value / 10_00_000).toFixed(1)}L`;
    if (Math.abs(value) >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

// ─── Risk Helpers ────────────────────────────────────────────────────────────
export const riskColors: Record<RiskCategory, string> = {
  critical: "#DC2626",
  at_risk: "#F59E0B",
  watch: "#3B82F6",
  healthy: "#10B981",
};

export const riskBgClasses: Record<RiskCategory, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  at_risk: "bg-amber-50 text-amber-700 border-amber-200",
  watch: "bg-blue-50 text-blue-700 border-blue-200",
  healthy: "bg-green-50 text-green-700 border-green-200",
};

export const riskLabels: Record<RiskCategory, string> = {
  critical: "Critical",
  at_risk: "At Risk",
  watch: "Watch",
  healthy: "Healthy",
};

// ─── Date Helpers ────────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
