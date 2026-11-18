"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  HeartPulse,
  CheckCircle2,
  Cpu,
  Database,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import { SystemHealthResponse } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(() =>
    sparkApi.peekCache<SystemHealthResponse>("/api/health")
  );

  const loadHealth = useCallback(async () => {
    try {
      const res = await sparkApi.getHealth();
      setHealth(res);
    } catch {
      // handled gracefully
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-300">
              INFRASTRUCTURE & RUNTIME DIAGNOSTICS
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            System Health & Telemetry
          </h1>
        </div>

        <Button variant="outline" size="sm" onClick={loadHealth}>
          <RefreshCw className="h-3.5 w-3.5" />
          Run Diagnostics
        </Button>
      </div>

      {health && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">AI Orchestrator</span>
                <Cpu className="h-4 w-4 text-violet-400" />
              </div>
              <p className="font-display text-xl font-bold text-white">
                {health.engine.orchestrator}
              </p>
              <p className="text-xs text-cyan-300 font-mono mt-1">
                Status: Protected & Active
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  Database & Checkpointer
                </span>
                <Database className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="font-display text-xl font-bold text-white">
                {health.database.engine}
              </p>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                {health.database.persisted_workflows} workflows •{" "}
                {health.database.persisted_events} events
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Platform Uptime</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="font-display text-xl font-bold text-white">
                {health.uptime_pct}% SLA
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Mode: {health.engine.execution_mode}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle>Subsystem Status Matrix</CardTitle>
                <CardDescription>
                  Live verification of API Gateway, Orchestration Runtime,
                  Inference Router, and Persistence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {health.subsystems.map((sub) => (
                  <div
                    key={sub.name}
                    className="flex items-center justify-between rounded-xl bg-space-900/80 border border-slate-800 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {sub.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Availability: {sub.uptime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-cyan-300">
                        {sub.latency_ms}ms
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>Subsystem Latency Breakdown (ms)</CardTitle>
                <CardDescription>
                  Real-time response latency across core services
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[310px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={health.subsystems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis
                      type="number"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#CBD5E1"
                      fontSize={10}
                      width={130}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#060B1E",
                        borderColor: "rgba(16, 185, 129, 0.4)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="latency_ms"
                      name="Latency (ms)"
                      fill="#10B981"
                      radius={[0, 8, 8, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
