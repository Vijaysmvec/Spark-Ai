from typing import Any, Optional
from pydantic import BaseModel, Field


class WorkflowCreateRequest(BaseModel):
    title: Optional[str] = None
    prompt: str = Field(..., min_length=5, description="Natural language workflow command")
    category: str = Field(default="Enterprise Operations")
    priority: str = Field(default="high")
    require_approval: bool = Field(default=True)
    selected_integrations: list[str] = Field(default_factory=lambda: ["web-browser", "google-workspace", "slack"])


class ApprovalDecisionRequest(BaseModel):
    decision: str = Field(..., pattern="^(approved|rejected)$")
    reviewer_note: Optional[str] = Field(default="Verified via SPARK AI Approval Center.")


class IntegrationUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(connected|disconnected)$")
    config: Optional[dict[str, Any]] = None


class SettingsUpdateRequest(BaseModel):
    gemini_model: str = "autonomous-core"
    temperature: float = 0.2
    require_human_approval_by_default: bool = True
    max_parallel_branches: int = 4
    checkpoint_persistence: str = "sqlite_wal"
    daily_budget_usd: float = 2000.0
    auto_retry_failed_nodes: bool = True
    telemetry_retention_days: int = 30


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    workspace_role: Optional[str] = "Mission Commander"


class FirebaseAuthRequest(BaseModel):
    id_token: Optional[str] = None
    uid: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    provider: str = "firebase_google"
