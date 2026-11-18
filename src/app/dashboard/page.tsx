"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  FileText,
  Play,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import { ApprovalItem, DashboardOverview } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalDialog } from "@/components/ui/approval-dialog";
import { useToast } from "@/components/ui/toast";
import {
  formatDateTime,
  formatDuration,
  formatINR,
  formatNumber,
} from "@/lib/utils";

export default function CommandCenterPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardOverview | null>(() =>
    sparkApi.peekCache<DashboardOverview>("/api/dashboard/overview")
  );
  const [loading, setLoading] = useState<boolean>(
    () => !sparkApi.peekCache<DashboardOverview>("/api/dashboard/overview")
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalItem | null>(null);

  const loadOverview = useCallback(
    async (signal?: AbortSignal, skipCache = false) => {
      try {
        setError(null);
        const res = await sparkApi.getDashboardOverview(signal, skipCache);
        setData(res);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(
            (err as Error).message ||
              "Could not connect to orchestration service."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    loadOverview(controller.signal, false);
    const interval = setInterval(() => loadOverview(undefined, true), 6000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [loadOverview]);

  const handleResolveApproval = async (
    approvalId: string,
    decision: "approved" | "rejected",
    note: string
  ) => {
    await sparkApi.resolveApproval(approvalId, decision, note);
    toast({
      title:
        decision === "approved"
          ? "Approval Granted — Workflow Resumed"
          : "Action Rejected — Workflow Halted",
      description: `LangGraph Execution Agent notified (${decision.toUpperCase()}).`,
      variant: decision === "approved" ? "success" : "warning",
    });
    await loadOverview();
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="p-8 text-center max-w-xl mx-auto mt-12 border-rose-500/40">
        <CardTitle className="mb-2">Orchestration Service Connection Required</CardTitle>
        <CardDescription className="mb-6">{error}</CardDescription>
        <Button onClick={() => loadOverview()}>
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </Card>
    );
  }

  if (!data) return null;

  const { kpis } = data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
              EXECUTIVE TELEMETRY & ORCHESTRATION
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            AI Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => loadOverview()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Telemetry
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/new">
              <PlusCircle className="h-4 w-4" />
              Dispatch Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Pending Human Approval Alert Strip */}
      {data.pending_approvals.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-violet-500/10 to-cyan-500/10 border border-amber-400/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-bold text-white">
                  Human-in-the-Loop Checkpoint Active
                </h2>
                <Badge variant="warning">
                  {data.pending_approvals.length} PENDING
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {data.pending_approvals[0].action_title} —{" "}
                <span className="text-amber-200 font-medium">
                  {data.pending_approvals[0].workflow_title}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="cyan"
              onClick={() => setSelectedApproval(data.pending_approvals[0])}
            >
              Inspect & Authorize
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/dashboard/approvals">View All</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card interactive className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Total Workflows Executed</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-white">
              {kpis.total_workflows}
            </p>
            <Badge variant="success">{kpis.success_rate_pct}% Success</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {kpis.completed_workflows} completed • {kpis.active_or_waiting} active/gated
          </p>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Avg Multi-Agent Cycle Time</span>
            <Clock className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-white">
              {formatDuration(kpis.avg_duration_ms)}
            </p>
            <Badge variant="cyan">Parallel DAG</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Research & Analysis forked concurrently
          </p>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Total Tokens Processed</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-white">
              {formatNumber(kpis.total_tokens)}
            </p>
            <span className="font-mono text-xs text-emerald-300">
              {formatINR(kpis.total_cost_usd)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Persisted across workflow checkpoint runs
          </p>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Intelligence Reports & Gates</span>
            <FileText className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-white">
              {kpis.reports_generated}
            </p>
            <Badge variant={kpis.pending_approvals > 0 ? "warning" : "neutral"}>
              {kpis.pending_approvals} Pending Gate
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Audit-signed executive briefings
          </p>
        </Card>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workflow Execution & Token Throughput</CardTitle>
                <CardDescription>
                  7-day persisted execution volume and token consumption
                </CardDescription>
              </div>
              <Badge variant="default">LIVE TELEMETRY</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[290px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.execution_history}>
                <defs>
                  <linearGradient id="tokensGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.55} />
                    <stop offset="65%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#03110B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.14)" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#061C13",
                    borderColor: "rgba(250, 204, 21, 0.55)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#F7F9F4",
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="tokens"
                  name="Tokens Processed"
                  stroke="#FACC15"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#FEF08A", stroke: "#CA8A04", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#FEF9C3", stroke: "#EAB308", strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#tokensGrad)"
                  isAnimationActive={false}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="workflows"
                  name="Workflows Run"
                  stroke="#10B981"
                  strokeWidth={2.2}
                  dot={{ r: 3.5, fill: "#6EE7B7", stroke: "#059669", strokeWidth: 1.5 }}
                  fillOpacity={1}
                  fill="url(#runsGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Specialized Agent Latency (ms)</CardTitle>
                <CardDescription>
                  Measured node execution latency across LangGraph runs
                </CardDescription>
              </div>
              <Badge variant="cyan">6 AGENTS</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[290px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.agent_performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.14)" />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  dataKey="agent"
                  type="category"
                  stroke="#FEF9C3"
                  fontSize={11}
                  width={78}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#061C13",
                    borderColor: "rgba(16, 185, 129, 0.55)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="avg_latency_ms"
                  name="Avg Latency (ms)"
                  fill="#10B981"
                  stroke="#FACC15"
                  strokeWidth={1}
                  radius={[0, 8, 8, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workflows Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Multi-Agent Missions</CardTitle>
            <CardDescription>
              Click any workflow to open its live React Flow execution graph
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/history">
              Full History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-4">Mission Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active Node</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {data.recent_workflows.map((wf) => (
                  <tr
                    key={wf.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/monitor?id=${wf.id}`}
                        className="font-semibold text-white hover:text-cyan-300 transition-colors block"
                      >
                        {wf.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {wf.id} • {formatDateTime(wf.created_at)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{wf.category}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={wf.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-300 uppercase">
                      {wf.current_node}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatDuration(wf.duration_ms)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatNumber(wf.tokens_used)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/monitor?id=${wf.id}`}>
                          <Play className="h-3 w-3" />
                          Inspect Graph
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ApprovalDialog
        approval={selectedApproval}
        open={Boolean(selectedApproval)}
        onOpenChange={(open) => !open && setSelectedApproval(null)}
        onResolve={handleResolveApproval}
      />
    </div>
  );
}
