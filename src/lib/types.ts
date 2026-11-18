export type WorkflowStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type NodeStatus =
  | "idle"
  | "running"
  | "waiting_approval"
  | "completed"
  | "failed";

export interface AuthenticatedOperator {
  id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
  project_number?: string;
  picture?: string;
  verified_at?: string;
}

export interface AuthStatusResponse {
  google_oauth_configured: boolean;
  google_redirect_uri: string;
  gemini_key_configured: boolean;
  google_cloud_project: string;
  supported_methods: string[];
}

export interface WorkflowNodeState {
  id: string;
  name: string;
  role: string;
  model: string;
  description: string;
  tools: string[];
  color: string;
  position: { x: number; y: number };
  status: NodeStatus;
  started_at: string | null;
  completed_at: string | null;
  latency_ms: number;
  tokens: number;
  active_tool: string | null;
  summary: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface AgentEvent {
  id: number;
  workflow_id: string;
  agent_id: string;
  event_type: string;
  status: string;
  message: string;
  tool_name?: string | null;
  payload?: Record<string, unknown>;
  tokens_delta: number;
  latency_ms: number;
  timestamp: string;
}

export interface ApprovalItem {
  id: string;
  workflow_id: string;
  workflow_title: string;
  agent_id: string;
  action_title: string;
  action_type: string;
  risk_level: "low" | "medium" | "high" | "critical";
  rationale: string;
  proposed_payload?: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  reviewer_note?: string | null;
  created_at: string | null;
  resolved_at?: string | null;
}

export interface WorkflowRun {
  id: string;
  title: string;
  prompt: string;
  category: string;
  priority: string;
  status: WorkflowStatus;
  require_approval: boolean;
  current_node: string;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number;
  tokens_used: number;
  cost_usd: number;
  nodes: WorkflowNodeState[];
  edges: WorkflowEdge[];
  plan: {
    strategy_summary?: string;
    parallel_branches?: string[];
    steps?: Array<{ id: string; agent: string; task: string }>;
    estimated_sla_seconds?: number;
  };
  research: {
    sources_scanned?: number;
    high_confidence_signals?: string[];
    citations?: Array<{ source: string; relevance: number }>;
  };
  analysis: {
    confidence_score?: number;
    risk_score?: string;
    projected_efficiency_gain_pct?: number;
    kpis?: Array<{ label: string; value: string; delta: string }>;
  };
  execution: {
    executed_actions?: Array<{
      tool: string;
      target: string;
      status: string;
      detail: string;
    }>;
    verification_hash?: string;
  };
  final_report: string;
  error_message?: string | null;
  events?: AgentEvent[];
  approvals?: ApprovalItem[];
  report_id?: string | null;
}

export interface DashboardOverview {
  kpis: {
    total_workflows: number;
    completed_workflows: number;
    active_or_waiting: number;
    pending_approvals: number;
    success_rate_pct: number;
    avg_duration_ms: number;
    total_tokens: number;
    total_cost_usd: number;
    reports_generated: number;
  };
  execution_history: Array<{
    date: string;
    workflows: number;
    completed: number;
    tokens: number;
    cost_usd: number;
  }>;
  agent_performance: Array<{
    agent: string;
    full_name: string;
    avg_latency_ms: number;
    tokens: number;
    invocations: number;
    success_rate: number;
    color: string;
  }>;
  category_distribution: Array<{
    category: string;
    count: number;
  }>;
  recent_workflows: WorkflowRun[];
  pending_approvals: ApprovalItem[];
}

export interface AgentCatalogItem {
  id: string;
  name: string;
  role: string;
  model: string;
  description: string;
  tools: string[];
  color: string;
  position: { x: number; y: number };
  status: "online" | "busy";
  invocations: number;
  avg_latency_ms: number;
  total_tokens: number;
  latest_summary: string;
}

export interface ReportArtifact {
  id: string;
  workflow_id: string;
  title: string;
  category: string;
  summary: string;
  markdown_content: string;
  metrics: Array<{ label: string; value: string; delta: string }>;
  recommendations: string[];
  tokens_used: number;
  confidence_score: number;
  created_at: string | null;
}

export interface IntegrationItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected";
  scopes: string[];
  latency_ms: number;
  last_verified_at: string | null;
}

export interface SystemHealthResponse {
  status: string;
  version: string;
  timestamp: string;
  uptime_pct: number;
  engine: {
    orchestrator: string;
    model: string;
    gemini_key_configured: boolean;
    execution_mode: string;
    checkpoint_backend: string;
  };
  database: {
    engine: string;
    status: string;
    persisted_workflows: number;
    persisted_events: number;
  };
  subsystems: Array<{
    name: string;
    status: string;
    latency_ms: number;
    uptime: string;
  }>;
}

export interface OrchestratorSettings {
  gemini_model: string;
  temperature: number;
  require_human_approval_by_default: boolean;
  max_parallel_branches: number;
  checkpoint_persistence: string;
  daily_budget_usd: number;
  auto_retry_failed_nodes: boolean;
  telemetry_retention_days: number;
}
