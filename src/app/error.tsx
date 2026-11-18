"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-space-950 p-6 text-center">
      <div className="max-w-md rounded-2xl spark-glass border border-rose-500/35 p-8">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-400 mb-4" />
        <h2 className="font-display text-xl font-bold text-white mb-2">
          Command Interface Interrupted
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {error.message || "An unexpected client error occurred."}
        </p>
        <Button onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" />
          Recover Interface
        </Button>
      </div>
    </div>
  );
}
