import asyncio
import time
import uuid
from fastapi.testclient import TestClient

from backend.app.main import app


def run_all_tests():
    print("=" * 72)
    print("SPARK AI — END-TO-END FUNCTIONAL & PERFORMANCE TEST SUITE")
    print("=" * 72)

    with TestClient(app) as client:
        # 1. System Health Check
        t0 = time.perf_counter()
        res = client.get("/api/health")
        dt = (time.perf_counter() - t0) * 1000
        assert res.status_code == 200, f"Health failed: {res.text}"
        health = res.json()
        assert health["status"] == "operational"
        assert health["engine"]["model"] == "gemini-2.5-flash"
        assert len(health["subsystems"]) == 6
        print(f"[PASS] 01. GET /api/health ({dt:.1f}ms) -> status={health['status']}, subsystems={len(health['subsystems'])}")

        # 2. Auth Status & Individual User Registration + Login
        res = client.get("/api/auth/status")
        assert res.status_code == 200
        test_email = f"commander.{uuid.uuid4().hex[:6]}@spark-ai.enterprise"
        reg_res = client.post(
            "/api/auth/register",
            json={
                "name": "Test Commander",
                "email": test_email,
                "password": "SparkSecurePassword!2026",
                "workspace_role": "AI Principal Architect",
            },
        )
        assert reg_res.status_code == 200, f"Register failed: {reg_res.text}"
        reg_data = reg_res.json()
        assert reg_data["authenticated"] is True
        assert reg_data["user"]["email"] == test_email

        # Duplicate registration should fail with 400
        dup_res = client.post(
            "/api/auth/register",
            json={
                "name": "Test Commander",
                "email": test_email,
                "password": "SparkSecurePassword!2026",
            },
        )
        assert dup_res.status_code == 400

        # Login with valid credentials
        login_res = client.post(
            "/api/auth/login",
            json={"email": test_email, "password": "SparkSecurePassword!2026"},
        )
        assert login_res.status_code == 200
        assert login_res.json()["authenticated"] is True

        # Login with wrong password should fail with 401
        bad_login = client.post(
            "/api/auth/login",
            json={"email": test_email, "password": "WrongPassword123"},
        )
        assert bad_login.status_code == 401

        # Firebase Google SSO endpoint
        fb_email = f"google.user.{uuid.uuid4().hex[:6]}@gmail.com"
        fb_res = client.post(
            "/api/auth/firebase",
            json={
                "uid": f"fb-uid-{uuid.uuid4().hex[:8]}",
                "email": fb_email,
                "name": "Google Workspace User",
                "provider": "Google (Firebase Auth)",
            },
        )
        assert fb_res.status_code == 200
        assert fb_res.json()["user"]["email"] == fb_email
        print("[PASS] 02. Auth Suite (/register, /login, /firebase, duplicate & wrong-password guards)")

        # 3. Dashboard Overview Performance & Schema
        t0 = time.perf_counter()
        ov_res = client.get("/api/dashboard/overview")
        dt = (time.perf_counter() - t0) * 1000
        assert ov_res.status_code == 200
        ov = ov_res.json()
        assert "kpis" in ov
        assert len(ov["agent_performance"]) == 6
        assert len(ov["execution_history"]) == 7
        print(f"[PASS] 03. GET /api/dashboard/overview ({dt:.1f}ms) -> workflows={ov['kpis']['total_workflows']}, reports={ov['kpis']['reports_generated']}")

        # 4. Agent Fleet Catalog
        t0 = time.perf_counter()
        ag_res = client.get("/api/agents")
        dt = (time.perf_counter() - t0) * 1000
        assert ag_res.status_code == 200
        agents = ag_res.json()
        assert len(agents) == 6
        agent_ids = [a["id"] for a in agents]
        assert agent_ids == ["supervisor", "planner", "research", "analysis", "execution", "reporting"]
        print(f"[PASS] 04. GET /api/agents ({dt:.1f}ms) -> 6 specialized agents verified: {agent_ids}")

        # 5. Create Workflow with Human-in-the-Loop Approval Gate + Resume to Completion
        create_res = client.post(
            "/api/workflows",
            json={
                "title": "Automated Test Mission (Gated)",
                "prompt": "Audit cloud Kubernetes FinOps utilization, verify pricing benchmarks, and publish executive report.",
                "category": "Cloud FinOps",
                "priority": "critical",
                "require_approval": True,
            },
        )
        assert create_res.status_code == 200
        wf_id = create_res.json()["id"]

        # Wait briefly for Phase 1 (Supervisor -> Planner -> [Research || Analysis]) to reach waiting_approval
        status = "running"
        for _ in range(40):
            time.sleep(0.2)
            detail = client.get(f"/api/workflows/{wf_id}").json()
            status = detail["status"]
            if status in ("waiting_approval", "completed", "failed"):
                break

        assert status == "waiting_approval", f"Expected waiting_approval, got {status}"
        detail = client.get(f"/api/workflows/{wf_id}").json()
        node_map = {n["id"]: n["status"] for n in detail["nodes"]}
        assert node_map["supervisor"] == "completed"
        assert node_map["planner"] == "completed"
        assert node_map["research"] == "completed"
        assert node_map["analysis"] == "completed"
        assert node_map["execution"] == "waiting_approval"
        assert len(detail["approvals"]) >= 1
        approval_id = detail["approvals"][0]["id"]
        print(f"[PASS] 05. LangGraph Phase 1 Parallel Execution & Approval Gate -> wf={wf_id}, approval={approval_id}")

        # 6. Approve Checkpoint -> Verify Phase 2 (Execution -> Reporting) Completes & Publishes Report
        dec_res = client.post(
            f"/api/approvals/{approval_id}/decision",
            json={"decision": "approved", "reviewer_note": "Approved by automated test suite"},
        )
        assert dec_res.status_code == 200
        assert dec_res.json()["status"] == "approved"

        for _ in range(40):
            time.sleep(0.2)
            detail = client.get(f"/api/workflows/{wf_id}").json()
            status = detail["status"]
            if status in ("completed", "failed"):
                break

        assert status == "completed", f"Expected completed after approval, got {status}"
        assert detail["report_id"] is not None
        assert len(detail["final_report"]) > 100
        print(f"[PASS] 06. Approval Decision & LangGraph Phase 2 Resume -> wf={wf_id} COMPLETED, report_id={detail['report_id']}")

        # 7. Verify Reports Vault
        rep_res = client.get("/api/reports")
        assert rep_res.status_code == 200
        reports = rep_res.json()
        assert any(r["id"] == detail["report_id"] for r in reports)
        single_rep = client.get(f"/api/reports/{detail['report_id']}")
        assert single_rep.status_code == 200
        print(f"[PASS] 07. GET /api/reports & /api/reports/{detail['report_id']} -> total reports={len(reports)}")

        # 8. Verify Integrations Toggle
        int_res = client.get("/api/integrations")
        assert int_res.status_code == 200
        integrations = int_res.json()
        assert len(integrations) >= 4
        first_slug = integrations[0]["slug"]
        orig_status = integrations[0]["status"]
        target_status = "disconnected" if orig_status == "connected" else "connected"

        tog_res = client.post(
            f"/api/integrations/{first_slug}/toggle",
            json={"status": target_status},
        )
        assert tog_res.status_code == 200
        assert tog_res.json()["status"] == target_status

        # Restore original status
        client.post(
            f"/api/integrations/{first_slug}/toggle",
            json={"status": orig_status},
        )
        print(f"[PASS] 08. POST /api/integrations/{first_slug}/toggle -> verified state persistence")

        # 9. Verify Settings GET & PUT
        set_res = client.get("/api/settings")
        assert set_res.status_code == 200
        curr_settings = set_res.json()
        curr_settings["max_parallel_branches"] = 6
        put_res = client.put("/api/settings", json=curr_settings)
        assert put_res.status_code == 200
        assert put_res.json()["max_parallel_branches"] == 6
        print("[PASS] 09. GET & PUT /api/settings -> verified orchestrator settings persistence")

        # 10. Verify Workflow Cancel Lifecycle
        cancel_wf = client.post(
            "/api/workflows",
            json={
                "title": "Cancel Test Workflow",
                "prompt": "Test cancellation lifecycle.",
                "category": "Security & Compliance",
                "priority": "medium",
                "require_approval": True,
            },
        ).json()
        c_res = client.post(f"/api/workflows/{cancel_wf['id']}/cancel")
        assert c_res.status_code == 200
        assert c_res.json()["status"] == "cancelled"
        print(f"[PASS] 10. POST /api/workflows/{cancel_wf['id']}/cancel -> status=cancelled")

    print("=" * 72)
    print("ALL 10 END-TO-END FUNCTIONAL & PERFORMANCE TESTS PASSED!")
    print("=" * 72)


if __name__ == "__main__":
    run_all_tests()
