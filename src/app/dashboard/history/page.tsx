"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Play,
  RotateCcw,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import { WorkflowRun } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  formatDateTime,
  formatDuration,
  formatINR,
  formatNumber,
} from "@/lib/utils";

export default function WorkflowHistoryPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowRun[]>(
    () => sparkApi.peekCache<WorkflowRun[]>("/api/workflows") || []
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      const list = await sparkApi.getWorkflows({
        status: statusFilter,
        search,
      });
      setWorkflows(list);
    } catch {
      // handled gracefully
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
              PERSISTED EXECUTION LEDGER
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Workflow Execution History
          </h1>
        </div>

        <Button size="sm" asChild>
          <Link href="/dashboard/new">
            <PlusCircle className="h-4 w-4" />
            New Workflow
          </Link>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["all", "completed", "waiting_approval", "running", "cancelled"].map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? "bg-violet-600 text-white shadow-glow-violet"
                    : "bg-space-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {st.replace("_", " ").toUpperCase()}
              </button>
            )
          )}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mission title or category..."
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Persisted Workflow Runs ({workflows.length})</CardTitle>
          <CardDescription>
            Complete telemetry record including tokens, cost, and checkpoint
            status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-4">Mission</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4">Est. Cost</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {workflows.map((wf) => (
                  <tr
                    key={wf.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Link
                        href={`/dashboard/monitor?id=${wf.id}`}
                        className="font-semibold text-white hover:text-cyan-300 block"
                      >
                        {wf.title}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400">
                        {wf.id} • {formatDateTime(wf.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{wf.category}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={wf.status} />
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {formatDuration(wf.duration_ms)}
                    </td>
                    <td className="py-4 px-4 font-mono text-cyan-300">
                      {formatNumber(wf.tokens_used)}
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-300">
                      {formatINR(wf.cost_usd)}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await sparkApi.retryWorkflow(wf.id);
                          toast({
                            title: "Workflow Re-Dispatched",
                            description: `${wf.title} is running again.`,
                            variant: "success",
                          });
                          loadHistory();
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Re-Run
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/monitor?id=${wf.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Graph
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
    </div>
  );
}
