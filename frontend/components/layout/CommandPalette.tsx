"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBanking } from "@/lib/banking-store";
import { sounds } from "@/lib/audio";
import {
  Search, Home, Wallet, Receipt, CreditCard, Lock,
  ShieldCheck, TrendingUp, Sparkles, Zap, Award,
  Calculator, Users, Send, ArrowRight, X, Command,
  UserCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenSendModal: () => void;
  onOpenPayModal: () => void;
  onOpenReceiveModal: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenSendModal,
  onOpenPayModal,
  onOpenReceiveModal,
}: Props) {
  const router = useRouter();
  const { switchCustomerPersona } = useBanking();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          sounds.click();
          // parent controls open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (href: string) => {
    sounds.click();
    router.push(href);
    onClose();
  };

  const navItems = [
    { label: "Dashboard / Home", href: "/dashboard", icon: Home, category: "Navigation" },
    { label: "My Accounts & Balances", href: "/accounts", icon: Wallet, category: "Navigation" },
    { label: "Transaction History", href: "/transactions", icon: Receipt, category: "Navigation" },
    { label: "Payments & Upcoming Bills", href: "/payments", icon: CreditCard, category: "Navigation" },
    { label: "Card Controls & Limits", href: "/cards", icon: Lock, category: "Navigation" },
    { label: "Financial Health Diagnostics", href: "/health", icon: ShieldCheck, category: "FinShield" },
    { label: "Cash Flow & 90-Day Forecast", href: "/forecast", icon: TrendingUp, category: "FinShield" },
    { label: "Intervention Decision Center", href: "/interventions", icon: Sparkles, category: "FinShield" },
    { label: "Temporary Liquidity Bridge", href: "/overdraft", icon: Zap, category: "FinShield" },
    { label: "Compare Loans Marketplace", href: "/loans", icon: Award, category: "FinShield" },
    { label: "What-If Decision Simulator", href: "/simulator", icon: Calculator, category: "FinShield" },
    { label: "Bank Officer Risk Center", href: "/officer", icon: Users, category: "Management" },
  ];

  const actionItems = [
    {
      label: "Send Money / Transfer",
      icon: Send,
      category: "Quick Actions",
      action: () => {
        onClose();
        onOpenSendModal();
      },
    },
    {
      label: "Pay Upcoming Bill",
      icon: CreditCard,
      category: "Quick Actions",
      action: () => {
        onClose();
        onOpenPayModal();
      },
    },
    {
      label: "Receive Money / Show QR",
      icon: Wallet,
      category: "Quick Actions",
      action: () => {
        onClose();
        onOpenReceiveModal();
      },
    },
  ];

  const personaItems = [
    {
      label: "Switch to Arjun Mehta (Watchlist / Software Eng)",
      icon: UserCheck,
      category: "Demo Personas",
      action: () => {
        switchCustomerPersona("demo-customer-1");
        onClose();
      },
    },
    {
      label: "Switch to Priya Sharma (Healthy / Lead Designer)",
      icon: UserCheck,
      category: "Demo Personas",
      action: () => {
        switchCustomerPersona("demo-customer-2");
        onClose();
      },
    },
    {
      label: "Switch to Rajesh Verma (Critical / Consultant)",
      icon: UserCheck,
      category: "Demo Personas",
      action: () => {
        switchCustomerPersona("demo-customer-3");
        onClose();
      },
    },
  ];

  const allItems = [...actionItems, ...navItems, ...personaItems];

  const filtered = allItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-obsidian-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden glass-panel-glow">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-obsidian-950">
          <Search className="h-5 w-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, feature, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if ("href" in item && item.href) navigateTo(item.href);
                  else if ("action" in item && item.action) item.action();
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-obsidian-950 text-cyan-400 group-hover:text-cyan-300 border border-white/5">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{item.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-cyan-400 text-xs">
                  <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100">Select</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching actions found for "{query}"
            </div>
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="px-5 py-2.5 bg-obsidian-950/80 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">↑↓</kbd> Navigate
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px] ml-2">ESC</kbd> Close
          </span>
          <span className="text-cyan-400 font-medium">FinShield Fast Command Hub</span>
        </div>
      </div>
    </div>
  );
}
