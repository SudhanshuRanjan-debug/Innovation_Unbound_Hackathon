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
  critical: "#EF4444",
  at_risk: "#F59E0B",
  watch: "#06B6D4",
  healthy: "#10B981",
};

export const riskHexColors: Record<RiskCategory, number> = {
  critical: 0xef4444,
  at_risk: 0xf59e0b,
  watch: 0x06b6d4,
  healthy: 0x10b981,
};

export const riskBgClasses: Record<RiskCategory, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30 shadow-glow-red/20",
  at_risk: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-glow-amber/20",
  watch: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-glow-cyan/20",
  healthy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-glow-emerald/20",
};

export const riskLabels: Record<RiskCategory, string> = {
  critical: "Critical Distress",
  at_risk: "At Risk",
  watch: "Watchlist",
  healthy: "Resilient & Healthy",
};

export function getRiskCategory(score: number): RiskCategory {
  if (score >= 70) return "healthy";
  if (score >= 50) return "watch";
  if (score >= 30) return "at_risk";
  return "critical";
}

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
