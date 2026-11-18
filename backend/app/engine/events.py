import asyncio
import json
from datetime import datetime, timezone
from typing import Any
from backend.app.database import SessionLocal
from backend.app.models import AgentEventLog


class EventBroadcaster:
    """Manages real-time Server-Sent Events subscriptions per workflow and globally."""

    def __init__(self) -> None:
        self._workflow_subscribers: dict[str, set[asyncio.Queue[dict[str, Any]]]] = {}
        self._global_subscribers: set[asyncio.Queue[dict[str, Any]]] = set()

    def subscribe_workflow(self, workflow_id: str) -> asyncio.Queue[dict[str, Any]]:
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=250)
        if workflow_id not in self._workflow_subscribers:
            self._workflow_subscribers[workflow_id] = set()
        self._workflow_subscribers[workflow_id].add(queue)
        return queue

    def unsubscribe_workflow(self, workflow_id: str, queue: asyncio.Queue[dict[str, Any]]) -> None:
        if workflow_id in self._workflow_subscribers:
            self._workflow_subscribers[workflow_id].discard(queue)
            if not self._workflow_subscribers[workflow_id]:
                del self._workflow_subscribers[workflow_id]

    def subscribe_global(self) -> asyncio.Queue[dict[str, Any]]:
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=250)
        self._global_subscribers.add(queue)
        return queue

    def unsubscribe_global(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        self._global_subscribers.discard(queue)

    async def publish(
        self,
        workflow_id: str,
        agent_id: str,
        event_type: str,
        status: str,
        message: str,
        tool_name: str | None = None,
        payload: dict[str, Any] | None = None,
        tokens_delta: int = 0,
        latency_ms: int = 0,
        persist: bool = True,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        event_id = 0
        if persist:
            db = SessionLocal()
            try:
                log_entry = AgentEventLog(
                    workflow_id=workflow_id,
                    agent_id=agent_id,
                    event_type=event_type,
                    status=status,
                    message=message,
                    tool_name=tool_name,
                    payload_json=json.dumps(payload or {}),
                    tokens_delta=tokens_delta,
                    latency_ms=latency_ms,
                    timestamp=now,
                )
                db.add(log_entry)
                db.commit()
                db.refresh(log_entry)
                event_id = log_entry.id
            finally:
                db.close()

        event_data = {
            "id": event_id,
            "workflow_id": workflow_id,
            "agent_id": agent_id,
            "event_type": event_type,
            "status": status,
            "message": message,
            "tool_name": tool_name,
            "payload": payload or {},
            "tokens_delta": tokens_delta,
            "latency_ms": latency_ms,
            "timestamp": now.isoformat(),
        }

        for q in list(self._workflow_subscribers.get(workflow_id, set())):
            try:
                q.put_nowait(event_data)
            except asyncio.QueueFull:
                pass

        for q in list(self._global_subscribers):
            try:
                q.put_nowait(event_data)
            except asyncio.QueueFull:
                pass

        return event_data


broadcaster = EventBroadcaster()
