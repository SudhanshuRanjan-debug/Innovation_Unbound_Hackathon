"use client";
import React, { useState } from "react";
import { useBanking, ScheduledPayment } from "@/lib/banking-store";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import { X, CreditCard, CheckCircle2, AlertCircle, Zap, Building, Home, Shield } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPayment?: ScheduledPayment | null;
}

export function PayBillModal({ isOpen, onClose, selectedPayment }: Props) {
  const { payments, accounts, payBill } = useBanking();
  const [chosenId, setChosenId] = useState<string>(selectedPayment?.id || payments[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPayment = payments.find((p) => p.id === chosenId) || selectedPayment || payments[0];
  const primaryAcc = accounts[0];

  const handlePay = async () => {
    if (!currentPayment) return;
    setError("");
    if (currentPayment.amount > primaryAcc.availableBalance) {
      setError(`Insufficient balance to pay ${formatCurrency(currentPayment.amount)}.`);
      return;
    }

    setLoading(true);
    sounds.click();
    await new Promise((r) => setTimeout(r, 600));

    const ok = await payBill(currentPayment.id);
    setLoading(false);
    if (ok) {
      setSuccess(true);
    } else {
      setError("Payment processing failed. Please try again.");
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel-glow border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 bg-obsidian-900/95">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>

        {!success ? (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
                <CreditCard className="h-3 w-3 text-cyan-400" />
                <span>BILL & OBLIGATION SETTLEMENT</span>
              </div>
              <h3 className="text-xl font-bold text-white">Pay Upcoming Bill</h3>
              <p className="text-xs text-muted-foreground mt-1">
                From: <span className="text-white font-medium">{primaryAcc.name}</span> ({primaryAcc.maskedNumber})
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Biller */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Select Bill / Obligation</label>
              <div className="space-y-2">
                {payments.map((p) => {
                  const isChosen = p.id === currentPayment?.id;
                  const isPaid = p.status === "paid";
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!isPaid) {
                          setChosenId(p.id);
                          sounds.tick();
                        }
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isPaid
                          ? "opacity-50 bg-obsidian-950/40 border-white/5 cursor-not-allowed"
                          : isChosen
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-glow-cyan/20"
                          : "bg-obsidian-950 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-cyan-400">
                          {p.category === "rent" ? (
                            <Home className="h-4 w-4" />
                          ) : p.category === "emi" ? (
                            <Building className="h-4 w-4" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Due: {formatDate(p.dueDate)} {isPaid && "· (Paid)"}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-white font-mono">{formatCurrency(p.amount)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {currentPayment && currentPayment.status !== "paid" && (
              <div className="bg-obsidian-950 p-4 rounded-xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Bill Amount:</span>
                  <span className="font-bold text-white">{formatCurrency(currentPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Convenience Fee:</span>
                  <span className="font-bold text-emerald-400">₹0 (Free)</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10 font-bold">
                  <span className="text-white">Total Payable:</span>
                  <span className="text-cyan-400 font-mono text-sm">{formatCurrency(currentPayment.amount)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-white/10 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={loading || !currentPayment || currentPayment.status === "paid"}
                onClick={handlePay}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-obsidian-950 font-bold text-xs shadow-glow-cyan"
              >
                {loading ? "Processing..." : `Pay ${formatCurrency(currentPayment?.amount || 0)}`}
              </Button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Bill Paid Successfully</h3>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                {formatCurrency(currentPayment?.amount || 0)}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Paid to <strong className="text-white">{currentPayment?.biller}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Receipt generated & sent to {primaryAcc.maskedNumber}
              </p>
            </div>

            <Button
              onClick={handleClose}
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
