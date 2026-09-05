"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBanking } from "@/lib/banking-store";
import { BankingSidebar } from "./banking-sidebar";
import { BankingHeader } from "./banking-header";
import { CopilotPanel } from "./CopilotPanel";
import { MobileNav } from "./mobile-nav";
import { ShieldCheck, Lock, Shield } from "lucide-react";

interface ShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Shell({ children, title, description, actions }: ShellProps) {
  const router = useRouter();
  const { isAuthenticated, authLoading } = useBanking();
  const [copilotCollapsed, setCopilotCollapsed] = useState(false);

  // Client-side route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router]);

  // If unauthenticated or loading session, show protected security barrier
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
            <Shield className="h-8 w-8 text-cyan-400" />
          </div>
          <div className="absolute inset-0 rounded-3xl border border-cyan-400/40 animate-ping opacity-25" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-white tracking-wide">
            Verifying Protected Banking Session
          </p>
          <p className="text-xs text-slate-400">
            Redirecting to secure authorization portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-foreground flex selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* 1. Left Column: Desktop Collapsible Banking Sidebar */}
      <BankingSidebar />

      {/* 2. Center Column: Main Workstation View */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Command & Quick Action Header */}
        <BankingHeader
          onToggleCopilot={() => setCopilotCollapsed(!copilotCollapsed)}
          copilotCollapsed={copilotCollapsed}
        />

        {/* Page Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Page Context Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
          </div>

          {/* Dynamic Content */}
          <div className="space-y-6">{children}</div>
        </main>

        {/* Bottom Banking Status Ribbon */}
        <footer className="w-full py-4 border-t border-white/5 bg-obsidian-950/80 text-xs text-muted-foreground mt-12 hidden sm:block">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>FinShield Digital Banking & Financial Resilience Engine</span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Protected Banking Session · Authoritative Calculations
            </p>
          </div>
        </footer>
      </div>

      {/* 3. Right Column: Contextual FinShield Copilot Panel */}
      <CopilotPanel
        isCollapsed={copilotCollapsed}
        onToggleCollapse={() => setCopilotCollapsed(!copilotCollapsed)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
