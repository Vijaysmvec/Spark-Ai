"use client";

import React, { useMemo } from "react";
import "@xyflow/react/dist/style.css";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import {
  ShieldCheck,
  GitBranch,
  Globe,
  BarChart3,
  Cpu,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Wrench,
} from "lucide-react";
import { WorkflowNodeState, WorkflowEdge } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  supervisor: ShieldCheck,
  planner: GitBranch,
  research: Globe,
  analysis: BarChart3,
  execution: Cpu,
  reporting: FileText,
};

function AgentCustomNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as WorkflowNodeState;
  const Icon = AGENT_ICONS[nodeData.id] || Cpu;
  const status = nodeData.status || "idle";

  const statusStyles: Record<string, string> = {
    idle: "border-slate-700/80 bg-space-900/90",
    running:
      "border-cyan-400 bg-space-850/95 shadow-[0_0_30px_-4px_rgba(34,211,238,0.55)] ring-1 ring-cyan-400/50",
    waiting_approval:
      "border-amber-400 bg-space-850/95 shadow-[0_0_30px_-4px_rgba(251,191,36,0.5)] ring-1 ring-amber-400/50",
    completed:
      "border-emerald-500/60 bg-space-900/95 shadow-[0_0_24px_-6px_rgba(16,185,129,0.35)]",
    failed:
      "border-rose-500/70 bg-space-900/95 shadow-[0_0_24px_-6px_rgba(244,63,94,0.4)]",
  };

  return (
    <div
      className={cn(
        "w-[255px] rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300",
        statusStyles[status] || statusStyles.idle,
        selected && "ring-2 ring-violet-400 shadow-glow-violet"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-space-950 !bg-cyan-400"
      />

      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15"
            style={{
              backgroundColor: `${nodeData.color}22`,
              color: nodeData.color,
            }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-xs font-bold tracking-wide text-white">
              {nodeData.name}
            </p>
            <p className="text-[10px] text-slate-400">{nodeData.role}</p>
          </div>
        </div>

        <div className="shrink-0">
          {status === "running" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
              <Loader2 className="h-3 w-3 animate-spin" />
              LIVE
            </span>
          )}
          {status === "waiting_approval" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              <AlertTriangle className="h-3 w-3" />
              GATE
            </span>
          )}
          {status === "completed" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              DONE
            </span>
          )}
          {status === "idle" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
              <Clock className="h-2.5 w-2.5" />
              IDLE
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-300 line-clamp-2 min-h-[32px] leading-relaxed mb-2.5">
        {nodeData.summary || nodeData.description}
      </p>

      {nodeData.active_tool && (
        <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-violet-500/15 border border-violet-400/30 px-2.5 py-1 text-[10px] font-mono text-violet-200">
          <Wrench className="h-3 w-3 text-cyan-400 animate-pulse" />
          <span className="truncate">tool: {nodeData.active_tool}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-800/90 pt-2 text-[10px] font-mono text-slate-400">
        <span>{nodeData.tools?.length || 0} tools</span>
        <div className="flex items-center gap-2">
          <span>{formatDuration(nodeData.latency_ms)}</span>
          <span>•</span>
          <span className="text-cyan-300">{nodeData.tokens || 0} tok</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-space-950 !bg-violet-400"
      />
    </div>
  );
}

const nodeTypes = {
  sparkAgent: AgentCustomNode,
};

interface LiveWorkflowCanvasProps {
  nodes: WorkflowNodeState[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: WorkflowNodeState | null) => void;
  className?: string;
}

export function LiveWorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  className,
}: LiveWorkflowCanvasProps) {
  const rfNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: "sparkAgent",
        position: n.position,
        selected: n.id === selectedNodeId,
        data: { ...n },
      })),
    [nodes, selectedNodeId]
  );

  const rfEdges: Edge[] = useMemo(() => {
    const statusMap = new Map(nodes.map((n) => [n.id, n.status]));
    return edges.map((e) => {
      const sourceStatus = statusMap.get(e.source);
      const targetStatus = statusMap.get(e.target);
      const isAnimated =
        sourceStatus === "running" ||
        targetStatus === "running" ||
        (sourceStatus === "completed" && targetStatus === "waiting_approval");
      const isCompleted =
        sourceStatus === "completed" && targetStatus === "completed";

      const strokeColor = isAnimated
        ? "#FACC15"
        : isCompleted
        ? "#10B981"
        : "#18422E";

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: isAnimated,
        style: {
          stroke: strokeColor,
          strokeWidth: isAnimated ? 2.5 : 1.8,
        },
        labelStyle: {
          fill: "#FEF9C3",
          fontSize: 10,
          fontWeight: 500,
        },
        labelBgStyle: {
          fill: "#061C13",
          fillOpacity: 0.92,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
      };
    });
  }, [edges, nodes]);

  return (
    <div
      className={cn(
        "relative flex flex-col h-[520px] w-full overflow-hidden rounded-2xl border border-slate-800/90 bg-space-950",
        className
      )}
    >
      {/* Top Interactive Process Pipeline Strip */}
      <div className="z-10 flex items-center justify-between gap-2 border-b border-slate-800/90 bg-space-900/95 px-4 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {nodes.map((n, idx) => {
            const Icon = AGENT_ICONS[n.id] || Cpu;
            const isSelected = n.id === selectedNodeId;
            const st = n.status || "idle";
            return (
              <React.Fragment key={n.id}>
                <button
                  type="button"
                  onClick={() => onSelectNode(n)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-all",
                    isSelected
                      ? "border-cyan-400 bg-space-800 shadow-glow-cyan"
                      : st === "completed"
                      ? "border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400"
                      : st === "waiting_approval"
                      ? "border-amber-400/60 bg-amber-500/15 hover:border-amber-300"
                      : st === "running"
                      ? "border-cyan-400/60 bg-cyan-500/15"
                      : "border-slate-800 bg-space-950/80 opacity-70 hover:opacity-100"
                  )}
                >
                  <Icon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: n.color }}
                  />
                  <div>
                    <p className="text-[11px] font-semibold text-white leading-none">
                      {n.name.replace(" Agent", "")}
                    </p>
                    <p className="text-[9px] font-mono uppercase text-slate-400 mt-0.5">
                      {st === "waiting_approval" ? "GATE" : st}
                    </p>
                  </div>
                </button>
                {idx < nodes.length - 1 && (
                  <span className="text-slate-600 font-mono text-xs px-0.5">
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Interactive React Flow DAG Canvas */}
      <div className="relative flex-1 w-full min-h-0">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          style={{ width: "100%", height: "100%" }}
          fitView
          fitViewOptions={{ padding: 0.14 }}
          minZoom={0.35}
          maxZoom={1.6}
          onNodeClick={(_, node) => {
            const match = nodes.find((item) => item.id === node.id) || null;
            onSelectNode(match);
          }}
          onPaneClick={() => onSelectNode(null)}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1E293B" gap={28} size={1.2} />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
