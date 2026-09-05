"use client";
import React, { useState } from "react";
import { useBanking } from "@/lib/banking-store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import { X, Send, User, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SendMoneyModal({ isOpen, onClose }: Props) {
  const { accounts, sendMoney } = useBanking();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const primaryAcc = accounts[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const numAmount = parseFloat(amount);
    if (!recipient.trim()) {
      setError("Please enter a valid recipient name, UPI ID, or account number.");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }
    if (numAmount > primaryAcc.availableBalance) {
      setError(`Insufficient funds. Available balance: ${formatCurrency(primaryAcc.availableBalance)}`);
      return;
    }

    setLoading(true);
    sounds.click();
    await new Promise((r) => setTimeout(r, 600));

    const ok = await sendMoney(recipient, numAmount, note);
    setLoading(false);
    if (ok) {
      setSuccess(true);
    } else {
      setError("Transfer failed. Please check balance and try again.");
    }
  };

  const handleReset = () => {
    setRecipient("");
    setAmount("");
    setNote("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel-glow border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 bg-obsidian-900/95">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {!success ? (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
                <Send className="h-3 w-3 text-cyan-400" />
                <span>INSTANT PAYMENT TRANSFER</span>
              </div>
              <h3 className="text-xl font-bold text-white">Send Money</h3>
              <p className="text-xs text-muted-foreground mt-1">
                From: <span className="text-white font-medium">{primaryAcc.name}</span> ({primaryAcc.maskedNumber})
              </p>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                Available: {formatCurrency(primaryAcc.availableBalance)}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Recipient (Name, UPI ID, or Mobile)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. rahul.sharma@okaxis or Rahul Sharma"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-obsidian-950/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-cyan-400 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-obsidian-950/80 border border-white/10 rounded-xl text-base font-bold text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                {/* Quick amount chips */}
                <div className="flex items-center gap-2 mt-2">
                  {[500, 1000, 2500, 5000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setAmount(v.toString());
                        sounds.tick();
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-obsidian-950 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40"
                    >
                      +₹{v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Remark / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner share, Rent, Project fee"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-obsidian-950/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 border-white/10 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-obsidian-950 font-bold text-xs shadow-glow-cyan"
                >
                  {loading ? "Processing Transfer..." : "Send Secure Payment"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Successful</h3>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                {formatCurrency(parseFloat(amount) || 0)}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Transferred to <strong className="text-white">{recipient}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Txn ID: FNS-{Date.now().toString().slice(-8)} · Debited from {primaryAcc.maskedNumber}
              </p>
            </div>

            <Button
              onClick={handleReset}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs"
            >
              Done & Return to Banking
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
