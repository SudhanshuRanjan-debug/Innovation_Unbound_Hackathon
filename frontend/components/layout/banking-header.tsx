"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBanking } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/audio";
import {
  Bell, Search, ShieldCheck, Send, QrCode, CreditCard,
  User, LogOut, ChevronDown, Check, Sparkles, AlertCircle,
  Menu, X, ExternalLink, Command, PanelRight,
} from "lucide-react";
import { SendMoneyModal } from "@/components/modals/SendMoneyModal";
import { ReceiveMoneyModal } from "@/components/modals/ReceiveMoneyModal";
import { PayBillModal } from "@/components/modals/PayBillModal";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { AIExplanationModal } from "@/components/experience/AIExplanationModal";

interface Props {
  onToggleCopilot?: () => void;
  copilotCollapsed?: boolean;
}

export function BankingHeader({ onToggleCopilot, copilotCollapsed }: Props) {
  const router = useRouter();
  const {
    customer,
    resilienceScore,
    riskCategory,
    notifications,
    markAllNotificationsRead,
    switchCustomerPersona,
    logout,
  } = useBanking();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sounds.click();
    logout();
    router.push("/auth");
  };

  return (
    <>
      <header className="h-16 px-4 sm:px-6 bg-obsidian-950/85 border-b border-white/10 sticky top-0 z-30 backdrop-blur-2xl flex items-center justify-between gap-4">
        {/* Mobile Brand */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 text-obsidian-950 flex items-center justify-center font-black text-xs">
              FS
            </div>
            <span className="font-extrabold text-sm text-white">FINSHIELD</span>
          </Link>
        </div>

        {/* Global Fast Command / Search Bar Trigger (⌘K) */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <button
            type="button"
            onClick={() => {
              sounds.click();
              setCommandPaletteOpen(true);
            }}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-obsidian-900/90 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-400 hover:text-white transition-all group shadow-inner"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span>Search commands, accounts, tools...</span>
            </span>
            <kbd className="px-2 py-0.5 rounded-lg bg-obsidian-950 border border-white/10 text-[10px] font-mono text-slate-400 group-hover:text-cyan-300">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              sounds.click();
              setSendOpen(true);
            }}
            className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs h-8 px-3 rounded-xl gap-1.5 font-bold"
          >
            <Send className="h-3.5 w-3.5 text-cyan-400" />
            <span>Send Money</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              sounds.click();
              setPayOpen(true);
            }}
            className="bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs h-8 px-3 rounded-xl gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
            <span>Pay Bills</span>
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Resilience Capsule Pill */}
          <Link
            href="/health"
            onClick={() => sounds.click()}
            className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-900 border border-white/10 hover:border-cyan-500/40 transition-all text-xs"
          >
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Resilience:</span>
            <span className="font-bold text-cyan-400 font-mono">{Math.round(resilienceScore)}</span>
            <Badge
              variant={
                riskCategory === "healthy"
                  ? "success"
                  : riskCategory === "critical"
                  ? "critical"
                  : "warning"
              }
              className="text-[9px] py-0 uppercase"
            >
              {riskCategory}
            </Badge>
          </Link>

          {/* Toggle Copilot Panel (Desktop Workstation) */}
          {onToggleCopilot && (
            <button
              onClick={() => {
                sounds.click();
                onToggleCopilot();
              }}
              className={`hidden 2xl:flex items-center gap-1.5 p-2 rounded-xl border transition-all text-xs ${
                !copilotCollapsed
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-glow-cyan/20"
                  : "bg-obsidian-900 border-white/10 text-slate-400 hover:text-white"
              }`}
              title="Toggle Copilot Panel"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                sounds.click();
                setNotifOpen(!notifOpen);
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-obsidian-900 border border-white/10 p-4 shadow-2xl space-y-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-cyan-400 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                        !n.read ? "bg-cyan-500/10 border-cyan-500/30" : "bg-obsidian-950 border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white text-[11px]">{n.title}</p>
                        <span className="text-[9px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setNotifOpen(false)}
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1 font-semibold"
                        >
                          <span>Review in detail</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile & Demo Persona Switcher */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                sounds.click();
                setProfileOpen(!profileOpen);
              }}
              className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-white/5 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-obsidian-950 flex items-center justify-center font-bold text-xs shadow-glow-cyan/30">
                {customer.avatar}
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xs text-white block leading-tight">{customer.name}</span>
                <span className="text-[10px] text-slate-400 block leading-tight">{customer.role.split("·")[0]}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-obsidian-900 border border-white/10 p-3 shadow-2xl space-y-3 z-50">
                <div className="p-2 border-b border-white/10">
                  <p className="text-xs font-bold text-white">{customer.name}</p>
                  <p className="text-[10px] text-muted-foreground">{customer.email}</p>
                </div>

                {/* Persona Quick Switchers */}
                <div className="space-y-1">
                  <p className="px-2 text-[9px] uppercase tracking-wider font-bold text-slate-500">
                    Switch Demo Persona
                  </p>
                  {[
                    { id: "demo-customer-1", name: "Arjun Mehta", label: "Watchlist · Software Eng" },
                    { id: "demo-customer-2", name: "Priya Sharma", label: "Healthy · Lead Designer" },
                    { id: "demo-customer-3", name: "Rajesh Verma", label: "Critical · Consultant" },
                  ].map((p) => {
                    const isSelected = customer.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchCustomerPersona(p.id);
                          setProfileOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                            : "text-slate-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div>
                          <p className="leading-tight">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground font-normal">{p.label}</p>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette and Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSendModal={() => setSendOpen(true)}
        onOpenPayModal={() => setPayOpen(true)}
        onOpenReceiveModal={() => setReceiveOpen(true)}
      />
      <SendMoneyModal isOpen={sendOpen} onClose={() => setSendOpen(false)} />
      <ReceiveMoneyModal isOpen={receiveOpen} onClose={() => setReceiveOpen(false)} />
      <PayBillModal isOpen={payOpen} onClose={() => setPayOpen(false)} />
      <AIExplanationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        contextType="financial_health"
        contextData={{ risk_score: resilienceScore, risk_category: riskCategory }}
      />
    </>
  );
}
