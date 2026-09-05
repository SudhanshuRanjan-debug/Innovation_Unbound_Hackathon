import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-glow-cyan/20",
        secondary: "border-white/10 bg-white/5 text-slate-300",
        destructive: "border-red-500/30 bg-red-500/10 text-red-400 shadow-glow-red/20",
        outline: "border-white/20 text-slate-300",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-glow-emerald/20",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-glow-amber/20",
        info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-glow-cyan/20",
        critical: "border-red-500/40 bg-red-500/15 text-red-400 shadow-glow-red/30 animate-pulse",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
