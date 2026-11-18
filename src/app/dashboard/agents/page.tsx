"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ShieldCheck,
  GitBranch,
  Globe,
  BarChart3,
  Cpu,
  FileText,
  Wrench,
  ArrowRight,
  Clock,
  Activity,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import { AgentCatalogItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatNumber } from "@/lib/utils";

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  supervisor: ShieldCheck,
  planner: GitBranch,
  research: Globe,
  analysis: BarChart3,
  execution: Cpu,
  reporting: FileText,
};

export default function AgentWorkspacePage() {
  const [agents, setAgents] = useState<AgentCatalogItem[]>(
    () => sparkApi.peekCache<AgentCatalogItem[]>("/api/agents") || []
  );
  const [loading, setLoading] = useState<boolean>(
    () => !sparkApi.peekCache<AgentCatalogItem[]>("/api/agents")
  );

  useEffect(() => {
    const controller = new AbortController();
    sparkApi
      .getAgents(controller.signal)
      .then(setAgents)
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
              SPECIALIZED MULTI-AGENT FLEET
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Agent Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inspect the 6 specialized autonomous AI agents, their toolboxes,
            and live persisted execution metrics.
          </p>
        </div>

        <Button size="sm" asChild>
          <Link href="/dashboard/monitor">
            View Live Agent Topology
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.id] || Bot;
            return (
              <Card
                key={agent.id}
                interactive
                className="flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15"
                        style={{
                          backgroundColor: `${agent.color}22`,
                          color: agent.color,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <StatusBadge status={agent.status} />
                    </div>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription className="text-violet-300 font-medium">
                      {agent.role}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {agent.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-space-950/90 border border-slate-800 p-3 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400">Runs</p>
                        <p className="font-mono text-xs font-bold text-white mt-0.5">
                          {agent.invocations}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Avg Latency</p>
                        <p className="font-mono text-xs font-bold text-cyan-300 mt-0.5">
                          {formatDuration(agent.avg_latency_ms)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Tokens</p>
                        <p className="font-mono text-xs font-bold text-emerald-300 mt-0.5">
                          {formatNumber(agent.total_tokens)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                        Authorized Tool Capabilities
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.tools.map((tool) => (
                          <span
                            key={tool}
                            className="inline-flex items-center gap-1 rounded-lg bg-space-900 border border-slate-700/80 px-2 py-1 text-[11px] font-mono text-slate-300"
                          >
                            <Wrench className="h-3 w-3 text-cyan-400" />
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="px-6 pb-5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-emerald-300">Autonomous Core</span>
                  <Link
                    href="/dashboard/new"
                    className="text-cyan-300 hover:text-white inline-flex items-center gap-1"
                  >
                    Assign Task <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
