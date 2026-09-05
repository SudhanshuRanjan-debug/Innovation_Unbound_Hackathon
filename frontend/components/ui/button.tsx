import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-500 to-teal-500 text-obsidian-950 shadow-glow-cyan/50 hover:from-cyan-400 hover:to-teal-400 hover:shadow-glow-cyan",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-glow-red/30 hover:from-red-500 hover:to-rose-500",
        outline:
          "border border-white/15 bg-obsidian-900/60 text-slate-200 backdrop-blur-md hover:bg-white/10 hover:border-cyan-500/40 hover:text-white",
        secondary:
          "bg-obsidian-800 text-slate-200 hover:bg-obsidian-750 hover:text-white border border-white/5",
        ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
        link: "text-cyan-400 underline-offset-4 hover:underline",
        glow: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan hover:bg-cyan-500/30",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
