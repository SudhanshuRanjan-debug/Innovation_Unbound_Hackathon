"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBanking } from "@/lib/banking-store";
import { sounds } from "@/lib/audio";
import {
  Home, Wallet, Receipt, CreditCard, ShieldCheck,
  TrendingUp, Sparkles, Zap, Award, Calculator,
  Users, ChevronRight, Lock, Bell, CheckCircle2,
} from "lucide-react";

export function BankingSidebar() {
  const pathname = usePathname();
  const { resilienceScore, riskCategory } = useBanking();

  const bankingNav = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "My Accounts", href: "/accounts", icon: Wallet },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Payments & Bills", href: "/payments", icon: CreditCard },
    { label: "Cards", href: "/cards", icon: Lock },
  ];

  const finshieldNav = [
    { label: "Financial Health", href: "/health", icon: ShieldCheck, badge: `${Math.round(resilienceScore)}` },
    { label: "Cash Flow Horizon", href: "/forecast", icon: TrendingUp },
    { label: "Intervention Center", href: "/interventions", icon: Sparkles },
    { label: "Liquidity Bridge", href: "/overdraft", icon: Zap },
    { label: "Compare Loans", href: "/loans", icon: Award },
    { label: "What-If Simulator", href: "/simulator", icon: Calculator },
  ];

  const adminNav = [
    { label: "Risk Command Center", href: "/officer", icon: Users },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between bg-obsidian-900/90 border-r border-white/10 min-h-screen p-4 sticky top-0 backdrop-blur-xl">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link
          href="/dashboard"
          onClick={() => sounds.click()}
          className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-obsidian-950 flex items-center justify-center font-black shadow-glow-cyan/50 text-sm">
            FS
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block group-hover:text-cyan-300 transition-colors">
              FINSHIELD
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase block">
              Digital Banking
            </span>
          </div>
        </Link>

        {/* 1. BANKING SECTION */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Banking Core
          </p>
          <nav className="space-y-1 pt-1">
            {bankingNav.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => sounds.click()}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-cyan-500 text-obsidian-950 font-bold shadow-glow-cyan/40"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-obsidian-950" : "text-cyan-400/80 group-hover:text-cyan-300"}`} />
                    <span>{label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 2. FINSHIELD INTELLIGENCE SECTION */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between px-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              FinShield Intelligence
            </p>
          </div>
          <nav className="space-y-1 pt-1">
            {finshieldNav.map(({ label, href, icon: Icon, badge }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => sounds.click()}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-teal-400 text-obsidian-950 font-bold shadow-glow-cyan/40"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-obsidian-950" : "text-teal-400/80 group-hover:text-teal-300"}`} />
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-obsidian-950 text-cyan-300"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. STAFF / OFFICER SECTION */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <p className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Bank Staff
          </p>
          <nav className="space-y-1 pt-1">
            {adminNav.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => sounds.click()}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-purple-500 text-white font-bold shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-purple-400" />
                    <span>{label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Resilience Health Pill at bottom */}
      <div className="pt-4 border-t border-white/10">
        <Link
          href="/health"
          className="block p-3 rounded-2xl bg-obsidian-950/80 border border-cyan-500/30 hover:border-cyan-400/60 transition-all group"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Resilience Grade</span>
            <span className="font-bold text-cyan-400 font-mono">{Math.round(resilienceScore)} / 100</span>
          </div>
          <div className="h-1.5 bg-obsidian-900 rounded-full overflow-hidden mt-2 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-700"
              style={{ width: `${resilienceScore}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center justify-between">
            <span>Status: <strong className="text-white capitalize">{riskCategory}</strong></span>
            <span className="text-cyan-400 group-hover:underline">Deep-Dive →</span>
          </p>
        </Link>
      </div>
    </aside>
  );
}
