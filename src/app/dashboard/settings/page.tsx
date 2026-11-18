"use client";

import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, ShieldCheck, Cpu } from "lucide-react";
import { sparkApi } from "@/lib/api";
import { OrchestratorSettings } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<OrchestratorSettings>(
    () =>
      sparkApi.peekCache<OrchestratorSettings>("/api/settings") || {
        gemini_model: "autonomous-core",
        temperature: 0.2,
        require_human_approval_by_default: true,
        max_parallel_branches: 4,
        checkpoint_persistence: "sqlite_wal",
        daily_budget_usd: 2000.0,
        auto_retry_failed_nodes: true,
        telemetry_retention_days: 30,
      }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    sparkApi
      .getSettings(controller.signal)
      .then(setConfig)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await sparkApi.updateSettings(config);
      setConfig(updated);
      toast({
        title: "Orchestrator Configuration Saved",
        description: "Persisted to SQLite system_settings table.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Save Failed",
        description: (err as Error).message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
            ENGINE & GOVERNANCE CONFIGURATION
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Orchestrator Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure orchestration runtime parameters, checkpoint policies, and
          default human-in-the-loop guardrails.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-400" />
              <CardTitle>Orchestration & Runtime Parameters</CardTitle>
            </div>
            <CardDescription>
              All credentials and security keys are isolated and managed
              automatically in the secure vault.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Telemetry Retention Window (Days)
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={config.telemetry_retention_days}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    telemetry_retention_days:
                      parseInt(e.target.value, 10) || 30,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reasoning Temperature (0.0 – 1.0)
              </label>
              <Input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={config.temperature}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    temperature: parseFloat(e.target.value) || 0.2,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Max Parallel Execution Branches
              </label>
              <Input
                type="number"
                min="1"
                max="12"
                value={config.max_parallel_branches}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    max_parallel_branches: parseInt(e.target.value, 10) || 4,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Daily Token Budget Alert Cap (₹ INR)
              </label>
              <Input
                type="number"
                step="100"
                min="100"
                value={config.daily_budget_usd}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    daily_budget_usd: parseFloat(e.target.value) || 2000.0,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <CardTitle>Governance & Persistence Policies</CardTitle>
            </div>
            <CardDescription>
              Control Human-in-the-Loop checkpoints and automatic node recovery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-space-900/80 border border-slate-800 p-4">
              <div>
                <p className="text-xs font-semibold text-white">
                  Require Human Approval Gate by Default
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically pause new workflows before the Execution Agent
                  mutates external state
                </p>
              </div>
              <Switch
                checked={config.require_human_approval_by_default}
                onCheckedChange={(val) =>
                  setConfig({
                    ...config,
                    require_human_approval_by_default: val,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-space-900/80 border border-slate-800 p-4">
              <div>
                <p className="text-xs font-semibold text-white">
                  Auto-Retry Transient Node Failures
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically retry failed tool calls from the latest
                  LangGraph checkpoint
                </p>
              </div>
              <Switch
                checked={config.auto_retry_failed_nodes}
                onCheckedChange={(val) =>
                  setConfig({ ...config, auto_retry_failed_nodes: val })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Persisting..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}
