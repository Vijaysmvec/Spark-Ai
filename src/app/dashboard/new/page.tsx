"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Play,
  ShieldCheck,
  Zap,
  Globe,
  FileSpreadsheet,
  MessageSquare,
  GitBranch,
  Layers,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

const MISSION_TEMPLATES = [
  {
    title: "Q4 Enterprise Revenue & Pricing Intelligence",
    category: "Revenue Operations",
    priority: "critical",
    prompt:
      "Analyze Q4 enterprise pipeline velocity across EMEA and North America, extract competitor pricing matrices via headless browser, run quantitative cohort simulation, update Google Workspace forecast sheets, and post an executive brief to Slack.",
  },
  {
    title: "Multi-Cloud Kubernetes & GPU FinOps Rightsizing",
    category: "Cloud FinOps",
    priority: "high",
    prompt:
      "Audit utilization telemetry across 14 production Kubernetes clusters and reserved GPU nodes, calculate monthly run-rate savings with p99 SLA protection, and prepare an automated Terraform rightsizing patch.",
  },
  {
    title: "Zero-Trust API Perimeter & Dependency Security Audit",
    category: "Security & Compliance",
    priority: "critical",
    prompt:
      "Perform an automated security audit across all production microservices, OAuth scopes, and third-party packages, compute CVSS risk matrices, and generate an executive SOC2 compliance report.",
  },
  {
    title: "Global Supplier Contract & SLA Risk Verification",
    category: "Legal & Procurement",
    priority: "medium",
    prompt:
      "Cross-examine vendor SLA agreements against enterprise legal guardrails, model supply-chain disruption probability, and synchronize approved vendor scorecards.",
  },
];

function NewWorkflowForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialPrompt =
    searchParams.get("prompt") || MISSION_TEMPLATES[0].prompt;

  const [title, setTitle] = useState("Enterprise Multi-Agent Directive");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [category, setCategory] = useState("Revenue Operations");
  const [priority, setPriority] = useState("critical");
  const [requireApproval, setRequireApproval] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectTemplate = (tpl: (typeof MISSION_TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setPriority(tpl.priority);
    setPrompt(tpl.prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 5) {
      toast({
        title: "Mission Directive Required",
        description: "Please provide a detailed workflow objective.",
        variant: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await sparkApi.createWorkflow({
        title: title.trim() || undefined,
        prompt: prompt.trim(),
        category,
        priority,
        require_approval: requireApproval,
      });

      toast({
        title: "Workflow Dispatched to LangGraph Engine",
        description: `Mission ${created.id} is now executing live.`,
        variant: "success",
      });

      router.push(`/dashboard/monitor?id=${created.id}`);
    } catch (err) {
      toast({
        title: "Failed to Launch Workflow",
        description: (err as Error).message,
        variant: "error",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
            LANGGRAPH MISSION COMPOSER
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Launch New Multi-Agent Workflow
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Define your objective in natural language. SPARK AI will orchestrate
          Supervisor, Planner, Research, Analysis, Execution, and Reporting
          agents.
        </p>
      </div>

      {/* Blueprint Presets */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
          Enterprise Blueprint Presets
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {MISSION_TEMPLATES.map((tpl) => (
            <button
              key={tpl.title}
              type="button"
              onClick={() => handleSelectTemplate(tpl)}
              className="text-left rounded-2xl spark-glass-interactive p-4 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="cyan">{tpl.category}</Badge>
                <span className="font-mono text-[10px] uppercase text-slate-400">
                  Priority: {tpl.priority}
                </span>
              </div>
              <p className="font-display text-sm font-bold text-white mb-1">
                {tpl.title}
              </p>
              <p className="text-xs text-slate-400 line-clamp-2">
                {tpl.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Composer Card */}
      <Card className="border-violet-500/35">
        <CardHeader>
          <CardTitle>Mission Parameters & Governance</CardTitle>
          <CardDescription>
            Configure execution priority and Human-in-the-Loop approval
            checkpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mission Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q4 Enterprise Pipeline & Pricing Audit"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Operational Domain
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-700/80 bg-space-900/90 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Revenue Operations">Revenue Operations</option>
                  <option value="Cloud FinOps">Cloud FinOps</option>
                  <option value="Security & Compliance">
                    Security & Compliance
                  </option>
                  <option value="Strategic Intelligence">
                    Strategic Intelligence
                  </option>
                  <option value="Legal & Procurement">
                    Legal & Procurement
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Natural Language Command Directive
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="Instruct the AI workforce on what to research, analyze, execute, and report..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl bg-space-900/80 border border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Require Human-in-the-Loop Approval Gate
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pause before Execution Agent performs external API or
                      browser actions
                    </p>
                  </div>
                </div>
                <Switch
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>

              <div className="rounded-2xl bg-space-900/80 border border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Execution Priority Tier
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Allocates dedicated multi-agent execution concurrency
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {["medium", "high", "critical"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-mono uppercase transition-colors ${
                        priority === p
                          ? "bg-violet-600 text-white"
                          : "bg-space-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tool Connectors Preview */}
            <div className="rounded-2xl bg-space-950/90 border border-slate-800/90 p-4">
              <p className="text-xs font-mono uppercase text-slate-400 mb-3">
                Connected Agent Toolboxes Enabled for This Run
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-space-900/60 p-2.5 text-slate-200">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <span>Playwright Browser</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-space-900/60 p-2.5 text-slate-200">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <span>Google Workspace</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-space-900/60 p-2.5 text-slate-200">
                  <MessageSquare className="h-4 w-4 text-violet-400" />
                  <span>Slack Command Bus</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-space-900/60 p-2.5 text-slate-200">
                  <GitBranch className="h-4 w-4 text-amber-400" />
                  <span>Python Sandbox</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={submitting}>
                <Play className="h-4 w-4 fill-current" />
                {submitting
                  ? "Initializing LangGraph State..."
                  : "Launch Multi-Agent Workflow"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewWorkflowPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading composer...</div>}>
      <NewWorkflowForm />
    </Suspense>
  );
}
