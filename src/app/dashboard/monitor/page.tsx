"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Play,
  RefreshCw,
  ShieldAlert,
  Terminal,
  Wifi,
  WifiOff,
  Wrench,
  XCircle,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import {
  AgentEvent,
  ApprovalItem,
  WorkflowNodeState,
  WorkflowRun,
} from "@/lib/types";
import { LiveWorkflowCanvas } from "@/components/workflow/LiveWorkflowCanvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ApprovalDialog } from "@/components/ui/approval-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/utils";

function LiveMonitorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const requestedId = searchParams.get("id");
  const [workflows, setWorkflows] = useState<WorkflowRun[]>(
    () => sparkApi.peekCache<WorkflowRun[]>("/api/workflows") || []
  );
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowRun | null>(
    () => {
      const list = sparkApi.peekCache<WorkflowRun[]>("/api/workflows");
      const targetId = requestedId || list?.[0]?.id;
      if (!targetId) return null;
      return (
        sparkApi.peekCache<WorkflowRun>(
          `/api/workflows/${encodeURIComponent(targetId)}`
        ) ||
        list?.find((w) => w.id === targetId) ||
        null
      );
    }
  );
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeState | null>(
    () => activeWorkflow?.nodes?.[0] || null
  );
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [streamStatus, setStreamStatus] = useState<
    "connecting" | "connected" | "reconnecting"
  >("connecting");
  const [approvalModal, setApprovalModal] = useState<ApprovalItem | null>(null);

  const fetchWorkflowDetail = useCallback(async (wfId: string) => {
    try {
      const detail = await sparkApi.getWorkflowDetail(wfId);
      setActiveWorkflow(detail);
      if (detail.events) {
        setEvents(detail.events);
      }
      setSelectedNode((prev) => {
        if (!prev) {
          return (
            detail.nodes.find((n) => n.id === detail.current_node) ||
            detail.nodes[0] ||
            null
          );
        }
        if (
          detail.status === "running" ||
          detail.status === "waiting_approval"
        ) {
          return (
            detail.nodes.find((n) => n.id === detail.current_node) ||
            detail.nodes.find((n) => n.id === prev.id) ||
            prev
          );
        }
        return detail.nodes.find((n) => n.id === prev.id) || prev;
      });
    } catch {
      // handled gracefully
    }
  }, []);

  useEffect(() => {
    sparkApi
      .getWorkflows()
      .then((list) => {
        setWorkflows(list);
        const targetId = requestedId || list[0]?.id;
        if (targetId) {
          fetchWorkflowDetail(targetId);
        }
      })
      .catch(() => {});
  }, [requestedId, fetchWorkflowDetail]);

  // Connect to FastAPI Server-Sent Events stream with automatic recovery
  useEffect(() => {
    const wfId = activeWorkflow?.id;
    if (!wfId) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    const connectSSE = () => {
      if (unmounted) return;
      setStreamStatus("connecting");
      const url = sparkApi.getWorkflowStreamUrl(wfId);
      es = new EventSource(url);

      es.onopen = () => {
        if (!unmounted) setStreamStatus("connected");
      };

      es.addEventListener("connected", () => {
        if (!unmounted) setStreamStatus("connected");
      });

      es.addEventListener("agent_event", (evt) => {
        try {
          const parsed = JSON.parse((evt as MessageEvent).data) as AgentEvent;
          setEvents((prev) => {
            if (prev.some((e) => e.id === parsed.id && parsed.id !== 0)) {
              return prev;
            }
            return [...prev, parsed];
          });
          fetchWorkflowDetail(wfId);
        } catch {
          // ignore malformed event
        }
      });

      es.onerror = () => {
        if (unmounted) return;
        setStreamStatus("reconnecting");
        es?.close();
        reconnectTimer = setTimeout(() => {
          fetchWorkflowDetail(wfId);
          connectSSE();
        }, 2500);
      };
    };

    connectSSE();

    // Poll fallback while workflow is actively running
    const poll = setInterval(() => {
      if (
        activeWorkflow?.status === "running" ||
        activeWorkflow?.status === "waiting_approval"
      ) {
        fetchWorkflowDetail(wfId);
      }
    }, 2000);

    return () => {
      unmounted = true;
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(poll);
    };
  }, [activeWorkflow?.id, activeWorkflow?.status, fetchWorkflowDetail]);

  const handleResolveApproval = async (
    approvalId: string,
    decision: "approved" | "rejected",
    note: string
  ) => {
    await sparkApi.resolveApproval(approvalId, decision, note);
    toast({
      title:
        decision === "approved"
          ? "Execution Authorized — Resuming Graph"
          : "Workflow Halted by Operator",
      description: `LangGraph checkpoint updated (${decision.toUpperCase()}).`,
      variant: decision === "approved" ? "success" : "warning",
    });
    if (activeWorkflow?.id) {
      await fetchWorkflowDetail(activeWorkflow.id);
    }
  };

  const pendingApproval = activeWorkflow?.approvals?.find(
    (a) => a.status === "pending"
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Badge
              variant={streamStatus === "connected" ? "success" : "warning"}
            >
              {streamStatus === "connected" ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              SSE STREAM: {streamStatus.toUpperCase()}
            </Badge>
            {activeWorkflow && <StatusBadge status={activeWorkflow.status} />}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {activeWorkflow?.title || "Live Multi-Agent Execution Monitor"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeWorkflow?.id || ""}
            onChange={(e) => {
              const id = e.target.value;
              router.push(`/dashboard/monitor?id=${id}`);
              fetchWorkflowDetail(id);
            }}
            className="h-10 rounded-xl border border-slate-700 bg-space-900 px-3 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                [{w.status.toUpperCase()}] {w.title}
              </option>
            ))}
          </select>

          {activeWorkflow && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchWorkflowDetail(activeWorkflow.id)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh State
            </Button>
          )}

          {activeWorkflow && (
            <Button
              variant="cyan"
              size="sm"
              onClick={async () => {
                await sparkApi.retryWorkflow(activeWorkflow.id);
                toast({
                  title: "Re-running Multi-Agent Graph",
                  description: "Supervisor Agent re-initialized execution.",
                  variant: "default",
                });
                fetchWorkflowDetail(activeWorkflow.id);
              }}
            >
              <Play className="h-3.5 w-3.5" />
              Re-Run Graph
            </Button>
          )}
        </div>
      </div>

      {/* Approval Waiting Banner */}
      {pendingApproval && (
        <div className="rounded-2xl bg-amber-500/15 border border-amber-400/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <p className="font-display text-sm font-bold text-white">
                Execution Agent Paused at Human-in-the-Loop Gate
              </p>
              <p className="text-xs text-slate-200 mt-0.5">
                {pendingApproval.action_title} — {pendingApproval.rationale}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setApprovalModal(pendingApproval)}
            className="shrink-0"
          >
            Authorize / Review Action
          </Button>
        </div>
      )}

      {/* Main React Flow Canvas + Selected Node Inspector */}
      {activeWorkflow && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <LiveWorkflowCanvas
              nodes={activeWorkflow.nodes}
              edges={activeWorkflow.edges}
              selectedNodeId={selectedNode?.id || null}
              onSelectNode={setSelectedNode}
              className="h-[520px]"
            />
          </div>

          {/* Right Node Detail Panel */}
          <Card className="xl:col-span-4 flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                  <Badge variant="default">AGENT NODE INSPECTOR</Badge>
                  {selectedNode && <StatusBadge status={selectedNode.status} />}
                </div>
                <CardTitle className="mt-2">
                  {selectedNode?.name || "Select a Node"}
                </CardTitle>
                <CardDescription>
                  {selectedNode?.role ||
                    "Click any node on the React Flow canvas"}
                </CardDescription>
              </CardHeader>

              {selectedNode && (
                <CardContent className="pt-4 space-y-4">
                  <div className="rounded-xl bg-space-950/90 border border-slate-800 p-3.5 text-xs text-slate-300 leading-relaxed">
                    <p className="font-mono text-[10px] uppercase text-cyan-300 mb-1">
                      Live Checkpoint Summary
                    </p>
                    {selectedNode.summary || selectedNode.description}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="rounded-xl bg-space-900/80 border border-slate-800 p-2.5">
                      <p className="text-[10px] text-slate-400">Latency</p>
                      <p className="font-mono text-xs font-bold text-white mt-0.5">
                        {formatDuration(selectedNode.latency_ms)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-space-900/80 border border-slate-800 p-2.5">
                      <p className="text-[10px] text-slate-400">Tokens</p>
                      <p className="font-mono text-xs font-bold text-cyan-300 mt-0.5">
                        {formatNumber(selectedNode.tokens)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-space-900/80 border border-slate-800 p-2.5">
                      <p className="text-[10px] text-slate-400">State</p>
                      <p className="font-mono text-[11px] font-bold text-violet-300 mt-0.5 uppercase">
                        {selectedNode.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-mono uppercase text-slate-400 mb-2">
                      Assigned Agent Tools
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.tools.map((tool) => (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1 rounded-lg bg-space-900 border border-slate-700/80 px-2.5 py-1 text-[11px] font-mono text-slate-300"
                        >
                          <Wrench className="h-3 w-3 text-cyan-400" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </div>

            <div className="p-6 pt-0">
              {activeWorkflow.report_id && (
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard/reports">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    Open Generated Executive Report
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Real-Time Event Stream Console */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <CardTitle>Real-Time Execution Event Stream</CardTitle>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {events.length} persisted events
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-space-950 border border-slate-800/90 p-4 max-h-72 overflow-y-auto font-mono text-xs space-y-2.5">
            {events.length === 0 ? (
              <p className="text-slate-500">
                Awaiting live workflow events from FastAPI SSE stream...
              </p>
            ) : (
              events.map((ev, i) => (
                <div
                  key={`${ev.id}-${i}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2 last:border-none"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-slate-500 shrink-0">
                      {formatDateTime(ev.timestamp)}
                    </span>
                    <span className="rounded bg-violet-500/20 border border-violet-400/30 px-1.5 py-0.5 text-[10px] uppercase text-violet-300 shrink-0">
                      {ev.agent_id}
                    </span>
                    <span className="text-slate-200">{ev.message}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                    {ev.tool_name && (
                      <span className="text-cyan-300">[{ev.tool_name}]</span>
                    )}
                    {ev.latency_ms > 0 && (
                      <span>{formatDuration(ev.latency_ms)}</span>
                    )}
                    {ev.tokens_delta > 0 && (
                      <span className="text-emerald-300">
                        +{ev.tokens_delta} tok
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ApprovalDialog
        approval={approvalModal}
        open={Boolean(approvalModal)}
        onOpenChange={(open) => !open && setApprovalModal(null)}
        onResolve={handleResolveApproval}
      />
    </div>
  );
}

export default function LiveMonitorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Connecting to Live Monitor...</div>}>
      <LiveMonitorContent />
    </Suspense>
  );
}
