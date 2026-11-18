"use client";

import React, { useEffect, useState } from "react";
import { Blocks, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import { sparkApi } from "@/lib/api";
import { IntegrationItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<IntegrationItem[]>(
    () => sparkApi.peekCache<IntegrationItem[]>("/api/integrations") || []
  );

  useEffect(() => {
    const controller = new AbortController();
    sparkApi
      .getIntegrations(controller.signal)
      .then(setItems)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleToggle = async (slug: string, current: string) => {
    const nextStatus = current === "connected" ? "disconnected" : "connected";
    try {
      await sparkApi.toggleIntegration(slug, nextStatus);
      setItems((prev) =>
        prev.map((i) => (i.slug === slug ? { ...i, status: nextStatus } : i))
      );
      toast({
        title: `Connector ${
          nextStatus === "connected" ? "Enabled" : "Disconnected"
        }`,
        description: `${slug} status updated in SQLite vault.`,
        variant: nextStatus === "connected" ? "success" : "default",
      });
    } catch (err) {
      toast({
        title: "Failed to Update Connector",
        description: (err as Error).message,
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Blocks className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
            ZERO-TRUST ENTERPRISE CONNECTORS
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Secure Integrations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          All connector credentials are encrypted and isolated. Toggle
          connectors available to the Execution and Research agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            interactive
            className="flex flex-col justify-between"
          >
            <div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">{item.category}</Badge>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <Switch
                      checked={item.status === "connected"}
                      onCheckedChange={() =>
                        handleToggle(item.slug, item.status)
                      }
                    />
                  </div>
                </div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-cyan-400" />
                    Security Posture
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-lg bg-space-900 border border-slate-700/80 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
                      Zero-Trust Vault • Credentials Redacted
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="px-6 pb-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Ping: {item.latency_ms}ms</span>
              <span>Verified: {formatDateTime(item.last_verified_at)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
