import {
  AgentCatalogItem,
  ApprovalItem,
  AuthenticatedOperator,
  AuthStatusResponse,
  DashboardOverview,
  IntegrationItem,
  OrchestratorSettings,
  ReportArtifact,
  SystemHealthResponse,
  WorkflowRun,
} from "./types";

export const PRIMARY_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "").replace("localhost", "127.0.0.1") ||
  "http://127.0.0.1:8000";
export const FALLBACK_API_URL = "http://127.0.0.1:8765";

let activeApiBaseUrl =
  typeof window !== "undefined"
    ? window.sessionStorage.getItem("spark_active_api_url") || PRIMARY_API_URL
    : PRIMARY_API_URL;
let portResolved = false;

// Fast in-memory Stale-While-Revalidate (SWR) cache & request deduplication
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<unknown>>();
const CACHE_FRESH_TTL_MS = 4000;

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function fetchWithFallback(
  path: string,
  init: RequestInit
): Promise<Response> {
  if (!portResolved) {
    try {
      const winner = await Promise.any([
        fetch(`${PRIMARY_API_URL}${path}`, init).then((r) => ({
          url: PRIMARY_API_URL,
          res: r,
        })),
        fetch(`${FALLBACK_API_URL}${path}`, init).then((r) => ({
          url: FALLBACK_API_URL,
          res: r,
        })),
      ]);
      activeApiBaseUrl = winner.url;
      portResolved = true;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("spark_active_api_url", winner.url);
      }
      return winner.res;
    } catch {
      // Fall through to sequential attempt below
    }
  }

  try {
    return await fetch(`${activeApiBaseUrl}${path}`, init);
  } catch (err) {
    if ((err as Error)?.name === "AbortError") {
      throw err;
    }
    const alternate =
      activeApiBaseUrl === PRIMARY_API_URL ? FALLBACK_API_URL : PRIMARY_API_URL;
    const res = await fetch(`${alternate}${path}`, init);
    activeApiBaseUrl = alternate;
    portResolved = true;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("spark_active_api_url", alternate);
    }
    return res;
  }
}

export function peekCachedData<T>(cacheKey: string): T | null {
  const entry = memoryCache.get(cacheKey);
  return entry ? (entry.data as T) : null;
}

