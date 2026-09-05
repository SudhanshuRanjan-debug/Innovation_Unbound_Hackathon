"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { sounds } from "@/lib/audio";
import confetti from "canvas-confetti";
import { signInWithGoogle, signInWithGithub } from "@/lib/supabase";

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  maskedNumber: string;
  type: "savings" | "current" | "emergency";
  availableBalance: number;
  currentBalance: number;
  ifsc: string;
  interestRate?: number;
  monthlyDeposit?: number;
  target?: number;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  category: "salary" | "rent" | "emi" | "dining" | "shopping" | "utilities" | "fuel" | "transfer" | "investment";
  amount: number;
  type: "credit" | "debit";
  account: string;
  merchant?: string;
  status: "completed" | "pending" | "failed";
  isRecurring?: boolean;
}

export interface ScheduledPayment {
  id: string;
  title: string;
  biller: string;
  amount: number;
  dueDate: string;
  category: "rent" | "emi" | "utility" | "subscription";
  status: "upcoming" | "scheduled" | "paid";
  autoDebit: boolean;
  daysLeft: number;
}

export interface BankCard {
  id: string;
  type: "debit" | "credit" | "virtual";
  cardholderName: string;
  maskedNumber: string;
  expiry: string;
  cvv: string;
  availableLimit: number;
  totalLimit: number;
  isFrozen: boolean;
  onlinePayments: boolean;
  internationalPayments: boolean;
  contactless: boolean;
  dailyLimit: number;
}

export interface ActiveLoan {
  id: string;
  loanNumber: string;
  type: string;
  lender: string;
  principal: number;
  outstandingPrincipal: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  nextPaymentDate: string;
  status: "active" | "closed";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "alert" | "info" | "success";
  read: boolean;
  link?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
}

interface BankingState {
  isAuthenticated: boolean;
  authLoading: boolean;
  customer: CustomerUser;
  accounts: BankAccount[];
  transactions: BankTransaction[];
  payments: ScheduledPayment[];
  cards: BankCard[];
  loans: ActiveLoan[];
  notifications: NotificationItem[];
  monthlyOverview: {
    income: number;
    spent: number;
    saved: number;
    upcoming: number;
  };
  resilienceScore: number;
  riskCategory: "healthy" | "watch" | "at_risk" | "critical";
  activeInterventionPlan: string | null;
  activeLiquidityBridge: { amount: number; days: number; approved: boolean } | null;
  // Auth Actions
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: "google" | "github") => Promise<{ success: boolean; error?: string }>;
  loginDemo: (personaId?: string) => void;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (identifier: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Banking Actions
  sendMoney: (recipient: string, amount: number, note?: string) => Promise<boolean>;
  payBill: (paymentId: string) => Promise<boolean>;
  toggleFreezeCard: (cardId: string) => void;
  updateCardLimit: (cardId: string, limit: number) => void;
  updateTransactionCategory: (txId: string, category: BankTransaction["category"]) => void;
  toggleTransactionRecurring: (txId: string) => void;
  applyInterventionPlan: (planName: string, monthlySaving: number, scoreGain: number) => void;
  requestLiquidityBridge: (amount: number, days: number) => void;
  switchCustomerPersona: (personaId: string) => void;
  markAllNotificationsRead: () => void;
}

const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: "acc-1",
    name: "Primary Salary Account",
    accountNumber: "5010048219321",
    maskedNumber: "•••• 4821",
    type: "savings",
    availableBalance: 48500,
    currentBalance: 52840,
    ifsc: "FINS0004821",
    interestRate: 3.5,
  },
  {
    id: "acc-2",
    name: "Digital Flexi Current Account",
    accountNumber: "5010093128456",
    maskedNumber: "•••• 9312",
    type: "current",
    availableBalance: 12400,
    currentBalance: 12400,
    ifsc: "FINS0004821",
  },
  {
    id: "acc-3",
    name: "Emergency Reserve Fund",
    accountNumber: "5010077013344",
    maskedNumber: "•••• 7701",
    type: "emergency",
    availableBalance: 42000,
    currentBalance: 42000,
    ifsc: "FINS0004821",
    target: 100000,
    monthlyDeposit: 5000,
    interestRate: 6.8,
  },
];

