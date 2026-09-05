"use client";
import React from "react";
import { useBanking, BankCard } from "@/lib/banking-store";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/audio";
import { X, Lock, Unlock, AlertTriangle, ShieldCheck } from "lucide-react";

interface Props {
  card: BankCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FreezeCardModal({ card, isOpen, onClose }: Props) {
  const { toggleFreezeCard } = useBanking();

  if (!isOpen || !card) return null;

  const isFrozen = card.isFrozen;

  const handleConfirm = () => {
    toggleFreezeCard(card.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel-glow border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5 bg-obsidian-900/95 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
            isFrozen
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}
        >
          {isFrozen ? <Unlock className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">
            {isFrozen ? "Unfreeze Card?" : "Freeze Card Temporarily?"}
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {isFrozen
              ? `Unfreezing will restore point-of-sale, online, and ATM transactions on ${card.maskedNumber}.`
              : `Freezing will immediately block all POS, ATM, and online transactions on ${card.maskedNumber}. You can unfreeze anytime.`}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/10 text-slate-300 hover:text-white text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 font-bold text-xs ${
              isFrozen
                ? "bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 shadow-glow-emerald"
                : "bg-red-500 hover:bg-red-400 text-white shadow-glow-red"
            }`}
          >
            {isFrozen ? "Confirm Unfreeze" : "Confirm Freeze"}
          </Button>
        </div>
      </div>
    </div>
  );
}
