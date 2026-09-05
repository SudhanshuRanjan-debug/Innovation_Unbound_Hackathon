"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import { CustomerSwitcher } from "@/components/experience/CustomerSwitcher";
import { AIExplanationModal } from "@/components/experience/AIExplanationModal";
import {
  Shield, LayoutDashboard, HeartPulse, TrendingUp,
  AlertTriangle, CreditCard, Calculator, ShieldAlert,
  Brain, Menu, X, Compass, Wallet, Receipt, Lock,
  LogIn,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/explore", label: "Master Journey", icon: Compass },
  { href: "/auth", label: "Sign In", icon: LogIn },
  { href: "/dashboard", label: "Banking Home", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/cards", label: "Cards", icon: Lock },
  { href: "/health", label: "Resilience", icon: HeartPulse },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/interventions", label: "Interventions", icon: AlertTriangle },
  { href: "/overdraft", label: "Liquidity Bridge", icon: CreditCard },
  { href: "/loans", label: "Loans", icon: Shield },
  { href: "/simulator", label: "Simulator", icon: Calculator },
  { href: "/officer", label: "Bank Officer", icon: ShieldAlert },
];

export function Navigation() {
  const pathname = usePathname();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-obsidian-950/80 backdrop-blur-xl border-b border-white/10 shadow-glass-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => sounds.click()}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-obsidian-950 shadow-glow-cyan/50 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                FinShield
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Digital Bank
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Floating Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-2xl bg-obsidian-900/80 border border-white/10 backdrop-blur-md">
            {[
              { href: "/dashboard", label: "Banking Home", icon: LayoutDashboard },
              { href: "/accounts", label: "Accounts", icon: Wallet },
              { href: "/transactions", label: "Transactions", icon: Receipt },
              { href: "/cards", label: "Cards", icon: Lock },
              { href: "/health", label: "Resilience", icon: HeartPulse },
              { href: "/forecast", label: "Forecast", icon: TrendingUp },
              { href: "/interventions", label: "Interventions", icon: AlertTriangle },
              { href: "/overdraft", label: "Liquidity Bridge", icon: CreditCard },
              { href: "/loans", label: "Loans", icon: Shield },
              { href: "/simulator", label: "Simulator", icon: Calculator },
            ].map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => sounds.hover()}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", active ? "text-cyan-400" : "text-slate-400")} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* AI Advisor Modal Trigger */}
            <button
              onClick={() => {
                sounds.click();
                setAiModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 hover:border-purple-500/60 transition-all shadow-glow-purple/20"
            >
              <Brain className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Customer Switcher */}
            <CustomerSwitcher />

            {/* Sign In CTA */}
            <Link
              href="/auth"
              onClick={() => sounds.click()}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs shadow-glow-cyan transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-obsidian-900 border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 p-4 rounded-2xl bg-obsidian-900 border border-white/10 space-y-2 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => {
                      sounds.click();
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all",
                      active
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-300 hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-4 w-4 text-cyan-400" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between">
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-cyan-500 text-obsidian-950 font-bold text-xs"
              >
                Sign In / Switch Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Neural AI Advisory Modal */}
      <AIExplanationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="financial_health"
      />
    </>
  );
}
