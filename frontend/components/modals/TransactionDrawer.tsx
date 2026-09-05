"use client";
import React, { useState } from "react";
import { useBanking, BankTransaction } from "@/lib/banking-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  X, Tag, Repeat, CheckCircle2, ArrowDownLeft, ArrowUpRight,
  Receipt, Shield, Clock,
} from "lucide-react";

interface Props {
  transaction: BankTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: BankTransaction["category"][] = [
  "salary", "rent", "emi", "dining", "shopping", "utilities", "fuel", "transfer", "investment"
];

export function TransactionDrawer({ transaction, isOpen, onClose }: Props) {
  const { updateTransactionCategory, toggleTransactionRecurring } = useBanking();
  const [selectedCat, setSelectedCat] = useState<BankTransaction["category"] | null>(null);

  if (!isOpen || !transaction) return null;

  const isCredit = transaction.type === "credit";

  const handleCategoryChange = (cat: BankTransaction["category"]) => {
    setSelectedCat(cat);
    updateTransactionCategory(transaction.id, cat);
  };

  const handleToggleRecurring = () => {
    toggleTransactionRecurring(transaction.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-obsidian-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-obsidian-900 border-l border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Transaction Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Amount Badge Banner */}
          <div className="text-center py-4 bg-obsidian-950/80 rounded-2xl border border-white/5 space-y-1">
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-1 ${
                isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {isCredit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <h2
              className={`text-3xl font-black font-mono ${
                isCredit ? "text-emerald-400" : "text-white"
              }`}
            >
              {isCredit ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </h2>
            <p className="text-xs text-slate-300 font-medium">{transaction.description}</p>
            <Badge variant="success" className="text-[10px] py-0">
              {transaction.status.toUpperCase()}
            </Badge>
          </div>

          {/* Core Info Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-obsidian-950/40 border border-white/5">
              <span className="text-muted-foreground">Transaction Date:</span>
              <span className="text-white font-medium">{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-obsidian-950/40 border border-white/5">
              <span className="text-muted-foreground">Debited Account:</span>
              <span className="text-white font-medium">{transaction.account}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-obsidian-950/40 border border-white/5">
              <span className="text-muted-foreground">Merchant / Counterparty:</span>
              <span className="text-cyan-300 font-medium">{transaction.merchant || "Direct Transfer"}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-obsidian-950/40 border border-white/5">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="text-slate-400 font-mono text-[11px]">{transaction.id}</span>
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Tag className="h-3.5 w-3.5 text-cyan-400" />
              <span>Re-categorize Transaction</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    (selectedCat || transaction.category) === cat
                      ? "bg-cyan-500 text-obsidian-950 font-bold shadow-glow-cyan/20"
                      : "bg-obsidian-950 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Cadence Toggle */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Repeat className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">Recurring Cadence</p>
                <p className="text-[10px] text-slate-300">Include in 90-day cash flow forecast</p>
              </div>
            </div>
            <button
              onClick={handleToggleRecurring}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                transaction.isRecurring
                  ? "bg-emerald-500 text-obsidian-950 shadow-glow-emerald/30"
                  : "bg-obsidian-950 border border-white/20 text-slate-400"
              }`}
            >
              {transaction.isRecurring ? "Active" : "Mark Recurring"}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <Button onClick={onClose} className="w-full bg-white/10 hover:bg-white/15 text-white text-xs">
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}
