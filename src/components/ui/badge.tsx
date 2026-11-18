import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-violet-500/20 text-violet-200 border border-violet-400/35",
        cyan: "bg-cyan-500/15 text-cyan-200 border border-cyan-400/35",
        success:
          "bg-emerald-500/15 text-emerald-300 border border-emerald-400/35",
        warning:
          "bg-amber-500/15 text-amber-300 border border-amber-400/40",
        danger: "bg-rose-500/15 text-rose-300 border border-rose-400/35",
        neutral: "bg-slate-800/80 text-slate-300 border border-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "idle").toLowerCase();
  if (normalized === "completed" || normalized === "approved" || normalized === "connected" || normalized === "healthy" || normalized === "online") {
    return (
      <Badge variant="success">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  }
  if (normalized === "running" || normalized === "busy") {
    return (
      <Badge variant="cyan">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  }
  if (normalized === "waiting_approval" || normalized === "pending") {
    return (
      <Badge variant="warning">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        AWAITING APPROVAL
      </Badge>
    );
  }
  if (normalized === "failed" || normalized === "rejected" || normalized === "cancelled") {
    return (
      <Badge variant="danger">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  }
  return (
    <Badge variant="neutral">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {status.replace("_", " ").toUpperCase()}
    </Badge>
  );
}

export { Badge, badgeVariants };
