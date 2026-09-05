"use client";
import React, { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useBanking, ScheduledPayment } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  CreditCard, Calendar, CheckCircle2, Clock, AlertTriangle,
  Plus, Send, QrCode, ArrowRight, ShieldCheck, Zap,
} from "lucide-react";
import { PayBillModal } from "@/components/modals/PayBillModal";
import { SendMoneyModal } from "@/components/modals/SendMoneyModal";
import { ReceiveMoneyModal } from "@/components/modals/ReceiveMoneyModal";

export default function PaymentsPage() {
  const { payments } = useBanking();
  const [selectedPayment, setSelectedPayment] = useState<ScheduledPayment | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  const pendingPayments = payments.filter((p) => p.status !== "paid");
  const paidPayments = payments.filter((p) => p.status === "paid");

  const totalDue = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  const handlePayClick = (p: ScheduledPayment) => {
    sounds.click();
    setSelectedPayment(p);
    setPayModalOpen(true);
  };

  return (
    <Shell
      title="Payments & Obligations Hub"
      description="Manage upcoming monthly utility bills, loan EMIs, rent, and scheduled recurring debits"
    >
      {/* Top Action Ribbon */}
      <div className="rounded-3xl bg-gradient-to-r from-obsidian-900 via-obsidian-950 to-cyan-950/20 border border-white/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            Total Upcoming Obligations
          </span>
          <p className="text-3xl font-black text-amber-400 font-mono">
            {formatCurrency(totalDue)}
          </p>
          <p className="text-xs text-slate-400">
            {pendingPayments.length} payments due in the next 15 days
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            size="sm"
            onClick={() => {
              sounds.click();
              setSelectedPayment(null);
              setPayModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs h-10 px-4 rounded-xl gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Pay a Bill</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              sounds.click();
              setSendOpen(true);
            }}
            className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 font-bold text-xs h-10 px-4 rounded-xl gap-2"
          >
            <Send className="h-4 w-4 text-cyan-400" />
            <span>Send Money</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              sounds.click();
              setReceiveOpen(true);
            }}
            className="bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs h-10 px-4 rounded-xl gap-2"
          >
            <QrCode className="h-4 w-4 text-teal-400" />
            <span>Scan & Pay / QR</span>
          </Button>
        </div>
      </div>

      {/* Two Column Layout: Upcoming vs Settled */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Pending & Upcoming Bills (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Upcoming Due Soon ({pendingPayments.length})
            </h3>
            <Badge variant="warning" className="text-[9px] uppercase">
              Action Required
            </Badge>
          </div>

          <div className="space-y-3">
            {pendingPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-obsidian-950 border border-white/5 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{p.title}</p>
                    {p.autoDebit && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[9px] font-bold border border-cyan-500/30">
                        Auto-Debit Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Due on {formatDate(p.dueDate)} (
                    <strong className="text-amber-400">{p.daysLeft} days left</strong>)
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">Biller ID: {p.biller}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <p className="text-base font-black text-white font-mono">
                    {formatCurrency(p.amount)}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handlePayClick(p)}
                    className="bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs h-8 px-4 rounded-xl"
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Settled Recently & Auto-Debit Rules (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Settled Recently */}
          <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Settled Recently ({paidPayments.length})
            </h3>

            <div className="space-y-2.5">
              {paidPayments.length > 0 ? (
                paidPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-between opacity-80"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{p.title}</p>
                      <span className="text-[10px] text-muted-foreground">{p.biller}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400 font-mono">
                        {formatCurrency(p.amount)}
                      </p>
                      <Badge variant="success" className="text-[8px] py-0">
                        Paid
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No recent settled payments.</p>
              )}
            </div>
          </div>

          {/* Auto-Debit Mandates Info */}
          <div className="p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>NPCI e-Mandate Protection</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              All auto-debit payments are protected by FinShield's pre-debit balance verification. If your balance dips below required thresholds, we notify you 48 hours in advance.
            </p>
          </div>
        </div>
      </div>

      <PayBillModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        selectedPayment={selectedPayment}
      />
      <SendMoneyModal isOpen={sendOpen} onClose={() => setSendOpen(false)} />
      <ReceiveMoneyModal isOpen={receiveOpen} onClose={() => setReceiveOpen(false)} />
    </Shell>
  );
}
