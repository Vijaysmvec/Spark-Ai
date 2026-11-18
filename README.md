# SPARK AI — Autonomous Multi-Agent Command Center

> **"Your AI Workforce. One Command Away."**  
> Turn complex business workflows into intelligent execution. Let specialized AI agents plan, collaborate, and deliver results.

SPARK AI is a full-stack multi-agent orchestration platform featuring a **Next.js + React + TypeScript** frontend with **GSAP + ScrollTrigger**, **Lenis**, **Motion for React**, **React Flow (`@xyflow/react`)**, and **Recharts**, connected to a **Python FastAPI + LangGraph + Google Gemini 2.5 Flash + SQLite** backend.

---

## 1. Architecture Overview

| Layer | Technology Stack |
| :--- | :--- |
| **Frontend Framework** | Next.js (App Router) + React 19 + Strict TypeScript |
| **Styling & Design System** | Tailwind CSS + Customized `shadcn/ui` (Radix Primitives) |
| **Scroll & Cinematic Motion** | GSAP + ScrollTrigger + `@gsap/react` + Lenis (Public Landing Page only) |
| **UI Micro-Interactions** | Motion for React (`motion/react`) |
| **Live Agent Graph** | React Flow (`@xyflow/react`) connected via Server-Sent Events (SSE) |
| **Analytics & Telemetry** | Recharts (Real persisted SQLite metrics) |
| **Icons** | Lucide React |
| **Backend API & Streaming** | Python FastAPI + `sse-starlette` (Server-Sent Events) |
| **AI Orchestration** | LangGraph (`StateGraph` + Checkpoint Persistence) |
| **Foundation AI Model** | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |
| **Database & Persistence** | SQLite + SQLAlchemy 2.0 ORM |

---

## 2. Specialized Multi-Agent Topology

Every workflow executes across a 6-agent LangGraph `StateGraph` with parallel branch execution and Human-in-the-Loop governance:

1. **Supervisor Agent (`supervisor`)** — Validates executive intent, sets security & compliance guardrails, and initializes the mission topology.
2. **Planner Agent (`planner`)** — Decomposes the command into a structured Directed Acyclic Graph (DAG) and forks parallel execution branches.
3. **Research Agent (`research`)** *(Parallel Branch A)* — Performs headless browser extraction, web intelligence gathering, and citation verification.
4. **Analysis Agent (`analysis`)** *(Parallel Branch B)* — Runs quantitative modeling, ROI/FinOps simulations, and risk scoring in parallel with Research.
5. **Execution Agent (`execution`)** — Pauses at the **Human-in-the-Loop Approval Gate** when required; once approved, executes browser automation and enterprise connector mutations.
6. **Reporting Agent (`reporting`)** — Compiles an audit-signed executive Markdown report with KPI scorecards and strategic recommendations.

---

## 3. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
# Backend (FastAPI + LangGraph + Gemini 2.5 Flash)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./spark_ai.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SPARK_API_TOKEN=spark-dev-token-2026

# Frontend (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Security Note:** Never place `GEMINI_API_KEY` or Google OAuth secrets in frontend code or `NEXT_PUBLIC_*` variables. All sensitive operations and model invocations are handled strictly by the FastAPI backend.

---

## 4. Running the Application (Development)

### Step 1: Start the FastAPI + LangGraph Backend (Port 8000)

Install Python dependencies and start the FastAPI server from the root directory:

```bash
pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

- **Backend API Base URL:** `http://localhost:8000`
- **Interactive OpenAPI Docs:** `http://localhost:8000/docs`
- **System Health Endpoint:** `http://localhost:8000/api/health`

### Step 2: Start the Next.js Frontend (Port 3000)

In a separate terminal at the project root, install dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```

- **Public Landing Experience:** `http://localhost:3000`
- **Operational Command Center:** `http://localhost:3000/dashboard`

---
Make sure the everything is up to the date !!

## 5. Running with Docker Compose (Single Command)

To build and start both the FastAPI backend (`:8000`) and Next.js frontend (`:3000`) using Docker Compose:

```bash
docker compose up --build
```

---

## 6. Application Pages & Routes

- `/` — **Public Landing Page** (GSAP + ScrollTrigger + Lenis smooth scroll, Hero composer, 7 Feature sections, Interactive Multi-Agent Showcase, Closing CTA)
- `/dashboard` — **Command Center** (Executive KPIs, Recharts 7-day execution & token analytics, agent latency benchmark, active workflows, inline approval banner)
- `/dashboard/new` — **New Workflow** (Natural language mission composer, enterprise blueprints, priority & human-approval governance toggles)
- `/dashboard/agents` — **Agent Workspace** (6 specialized Gemini 2.5 Flash agents, toolboxes, and live persisted metrics)
- `/dashboard/monitor` — **Live Monitor** (Interactive `@xyflow/react` multi-agent canvas streamed via FastAPI Server-Sent Events with auto-reconnect, node inspector, and live event console)
- `/dashboard/approvals` — **Approval Center** (Human-in-the-Loop governance queue with payload inspection and one-click Approve / Reject that resumes paused LangGraph workflows)
- `/dashboard/reports` — **Reports** (Executive Markdown briefings, KPI scorecards, recommendations, copy & export)
- `/dashboard/history` — **Workflow History** (Searchable, filterable ledger of all persisted SQLite workflow runs)
- `/dashboard/integrations` — **Integrations** (Playwright Headless Browser, Google Workspace, Slack, GitHub, PostgreSQL/Snowflake, Linear, Notion, Cryptographic Webhook)
- `/dashboard/health` — **System Health** (FastAPI, LangGraph, Gemini 2.5 Flash, and SQLite subsystem diagnostics & latency chart)
- `/dashboard/settings` — **Settings** (Persisted orchestrator parameters, temperature, approval defaults, and budget caps)
