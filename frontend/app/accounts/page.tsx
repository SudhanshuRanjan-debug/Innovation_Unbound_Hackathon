"use client";
import React, { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useBanking, BankAccount } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Wallet, Building, ShieldCheck, Download, ArrowRight,
  TrendingUp, Copy, Check, Send, ChevronRight, FileText,
  CreditCard, Shield, Clock, Sliders, CheckCircle2,
} from "lucide-react";
import { SendMoneyModal } from "@/components/modals/SendMoneyModal";

export default function AccountsPage() {
  const { accounts, transactions } = useBanking();
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || "acc-1");
  const [activeTab, setActiveTab] = useState<"overview" | "info" | "statements" | "goals">("overview");
  const [sendOpen, setSendOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const activeAccount = accounts.find((a) => a.id === selectedAccId) || accounts[0];
  const accountTxs = transactions.filter((t) => t.account === activeAccount.maskedNumber);

  const handleCopy = (text: string) => {
    sounds.click();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStatement = () => {
    sounds.click();
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      sounds.success();
      alert(`Statement for ${activeAccount.name} (${activeAccount.maskedNumber}) generated successfully.`);
    }, 800);
  };

  return (
    <Shell
      title="Accounts Workspace"
      description="Manage salary deposits, digital flexi liquidity, and emergency resilience cushion"
      actions={
        <Button
          size="sm"
          onClick={() => {
            sounds.click();
            setSendOpen(true);
          }}
          className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Transfer Between Accounts
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Account Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">
            Linked Bank Accounts
          </p>

          <div className="space-y-2.5">
            {accounts.map((acc) => {
              const isSelected = acc.id === activeAccount.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccId(acc.id);
                    sounds.tick();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? "bg-gradient-to-br from-cyan-950/50 via-obsidian-900 to-obsidian-950 border-cyan-500/60 shadow-glow-cyan/20"
                      : "bg-obsidian-900/80 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl text-xs ${
                          acc.type === "emergency"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : acc.type === "current"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {acc.type === "emergency" ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : acc.type === "current" ? (
                          <Building className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{acc.name}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{acc.maskedNumber}</span>
                      </div>
                    </div>

                    <Badge
                      variant={acc.type === "emergency" ? "success" : "outline"}
                      className="text-[9px] capitalize"
                    >
                      {acc.type}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-semibold">Available</span>
                    <p className="text-xl font-black text-white font-mono mt-0.5">
                      {formatCurrency(acc.availableBalance)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Account Workspace & Tabs (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-6">
          {/* Workspace Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
                  {activeAccount.type}
                </span>
                <h2 className="text-xl font-bold text-white">{activeAccount.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Account No: {activeAccount.accountNumber} · IFSC: {activeAccount.ifsc}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(activeAccount.accountNumber)}
                className="border-white/10 text-xs text-slate-300 gap-1.5 h-8"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy No."}</span>
              </Button>
              <Button
                size="sm"
                disabled={downloading}
                onClick={handleDownloadStatement}
                className="bg-white/10 hover:bg-white/15 text-white text-xs gap-1.5 h-8"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{downloading ? "Exporting..." : "Statement"}</span>
              </Button>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-obsidian-950 rounded-2xl border border-white/10 text-xs font-semibold overflow-x-auto">
            {[
              { id: "overview", label: "Account Activity" },
              { id: "info", label: "Information & Limits" },
              { id: "statements", label: "Statements & Tax" },
              { id: "goals", label: "Resilience Goals" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any);
                  sounds.tick();
                }}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === t.id
                    ? "bg-cyan-500 text-obsidian-950 font-bold shadow-glow-cyan/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Account Activity */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Available</span>
                  <p className="text-base font-bold text-cyan-400 font-mono">{formatCurrency(activeAccount.availableBalance)}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ledger Balance</span>
                  <p className="text-base font-bold text-white font-mono">{formatCurrency(activeAccount.currentBalance)}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Interest Rate</span>
                  <p className="text-base font-bold text-emerald-400 font-mono">{activeAccount.interestRate || 3.5}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Daily POS Limit</span>
                  <p className="text-base font-bold text-white font-mono">₹5,00,000</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Activity for {activeAccount.maskedNumber}
                </h4>
                <div className="space-y-1.5">
                  {accountTxs.length > 0 ? (
                    accountTxs.map((tx) => {
                      const isCredit = tx.type === "credit";
                      return (
                        <div
                          key={tx.id}
                          className="p-3 rounded-xl bg-obsidian-950 border border-white/5 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{tx.description}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDate(tx.date)} · {tx.category}</p>
                          </div>
                          <p
                            className={`text-xs font-bold font-mono ${
                              isCredit ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">No recent transactions recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Info & Limits */}
          {activeTab === "info" && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 space-y-2">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Account Holder:</span>
                  <span className="font-bold text-white">Arjun Mehta</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Account Classification:</span>
                  <span className="font-bold text-white capitalize">{activeAccount.type} Banking Account</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Branch & IFSC:</span>
                  <span className="font-mono text-cyan-300">Bangalore Indiranagar · {activeAccount.ifsc}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Nomination Status:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Registered
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Statements */}
          {activeTab === "statements" && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 space-y-3">
                <p className="font-bold text-white text-sm">Download E-Statements</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["August 2026", "July 2026", "June 2026", "FY 2025-26 Annual Summary"].map((period) => (
                    <div
                      key={period}
                      className="p-3 rounded-xl bg-obsidian-900 border border-white/5 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-200">{period}</span>
                      <Button
                        size="sm"
                        onClick={handleDownloadStatement}
                        className="bg-white/10 hover:bg-white/20 text-white text-[10px] h-7 px-2.5"
                      >
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Goals */}
          {activeTab === "goals" && (
            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Emergency Safety Reserve Target
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrency(accounts[2]?.availableBalance || 42000)} / ₹1,00,000 (42%)
                  </span>
                </div>
                <div className="h-2.5 bg-obsidian-950 rounded-full overflow-hidden border border-emerald-500/20">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[42%]" />
                </div>
                <p className="text-slate-300 text-xs">
                  Automated SIP of <strong>₹5,000/month</strong> is scheduled for the 5th of each month. Current cushion covers 1.4 months of living expenses.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <SendMoneyModal isOpen={sendOpen} onClose={() => setSendOpen(false)} />
    </Shell>
  );
}
