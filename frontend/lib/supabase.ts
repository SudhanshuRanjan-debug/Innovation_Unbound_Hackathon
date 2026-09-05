"use client";
import { createClient } from "@supabase/supabase-js";

// ── ENVIRONMENT KEYS RESOLUTION ──
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;

/**
 * Returns true if real Supabase project credentials are configured in .env / .env.local
 */
export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
  rawSupabaseAnonKey &&
  !rawSupabaseUrl.includes("your-project") &&
  !rawSupabaseUrl.includes("demo-finshield") &&
  !rawSupabaseUrl.includes("placeholder-finshield") &&
  rawSupabaseAnonKey !== "your-supabase-anon-key-here" &&
  rawSupabaseAnonKey.length > 20
);

// Fallback dummy endpoint that avoids background network calls when not configured
const supabaseUrl = isSupabaseConfigured ? rawSupabaseUrl : "https://placeholder-finshield.supabase.co";
const supabaseAnonKey = isSupabaseConfigured ? rawSupabaseAnonKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy";

// ── SUPABASE CLIENT INITIALIZATION ──
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
});

/**
 * Initiate Actual Google OAuth Sign-In / Sign-Up (Real Google Provider Flow)
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: { message: "Supabase project is not configured. Please verify NEXT_PUBLIC_SUPABASE_URL in frontend/.env.local." },
    };
  }

  const redirectOrigin = typeof window !== "undefined"
    ? window.location.origin
    : (siteUrl || "http://localhost:3000");
  const redirectTo = `${redirectOrigin}/dashboard`;

  try {
    const res = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes: "email profile openid",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
          ...(googleClientId && !googleClientId.includes("your-google-client-id") ? { client_id: googleClientId } : {}),
        },
      },
    });

    if (res.error) {
      return { data: null, error: res.error };
    }

    // If Supabase returns OAuth URL and browser didn't automatically redirect
    if (res.data?.url && typeof window !== "undefined") {
      window.location.href = res.data.url;
    }

    return res;
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || "Failed to initiate Google authentication." },
    };
  }
}

/**
 * Initiate Actual GitHub OAuth Sign-In / Sign-Up (Real GitHub Provider Flow)
 */
export async function signInWithGithub() {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: { message: "Supabase project is not configured. Please verify NEXT_PUBLIC_SUPABASE_URL in frontend/.env.local." },
    };
  }

  const redirectOrigin = typeof window !== "undefined"
    ? window.location.origin
    : (siteUrl || "http://localhost:3000");
  const redirectTo = `${redirectOrigin}/dashboard`;

  try {
    const res = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "read:user user:email",
        queryParams: {
          ...(githubClientId && !githubClientId.includes("your-github-client-id") ? { client_id: githubClientId } : {}),
        },
      },
    });

    if (res.error) {
      return { data: null, error: res.error };
    }

    if (res.data?.url && typeof window !== "undefined") {
      window.location.href = res.data.url;
    }

    return res;
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || "Failed to initiate GitHub authentication." },
    };
  }
}

/**
 * Email & Password Sign In via Supabase
 */
export async function signInWithEmailPassword(email: string, pass: string) {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: { message: "Supabase authentication is not configured." },
    };
  }

  try {
    return await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || "Email authentication failed." },
    };
  }
}

/**
 * Email & Password Sign Up / Registration via Supabase
 */
export async function signUpWithEmailPassword(
  email: string,
  pass: string,
  metadata?: { fullName?: string; phone?: string }
) {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: { message: "Supabase authentication is not configured." },
    };
  }

  const redirectOrigin = typeof window !== "undefined"
    ? window.location.origin
    : (siteUrl || "http://localhost:3000");
  const redirectTo = `${redirectOrigin}/dashboard`;

  try {
    return await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: metadata,
        emailRedirectTo: redirectTo,
      },
    });
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || "Registration failed." },
    };
  }
}
