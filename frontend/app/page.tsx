"use client";
import { AuthWorkstation } from "@/components/auth/AuthWorkstation";

/**
 * Root Application Entry Point
 * Starts directly with the FinShield Authorization (Auth) Page with zero redirect delay.
 */
export default function RootPage() {
  return <AuthWorkstation />;
}