export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { signal?: AbortSignal; skipCache?: boolean } = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const isGet = method === "GET";

  // Return fresh cached response immediately if within TTL
  if (isGet && !options.skipCache) {
    const cached = memoryCache.get(path);
    if (cached && Date.now() - cached.timestamp < CACHE_FRESH_TTL_MS) {
      return cached.data as T;
    }
    const existingInflight = inflightRequests.get(path);
    if (existingInflight) {
      return existingInflight as Promise<T>;
    }
  }

  const execFetch = async (): Promise<T> => {
    const headers = new Headers(options.headers || {});
    if (!isGet) {
      if (!headers.has("Content-Type") && options.body) {
        headers.set("Content-Type", "application/json");
      }
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("spark_api_token") ||
            "spark-dev-token-2026"
          : "spark-dev-token-2026";
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetchWithFallback(path, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      let errorDetail = `API error (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson?.detail) errorDetail = String(errJson.detail);
      } catch {
        // ignore json parse failure
      }
      throw new ApiClientError(errorDetail, response.status);
    }

    const json = (await response.json()) as T;
    if (isGet) {
      memoryCache.set(path, { data: json, timestamp: Date.now() });
    } else {
      // Any state mutation invalidates cached GET views so UI updates immediately
      invalidateApiCache();
    }
    return json;
  };

  if (isGet) {
    const promise = execFetch().finally(() => {
      inflightRequests.delete(path);
    });
    inflightRequests.set(path, promise);
    return promise;
  }

  return execFetch();
}

export const sparkApi = {
  peekCache: peekCachedData,
  invalidateCache: invalidateApiCache,

  prefetchAllDashboardData: () => {
    void request<DashboardOverview>("/api/dashboard/overview").catch(() => {});
    void request<AgentCatalogItem[]>("/api/agents").catch(() => {});
    void request<WorkflowRun[]>("/api/workflows").catch(() => {});
    void request<ApprovalItem[]>("/api/approvals").catch(() => {});
    void request<ApprovalItem[]>("/api/approvals?status=pending").catch(
      () => {}
    );
    void request<ReportArtifact[]>("/api/reports").catch(() => {});
    void request<IntegrationItem[]>("/api/integrations").catch(() => {});
    void request<SystemHealthResponse>("/api/health").catch(() => {});
    void request<OrchestratorSettings>("/api/settings").catch(() => {});
  },

  getAuthStatus: (signal?: AbortSignal) =>
    request<AuthStatusResponse>("/api/auth/status", { signal }),

  authenticateWithFirebase: (payload: {
    id_token?: string;
    uid: string;
    email: string;
    name?: string;
    picture?: string;
    provider?: string;
  }) =>
    request<{
      authenticated: boolean;
      provider: string;
      token: string;
      user: AuthenticatedOperator;
    }>("/api/auth/firebase", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerIndividualUser: (payload: {
    name: string;
    email: string;
    password: string;
    workspace_role?: string;
  }) =>
    request<{
      authenticated: boolean;
      provider: string;
      token: string;
      user: AuthenticatedOperator;
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  loginWithCredentials: (payload: {
    email: string;
    password: string;
  }) =>
    request<{
      authenticated: boolean;
      provider: string;
      token: string;
      user: AuthenticatedOperator;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getHealth: (signal?: AbortSignal) =>
    request<SystemHealthResponse>("/api/health", { signal }),

  getDashboardOverview: (signal?: AbortSignal, skipCache = false) =>
    request<DashboardOverview>("/api/dashboard/overview", {
      signal,
      skipCache,
    }),

  getAgents: (signal?: AbortSignal) =>
    request<AgentCatalogItem[]>("/api/agents", { signal }),

  getWorkflows: (
    params?: { status?: string; search?: string },
    signal?: AbortSignal
  ) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "all")
      qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return request<WorkflowRun[]>(`/api/workflows${query}`, { signal });
  },

  getWorkflowDetail: (
    workflowId: string,
    signal?: AbortSignal,
    skipCache = false
  ) =>
    request<WorkflowRun>(
      `/api/workflows/${encodeURIComponent(workflowId)}`,
      { signal, skipCache }
    ),

  createWorkflow: (payload: {
    title?: string;
    prompt: string;
    category: string;
    priority: string;
    require_approval: boolean;
    selected_integrations?: string[];
  }) =>
    request<WorkflowRun>("/api/workflows", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  retryWorkflow: (workflowId: string) =>
    request<WorkflowRun>(
      `/api/workflows/${encodeURIComponent(workflowId)}/retry`,
      {
        method: "POST",
      }
    ),

  cancelWorkflow: (workflowId: string) =>
    request<WorkflowRun>(
      `/api/workflows/${encodeURIComponent(workflowId)}/cancel`,
      {
        method: "POST",
      }
    ),

  getApprovals: (status?: string, signal?: AbortSignal) => {
    const query =
      status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    return request<ApprovalItem[]>(`/api/approvals${query}`, { signal });
  },

  resolveApproval: (
    approvalId: string,
    decision: "approved" | "rejected",
    reviewer_note?: string
  ) =>
    request<{ id: string; workflow_id: string; status: string }>(
      `/api/approvals/${encodeURIComponent(approvalId)}/decision`,
      {
        method: "POST",
        body: JSON.stringify({ decision, reviewer_note }),
      }
    ),

  getReports: (signal?: AbortSignal) =>
    request<ReportArtifact[]>("/api/reports", { signal }),

  getReportDetail: (reportId: string, signal?: AbortSignal) =>
    request<ReportArtifact>(
      `/api/reports/${encodeURIComponent(reportId)}`,
      { signal }
    ),

  getIntegrations: (signal?: AbortSignal) =>
    request<IntegrationItem[]>("/api/integrations", { signal }),

  toggleIntegration: (slug: string, status: "connected" | "disconnected") =>
    request<{ id: string; slug: string; status: string }>(
      `/api/integrations/${encodeURIComponent(slug)}/toggle`,
      {
        method: "POST",
        body: JSON.stringify({ status }),
      }
    ),

  getSettings: (signal?: AbortSignal) =>
    request<OrchestratorSettings>("/api/settings", { signal }),

  updateSettings: (payload: OrchestratorSettings) =>
    request<OrchestratorSettings>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getWorkflowStreamUrl: (workflowId: string) =>
    `${activeApiBaseUrl}/api/workflows/${encodeURIComponent(workflowId)}/stream`,

  getGlobalStreamUrl: () => `${activeApiBaseUrl}/api/events/stream`,
};
