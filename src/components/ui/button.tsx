"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#0B593B] via-[#10B981] to-[#08442D] text-white border border-[#FACC15]/65 shadow-[0_0_24px_-4px_rgba(16,185,129,0.55),0_0_14px_-4px_rgba(234,179,8,0.35),inset_0_1px_0_0_rgba(254,240,138,0.45)] hover:brightness-110",
        cyan: "bg-[#EAB308]/20 text-[#FEF08A] border border-[#FACC15]/55 hover:bg-[#EAB308]/30 hover:border-[#FEF08A] shadow-glow-violet",
        glass:
          "spark-glass text-slate-100 hover:border-[#FACC15]/65 hover:bg-space-800/90",
        outline:
          "border border-[#D4AF37]/45 bg-space-900/70 text-slate-100 hover:border-[#FACC15]/75 hover:text-[#FEF9C3] hover:bg-emerald-950/60",
        ghost:
          "text-slate-300 hover:bg-emerald-500/10 hover:text-[#FEF08A]",
        danger:
          "bg-rose-500/20 text-rose-200 border border-rose-500/40 hover:bg-rose-500/30 hover:border-rose-400",
        success:
          "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base font-semibold",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