const INITIAL_TRANSACTIONS: BankTransaction[] = [
  {
    id: "tx-1",
    date: "2026-09-01",
    description: "Monthly Salary — Tech Corp India",
    category: "salary",
    amount: 85000,
    type: "credit",
    account: "•••• 4821",
    merchant: "Tech Corp India Pvt Ltd",
    status: "completed",
    isRecurring: true,
  },
  {
    id: "tx-2",
    date: "2026-09-02",
    description: "Apartment Rent Payment",
    category: "rent",
    amount: 18000,
    type: "debit",
    account: "•••• 4821",
    merchant: "Prestige Estates Ltd",
    status: "completed",
    isRecurring: true,
  },
  {
    id: "tx-3",
    date: "2026-09-02",
    description: "HDFC Personal Loan Auto-Debit",
    category: "emi",
    amount: 7800,
    type: "debit",
    account: "•••• 4821",
    merchant: "HDFC Bank Retail Assets",
    status: "completed",
    isRecurring: true,
  },
  {
    id: "tx-4",
    date: "2026-09-03",
    description: "Amazon India — Electronics & Office",
    category: "shopping",
    amount: 2100,
    type: "debit",
    account: "•••• 4821",
    merchant: "Amazon Retail India",
    status: "completed",
    isRecurring: false,
  },
  {
    id: "tx-5",
    date: "2026-09-03",
    description: "Bescom Electricity Bill",
    category: "utilities",
    amount: 1240,
    type: "debit",
    account: "•••• 4821",
    merchant: "Bangalore Electricity Supply",
    status: "completed",
    isRecurring: true,
  },
  {
    id: "tx-6",
    date: "2026-09-04",
    description: "Swiggy Gourmet Dinner",
    category: "dining",
    amount: 420,
    type: "debit",
    account: "•••• 4821",
    merchant: "Swiggy Delivery",
    status: "completed",
    isRecurring: false,
  },
  {
    id: "tx-7",
    date: "2026-09-04",
    description: "Uber Premier Ride",
    category: "fuel",
    amount: 280,
    type: "debit",
    account: "•••• 4821",
    merchant: "Uber India Systems",
    status: "completed",
    isRecurring: false,
  },
  {
    id: "tx-8",
    date: "2026-09-04",
    description: "SIP Investment — Nifty 50 Index Fund",
    category: "investment",
    amount: 5000,
    type: "debit",
    account: "•••• 7701",
    merchant: "HDFC AMC Mutual Funds",
    status: "completed",
    isRecurring: true,
  },
];

const INITIAL_PAYMENTS: ScheduledPayment[] = [
  {
    id: "pay-1",
    title: "Apartment Rent (Indiranagar)",
    biller: "Prestige Estates Ltd",
    amount: 18000,
    dueDate: "2026-09-15",
    category: "rent",
    status: "upcoming",
    autoDebit: true,
    daysLeft: 11,
  },
  {
    id: "pay-2",
    title: "Personal Loan Monthly EMI",
    biller: "HDFC Bank Retail Assets",
    amount: 7800,
    dueDate: "2026-09-11",
    category: "emi",
    status: "upcoming",
    autoDebit: true,
    daysLeft: 7,
  },
  {
    id: "pay-3",
    title: "Bescom State Electricity",
    biller: "Bangalore Electricity Board",
    amount: 1240,
    dueDate: "2026-09-10",
    category: "utility",
    status: "upcoming",
    autoDebit: false,
    daysLeft: 6,
  },
  {
    id: "pay-4",
    title: "ACT Fibernet Broadband",
    biller: "ACT Digital Services",
    amount: 1150,
    dueDate: "2026-09-20",
    category: "utility",
    status: "upcoming",
    autoDebit: false,
    daysLeft: 16,
  },
];

const INITIAL_CARDS: BankCard[] = [
  {
    id: "card-1",
    type: "debit",
    cardholderName: "Arjun Mehta",
    maskedNumber: "•••• •••• •••• 4821",
    expiry: "09/29",
    cvv: "892",
    availableLimit: 150000,
    totalLimit: 200000,
    isFrozen: false,
    onlinePayments: true,
    internationalPayments: false,
    contactless: true,
    dailyLimit: 50000,
  },
];

const INITIAL_LOANS: ActiveLoan[] = [
  {
    id: "loan-1",
    loanNumber: "LN-2024-8842",
    type: "Personal Loan (Debt Consolidation)",
    lender: "HDFC Bank",
    principal: 250000,
    outstandingPrincipal: 142000,
    interestRate: 11.2,
    tenureMonths: 36,
    emiAmount: 7800,
    nextPaymentDate: "2026-09-11",
    status: "active",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Pre-Salary Liquidity Dip Warning",
    message: "Your projected balance will dip to ₹4,280 on Sept 25 prior to salary credit. 3 safe interventions available.",
    time: "10 mins ago",
    type: "alert",
    read: false,
    link: "/forecast",
  },
  {
    id: "notif-2",
    title: "September Salary Credited",
    message: "₹85,000.00 credited to Primary Salary Account (•••• 4821) from Tech Corp India.",
    time: "2 days ago",
    type: "success",
    read: true,
  },
];

