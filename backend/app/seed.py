import json
from datetime import datetime, timedelta, timezone
from backend.app.database import SessionLocal
from backend.app.models import (
    AgentEventLog,
    ApprovalRequest,
    IntegrationConfig,
    ReportArtifact,
    SystemSetting,
    WorkflowRun,
)


def seed_initial_data() -> None:
    db = SessionLocal()
    try:
        if db.query(WorkflowRun).count() > 0:
            return

        now = datetime.now(timezone.utc)

        def make_completed_nodes(latencies: dict[str, int], tokens: dict[str, int]) -> str:
            summaries = {
                "supervisor": "Validated enterprise governance & routed DAG topology",
                "planner": "Compiled 4-stage parallel execution plan with SLA checkpoints",
                "research": "Extracted 22 verified domain signals & primary citations",
                "analysis": "Completed quantitative simulation (97% confidence score)",
                "execution": "Dispatched automated Playwright & Workspace actions",
                "reporting": "Published executive Markdown brief & KPI scorecard",
            }
            data = {}
            for agent_id, summary in summaries.items():
                data[agent_id] = {
                    "status": "completed",
                    "started_at": (now - timedelta(minutes=25)).isoformat(),
                    "completed_at": (now - timedelta(minutes=24)).isoformat(),
                    "latency_ms": latencies.get(agent_id, 780),
                    "tokens": tokens.get(agent_id, 520),
                    "active_tool": None,
                    "summary": summary,
                }
            return json.dumps(data)

        waiting_nodes = {
            "supervisor": {
                "status": "completed",
                "started_at": (now - timedelta(minutes=12)).isoformat(),
                "completed_at": (now - timedelta(minutes=11, seconds=45)).isoformat(),
                "latency_ms": 620,
                "tokens": 480,
                "active_tool": None,
                "summary": "Mission MSN-FINOPS initialized with Tier-2 approval guardrails",
            },
            "planner": {
                "status": "completed",
                "started_at": (now - timedelta(minutes=11, seconds=45)).isoformat(),
                "completed_at": (now - timedelta(minutes=11, seconds=20)).isoformat(),
                "latency_ms": 740,
                "tokens": 610,
                "active_tool": None,
                "summary": "Decomposed cloud spend optimization into parallel Research & Analysis branches",
            },
            "research": {
                "status": "completed",
                "started_at": (now - timedelta(minutes=11, seconds=20)).isoformat(),
                "completed_at": (now - timedelta(minutes=10, seconds=50)).isoformat(),
                "latency_ms": 910,
                "tokens": 890,
                "active_tool": None,
                "summary": "Audited 14 Kubernetes clusters & idle GPU reservation contracts",
            },
            "analysis": {
                "status": "completed",
                "started_at": (now - timedelta(minutes=11, seconds=20)).isoformat(),
                "completed_at": (now - timedelta(minutes=10, seconds=45)).isoformat(),
                "latency_ms": 980,
                "tokens": 940,
                "active_tool": None,
                "summary": "Identified ₹35,80,000/mo savings with 0% production SLA impact",
            },
            "execution": {
                "status": "waiting_approval",
                "started_at": (now - timedelta(minutes=10, seconds=40)).isoformat(),
                "completed_at": None,
                "latency_ms": 310,
                "tokens": 220,
                "active_tool": "approval_gate",
                "summary": "Paused at Human-in-the-Loop Gate awaiting authorization to resize 6 idle nodes",
            },
            "reporting": {
                "status": "idle",
                "started_at": None,
                "completed_at": None,
                "latency_ms": 0,
                "tokens": 0,
                "active_tool": None,
                "summary": "Awaiting upstream Execution Agent completion",
            },
        }

        workflows = [
            WorkflowRun(
                id="wf-q4-rev-ops",
                title="Q4 Enterprise Revenue & Pipeline Acceleration Audit",
                prompt="Analyze Q4 enterprise pipeline velocity across EMEA and North America, benchmark competitor pricing shifts, update Google Workspace forecast sheets, and publish an executive brief to Slack.",
                category="Revenue Operations",
                priority="critical",
                status="completed",
                require_approval=True,
                current_node="reporting",
                created_at=now - timedelta(days=4, hours=3),
                started_at=now - timedelta(days=4, hours=3),
                completed_at=now - timedelta(days=4, hours=2, minutes=58),
                duration_ms=5420,
                tokens_used=4120,
                cost_usd=0.23,
                node_states_json=make_completed_nodes(
                    {"supervisor": 540, "planner": 690, "research": 1120, "analysis": 1050, "execution": 1240, "reporting": 780},
                    {"supervisor": 450, "planner": 620, "research": 980, "analysis": 910, "execution": 640, "reporting": 520},
                ),
                plan_json=json.dumps({
                    "strategy_summary": "Parallel market intelligence and CRM cohort velocity modeling",
                    "parallel_branches": ["research", "analysis"],
                    "steps": [
                        {"id": "STEP-01", "agent": "research", "task": "Extract enterprise SaaS pricing & expansion benchmarks"},
                        {"id": "STEP-02", "agent": "analysis", "task": "Run cohort conversion & deal-cycle regression"},
                        {"id": "STEP-03", "agent": "execution", "task": "Sync forecast sheet & notify #revops-command"},
                        {"id": "STEP-04", "agent": "reporting", "task": "Compile Q4 Executive Revenue Brief"},
                    ],
                }),
                research_json=json.dumps({
                    "sources_scanned": 24,
                    "high_confidence_signals": [
                        "Enterprise multi-year commits increased 29% when bundled with autonomous workflow SLAs",
                        "Mid-market deal cycle compressed from 46 days to 28 days following automated technical validation",
                        "Enterprise expansion cohorts show 118% net revenue retention across AI-native product tiers",
                    ],
                }),
                analysis_json=json.dumps({
                    "confidence_score": 0.97,
                    "risk_score": "LOW",
                    "projected_efficiency_gain_pct": 41.5,
                    "kpis": [
                        {"label": "Pipeline Velocity Lift", "value": "+34.2%", "delta": "+8.4% QoQ"},
                        {"label": "Forecast Accuracy", "value": "96.8%", "delta": "+4.1%"},
                        {"label": "Net Expansion ARR", "value": "₹15.4 Cr", "delta": "Verified"},
                    ],
                }),
                execution_json=json.dumps({
                    "executed_actions": [
                        {"tool": "playwright_runner", "target": "Competitor Pricing Matrix Portal", "status": "SUCCESS", "detail": "Captured 18 enterprise tier data points"},
                        {"tool": "workspace_connector", "target": "Google Sheets Q4 Forecast Model", "status": "SUCCESS", "detail": "Updated cohort projections & variance tabs"},
                        {"tool": "rest_webhook_dispatcher", "target": "Slack #revops-executive", "status": "SUCCESS", "detail": "Delivered summary card & report permalink"},
                    ]
                }),
                final_report="# Executive Intelligence Brief: Q4 Enterprise Revenue & Pipeline Acceleration Audit\n\n## Summary\nMulti-agent execution verified a **+34.2% pipeline velocity lift** and **₹15.4 Cr net expansion ARR** opportunity.",
            ),
            WorkflowRun(
                id="wf-sec-supply-chain",
                title="Zero-Trust Dependency & API Perimeter Security Sweep",
                prompt="Audit all production microservices, OAuth scopes, and third-party SDK dependencies for CVE exposure, compute CVSS risk matrices, and generate remediation tickets.",
                category="Security & Compliance",
                priority="high",
                status="completed",
                require_approval=True,
                current_node="reporting",
                created_at=now - timedelta(days=3, hours=5),
                started_at=now - timedelta(days=3, hours=5),
                completed_at=now - timedelta(days=3, hours=4, minutes=59),
                duration_ms=4890,
                tokens_used=3790,
                cost_usd=0.21,
                node_states_json=make_completed_nodes(
                    {"supervisor": 490, "planner": 640, "research": 1020, "analysis": 980, "execution": 1060, "reporting": 700},
                    {"supervisor": 410, "planner": 580, "research": 890, "analysis": 870, "execution": 560, "reporting": 480},
                ),
                research_json=json.dumps({
                    "sources_scanned": 31,
                    "high_confidence_signals": [
                        "Zero critical CVEs detected across active production runtime containers",
                        "All access tokens rotated within 24-hour epistemic security window",
                        "Two transitive dev dependencies flagged for minor patch upgrades",
                    ],
                }),
                analysis_json=json.dumps({
                    "confidence_score": 0.99,
                    "risk_score": "LOW",
                    "projected_efficiency_gain_pct": 52.0,
                    "kpis": [
                        {"label": "Perimeter Compliance", "value": "99.8%", "delta": "SOC2 Type II Ready"},
                        {"label": "Mean Time to Audit", "value": "4.9s", "delta": "-94% vs manual"},
                        {"label": "Critical Exposures", "value": "0", "delta": "Clean"},
                    ],
                }),
                final_report="# Zero-Trust Dependency & API Perimeter Security Sweep\n\nAll 31 production endpoints passed automated cryptographic and dependency verification.",
            ),
            WorkflowRun(
                id="wf-comp-intel-2026",
                title="Autonomous AI Agent Market Landscape & Pricing Synthesis",
                prompt="Research top 12 enterprise AI agent platforms, extract feature matrices via headless browser, run quantitative positioning analysis, and produce board-ready strategy report.",
                category="Strategic Intelligence",
                priority="high",
                status="completed",
                require_approval=False,
                current_node="reporting",
                created_at=now - timedelta(days=2, hours=2),
                started_at=now - timedelta(days=2, hours=2),
                completed_at=now - timedelta(days=2, hours=1, minutes=59),
                duration_ms=4610,
                tokens_used=3540,
                cost_usd=0.19,
                node_states_json=make_completed_nodes(
                    {"supervisor": 510, "planner": 610, "research": 990, "analysis": 920, "execution": 890, "reporting": 690},
                    {"supervisor": 390, "planner": 540, "research": 860, "analysis": 790, "execution": 510, "reporting": 450},
                ),
                research_json=json.dumps({
                    "sources_scanned": 19,
                    "high_confidence_signals": [
                        "Deterministic DAG orchestration + Human-in-the-Loop gates rank #1 in enterprise buyer criteria",
                        "Real-time visual telemetry increases operator trust scores by 63%",
                    ],
                }),
                analysis_json=json.dumps({
                    "confidence_score": 0.95,
                    "risk_score": "LOW",
                    "projected_efficiency_gain_pct": 44.0,
                    "kpis": [
                        {"label": "Feature Differentiation", "value": "94/100", "delta": "Category Leader"},
                        {"label": "Sources Synthesized", "value": "19", "delta": "100% Cited"},
                    ],
                }),
                final_report="# Autonomous AI Agent Market Landscape Synthesis\n\nComprehensive board analysis across 12 enterprise platforms.",
            ),
            WorkflowRun(
                id="wf-vendor-onboarding",
                title="Global Supplier SLA & Contract Compliance Verification",
                prompt="Cross-check 15 new logistics vendor contracts against enterprise legal clauses, calculate supply-chain disruption probability, and sync approved records.",
                category="Legal & Procurement",
                priority="medium",
                status="completed",
                require_approval=True,
                current_node="reporting",
                created_at=now - timedelta(days=1, hours=4),
                started_at=now - timedelta(days=1, hours=4),
                completed_at=now - timedelta(days=1, hours=3, minutes=59),
                duration_ms=5120,
                tokens_used=3890,
                cost_usd=0.21,
                node_states_json=make_completed_nodes(
                    {"supervisor": 520, "planner": 680, "research": 1080, "analysis": 1010, "execution": 1110, "reporting": 720},
                    {"supervisor": 420, "planner": 590, "research": 910, "analysis": 850, "execution": 610, "reporting": 510},
                ),
                final_report="# Global Supplier SLA & Contract Compliance Verification\n\n15 supplier agreements analyzed with automated clause verification.",
            ),
            WorkflowRun(
                id="wf-cloud-finops",
                title="Multi-Cloud GPU & Kubernetes FinOps Rightsizing Directive",
                prompt="Inspect telemetry across production Kubernetes clusters and reserved GPU nodes, calculate idle waste, and execute automated rightsizing patches after human approval.",
                category="Cloud FinOps",
                priority="critical",
                status="waiting_approval",
                require_approval=True,
                current_node="execution",
                created_at=now - timedelta(minutes=12),
                started_at=now - timedelta(minutes=12),
                completed_at=None,
                duration_ms=3560,
                tokens_used=3140,
                cost_usd=0.17,
                node_states_json=json.dumps(waiting_nodes),
                plan_json=json.dumps({
                    "strategy_summary": "Audit cluster utilization in parallel with FinOps cost modeling before executing rightsizing mutations",
                    "parallel_branches": ["research", "analysis"],
                    "steps": [
                        {"id": "STEP-01", "agent": "research", "task": "Query Prometheus & cloud billing APIs across 14 clusters"},
                        {"id": "STEP-02", "agent": "analysis", "task": "Simulate workload p99 headroom & compute monthly savings"},
                        {"id": "STEP-03", "agent": "execution", "task": "Apply Terraform/Kubernetes node-pool scaling patch (Requires Approval)"},
                        {"id": "STEP-04", "agent": "reporting", "task": "Publish FinOps savings certificate"},
                    ],
                }),
                research_json=json.dumps({
                    "sources_scanned": 14,
                    "high_confidence_signals": [
                        "6 staging GPU node pools remain under 11% utilization between 22:00 and 08:00 UTC",
                        "Spot instance fallback policies can absorb 35% of batch inference queues safely",
                        "Zero production latency degradation observed in canary rightsizing simulation",
                    ],
                }),
                analysis_json=json.dumps({
                    "confidence_score": 0.98,
                    "risk_score": "MEDIUM",
                    "projected_efficiency_gain_pct": 36.8,
                    "kpis": [
                        {"label": "Monthly Run-Rate Savings", "value": "₹35,80,000", "delta": "-31.4% Cloud Spend"},
                        {"label": "SLA Headroom Margin", "value": "99.95%", "delta": "Protected"},
                        {"label": "Payback Window", "value": "Immediate", "delta": "Zero CapEx"},
                    ],
                }),
            ),
        ]

        db.add_all(workflows)

        approvals = [
            ApprovalRequest(
                id="apr-finops-001",
                workflow_id="wf-cloud-finops",
                workflow_title="Multi-Cloud GPU & Kubernetes FinOps Rightsizing Directive",
                agent_id="execution",
                action_title="Authorize Production Node-Pool Auto-Scaling & Reservation Rebalance",
                action_type="infrastructure_mutation",
                risk_level="high",
                rationale=(
                    "Research & Analysis agents verified ₹35,80,000/mo in recoverable GPU and Kubernetes cluster waste "
                    "across 6 over-provisioned node pools with 98% confidence and zero production SLA impact. "
                    "Execution Agent requests authorization to apply the rightsizing manifest and notify #cloud-finops."
                ),
                proposed_payload_json=json.dumps({
                    "scope": "cluster_rightsizing",
                    "projected_monthly_savings_inr": 3580000,
                    "planned_tools": ["playwright_runner", "workspace_connector", "rest_webhook_dispatcher"],
                }),
                status="pending",
                created_at=now - timedelta(minutes=10),
            ),
            ApprovalRequest(
                id="apr-revops-000",
                workflow_id="wf-q4-rev-ops",
                workflow_title="Q4 Enterprise Revenue & Pipeline Acceleration Audit",
                agent_id="execution",
                action_title="Sync Executive Forecast Master Sheet & Dispatch Slack Briefing",
                action_type="workspace_mutation",
                risk_level="medium",
                rationale="Publish verified Q4 cohort forecast adjustments to Executive Google Sheet and notify leadership channel.",
                proposed_payload_json=json.dumps({
                    "target_document": "Executive Q4 Forecast Model",
                    "slack_channel": "#revops-executive",
                }),
                status="approved",
                reviewer_note="Approved by VP Revenue Operations — numbers match finance ledger.",
                created_at=now - timedelta(days=4, hours=2, minutes=59),
                resolved_at=now - timedelta(days=4, hours=2, minutes=58),
            ),
            ApprovalRequest(
                id="apr-sec-000",
                workflow_id="wf-sec-supply-chain",
                workflow_title="Zero-Trust Dependency & API Perimeter Security Sweep",
                agent_id="execution",
                action_title="Rotate Staging Webhook Signing Keys & Open 2 Patch PRs",
                action_type="security_remediation",
                risk_level="high",
                rationale="Automated key rotation and non-breaking dependency bump across two internal services.",
                proposed_payload_json=json.dumps({
                    "scope": "security_remediation",
                    "cvss_max": 3.1,
                }),
                status="approved",
                reviewer_note="Verified zero downtime window.",
                created_at=now - timedelta(days=3, hours=4, minutes=59),
                resolved_at=now - timedelta(days=3, hours=4, minutes=58),
            ),
        ]
        db.add_all(approvals)

        reports = [
            ReportArtifact(
                id="rep-q4-rev-ops",
                workflow_id="wf-q4-rev-ops",
                title="Q4 Enterprise Revenue & Pipeline Acceleration — Executive Report",
                category="Revenue Operations",
                summary="Comprehensive multi-agent synthesis across 24 enterprise data sources identifying ₹15.4 Cr in net expansion ARR and a 34.2% lift in pipeline velocity.",
                markdown_content="""# Executive Intelligence Brief: Q4 Enterprise Revenue & Pipeline Acceleration

## 1. Executive Summary
The SPARK AI multi-agent mesh executed a coordinated audit across CRM cohorts, regional pricing matrices, and expansion telemetry. Parallel synthesis by the **Research Agent** and **Analysis Agent** confirmed a **+34.2% acceleration in deal velocity** for enterprise bundles incorporating autonomous governance gates.

## 2. High-Confidence Research Signals
- **Enterprise Multi-Year Expansion**: Multi-year commitments grew **29% QoQ** when paired with deterministic SLA checkpoints.
- **Technical Validation Compression**: Automated sandbox proofs reduced stage-3 technical evaluation from **46 days to 28 days**.
- **Regional Outperformance**: Enterprise segments achieved **118% Net Revenue Retention (NRR)**.

## 3. Quantitative KPI Scorecard
- **Pipeline Velocity Lift**: `+34.2%` (+8.4% vs prior quarter baseline)
- **Forecast Model Precision**: `96.8%` (Validated across 1,420 active opportunities)
- **Identified Expansion ARR**: `₹15.4 Cr` (Immediate Q4 capture window)

## 4. Executed Operational Actions
- Synchronized master cohort projections in **Google Workspace Executive Forecast**.
- Dispatched automated alert cards and account prioritization matrices to **Slack #revops-executive**.
""",
                metrics_json=json.dumps([
                    {"label": "Pipeline Velocity Lift", "value": "+34.2%", "delta": "+8.4% QoQ"},
                    {"label": "Forecast Accuracy", "value": "96.8%", "delta": "+4.1%"},
                    {"label": "Net Expansion ARR", "value": "₹15.4 Cr", "delta": "Verified"},
                ]),
                recommendations_json=json.dumps([
                    "Prioritize 38 high-propensity enterprise expansion accounts identified in cohort tier A",
                    "Standardize automated stage-3 technical validation across all regional AE pods",
                    "Schedule weekly autonomous pipeline drift checks every Monday at 06:00 UTC",
                ]),
                tokens_used=4120,
                confidence_score=0.97,
                created_at=now - timedelta(days=4, hours=2, minutes=58),
            ),
            ReportArtifact(
                id="rep-sec-supply",
                workflow_id="wf-sec-supply-chain",
                title="Zero-Trust Dependency & API Perimeter Security Audit",
                category="Security & Compliance",
                summary="Automated cryptographic and CVE posture verification across 31 production endpoints and third-party SDKs with 99.8% compliance score.",
                markdown_content="""# Executive Security Brief: Zero-Trust Dependency & API Perimeter Audit

## 1. Posture Overview
Zero critical or high-severity vulnerabilities were detected across the orchestration core, checkpoint persistence layer, or client runtime.

## 2. Key Verification Metrics
- **Perimeter Compliance Score**: `99.8%` (SOC2 Type II & ISO-27001 aligned)
- **Mean Time to Audit (MTTA)**: `4.9 seconds` (-94% vs manual security review)
- **Credential & Secret Hygiene**: `100%` isolated with zero-trust access control
""",
                metrics_json=json.dumps([
                    {"label": "Perimeter Compliance", "value": "99.8%", "delta": "SOC2 Ready"},
                    {"label": "Mean Time to Audit", "value": "4.9s", "delta": "-94%"},
                    {"label": "Critical CVEs", "value": "0", "delta": "Verified Clean"},
                ]),
                recommendations_json=json.dumps([
                    "Keep automated dependency attestation active on every CI merge",
                    "Maintain strict zero-trust secret isolation across all connectors",
                ]),
                tokens_used=3790,
                confidence_score=0.99,
                created_at=now - timedelta(days=3, hours=4, minutes=59),
            ),
            ReportArtifact(
                id="rep-comp-intel",
                workflow_id="wf-comp-intel-2026",
                title="2026 Autonomous Enterprise Agent Landscape Benchmark",
                category="Strategic Intelligence",
                summary="Board-level benchmarking of 12 multi-agent orchestration architectures, evaluating reliability, human governance, and latency.",
                markdown_content="""# Strategic Intelligence Report: 2026 Autonomous Agent Landscape

## 1. Core Findings
Enterprise adoption is rapidly converging on **stateful graph orchestration** paired with **low-latency frontier reasoning** and **explicit human-in-the-loop governance**.

## 2. Benchmark Highlights
- **Feature Differentiation Score**: `94 / 100`
- **Operator Trust Lift from Live Graph Telemetry**: `+63%`
""",
                metrics_json=json.dumps([
                    {"label": "Feature Differentiation", "value": "94/100", "delta": "Top Decile"},
                    {"label": "Operator Trust Lift", "value": "+63%", "delta": "Verified"},
                ]),
                recommendations_json=json.dumps([
                    "Expand pre-built industry templates for FinOps, RevOps, and SecOps",
                    "Highlight real-time DAG observability in enterprise customer onboarding",
                ]),
                tokens_used=3540,
                confidence_score=0.95,
                created_at=now - timedelta(days=2, hours=1, minutes=59),
            ),
        ]
        db.add_all(reports)

        events = [
            AgentEventLog(
                workflow_id="wf-cloud-finops",
                agent_id="supervisor",
                event_type="node_complete",
                status="completed",
                message="Supervisor Agent initialized mission MSN-FINOPS and verified Tier-2 governance boundaries.",
                tool_name="topology_router",
                tokens_delta=480,
                latency_ms=620,
                timestamp=now - timedelta(minutes=11, seconds=45),
            ),
            AgentEventLog(
                workflow_id="wf-cloud-finops",
                agent_id="planner",
                event_type="node_complete",
                status="completed",
                message="Planner Agent compiled 4-stage DAG and forked parallel Research + Analysis branches.",
                tool_name="dag_compiler",
                tokens_delta=610,
                latency_ms=740,
                timestamp=now - timedelta(minutes=11, seconds=20),
            ),
            AgentEventLog(
                workflow_id="wf-cloud-finops",
                agent_id="research",
                event_type="node_complete",
                status="completed",
                message="Research Agent audited 14 Kubernetes clusters and extracted GPU reservation telemetry.",
                tool_name="headless_browser",
                tokens_delta=890,
                latency_ms=910,
                timestamp=now - timedelta(minutes=10, seconds=50),
            ),
            AgentEventLog(
                workflow_id="wf-cloud-finops",
                agent_id="analysis",
                event_type="node_complete",
                status="completed",
                message="Analysis Agent modeled ₹35,80,000/mo savings with 98% confidence and 0% SLA degradation.",
                tool_name="risk_matrix_engine",
                tokens_delta=940,
                latency_ms=980,
                timestamp=now - timedelta(minutes=10, seconds=45),
            ),
            AgentEventLog(
                workflow_id="wf-cloud-finops",
                agent_id="execution",
                event_type="approval_required",
                status="waiting_approval",
                message="Paused at Human-in-the-Loop Approval Gate: awaiting operator sign-off for cluster rightsizing.",
                tool_name="approval_gate",
                tokens_delta=220,
                latency_ms=310,
                timestamp=now - timedelta(minutes=10, seconds=40),
            ),
        ]
        db.add_all(events)

        integrations = [
            IntegrationConfig(
                id="int-browser",
                slug="headless-browser",
                name="Playwright Headless Browser Grid",
                category="Automation Runtime",
                description="Isolated Chromium automation cluster for live DOM extraction, form workflows, and visual verification.",
                status="connected",
                scopes_json=json.dumps(["dom.read", "navigation.execute", "screenshot.capture"]),
                latency_ms=34,
            ),
            IntegrationConfig(
                id="int-workspace",
                slug="google-workspace",
                name="Google Workspace Enterprise",
                category="Productivity & Docs",
                description="Bi-directional connector for Google Docs, Sheets forecast models, Drive vaults, and Executive Calendar.",
                status="connected",
                scopes_json=json.dumps(["docs.write", "sheets.update", "drive.readonly"]),
                latency_ms=48,
            ),
            IntegrationConfig(
                id="int-slack",
                slug="slack-command",
                name="Slack Enterprise Grid",
                category="Messaging & Alerts",
                description="Dispatches real-time executive briefings, anomaly alerts, and interactive approval notifications.",
                status="connected",
                scopes_json=json.dumps(["chat:write", "channels:read", "commands"]),
                latency_ms=29,
            ),
            IntegrationConfig(
                id="int-github",
                slug="github-enterprise",
                name="GitHub Enterprise Cloud",
                category="Engineering & CI/CD",
                description="Automated pull request creation, dependency security auditing, and workflow action triggers.",
                status="connected",
                scopes_json=json.dumps(["repo:status", "pull_requests:write", "security_events:read"]),
                latency_ms=41,
            ),
            IntegrationConfig(
                id="int-postgres",
                slug="postgres-warehouse",
                name="PostgreSQL / Snowflake Analytics",
                category="Data Warehouse",
                description="Read-guarded SQL telemetry interface for cohort modeling, financial forecasting, and KPI verification.",
                status="connected",
                scopes_json=json.dumps(["sql.readonly", "schema.inspect"]),
                latency_ms=19,
            ),
            IntegrationConfig(
                id="int-linear",
                slug="linear-ops",
                name="Linear Issue & Roadmap Sync",
                category="Project Tracking",
                description="Converts Planner Agent milestones and security remediations into prioritized engineering issues.",
                status="connected",
                scopes_json=json.dumps(["issues:write", "projects:read"]),
                latency_ms=37,
            ),
            IntegrationConfig(
                id="int-notion",
                slug="notion-knowledge",
                name="Notion Enterprise Wiki",
                category="Knowledge Base",
                description="Semantic indexing and automated publishing of Reporting Agent markdown artifacts.",
                status="disconnected",
                scopes_json=json.dumps(["pages:read", "pages:write"]),
                latency_ms=62,
            ),
            IntegrationConfig(
                id="int-webhook",
                slug="webhook-dispatcher",
                name="Cryptographic Webhook Gateway",
                category="Custom API",
                description="HMAC-SHA256 signed event delivery for custom enterprise ERPs and internal microservices.",
                status="connected",
                scopes_json=json.dumps(["webhook.sign", "webhook.dispatch"]),
                latency_ms=15,
            ),
        ]
        db.add_all(integrations)

        default_settings = {
            "gemini_model": "autonomous-core",
            "temperature": 0.2,
            "require_human_approval_by_default": True,
            "max_parallel_branches": 4,
            "checkpoint_persistence": "sqlite_wal",
            "daily_budget_usd": 2000.0,
            "auto_retry_failed_nodes": True,
            "telemetry_retention_days": 30,
        }
        db.add(SystemSetting(key="orchestrator_config", value_json=json.dumps(default_settings)))

        db.commit()
    finally:
        db.close()
