"use client";
import React, { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useBanking, BankTransaction } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Receipt, Search, Filter, ArrowDownLeft, ArrowUpRight,
  Download, Tag, Repeat, Sparkles, SlidersHorizontal,
  ChevronRight, Calendar, ArrowRight,
} from "lucide-react";
import { TransactionDrawer } from "@/components/modals/TransactionDrawer";

export default function TransactionsPage() {
  const { transactions } = useBanking();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);

  const categories = ["all", "salary", "rent", "emi", "dining", "shopping", "utilities", "fuel", "investment"];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesCat = catFilter === "all" || tx.category === catFilter;

    return matchesSearch && matchesType && matchesCat;
  });

  const totalDebits = filteredTransactions
    .filter((t) => t.type === "debit")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalCredits = filteredTransactions
    .filter((t) => t.type === "credit")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <Shell
      title="Transaction Ledger"
      description="Inspect categorized cash flows, recurring commitments, and counterparty metadata"
    >
      {/* High-Level Flow Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/10 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Filtered Inflow</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono">+{formatCurrency(totalCredits)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/10 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Filtered Outflow</span>
          <p className="text-2xl font-bold text-rose-400 font-mono">-{formatCurrency(totalDebits)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/10 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Net Movement</span>
          <p className={`text-2xl font-bold font-mono ${totalCredits >= totalDebits ? "text-cyan-400" : "text-amber-400"}`}>
            {totalCredits >= totalDebits ? "+" : ""}{formatCurrency(totalCredits - totalDebits)}
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description, merchant, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Type Filter Toggles */}
          <div className="flex items-center gap-1 p-1 bg-obsidian-950 rounded-2xl border border-white/10 text-xs font-semibold">
            {(["all", "credit", "debit"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTypeFilter(type);
                  sounds.tick();
                }}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  typeFilter === type
                    ? "bg-cyan-500 text-obsidian-950 font-bold shadow-glow-cyan/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[10px] text-muted-foreground uppercase font-bold shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCatFilter(cat);
                sounds.tick();
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold capitalize shrink-0 transition-all ${
                catFilter === cat
                  ? "bg-white/20 text-white border border-cyan-400/50"
                  : "bg-obsidian-950 border border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table (Grouped Timeline) */}
      <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {/* Today Group */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider px-1">
                TODAY
              </span>
              <div className="divide-y divide-white/5 bg-obsidian-950 rounded-2xl border border-white/5 overflow-hidden">
                {filteredTransactions.slice(0, 4).map((tx) => {
                  const isCredit = tx.type === "credit";
                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        sounds.click();
                        setSelectedTx(tx);
                      }}
                      className="p-3.5 hover:bg-white/[0.03] transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 ${
                            isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-300"
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>{formatDate(tx.date)}</span>
                            <span>·</span>
                            <span className="capitalize text-slate-400">{tx.category}</span>
                            <span>·</span>
                            <span className="font-mono">{tx.account}</span>
                            {tx.isRecurring && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-semibold">
                                Recurring
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm sm:text-base font-bold font-mono ${
                            isCredit ? "text-emerald-400" : "text-white"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </p>
                        <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Details →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Earlier Group */}
            {filteredTransactions.length > 4 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider px-1">
                  EARLIER THIS MONTH
                </span>
                <div className="divide-y divide-white/5 bg-obsidian-950 rounded-2xl border border-white/5 overflow-hidden">
                  {filteredTransactions.slice(4).map((tx) => {
                    const isCredit = tx.type === "credit";
                    return (
                      <div
                        key={tx.id}
                        onClick={() => {
                          sounds.click();
                          setSelectedTx(tx);
                        }}
                        className="p-3.5 hover:bg-white/[0.03] transition-all flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-300"
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span>{formatDate(tx.date)}</span>
                              <span>·</span>
                              <span className="capitalize text-slate-400">{tx.category}</span>
                              <span>·</span>
                              <span className="font-mono">{tx.account}</span>
                              {tx.isRecurring && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-semibold">
                                  Recurring
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={`text-sm sm:text-base font-bold font-mono ${
                              isCredit ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                          <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Details →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <Receipt className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No matching transactions</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or filter tags.</p>
          </div>
        )}
      </div>

      <TransactionDrawer
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </Shell>
  );
}