const BankingContext = createContext<BankingState | undefined>(undefined);

export function BankingProvider({ children }: { children: React.ReactNode }) {
  // Auth state — default unauthenticated to start routing at /auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Customer profile state
  const [customer, setCustomer] = useState<CustomerUser>({
    id: "demo-customer-1",
    name: "Arjun Mehta",
    email: "arjun@demo.finshield",
    phone: "+91 98765 43210",
    role: "Senior Software Engineer",
    avatar: "AM",
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<BankTransaction[]>(INITIAL_TRANSACTIONS);
  const [payments, setPayments] = useState<ScheduledPayment[]>(INITIAL_PAYMENTS);
  const [cards, setCards] = useState<BankCard[]>(INITIAL_CARDS);
  const [loans, setLoans] = useState<ActiveLoan[]>(INITIAL_LOANS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [monthlyOverview, setMonthlyOverview] = useState({
    income: 85000,
    spent: 42800,
    saved: 8200,
    upcoming: 21400,
  });

  const [resilienceScore, setResilienceScore] = useState<number>(63.5);
  const [riskCategory, setRiskCategory] = useState<"healthy" | "watch" | "at_risk" | "critical">("watch");
  const [activeInterventionPlan, setActiveInterventionPlan] = useState<string | null>(null);
  const [activeLiquidityBridge, setActiveLiquidityBridge] = useState<{ amount: number; days: number; approved: boolean } | null>(null);

  // Restore session from localStorage safely
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("finshield_auth_active");
      const storedUser = localStorage.getItem("finshield_auth_user");
      if (storedAuth === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      if (storedUser) {
        setCustomer(JSON.parse(storedUser));
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ── AUTHENTICATION METHODS ──

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    sounds.click();

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check valid credentials or demo credentials
    const isArjun = cleanId.includes("arjun") || cleanId.includes("9876543210") || cleanId === "arjun@demo.finshield";
    const isPriya = cleanId.includes("priya");
    const isRajesh = cleanId.includes("rajesh");

    if (isArjun || isPriya || isRajesh || cleanPass === "demo123" || cleanPass === "password" || cleanPass.length >= 6) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem("finshield_auth_active", "true");
      } catch {}

      if (isPriya) {
        switchCustomerPersona("demo-customer-2");
      } else if (isRajesh) {
        switchCustomerPersona("demo-customer-3");
      } else {
        switchCustomerPersona("demo-customer-1");
      }

      sounds.success();
      return { success: true };
    }

    sounds.error();
    return { success: false, error: "Invalid email/mobile or password. (Demo: arjun@demo.finshield / demo123)" };
  };

  const loginWithOtp = async (code: string): Promise<{ success: boolean; error?: string }> => {
    sounds.click();

    if (code === "123456" || code.length === 6) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem("finshield_auth_active", "true");
      } catch {}
      switchCustomerPersona("demo-customer-1");
      sounds.success();
      return { success: true };
    }

    sounds.error();
    return { success: false, error: "Invalid verification code. Enter demo OTP 123456." };
  };

  const loginDemo = (personaId = "demo-customer-1") => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem("finshield_auth_active", "true");
    } catch {}
    switchCustomerPersona(personaId);
    sounds.success();
  };

  const loginWithSocial = async (provider: "google" | "github"): Promise<{ success: boolean; error?: string }> => {
    sounds.click();
    try {
      const res = provider === "google" ? await signInWithGoogle() : await signInWithGithub();
      if (res.error) {
        sounds.error();
        return { success: false, error: res.error.message };
      }
      setIsAuthenticated(true);
      try {
        localStorage.setItem("finshield_auth_active", "true");
        const dataAny = res.data as any;
        if (dataAny?.user) {
          const userMeta = dataAny.user.user_metadata || {};
          const fullName = userMeta.full_name || (provider === "google" ? "Google User" : "GitHub Developer");
          const socialUser: CustomerUser = {
            id: dataAny.user.id || `social-${Date.now()}`,
            name: fullName,
            email: dataAny.user.email || `${provider}@user.finshield`,
            phone: "+91 98765 43210",
            role: `${provider.toUpperCase()} Verified Customer`,
            avatar: fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "FS",
          };
          setCustomer(socialUser);
          localStorage.setItem("finshield_auth_user", JSON.stringify(socialUser));
        }
      } catch {}
      sounds.success();
      return { success: true };
    } catch (err: any) {
      sounds.error();
      return { success: false, error: err?.message || `Failed to sign in with ${provider}` };
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    sounds.click();

    if (!name || !email || !password) {
      sounds.error();
      return { success: false, error: "All fields are required to register." };
    }

    const newUser: CustomerUser = {
      id: `cust-${Date.now()}`,
      name,
      email,
      phone: phone || "+91 98765 00000",
      role: "Verified Banking Customer",
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "FC",
    };

    setCustomer(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("finshield_auth_active", "true");
      localStorage.setItem("finshield_auth_user", JSON.stringify(newUser));
    } catch {}

    sounds.success();
    return { success: true };
  };

  const resetPassword = async (identifier: string, newPassword?: string): Promise<{ success: boolean; error?: string }> => {
    sounds.click();
    if (!identifier) {
      return { success: false, error: "Please enter your registered email or mobile." };
    }
    sounds.success();
    return { success: true };
  };

  const logout = () => {
    sounds.click();
    setIsAuthenticated(false);
    try {
      localStorage.setItem("finshield_auth_active", "false");
    } catch {}
  };

  // ── BANKING ACTIONS ──

  const sendMoney = async (recipient: string, amount: number, note?: string): Promise<boolean> => {
    sounds.click();
    if (amount <= 0 || amount > accounts[0].availableBalance) {
      sounds.error();
      return false;
    }

    setAccounts((prev) =>
      prev.map((acc, i) =>
        i === 0
          ? {
              ...acc,
              availableBalance: acc.availableBalance - amount,
              currentBalance: acc.currentBalance - amount,
            }
          : acc
      )
    );

    setMonthlyOverview((prev) => ({
      ...prev,
      spent: prev.spent + amount,
    }));

    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Transfer to ${recipient}${note ? ` · ${note}` : ""}`,
      category: "transfer",
      amount,
      type: "debit",
      account: accounts[0].maskedNumber,
      merchant: recipient,
      status: "completed",
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Money Sent Successfully",
      message: `₹${amount.toLocaleString("en-IN")} sent to ${recipient}. Primary Account balance updated.`,
      time: "Just now",
      type: "info",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    sounds.success();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ["#06B6D4", "#10B981"] });
    return true;
  };

  const payBill = async (paymentId: string): Promise<boolean> => {
    const p = payments.find((item) => item.id === paymentId);
    if (!p) return false;

    if (accounts[0].availableBalance < p.amount) {
      sounds.error();
      return false;
    }

    setPayments((prev) =>
      prev.map((item) => (item.id === paymentId ? { ...item, status: "paid" } : item))
    );

    setAccounts((prev) =>
      prev.map((acc, i) =>
        i === 0
          ? {
              ...acc,
              availableBalance: acc.availableBalance - p.amount,
              currentBalance: acc.currentBalance - p.amount,
            }
          : acc
      )
    );

    setMonthlyOverview((prev) => ({
      ...prev,
      spent: prev.spent + p.amount,
      upcoming: Math.max(0, prev.upcoming - p.amount),
    }));

    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Bill Payment — ${p.title}`,
      category: p.category === "rent" ? "rent" : p.category === "emi" ? "emi" : "utilities",
      amount: p.amount,
      type: "debit",
      account: accounts[0].maskedNumber,
      merchant: p.biller,
      status: "completed",
      isRecurring: true,
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Bill Payment Settled",
      message: `${p.title} of ₹${p.amount.toLocaleString("en-IN")} cleared successfully.`,
      time: "Just now",
      type: "success",
      read: false,
      link: "/payments",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    sounds.success();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 }, colors: ["#F59E0B", "#10B981"] });
    return true;
  };

  const toggleFreezeCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
    sounds.click();
  };

  const updateCardLimit = (cardId: string, limit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, dailyLimit: limit } : c))
    );
    sounds.tick();
  };

  const updateTransactionCategory = (txId: string, category: BankTransaction["category"]) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, category } : t))
    );
    sounds.click();
  };

  const toggleTransactionRecurring = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, isRecurring: !t.isRecurring } : t))
    );
    sounds.click();
  };

  const applyInterventionPlan = (planName: string, monthlySaving: number, scoreGain: number) => {
    setActiveInterventionPlan(planName);
    setMonthlyOverview((prev) => ({
      ...prev,
      spent: Math.max(0, prev.spent - monthlySaving),
      saved: prev.saved + monthlySaving,
    }));
    setResilienceScore((prev) => Math.min(100, Number((prev + scoreGain).toFixed(1))));
    setRiskCategory("healthy");

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Intervention Plan Applied",
      message: `${planName} activated. Estimated savings: ₹${monthlySaving}/mo. Resilience improved to ${(resilienceScore + scoreGain).toFixed(1)}.`,
      time: "Just now",
      type: "success",
      read: false,
      link: "/health",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    sounds.success();
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.8 }, colors: ["#10B981", "#34D399", "#06B6D4"] });
  };

  const requestLiquidityBridge = (amount: number, days: number) => {
    setActiveLiquidityBridge({ amount, days, approved: true });
    setAccounts((prev) =>
      prev.map((acc, i) => (i === 0 ? { ...acc, availableBalance: acc.availableBalance + amount } : acc))
    );

    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Temporary Liquidity Bridge Credit (${days} Days)`,
      category: "transfer",
      amount,
      type: "credit",
      account: accounts[0].maskedNumber,
      merchant: "FinShield Liquidity Reserve",
      status: "completed",
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Liquidity Bridge Activated",
      message: `₹${amount.toLocaleString("en-IN")} buffer credited. Auto-settlement scheduled on next salary deposit.`,
      time: "Just now",
      type: "success",
      read: false,
      link: "/overdraft",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    sounds.success();
    confetti({ particleCount: 45, spread: 75, origin: { y: 0.8 }, colors: ["#06B6D4", "#10B981"] });
  };

  const switchCustomerPersona = (personaId: string) => {
    if (personaId === "demo-customer-2") {
      setCustomer({
        id: "demo-customer-2",
        name: "Priya Sharma",
        email: "priya.sharma@designcraft.io",
        phone: "+91 98112 23344",
        role: "Principal Product Designer",
        avatar: "PS",
      });
      setAccounts([
        {
          id: "acc-1",
          name: "Salary & Wealth Account",
          accountNumber: "5010088219001",
          maskedNumber: "•••• 8821",
          type: "savings",
          availableBalance: 185000,
          currentBalance: 185000,
          ifsc: "FINS0004821",
          interestRate: 4.0,
        },
      ]);
      setMonthlyOverview({ income: 120000, spent: 50000, saved: 55000, upcoming: 15000 });
      setResilienceScore(84.0);
      setRiskCategory("healthy");
    } else if (personaId === "demo-customer-3") {
      setCustomer({
        id: "demo-customer-3",
        name: "Rajesh Verma",
        email: "rajesh.verma@consulting.in",
        phone: "+91 98776 65544",
        role: "Independent Business Consultant",
        avatar: "RV",
      });
      setAccounts([
        {
          id: "acc-1",
          name: "Primary Account",
          accountNumber: "5010033219111",
          maskedNumber: "•••• 3321",
          type: "savings",
          availableBalance: 4200,
          currentBalance: 4200,
          ifsc: "FINS0004821",
        },
      ]);
      setMonthlyOverview({ income: 60000, spent: 58000, saved: 0, upcoming: 34000 });
      setResilienceScore(28.0);
      setRiskCategory("critical");
    } else {
      setCustomer({
        id: "demo-customer-1",
        name: "Arjun Mehta",
        email: "arjun@demo.finshield",
        phone: "+91 98765 43210",
        role: "Senior Software Engineer",
        avatar: "AM",
      });
      setAccounts(INITIAL_ACCOUNTS);
      setMonthlyOverview({ income: 85000, spent: 42800, saved: 8200, upcoming: 21400 });
      setResilienceScore(63.5);
      setRiskCategory("watch");
    }
    sounds.click();
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    sounds.click();
  };

  return (
    <BankingContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        customer,
        accounts,
        transactions,
        payments,
        cards,
        loans,
        notifications,
        monthlyOverview,
        resilienceScore,
        riskCategory,
        activeInterventionPlan,
        activeLiquidityBridge,
        login,
        loginWithOtp,
        loginWithSocial,
        loginDemo,
        register,
        resetPassword,
        logout,
        sendMoney,
        payBill,
        toggleFreezeCard,
        updateCardLimit,
        updateTransactionCategory,
        toggleTransactionRecurring,
        applyInterventionPlan,
        requestLiquidityBridge,
        switchCustomerPersona,
        markAllNotificationsRead,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
}

export function useBanking() {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error("useBanking must be used within a BankingProvider");
  }
  return context;
}
