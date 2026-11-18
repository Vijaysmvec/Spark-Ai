"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Badge } from "./badge";
import { Textarea } from "./input";
import { ShieldAlert, CheckCircle2, XCircle, Terminal } from "lucide-react";
import { ApprovalItem } from "@/lib/types";

interface ApprovalDialogProps {
  approval: ApprovalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (
    approvalId: string,
    decision: "approved" | "rejected",
    note: string
  ) => Promise<void>;
}

export function ApprovalDialog({
  approval,
  open,
  onOpenChange,
  onResolve,
}: ApprovalDialogProps) {
  const [note, setNote] = React.useState(
    "Verified execution payload and SLA guardrails."
  );
  const [submitting, setSubmitting] = React.useState(false);

  if (!approval) return null;

  const handleAction = async (decision: "approved" | "rejected") => {
    setSubmitting(true);
    try {
      await onResolve(approval.id, decision, note);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="warning">
              <ShieldAlert className="h-3.5 w-3.5" />
              HUMAN-IN-THE-LOOP GATE
            </Badge>
            <Badge
              variant={
                approval.risk_level === "high" ||
                approval.risk_level === "critical"
                  ? "danger"
                  : "cyan"
              }
            >
              RISK: {approval.risk_level.toUpperCase()}
            </Badge>
          </div>
          <DialogTitle>{approval.action_title}</DialogTitle>
          <DialogDescription>
            Workflow: <span className="text-slate-200">{approval.workflow_title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="rounded-xl bg-space-900/90 border border-slate-800 p-3.5 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-cyan-300 mb-1">
              Agent Rationale ({approval.agent_id.toUpperCase()}):
            </p>
            {approval.rationale}
          </div>

          <div className="rounded-xl bg-space-950/90 border border-violet-500/25 p-3.5">
            <div className="flex items-center justify-between text-xs font-mono text-violet-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                <span>Scope: {approval.action_type.replace(/_/g, " ").toUpperCase()}</span>
              </span>
              <span className="text-emerald-300">Sensitive Data Redacted</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reviewer Audit Note
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[72px] text-xs"
              placeholder="Enter governance sign-off note..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="danger"
            disabled={submitting}
            onClick={() => handleAction("rejected")}
          >
            <XCircle className="h-4 w-4" />
            Reject & Halt
          </Button>
          <Button
            variant="default"
            disabled={submitting}
            onClick={() => handleAction("approved")}
          >
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? "Dispatching..." : "Approve & Resume Execution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
