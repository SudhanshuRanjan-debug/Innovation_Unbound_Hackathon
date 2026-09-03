"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Calculator,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",   label: "Dashboard",         icon: LayoutDashboard },
  { href: "/health",      label: "Financial Health",  icon: HeartPulse },
  { href: "/forecast",    label: "Cash Flow",         icon: TrendingUp },
  { href: "/interventions", label: "Interventions",   icon: AlertTriangle },
  { href: "/loans",       label: "Loan Comparison",   icon: CreditCard },
  { href: "/simulator",   label: "Simulator",         icon: Calculator },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r bg-white h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">FinShield</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-blue-600" : "text-gray-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t">
        <p className="text-xs text-muted-foreground">Demo Customer</p>
        <p className="text-sm font-medium text-gray-900">Arjun Mehta</p>
      </div>
    </aside>
  );
}
