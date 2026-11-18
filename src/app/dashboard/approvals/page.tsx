"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Terminal,
  ExternalLink,
  Clock,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import { ApprovalItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalDialog } from "@/components/ui/approval-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

export default function ApprovalCenterPage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalItem[]>(
    () => sparkApi.peekCache<ApprovalItem[]>("/api/approvals") || []
  );
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalItem | null>(null);

  const loadApprovals = useCallback(async () => {
    try {
      const list = await sparkApi.getApprovals("all");
      setApprovals(list);
    } catch {
      // handled gracefully
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const handleResolve = async (
    approvalId: string,
    decision: "approved" | "rejected",
    note: string
  ) => {
    await sparkApi.resolveApproval(approvalId, decision, note);
    toast({
      title:
        decision === "approved"
          ? "Action Approved — Execution Resumed"
          : "Action Rejected — Workflow Halted",
      description: `Checkpoint ${approvalId} marked as ${decision.toUpperCase()}.`,
      variant: decision === "approved" ? "success" : "warning",
    });
    await loadApprovals();
  };

  const pendingList = approvals.filter((a) => a.status === "pending");
  const resolvedList = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
            HUMAN-IN-THE-LOOP GOVERNANCE
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Approval Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review and authorize high-impact external mutations before the
          Execution Agent commits changes.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Checkpoints ({pendingList.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Audit History ({resolvedList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingList.length === 0 ? (
            <Card className="p-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <CardTitle>All Governance Gates Clear</CardTitle>
              <CardDescription className="mt-1">
                No workflows are currently waiting for human authorization.
              </CardDescription>
            </Card>
          ) : (
            pendingList.map((item) => (
              <Card
                key={item.id}
                className="border-amber-400/40 shadow-[0_0_30px_-8px_rgba(251,191,36,0.25)]"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <Badge variant="danger">
                        RISK: {item.risk_level.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-xs text-slate-400">
                        {item.id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>
                  <CardTitle>{item.action_title}</CardTitle>
                  <CardDescription>
                    Workflow:{" "}
                    <Link
                      href={`/dashboard/monitor?id=${item.workflow_id}`}
                      className="text-cyan-300 hover:underline inline-flex items-center gap-1"
                    >
                      {item.workflow_title}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-space-900/90 border border-slate-800 p-4 text-xs text-slate-200 leading-relaxed">
                    {item.rationale}
                  </div>

                  <div className="rounded-xl bg-space-950 border border-slate-800 p-3.5">
                    <div className="flex items-center justify-between text-xs font-mono text-violet-300">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Execution Scope: {item.action_type.replace(/_/g, " ").toUpperCase()}</span>
                      </span>
                      <span className="text-emerald-300">Sensitive Payload Redacted</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        handleResolve(
                          item.id,
                          "rejected",
                          "Rejected via Approval Center."
                        )
                      }
                    >
                      <XCircle className="h-4 w-4" />
                      Reject & Halt
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedApproval(item)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Review & Authorize Execution
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedList.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="font-mono text-xs text-slate-400">
                      {item.id}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Resolved: {formatDateTime(item.resolved_at)}
                  </span>
                </div>
                <CardTitle className="text-base">{item.action_title}</CardTitle>
                <CardDescription>{item.workflow_title}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-300 space-y-2">
                <p>{item.rationale}</p>
                {item.reviewer_note && (
                  <p className="rounded-lg bg-space-900 border border-slate-800 p-2.5 text-cyan-200 font-mono">
                    Reviewer Note: {item.reviewer_note}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <ApprovalDialog
        approval={selectedApproval}
        open={Boolean(selectedApproval)}
        onOpenChange={(open) => !open && setSelectedApproval(null)}
        onResolve={handleResolve}
      />
    </div>
  );
}
