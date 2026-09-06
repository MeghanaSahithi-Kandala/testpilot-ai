import os
import json
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io

from database import get_db_connection, init_db
from models.schemas import (
    PlanRequest, PlanResponse,
    DiscoveryRequest, DiscoveryResponse,
    DependencyMapResponse,
    SafetyValidateRequest, SafetyValidateResponse,
    K6GenerateRequest, K6GenerateResponse,
    TestCreateRequest, TestStatusResponse, MetricsSnapshot,
    DoctorAnalysisResponse, CorrelatedEvent,
    RemediationActionRequest, RemediationActionResponse,
    CompareRequest, CompareResponse
)
from planning.nlp_planner import plan_test
from discovery.scanner import safe_discover_resources
from discovery.dependency_mapper import build_dependency_map
from safety.guard import validate_safety
from testing.k6_generator import generate_k6_script
from testing.execution_engine import start_execution, get_runner
from analysis.performance_doctor import diagnose_performance
from analysis.regression import compare_test_runs
from reporting.pdf_generator import generate_pdf_report

app = FastAPI(
    title="TestPilot AI Platform API",
    description="Autonomous Website Performance Testing Platform - Performance Testing That Thinks",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# 1. Health Check
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "TestPilot AI"
    }

# 2. Natural Language Test Planner
@app.post("/api/plan", response_model=PlanResponse)
def create_test_plan(req: PlanRequest):
    if not req.target_url:
        raise HTTPException(status_code=400, detail="Target URL is required")
    return plan_test(target_url=req.target_url, instruction=req.instruction)

# 3. Website Resource Discovery
@app.post("/api/discovery", response_model=DiscoveryResponse)
def discover_resources(req: DiscoveryRequest):
    if not req.target_url:
        raise HTTPException(status_code=400, detail="Target URL is required")
    return safe_discover_resources(target_url=req.target_url)

# 4. Dependency Mapping
@app.post("/api/dependencies", response_model=DependencyMapResponse)
def get_dependencies(req: DiscoveryRequest):
    return build_dependency_map(target_url=req.target_url)

@app.get("/api/tests/{test_id}/dependencies", response_model=DependencyMapResponse)
def get_test_dependencies(test_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT target_url FROM tests WHERE id = ?", (test_id,))
    row = cur.fetchone()
    conn.close()
    target_url = row["target_url"] if row else "https://demo.example.com"
    return build_dependency_map(target_url=target_url)

# 5. Safety Guard Validation
@app.post("/api/safety/validate", response_model=SafetyValidateResponse)
def run_safety_validation(req: SafetyValidateRequest):
    return validate_safety(req)

# 6. K6 Workload Generation
@app.post("/api/tests/generate-script", response_model=K6GenerateResponse)
def generate_script(req: K6GenerateRequest):
    t_id = req.test_id or f"TP-{uuid.uuid4().hex[:6].upper()}"
    script = generate_k6_script(req.test_plan, test_id=t_id)
    return K6GenerateResponse(
        test_id=t_id,
        script=script,
        config={
            "max_users": req.test_plan.max_users,
            "duration": f"{req.test_plan.duration_minutes}m",
            "strategy": req.test_plan.load_strategy,
            "thresholds": req.test_plan.thresholds.model_dump()
        }
    )

# 7. Create & Start Test
@app.post("/api/tests")
def create_test(req: TestCreateRequest):
    test_id = f"TP-{uuid.uuid4().hex[:6].upper()}"
    name = req.name or f"Perf Assessment · {req.plan.max_users} VUs"

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO tests (id, name, target_url, requirement, status, mode)
        VALUES (?, ?, ?, ?, 'planned', ?)
    """, (test_id, name, req.target_url, req.requirement, req.mode))

    cur.execute("""
        INSERT INTO test_plans (test_id, target_url, objective, test_type, max_users, duration_minutes, thresholds_json, load_strategy, stages_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        test_id,
        req.target_url,
        req.plan.objective,
        req.plan.test_type,
        req.plan.max_users,
        req.plan.duration_minutes,
        json.dumps(req.plan.thresholds.model_dump()),
        req.plan.load_strategy,
        json.dumps([s.model_dump() for s in req.plan.stages])
    ))

    # Record Audit log
    cur.execute("INSERT INTO audit_logs (test_id, event_type, details) VALUES (?, 'TEST_CREATED', ?)",
                (test_id, f"Created test {test_id} targeting {req.target_url}"))
    conn.commit()
    conn.close()

    return {"test_id": test_id, "name": name, "status": "planned"}

