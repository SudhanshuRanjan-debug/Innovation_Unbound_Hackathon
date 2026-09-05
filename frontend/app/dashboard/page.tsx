"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { useBanking, BankTransaction, ScheduledPayment } from "@/lib/banking-store";
import { SceneCanvas } from "@/components/3d/SceneCanvas";
import { FinancialCore } from "@/components/3d/FinancialCore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  Send, QrCode, CreditCard, PlusCircle, Receipt, ArrowRight,
  ShieldCheck, Sparkles, ChevronRight, Lock, Calendar, ArrowUpRight,
  ArrowDownLeft, AlertTriangle, TrendingUp, Zap, Award, Calculator,
  TrendingDown, FileText, CheckCircle2, ChevronDown, Clock,
} from "lucide-react";
import { SendMoneyModal } from "@/components/modals/SendMoneyModal";
import { ReceiveMoneyModal } from "@/components/modals/ReceiveMoneyModal";
import { PayBillModal } from "@/components/modals/PayBillModal";
import { TransactionDrawer } from "@/components/modals/TransactionDrawer";
import { FreezeCardModal } from "@/components/modals/FreezeCardModal";

export default function DashboardPage() {
  const {
    customer,
    accounts,
    transactions,
    payments,
    cards,
    loans,
    monthlyOverview,
    resilienceScore,
    riskCategory,
    activeInterventionPlan,
  } = useBanking();

  // Modals state
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<ScheduledPayment | null>(null);
  const [freezeCardOpen, setFreezeCardOpen] = useState(false);
  const [moneyFlowTab, setMoneyFlowTab] = useState<"all" | "income" | "spending" | "savings">("all");

  const primaryAcc = accounts[0];
  const primaryCard = cards[0];
  const activeLoan = loans[0];
  const emergencyAcc = accounts.find((a) => a.type === "emergency") || accounts[2];

  // Group transactions
  const todayTxs = transactions.slice(0, 3);
  const yesterdayTxs = transactions.slice(3, 6);

  return (
    <Shell
      title="Banking Home"
      description="Real-time financial telemetry, cash flow streams, and proactive resilience protection"
    >
      {/* 1. CONTEXTUAL GREETING & STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Good morning, {customer.name.split(" ")[0]}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your money and cash flow resilience at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono border-white/10 text-slate-300">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </Badge>
          <Badge
            variant={riskCategory === "healthy" ? "success" : riskCategory === "critical" ? "critical" : "warning"}
            className="text-xs uppercase"
          >
            {riskCategory}
          </Badge>
        </div>
      </div>

      {/* 2. PRIMARY FINANCIAL SURFACE (Non-card, Dominant Banking Area) */}
      <div className="rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-cyan-950/40 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden glass-panel-glow">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                PRIMARY SALARY ACCOUNT
              </span>
              <span className="text-xs text-slate-400 font-mono">{primaryAcc.maskedNumber}</span>
              <span className="text-xs text-emerald-400 font-medium">· Active & Verified</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Available Balance
              </p>
              <h1 className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                <AnimatedCounter value={primaryAcc.availableBalance} prefix="₹" />
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  <strong className="text-emerald-400 font-mono">+{formatCurrency(monthlyOverview.income)}</strong> income this month
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">·</span>
                <span className="text-muted-foreground">Ledger Balance: </span>
                <span className="font-bold text-white font-mono">{formatCurrency(primaryAcc.currentBalance)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">·</span>
                <span className="text-muted-foreground">IFSC: </span>
                <span className="font-mono text-cyan-400">{primaryAcc.ifsc}</span>
              </div>
            </div>
          </div>

          {/* Prominent Action Bar */}
          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => {
                sounds.click();
                setSendOpen(true);
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-extrabold text-xs h-11 px-5 rounded-2xl shadow-glow-cyan flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Send Money</span>
            </Button>
            <Button
              onClick={() => {
                sounds.click();
                setPayOpen(true);
              }}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs h-11 px-4 rounded-2xl border border-white/10 flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4 text-amber-400" />
              <span>Pay Bill</span>
            </Button>
            <Button
              onClick={() => {
                sounds.click();
                setReceiveOpen(true);
              }}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs h-11 px-4 rounded-2xl border border-white/10 flex items-center gap-2"
            >
              <QrCode className="h-4 w-4 text-teal-400" />
              <span>Receive / QR</span>
            </Button>
            <Link href="/accounts">
              <Button
                variant="outline"
                onClick={() => sounds.click()}
                className="border-white/10 hover:bg-white/5 text-slate-300 text-xs h-11 px-4 rounded-2xl"
              >
                <span>Full Account →</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE MONEY FLOW PANEL (Visual Inflow -> Outflow -> Buffer Pipeline) */}
      <div className="rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Monthly Money Flow Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive allocation across verified inflows, living expenses, and safety cushions
            </p>
          </div>
          <Link
            href="/forecast"
            onClick={() => sounds.click()}
            className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>90-Day Cash Flow Horizon</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Dynamic Interactive Flow Stream */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>1. Total Inflow</span>
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <p className="text-xl font-black text-white font-mono">
              +{formatCurrency(monthlyOverview.income)}
            </p>
            <p className="text-[10px] text-slate-400">Direct Salary Deposited</p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-950 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span>2. Discretionary Spent</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-xl font-black text-white font-mono">
              -{formatCurrency(monthlyOverview.spent)}
            </p>
            <p className="text-[10px] text-slate-400">Living & Lifestyle Expenses</p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-950 border border-cyan-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>3. Upcoming Bills & EMI</span>
              <Calendar className="h-4 w-4" />
            </div>
            <p className="text-xl font-black text-white font-mono">
              {formatCurrency(monthlyOverview.upcoming)}
            </p>
            <p className="text-[10px] text-slate-400">Rent + EMI Due in 7 Days</p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-950 border border-teal-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-teal-400">
              <span>4. Net Safety Buffer</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-xl font-black text-teal-300 font-mono">
              {formatCurrency(emergencyAcc.availableBalance)}
            </p>
            <p className="text-[10px] text-slate-400">Emergency Reserve Cushion</p>
          </div>
        </div>
      </div>

      {/* 4. PROACTIVE RESILIENCE WARNING BANNER (Non-card, Streamlined) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-obsidian-900 to-amber-500/10 border border-amber-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                PROACTIVE COPILOT WARNING
              </span>
              <span className="text-[10px] text-slate-400 font-mono">· Detection 5 Days Ahead</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
              Your balance is projected to dip to <strong className="text-amber-300 font-mono font-bold">₹4,280</strong> on Sept 25 prior to next salary credit (<strong className="text-emerald-400 font-mono">₹85,000</strong>).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link href="/forecast">
            <Button
              size="sm"
              onClick={() => sounds.click()}
              className="bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs h-9 px-3 rounded-xl"
            >
              Understand Why →
            </Button>
          </Link>
          <Link href="/interventions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sounds.click()}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs h-9 px-3 rounded-xl"
            >
              Explore Safe Interventions
            </Button>
          </Link>
          <Link href="/overdraft">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sounds.click()}
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs h-9 px-3 rounded-xl"
            >
              Liquidity Bridge
            </Button>
          </Link>
        </div>
      </div>

      {/* 5. TWO-COLUMN SPLIT: BANKING TRANSACTION WORKSPACE + UPCOMING OBLIGATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Banking Ledger Table */}
        <div className="lg:col-span-7 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-cyan-400" />
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
                Transaction Ledger
              </h3>
            </div>
            <Link
              href="/transactions"
              onClick={() => sounds.click()}
              className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Group: TODAY */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider px-1">
              TODAY
            </p>
            <div className="space-y-1.5">
              {todayTxs.map((tx) => {
                const isCredit = tx.type === "credit";
                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      sounds.click();
                      setSelectedTx(tx);
                    }}
                    className="p-3 rounded-2xl bg-obsidian-950/80 border border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl text-xs font-bold ${
                          isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-300"
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(tx.date)} · <span className="capitalize">{tx.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-bold font-mono ${
                          isCredit ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 font-mono">
                        Inspect →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group: YESTERDAY */}
          <div className="space-y-2 pt-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider px-1">
              YESTERDAY
            </p>
            <div className="space-y-1.5">
              {yesterdayTxs.map((tx) => {
                const isCredit = tx.type === "credit";
                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      sounds.click();
                      setSelectedTx(tx);
                    }}
                    className="p-3 rounded-2xl bg-obsidian-950/80 border border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl text-xs font-bold ${
                          isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-300"
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(tx.date)} · <span className="capitalize">{tx.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-bold font-mono ${
                          isCredit ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 font-mono">
                        Inspect →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Upcoming Obligations & Scheduled Debits */}
        <div className="lg:col-span-5 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
                Upcoming Obligations
              </h3>
            </div>
            <Link
              href="/payments"
              onClick={() => sounds.click()}
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Manage Bills</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {payments.slice(0, 3).map((p) => {
              const isPaid = p.status === "paid";
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isPaid
                      ? "opacity-50 bg-obsidian-950/40 border-white/5"
                      : "bg-obsidian-950/80 border-white/5 hover:border-amber-500/30"
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Due in <strong className="text-amber-400">{p.daysLeft} days</strong> ({formatDate(p.dueDate)})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs font-bold text-white font-mono">{formatCurrency(p.amount)}</p>
                    {!isPaid ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          sounds.click();
                          setSelectedPayment(p);
                          setPayOpen(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-obsidian-950 text-[10px] font-bold h-7 px-2.5 rounded-xl"
                      >
                        Pay
                      </Button>
                    ) : (
                      <Badge variant="success" className="text-[9px] py-0.5">
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Card & Loan Quick Links */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="font-bold text-white">Platinum Debit ({primaryCard.maskedNumber.slice(-4)})</p>
                  <p className="text-[10px] text-muted-foreground">Limit: {formatCurrency(primaryCard.dailyLimit)}/day</p>
                </div>
              </div>
              <Link href="/cards">
                <Button variant="ghost" size="sm" className="text-[10px] text-cyan-400 h-7 px-2">
                  Controls →
                </Button>
              </Link>
            </div>

            <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="font-bold text-white">Personal Loan EMI</p>
                  <p className="text-[10px] text-amber-400 font-mono">{formatCurrency(activeLoan.emiAmount)} / month</p>
                </div>
              </div>
              <Link href="/loans">
                <Button variant="ghost" size="sm" className="text-[10px] text-amber-400 h-7 px-2">
                  Compare →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6. SPATIAL 3D RESILIENCE WORKSTATION & FEATURE LAUNCHPAD */}
      <div className="rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-cyan-950/30 border border-cyan-500/30 p-6 sm:p-7 space-y-6 glass-panel-glow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* 3D Financial Core Sphere */}
          <div className="lg:col-span-4 h-64 rounded-2xl bg-obsidian-950/90 border border-cyan-500/20 relative overflow-hidden flex items-center justify-center">
            <SceneCanvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} color="#06B6D4" intensity={1.5} />
              <FinancialCore score={resilienceScore} category={riskCategory} />
            </SceneCanvas>
            <div className="absolute bottom-2 left-3 right-3 text-center pointer-events-none">
              <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest bg-obsidian-950/90 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Spatial 3D Resilience Core
              </span>
            </div>
          </div>

          {/* Diagnostics Summary & Launchpad Hub */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Financial Resilience Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
                    {resilienceScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 100</span>
                  <Badge
                    variant={riskCategory === "healthy" ? "success" : riskCategory === "critical" ? "critical" : "warning"}
                    className="uppercase text-[10px]"
                  >
                    {riskCategory}
                  </Badge>
                </div>
              </div>

              <Link href="/health">
                <Button
                  size="sm"
                  onClick={() => sounds.click()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs rounded-xl"
                >
                  Diagnostic Breakdown →
                </Button>
              </Link>
            </div>

            {/* Quick Feature Launchpad Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
              {[
                { label: "Cash Flow Horizon", href: "/forecast", icon: TrendingUp, desc: "90-day predictive dip detection" },
                { label: "Intervention Center", href: "/interventions", icon: Sparkles, desc: "Restructuring without debt" },
                { label: "Liquidity Bridge", href: "/overdraft", icon: Zap, desc: "Pre-salary micro-advance" },
                { label: "Loan Marketplace", href: "/loans", icon: Award, desc: "Multi-dimensional ranking" },
                { label: "Decision Simulator", href: "/simulator", icon: Calculator, desc: "Real-time 3D what-if testing" },
                { label: "Bank Officer Center", href: "/officer", icon: ShieldCheck, desc: "Portfolio risk triage queue" },
              ].map((f, i) => (
                <Link
                  key={i}
                  href={f.href}
                  onClick={() => sounds.click()}
                  className="p-3 rounded-2xl bg-obsidian-950/80 border border-white/5 hover:border-cyan-500/40 transition-all group block space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <f.icon className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                      {f.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{f.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <SendMoneyModal isOpen={sendOpen} onClose={() => setSendOpen(false)} />
      <ReceiveMoneyModal isOpen={receiveOpen} onClose={() => setReceiveOpen(false)} />
      <PayBillModal isOpen={payOpen} onClose={() => setPayOpen(false)} selectedPayment={selectedPayment} />
      <TransactionDrawer
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
      <FreezeCardModal
        card={primaryCard}
        isOpen={freezeCardOpen}
        onClose={() => setFreezeCardOpen(false)}
      />
    </Shell>
  );
}
