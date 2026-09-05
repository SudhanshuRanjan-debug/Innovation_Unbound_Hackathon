"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sounds } from "@/lib/audio";
import {
  Home, Wallet, ShieldCheck, Award, MoreHorizontal,
  Receipt, CreditCard, Lock, TrendingUp, Sparkles,
  Zap, Calculator, Users, X,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Money", href: "/accounts", icon: Wallet },
    { label: "Health", href: "/health", icon: ShieldCheck },
    { label: "Loans", href: "/loans", icon: Award },
  ];

  const fullMenu = [
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Payments & Bills", href: "/payments", icon: CreditCard },
    { label: "Manage Cards", href: "/cards", icon: Lock },
    { label: "Cash Flow Horizon", href: "/forecast", icon: TrendingUp },
    { label: "Intervention Center", href: "/interventions", icon: Sparkles },
    { label: "Liquidity Bridge", href: "/overdraft", icon: Zap },
    { label: "What-If Simulator", href: "/simulator", icon: Calculator },
    { label: "Risk Command Center", href: "/officer", icon: Users },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-obsidian-950/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {mainTabs.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => sounds.click()}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-cyan-400 drop-shadow-glow" : ""}`} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          onClick={() => {
            sounds.click();
            setDrawerOpen(true);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            drawerOpen ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* Full Feature Drawer Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-obsidian-900 border-t border-white/10 rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm text-white">All FinShield Banking & Intelligence</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {fullMenu.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => {
                      sounds.click();
                      setDrawerOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-semibold border transition-all ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-obsidian-950 border-white/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