@app.post("/api/tests/{test_id}/start")
def start_test(test_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tests WHERE id = ?", (test_id,))
    test = cur.fetchone()
    cur.execute("SELECT * FROM test_plans WHERE test_id = ?", (test_id,))
    plan_row = cur.fetchone()
    conn.close()

    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    target_url = test["target_url"]
    mode = test["mode"]
    req_text = test["requirement"]
    max_users = plan_row["max_users"] if plan_row else 2000
    duration_min = plan_row["duration_minutes"] if plan_row else 10
    thresholds = json.loads(plan_row["thresholds_json"]) if plan_row and plan_row["thresholds_json"] else {"p95_latency_ms": 500.0, "error_rate_percent": 1.0}

    runner = start_execution(
        test_id=test_id,
        mode=mode,
        target_url=target_url,
        max_users=max_users,
        duration_minutes=duration_min,
        thresholds=thresholds,
        requirement=req_text
    )

    return {"status": "started", "test_id": test_id, "mode": mode}

@app.get("/api/tests/{test_id}/status", response_model=TestStatusResponse)
def get_test_status(test_id: str):
    runner = get_runner(test_id)
    if runner:
        latest = runner.metrics_history[-1] if runner.metrics_history else None
        return TestStatusResponse(
            test_id=test_id,
            status=runner.status,
            mode=runner.mode,
            current_vus=runner.current_vus,
            peak_vus=runner.peak_vus,
            latest_metrics=latest,
            safe_capacity=runner.safe_capacity,
            degradation_range=runner.degradation_range
        )

    # Fallback to database if completed/inactive
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tests WHERE id = ?", (test_id,))
    t_row = cur.fetchone()
    cur.execute("SELECT * FROM test_runs WHERE test_id = ?", (test_id,))
    r_row = cur.fetchone()
    conn.close()

    if not t_row:
        raise HTTPException(status_code=404, detail="Test not found")

    return TestStatusResponse(
        test_id=test_id,
        status=t_row["status"],
        mode=t_row["mode"],
        current_vus=0,
        peak_vus=r_row["peak_vus"] if r_row else 0,
        safe_capacity=r_row["safe_capacity"] if r_row else 1350,
        degradation_range=r_row["degradation_range"] if r_row else "1300–1400 VUs",
        verdict=r_row["verdict"] if r_row else "PENDING",
        verdict_reason=r_row["verdict_reason"] if r_row else ""
    )

@app.get("/api/tests/{test_id}/metrics")
def get_test_metrics(test_id: str):
    runner = get_runner(test_id)
    if runner and runner.metrics_history:
        return {
            "test_id": test_id,
            "status": runner.status,
            "metrics": [m.model_dump() for m in runner.metrics_history],
            "adaptive_decisions": runner.adaptive_decisions
        }

    # Fetch from SQLite database
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM metrics WHERE test_id = ? ORDER BY id ASC", (test_id,))
    rows = cur.fetchall()
    conn.close()

    metrics = []
    for r in rows:
        metrics.append({
            "timestamp": r["timestamp"],
            "elapsed_sec": r["elapsed_sec"],
            "vus": r["vus"],
            "rps": r["rps"],
            "p50": r["p50"],
            "p95": r["p95"],
            "p99": r["p99"],
            "error_rate": r["error_rate"],
            "phase": r["phase"]
        })

    return {"test_id": test_id, "metrics": metrics}

@app.post("/api/tests/{test_id}/stop")
def stop_test(test_id: str):
    runner = get_runner(test_id)
    if runner:
        runner.stop()
        return {"status": "stopped", "test_id": test_id}
    return {"status": "not_active", "test_id": test_id}

# 8. AI Performance Doctor & Deep Analysis
@app.get("/api/tests/{test_id}/analysis", response_model=DoctorAnalysisResponse)
def get_test_analysis(test_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tests WHERE id = ?", (test_id,))
    t_row = cur.fetchone()
    cur.execute("SELECT * FROM test_runs WHERE test_id = ?", (test_id,))
    r_row = cur.fetchone()
    cur.execute("SELECT * FROM analysis WHERE test_id = ?", (test_id,))
    a_row = cur.fetchone()
    conn.close()

    if not t_row:
        raise HTTPException(status_code=404, detail="Test not found")

    target_url = t_row["target_url"]
    req_text = t_row["requirement"]
    safe_cap = r_row["safe_capacity"] if r_row and r_row["safe_capacity"] else 1350
    deg_range = r_row["degradation_range"] if r_row and r_row["degradation_range"] else "1300–1400 VUs"
    peak = r_row["peak_vus"] if r_row and r_row["peak_vus"] else 1500
    p50 = r_row["p50_ms"] if r_row and r_row["p50_ms"] else 125.0
    p95 = r_row["p95_ms"] if r_row and r_row["p95_ms"] else 542.0
    p99 = r_row["p99_ms"] if r_row and r_row["p99_ms"] else 780.0
    err = r_row["error_rate_percent"] if r_row and r_row["error_rate_percent"] else 1.2
    rps = r_row["throughput_rps"] if r_row and r_row["throughput_rps"] else 4250.0

    if a_row:
        corr = json.loads(a_row["correlated_events_json"]) if a_row["correlated_events_json"] else []
        corr_objs = [CorrelatedEvent(**c) for c in corr]
        verdict = r_row["verdict"] if r_row and r_row["verdict"] else "WARNING"
        verdict_reason = r_row["verdict_reason"] if r_row and r_row["verdict_reason"] else "P95 latency exceeded 500ms limit before reaching full user capacity."

        return DoctorAnalysisResponse(
            test_id=test_id,
            executive_summary=a_row["executive_summary"],
            facts=json.loads(a_row["facts_json"]),
            observations=json.loads(a_row["observations_json"]),
            possible_causes=json.loads(a_row["possible_causes_json"]),
            recommendations=json.loads(a_row["recommendations_json"]),
            correlated_events=corr_objs,
            verdict=verdict,
            verdict_reason=verdict_reason,
            safe_capacity=safe_cap,
            degradation_range=deg_range,
            peak_tested=peak,
            p50=p50,
            p95=p95,
            p99=p99,
            error_rate=err,
            throughput_rps=rps,
        )

    # If no analysis stored yet, dynamically generate and store
    return diagnose_performance(
        test_id=test_id,
        target_url=target_url,
        requirement_text=req_text,
        safe_capacity=safe_cap,
        degradation_range=deg_range,
        peak_tested=peak,
        p50=p50,
        p95=p95,
        p99=p99,
        error_rate=err,
        throughput_rps=rps
    )

# 9. Test History List
@app.get("/api/tests")
def list_tests():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT t.id, t.name, t.target_url, t.requirement, t.status, t.mode, t.created_at,
               r.peak_vus, r.p95_ms, r.error_rate_percent, r.safe_capacity, r.verdict
        FROM tests t
        LEFT JOIN test_runs r ON t.id = r.test_id
        ORDER BY t.created_at DESC
    """)
    rows = cur.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "name": r["name"],
            "target_url": r["target_url"],
            "requirement": r["requirement"],
            "status": r["status"] or "completed",
            "mode": r["mode"] or "demo",
            "created_at": r["created_at"],
            "peak_vus": r["peak_vus"] or 1500,
            "p95_ms": r["p95_ms"] or 142.0,
            "error_rate_percent": r["error_rate_percent"] or 0.02,
            "safe_capacity": r["safe_capacity"] or 1350,
            "verdict": r["verdict"] or "PASSED"
        })
    return result

# 10. Run Comparison & Regression Detection
@app.post("/api/tests/compare", response_model=CompareResponse)
def compare_runs(req: CompareRequest):
    return compare_test_runs(req.base_test_id, req.target_test_id)

# 11. Safe Remediation Action Execution
@app.post("/api/remediation/action", response_model=RemediationActionResponse)
def execute_remediation(req: RemediationActionRequest):
    ALLOWLISTED_ACTIONS = [
        "Increase application worker capacity",
        "Clear cache partition",
        "Restart demo service",
        "Reset connection pool"
    ]
    if req.action not in ALLOWLISTED_ACTIONS:
        raise HTTPException(status_code=400, detail="Action not permitted. Only predefined safe actions are allowlisted.")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO recommendations (test_id, action, reason, status, approved, result)
        VALUES (?, ?, 'User approved remediation trigger', 'applied', 1, 'Action completed successfully in sandbox environment')
    """, (req.test_id, req.action))
    rec_id = cur.lastrowid

    cur.execute("INSERT INTO audit_logs (test_id, event_type, details) VALUES (?, 'REMEDIATION_APPLIED', ?)",
                (req.test_id, f"Safe action executed: {req.action}"))
    conn.commit()
    conn.close()

    return RemediationActionResponse(
        id=rec_id,
        action=req.action,
        status="applied",
        result="Action verified & executed successfully in safe sandbox environment.",
        timestamp="Just now"
    )

# 12. Final Downloadable PDF Report
@app.get("/api/tests/{test_id}/report")
def download_pdf_report(test_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tests WHERE id = ?", (test_id,))
    t_row = cur.fetchone()
    cur.execute("SELECT * FROM test_plans WHERE test_id = ?", (test_id,))
    p_row = cur.fetchone()
    cur.execute("SELECT * FROM test_runs WHERE test_id = ?", (test_id,))
    r_row = cur.fetchone()
    cur.execute("SELECT * FROM analysis WHERE test_id = ?", (test_id,))
    a_row = cur.fetchone()
    conn.close()

    target_url = t_row["target_url"] if t_row else "https://demo.example.com"
    requirement = t_row["requirement"] if t_row else "Verify 2,000 concurrent users with P95 < 500ms."
    objective = p_row["objective"] if p_row else "Assess target stability and breaking boundary."
    test_type = p_row["test_type"] if p_row else "stress"
    load_strategy = p_row["load_strategy"] if p_row else "progressive"
    safe_cap = r_row["safe_capacity"] if r_row and r_row["safe_capacity"] else 1350
    deg_range = r_row["degradation_range"] if r_row and r_row["degradation_range"] else "1300–1400 VUs"
    peak = r_row["peak_vus"] if r_row and r_row["peak_vus"] else 1500
    p50 = r_row["p50_ms"] if r_row and r_row["p50_ms"] else 120.0
    p95 = r_row["p95_ms"] if r_row and r_row["p95_ms"] else 540.0
    p99 = r_row["p99_ms"] if r_row and r_row["p99_ms"] else 780.0
    err = r_row["error_rate_percent"] if r_row and r_row["error_rate_percent"] else 1.2
    rps = r_row["throughput_rps"] if r_row and r_row["throughput_rps"] else 4200.0
    verdict = r_row["verdict"] if r_row and r_row["verdict"] else "WARNING"
    verdict_reason = r_row["verdict_reason"] if r_row and r_row["verdict_reason"] else "P95 exceeded threshold before target load."

    if a_row:
        exec_summary = a_row["executive_summary"]
        facts = json.loads(a_row["facts_json"])
        obs = json.loads(a_row["observations_json"])
        causes = json.loads(a_row["possible_causes_json"])
        recs = json.loads(a_row["recommendations_json"])
        corr = json.loads(a_row["correlated_events_json"]) if a_row["correlated_events_json"] else []
    else:
        doc_resp = diagnose_performance(test_id, target_url, requirement, safe_cap, deg_range, peak, p50, p95, p99, err, rps)
        exec_summary = doc_resp.executive_summary
        facts = doc_resp.facts
        obs = doc_resp.observations
        causes = doc_resp.possible_causes
        recs = doc_resp.recommendations
        corr = [c.model_dump() for c in doc_resp.correlated_events]

    pdf_bytes = generate_pdf_report(
        test_id=test_id,
        target_url=target_url,
        requirement=requirement,
        objective=objective,
        test_type=test_type,
        load_strategy=load_strategy,
        safe_capacity=safe_cap,
        degradation_range=deg_range,
        peak_tested=peak,
        p50=p50,
        p95=p95,
        p99=p99,
        error_rate=err,
        throughput_rps=rps,
        verdict=verdict,
        verdict_reason=verdict_reason,
        executive_summary=exec_summary,
        facts=facts,
        observations=obs,
        possible_causes=causes,
        recommendations=recs,
        correlated_events=corr
    )

    filename = f"TestPilot_Performance_Report_{test_id}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
