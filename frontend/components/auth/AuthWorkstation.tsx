"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBanking } from "@/lib/banking-store";
import { DimensionalGlobeBackground } from "@/components/3d/DimensionalGlobeBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/audio";
import {
  ShieldCheck, Lock, Mail, Smartphone, ArrowRight,
  Sparkles, CheckCircle2, UserCheck, Eye, EyeOff,
  Shield, KeyRound, AlertCircle, RefreshCw, ChevronLeft,
  Zap, UserPlus, HelpCircle, Check,
} from "lucide-react";

// Official Google Multicolored Icon
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

// Official GitHub Octocat Icon
function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function AuthWorkstation() {
  const router = useRouter();
  const {
    isAuthenticated,
    authLoading,
    login,
    loginWithOtp,
    loginWithSocial,
    loginDemo,
    register,
    resetPassword,
  } = useBanking();

  // Mode: "signin" | "signup" | "otp" | "forgot"
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "otp" | "forgot">("signin");

  // Sign in form state
  const [identifier, setIdentifier] = useState("arjun@demo.finshield");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);

  // Sign up form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);

  // OTP state
  const [otp, setOtp] = useState(["1", "2", "3", "4", "5", "6"]);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotNewPass, setForgotNewPass] = useState("");

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Prefetch dashboard & redirect if authenticated
  useEffect(() => {
    router.prefetch("/dashboard");
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle Password Sign In
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage("Please enter your email or mobile number.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Password is required.");
      return;
    }

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      setSuccessMessage("Authentication verified. Entering dashboard...");
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Authentication failed.");
    }
  };

  // Handle Social OAuth Sign In / Sign Up (Real Google / GitHub Provider Flow)
  const handleSocialLogin = async (provider: "google" | "github") => {
    sounds.click();
    setErrorMessage(null);
    setSocialLoading(provider);

    const res = await loginWithSocial(provider);
    setSocialLoading(null);

    if (res.success) {
      setSuccessMessage(`Redirecting to ${provider === "google" ? "Google" : "GitHub"} authorization...`);
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || `Failed to authenticate with ${provider}.`);
    }
  };

  // Handle Demo 1-Click Login (Instant)
  const handleDemoClick = (personaId = "demo-customer-1") => {
    sounds.click();
    setErrorMessage(null);
    loginDemo(personaId);
    setSuccessMessage("Signed in as Arjun Mehta (Demo Account).");
    router.push("/dashboard");
  };

  // Handle Sign Up Submission (Instant)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (regConfirmPassword && regPassword !== regConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!agreedTerms) {
      setErrorMessage("Please accept the banking terms & resilience copilot disclosures to proceed.");
      return;
    }

    setLoading(true);
    const res = await register(regName, regEmail, regPhone, regPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMessage("Account created successfully! Welcome to FinShield Digital Banking.");
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Registration failed.");
    }
  };

  // Handle OTP Inputs
  const handleOtpChange = (val: string, index: number) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the OTP.");
      return;
    }

    setLoading(true);
    const res = await loginWithOtp(code);
    setLoading(false);

    if (res.success) {
      setSuccessMessage("Mobile number verified. Entering dashboard...");
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Invalid OTP code.");
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (forgotStep === 1) {
      if (!forgotEmail.trim()) {
        setErrorMessage("Please enter your registered email or phone.");
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      setLoading(false);
      setForgotStep(2);
      setSuccessMessage("Recovery instructions sent. Enter your new password.");
    } else {
      if (forgotNewPass.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
      setLoading(true);
      const res = await resetPassword(forgotEmail, forgotNewPass);
      setLoading(false);

      if (res.success) {
        setSuccessMessage("Password updated successfully! Welcome back.");
        router.push("/dashboard");
      } else {
        setErrorMessage(res.error || "Failed to update password.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02040a] text-foreground flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans relative">
      {/* 3D Dimensional Globe Background in Space (Crystal Clear, Zero Blur) */}
      <DimensionalGlobeBackground />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full h-16 sm:h-20 px-4 sm:px-8 border-b border-white/10 flex items-center justify-between bg-obsidian-950/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-glow-cyan/30">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                FIN<span className="text-cyan-400">SHIELD</span>
              </span>
              <Badge variant="info" className="text-[10px] px-1.5 py-0 uppercase tracking-widest hidden sm:inline-flex">
                Digital Bank
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Intelligent Resilience & Real-Time Financial Intelligence
            </p>
          </div>
        </div>

        {/* Top Right Quick Demo Access */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>256-Bit TLS Bank Encryption</span>
          </div>

          <button
            onClick={() => handleDemoClick("demo-customer-1")}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs sm:text-sm font-semibold transition-all shadow-glow-cyan/20 active:scale-95"
            title="Instant sign-in as Arjun Mehta (Demo Account)"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400" />
            <span>Instant Demo</span>
          </button>
        </div>
      </header>

      {/* Main Workstation Layout: Centered Glass Workstation with Dimensional Globe & Blobs Breathing in Background */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 w-full max-w-xl mx-auto my-auto">
        {/* Main Card Container (Crystal clear surrounding, high-contrast readable container) */}
        <div className="relative w-full rounded-3xl p-6 sm:p-8 bg-obsidian-950/80 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.85)] space-y-6">
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-300 text-xs sm:text-sm animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                CARD 1: CUSTOMER SIGN IN (Main Default View)
               ══════════════════════════════════════════════════════════ */}
            {authMode === "signin" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Customer Sign In
                    </h2>
                    <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                      SECURE PORTAL
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Access your accounts, intelligence dashboard, and resilience shield
                  </p>
                </div>

                {/* 1. SOCIAL OAUTH SECTION (Google & GitHub with Supabase) */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Google OAuth Button */}
                    <button
                      type="button"
                      disabled={loading || socialLoading !== null}
                      onClick={() => handleSocialLogin("google")}
                      className="w-full h-12 sm:h-13 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] border border-white/10 hover:border-cyan-500/40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md group disabled:opacity-50"
                    >
                      {socialLoading === "google" ? (
                        <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                      ) : (
                        <GoogleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                      )}
                      <span>Continue with Google</span>
                    </button>

                    {/* GitHub OAuth Button */}
                    <button
                      type="button"
                      disabled={loading || socialLoading !== null}
                      onClick={() => handleSocialLogin("github")}
                      className="w-full h-12 sm:h-13 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] border border-white/10 hover:border-cyan-500/40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md group disabled:opacity-50"
                    >
                      {socialLoading === "github" ? (
                        <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                      ) : (
                        <GithubIcon className="w-5 h-5 text-slate-200 shrink-0 transition-transform group-hover:scale-110" />
                      )}
                      <span>Continue with GitHub</span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-3 bg-obsidian-900 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Or sign in with email credentials
                  </span>
                </div>

                {/* 2. PASSWORD SIGN IN FORM */}
                <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs sm:text-sm">
                  {/* Identifier Input */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Email or Mobile Number</span>
                      <span className="text-[11px] text-slate-500 font-mono">arjun@demo.finshield</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. arjun@demo.finshield or 9876543210"
                        className="w-full h-11 sm:h-12 px-4 pl-10 bg-obsidian-950 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-300">
                      <label>Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.click();
                          setAuthMode("forgot");
                          setErrorMessage(null);
                        }}
                        className="text-[11px] sm:text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your security password"
                        className="w-full h-11 sm:h-12 px-4 pl-10 pr-10 bg-obsidian-950 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Sign In Button */}
                  <Button
                    type="submit"
                    disabled={loading || socialLoading !== null}
                    className="w-full h-12 sm:h-13 md:h-14 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-obsidian-950 font-bold sm:font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-glow-cyan/60 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-obsidian-950" />
                        <span>Authorizing Banking Session...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to FinShield</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>


                {/* 4. DEDICATED SIGN UP LINK */}
                <div className="pt-3 border-t border-white/5 text-center">
                  <p className="text-xs sm:text-sm text-slate-400">
                    Don&apos;t have a FinShield account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.click();
                        setAuthMode("signup");
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
                    >
                      Open an Account (Sign Up) →
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                CARD 2: CUSTOMER SIGN UP / OPEN NEW ACCOUNT
               ══════════════════════════════════════════════════════════ */}
            {authMode === "signup" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Header with Back button */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.click();
                        setAuthMode("signin");
                        setErrorMessage(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Back to Sign In</span>
                    </button>
                    <Badge variant="success" className="text-[10px] px-2 py-0.5 uppercase tracking-wider">
                      Zero Fees • Instant KYC
                    </Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                    Open a FinShield Account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Join next-generation digital banking with AI-powered resilience
                  </p>
                </div>

                {/* Quick Social Sign Up */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={loading || socialLoading !== null}
                    onClick={() => handleSocialLogin("google")}
                    className="w-full h-11 px-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>Sign up with Google</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading || socialLoading !== null}
                    onClick={() => handleSocialLogin("github")}
                    className="w-full h-11 px-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <GithubIcon className="w-4 h-4 shrink-0" />
                    <span>Sign up with GitHub</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-3 bg-obsidian-900 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Or register with email
                  </span>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full h-10 sm:h-11 px-3.5 bg-obsidian-950 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full h-10 sm:h-11 px-3.5 bg-obsidian-950 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full h-10 sm:h-11 px-3.5 bg-obsidian-950 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full h-10 sm:h-11 px-3.5 bg-obsidian-950 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Confirm Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full h-10 sm:h-11 px-3.5 bg-obsidian-950 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-cyan-500 focus:ring-cyan-500 bg-obsidian-950"
                    />
                    <span>
                      I agree to the FinShield Banking Terms, Data Privacy Charter, and Autonomous Resilience Safeguards.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 sm:h-13 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-obsidian-950 font-bold sm:font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-glow-emerald/50 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-obsidian-950" />
                        <span>Creating Digital Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Complete Registration & Open Account</span>
                      </>
                    )}
                  </Button>
                </form>

                {/* Bottom switch to Sign In */}
                <div className="pt-2 text-center text-xs text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.click();
                      setAuthMode("signin");
                      setErrorMessage(null);
                    }}
                    className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                  >
                    Sign In here →
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                CARD 3: 2-FACTOR OTP VERIFICATION
               ══════════════════════════════════════════════════════════ */}
            {authMode === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-5 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Two-Factor Security
                    </h2>
                    <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      SMS / OTP
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Enter the 6-digit code sent to your registered mobile number <span className="text-slate-200 font-mono">(Demo: 123456)</span>
                  </p>
                </div>

                <div className="flex justify-between gap-2 sm:gap-3 py-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-11 sm:w-13 h-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold bg-obsidian-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-cyan-400 focus:shadow-glow-cyan/40 transition-all"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 sm:h-13 md:h-14 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-obsidian-950 font-bold sm:font-extrabold text-sm sm:text-base tracking-wide shadow-glow-cyan/60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Verify & Access Banking Portal</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.click();
                      setAuthMode("signin");
                      setErrorMessage(null);
                    }}
                    className="hover:text-white transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.click();
                      setOtp(["1", "2", "3", "4", "5", "6"]);
                      setSuccessMessage("Demo code resent: 123456");
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* ══════════════════════════════════════════════════════════
                CARD 4: FORGOT PASSWORD RECOVERY
               ══════════════════════════════════════════════════════════ */}
            {authMode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Recover your password
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Enter your registered email or phone to reset credentials
                  </p>
                </div>

                {forgotStep === 1 ? (
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-300">Registered Email or Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. arjun@demo.finshield"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full h-11 sm:h-12 px-4 bg-obsidian-950 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-300">Set New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="New password (min 6 characters)"
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      className="w-full h-11 sm:h-12 px-4 bg-obsidian-950 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 sm:h-13 md:h-14 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-obsidian-950 font-bold sm:font-extrabold text-sm sm:text-base tracking-wide shadow-glow-cyan/60"
                >
                  {loading ? "Processing..." : forgotStep === 1 ? "Send Recovery Code" : "Update Password & Sign In"}
                </Button>

                <div className="text-center pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.click();
                      setAuthMode("signin");
                      setForgotStep(1);
                      setErrorMessage(null);
                    }}
                    className="text-slate-400 hover:text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Security Footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-cyan-400" /> Supabase 256-Bit Auth
              </span>
              <span>TLS 1.3 Verified</span>
            </div>
          </div>

          {/* Quick Security & Trust Telemetry */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono pt-4">
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Zero Liability Protection
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> ISO 27001 Certified
            </span>
          </div>
        </main>
      </div>
  );
}
