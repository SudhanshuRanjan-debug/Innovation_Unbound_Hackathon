"use client";
import React, { useState } from "react";
import { useBanking } from "@/lib/banking-store";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/audio";
import { X, QrCode, Copy, Check, ShieldCheck } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiveMoneyModal({ isOpen, onClose }: Props) {
  const { customer, accounts } = useBanking();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const upiId = `${customer.name.toLowerCase().replace(/\s+/g, "")}@finshield`;
  const primaryAcc = accounts[0];

  const handleCopy = () => {
    sounds.click();
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <QrCode className="h-3.5 w-3.5 text-cyan-400" />
            <span>RECEIVE INSTANT FUNDS</span>
          </div>
          <h3 className="text-xl font-bold text-white">Receive Money</h3>
          <p className="text-xs text-muted-foreground">Scan QR or share your FinShield UPI ID</p>
        </div>

        {/* QR Code Graphic */}
        <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg relative overflow-hidden">
          <div className="w-full h-full border-4 border-obsidian-950 p-2 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-10 h-10 bg-obsidian-950 rounded-sm" />
              <div className="w-10 h-10 bg-obsidian-950 rounded-sm" />
            </div>
            <div className="text-center font-bold text-[10px] text-obsidian-950 tracking-wider">
              FINSHIELD UPI
            </div>
            <div className="flex justify-between items-end">
              <div className="w-10 h-10 bg-obsidian-950 rounded-sm" />
              <div className="w-6 h-6 border-2 border-cyan-600 rounded-sm" />
            </div>
          </div>
        </div>

        {/* UPI ID Pill with Copy button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-950 border border-white/10 text-xs">
            <span className="font-mono text-cyan-300 truncate">{upiId}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-semibold pl-2 shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="text-left bg-obsidian-950/60 p-3 rounded-xl border border-white/5 space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Linked Account:</span>
              <span className="font-medium text-white">{primaryAcc.maskedNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IFSC:</span>
              <span className="font-mono text-cyan-300">{primaryAcc.ifsc}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
