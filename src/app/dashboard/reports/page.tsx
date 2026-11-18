"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Download,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import { ReportArtifact } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function ReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportArtifact[]>(
    () => sparkApi.peekCache<ReportArtifact[]>("/api/reports") || []
  );
  const [selectedReport, setSelectedReport] = useState<ReportArtifact | null>(
    () => {
      const cached = sparkApi.peekCache<ReportArtifact[]>("/api/reports");
      return cached && cached.length > 0 ? cached[0] : null;
    }
  );

  useEffect(() => {
    const controller = new AbortController();
    sparkApi
      .getReports(controller.signal)
      .then((list) => {
        setReports(list);
        if (list.length > 0) setSelectedReport(list[0]);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleCopyMarkdown = () => {
    if (!selectedReport) return;
    navigator.clipboard.writeText(selectedReport.markdown_content);
    toast({
      title: "Executive Report Copied",
      description: "Markdown briefing copied to clipboard.",
      variant: "success",
    });
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    const blob = new Blob([selectedReport.markdown_content], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
            REPORTING AGENT ARTIFACT VAULT
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Executive Intelligence Reports
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Audit-signed briefings, quantitative KPI scorecards, and strategic
          recommendations synthesized by the Reporting Agent.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Reports */}
        <div className="lg:col-span-4 space-y-3">
          {reports.map((rep) => {
            const isSelected = selectedReport?.id === rep.id;
            return (
              <button
                key={rep.id}
                type="button"
                onClick={() => setSelectedReport(rep)}
                className={`w-full text-left rounded-2xl p-4 border transition-all ${
                  isSelected
                    ? "spark-glass border-cyan-400 shadow-glow-cyan"
                    : "spark-glass border-slate-800 hover:border-violet-400/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="default">{rep.category}</Badge>
                  <span className="font-mono text-[11px] text-emerald-300">
                    {Math.round(rep.confidence_score * 100)}% Conf
                  </span>
                </div>
                <p className="font-display text-sm font-bold text-white mb-1">
                  {rep.title}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                  {rep.summary}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>{formatDateTime(rep.created_at)}</span>
                  <span>{formatNumber(rep.tokens_used)} tok</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Full Report Viewer */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <Card className="border-violet-500/35">
              <CardHeader className="border-b border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="cyan">{selectedReport.category}</Badge>
                    <Badge variant="success">
                      Confidence:{" "}
                      {Math.round(selectedReport.confidence_score * 100)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyMarkdown}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy MD
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadMarkdown}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                    <Button variant="cyan" size="sm" asChild>
                      <Link
                        href={`/dashboard/monitor?id=${selectedReport.workflow_id}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Source Graph
                      </Link>
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  {selectedReport.title}
                </CardTitle>
                <CardDescription>{selectedReport.summary}</CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* KPI Scorecard Strip */}
                {selectedReport.metrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {selectedReport.metrics.map((m, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-space-900/90 border border-slate-800 p-4"
                      >
                        <p className="text-xs text-slate-400">{m.label}</p>
                        <p className="font-display text-2xl font-bold text-white mt-1">
                          {m.value}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-mono text-cyan-300">
                          {m.delta}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formatted Executive Markdown Body */}
                <div className="rounded-2xl bg-space-950/90 border border-slate-800/90 p-6 space-y-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedReport.markdown_content}
                </div>

                {/* Strategic Recommendations */}
                {selectedReport.recommendations.length > 0 && (
                  <div className="rounded-2xl bg-violet-500/10 border border-violet-500/30 p-5">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-violet-300 mb-3">
                      <Sparkles className="h-4 w-4" />
                      <span>Recommended Next Executive Actions</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-200">
                      {selectedReport.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-400">
              Select a report to view its executive synthesis.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
