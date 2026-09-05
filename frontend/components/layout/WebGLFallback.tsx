"use client";
import React from "react";
import { riskColors, riskLabels } from "@/lib/utils";
import type { RiskCategory } from "@/types";

interface Props {
  score?: number;
  category?: RiskCategory;
  title?: string;
}

export function WebGLFallback({
  score = 63.5,
  category = "watch",
  title = "Resilience Core (2D Mode)",
}: Props) {
  const color = riskColors[category] || "#06B6D4";
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center p-6 bg-obsidian-900/60 rounded-2xl border border-white/10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        }}
      />

      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-obsidian-800"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold text-white">{Math.round(score)}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
            {riskLabels[category]}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4 font-medium">{title}</p>
    </div>
  );
}
