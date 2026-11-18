import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-space-800/80 via-space-700/50 to-space-800/80",
        className
      )}
      {...props}
    />
  );
}
