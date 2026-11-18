from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from backend.app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserAccount(Base):
    __tablename__ = "user_accounts"

    id = Column(String(64), primary_key=True, index=True)
    uid = Column(String(128), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(Text, default="")
    password_hash = Column(String(255), nullable=True)
    provider = Column(String(64), default="firebase_google")
    role = Column(String(64), default="Mission Commander")
    created_at = Column(DateTime, default=utc_now)
    last_login_at = Column(DateTime, default=utc_now)


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    category = Column(String(64), default="Operations")
    priority = Column(String(32), default="high")
    status = Column(String(32), default="queued", index=True)
    require_approval = Column(Boolean, default=True)
    current_node = Column(String(64), default="supervisor")
    created_at = Column(DateTime, default=utc_now, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    node_states_json = Column(Text, default="{}")
    plan_json = Column(Text, default="{}")
    research_json = Column(Text, default="{}")
    analysis_json = Column(Text, default="{}")
    execution_json = Column(Text, default="{}")
    final_report = Column(Text, default="")
    checkpoint_thread_id = Column(String(128), nullable=True)
    error_message = Column(Text, nullable=True)


class AgentEventLog(Base):
    __tablename__ = "agent_event_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(String(64), ForeignKey("workflow_runs.id"), index=True, nullable=False)
    agent_id = Column(String(64), index=True, nullable=False)
    event_type = Column(String(64), nullable=False)
    status = Column(String(32), default="running")
    message = Column(Text, nullable=False)
    tool_name = Column(String(128), nullable=True)
    payload_json = Column(Text, default="{}")
    tokens_delta = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    timestamp = Column(DateTime, default=utc_now, index=True)


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(64), primary_key=True, index=True)
    workflow_id = Column(String(64), ForeignKey("workflow_runs.id"), index=True, nullable=False)
    workflow_title = Column(String(255), nullable=False)
    agent_id = Column(String(64), default="execution")
    action_title = Column(String(255), nullable=False)
    action_type = Column(String(64), default="external_execution")
    risk_level = Column(String(32), default="high")
    rationale = Column(Text, nullable=False)
    proposed_payload_json = Column(Text, default="{}")
    status = Column(String(32), default="pending", index=True)
    reviewer_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)
    resolved_at = Column(DateTime, nullable=True)


class ReportArtifact(Base):
    __tablename__ = "report_artifacts"

    id = Column(String(64), primary_key=True, index=True)
    workflow_id = Column(String(64), ForeignKey("workflow_runs.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(64), default="Executive Intelligence")
    summary = Column(Text, nullable=False)
    markdown_content = Column(Text, nullable=False)
    metrics_json = Column(Text, default="[]")
    recommendations_json = Column(Text, default="[]")
    tokens_used = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.96)
    created_at = Column(DateTime, default=utc_now, index=True)


class IntegrationConfig(Base):
    __tablename__ = "integration_configs"

    id = Column(String(64), primary_key=True, index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(32), default="connected")
    scopes_json = Column(Text, default="[]")
    config_json = Column(Text, default="{}")
    latency_ms = Column(Integer, default=42)
    last_verified_at = Column(DateTime, default=utc_now)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(64), primary_key=True, index=True)
    value_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=utc_now)
