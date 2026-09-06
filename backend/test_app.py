import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_full_pipeline():
    print("1. Testing Health...")
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    print("[OK] Health endpoint OK")

    print("2. Testing Natural Language Planner (Specific)...")
    payload = {
        "target_url": "https://demo.example.com",
        "instruction": "Check whether my website can handle 2000 concurrent users while keeping response time below 500ms and error rate below 1%."
    }
    r = client.post("/api/plan", json=payload)
    assert r.status_code == 200
    plan = r.json()
    assert plan["max_users"] == 2000
    assert plan["thresholds"]["p95_latency_ms"] == 500
    assert plan["thresholds"]["error_rate_percent"] == 1.0
    print(f"[OK] Planner parsed: {plan['max_users']} VUs, {plan['thresholds']['p95_latency_ms']}ms, {plan['test_type']}")

    print("3. Testing Autonomous Planner Fallback (Vague)...")
    payload_vague = {
        "target_url": "https://demo.example.com",
        "instruction": "Test this website thoroughly."
    }
    r = client.post("/api/plan", json=payload_vague)
    assert r.status_code == 200
    plan_vague = r.json()
    assert plan_vague["test_type"] == "autonomous"
    print(f"[OK] Autonomous fallback OK: {plan_vague['test_type']}")

    print("4. Testing Resource Discovery...")
    r = client.post("/api/discovery", json={"target_url": "https://demo.example.com"})
    assert r.status_code == 200
    disc = r.json()
    assert len(disc["pages"]) > 0
    assert any("not directly observable" in w.lower() for w in disc["warnings"])
    print(f"[OK] Discovery OK ({len(disc['pages'])} pages, {len(disc['api_endpoints'])} endpoints, warnings verified)")

    print("5. Testing Dependency Mapper...")
    r = client.post("/api/dependencies", json={"target_url": "https://demo.example.com"})
    assert r.status_code == 200
    dep = r.json()
    assert any(n["type"] == "Database" and "Not directly observable" in n["label"] for n in dep["nodes"])
    print(f"[OK] Dependency map OK ({len(dep['nodes'])} nodes, strict unobserved label confirmed)")

    print("6. Testing Safety Guard...")
    r = client.post("/api/safety/validate", json={
        "target_url": "https://demo.example.com",
        "max_users": 2000,
        "duration_minutes": 10,
        "user_authorized": True
    })
    assert r.status_code == 200
    safety = r.json()
    assert safety["safe"] is True
    assert safety["status_message"] == "SAFETY CHECK PASSED"
    print("[OK] Safety guard verified")

    print("7. Testing K6 Generator...")
    r = client.post("/api/tests/generate-script", json={"test_plan": plan})
    assert r.status_code == 200
    k6_res = r.json()
    assert "import http from 'k6/http';" in k6_res["script"]
    print("[OK] K6 script generation verified")

    print("8. Creating and Starting Test...")
    r = client.post("/api/tests", json={
        "target_url": "https://demo.example.com",
        "requirement": payload["instruction"],
        "plan": plan,
        "mode": "demo"
    })
    assert r.status_code == 200
    test_id = r.json()["test_id"]
    print(f"[OK] Created test {test_id}")

    r = client.post(f"/api/tests/{test_id}/start")
    assert r.status_code == 200
    print("[OK] Started test runner, waiting for adaptive execution...")

    # Wait for execution runner to complete adaptive steps
    time.sleep(7)

    print("9. Checking Test Status and Metrics...")
    r = client.get(f"/api/tests/{test_id}/status")
    assert r.status_code == 200
    status_res = r.json()
    print(f"[OK] Status: {status_res['status']}, Safe Capacity: ~{status_res['safe_capacity']} VUs, Range: {status_res['degradation_range']}")

    r = client.get(f"/api/tests/{test_id}/metrics")
    assert r.status_code == 200
    metrics_res = r.json()
    assert len(metrics_res["metrics"]) > 0
    print(f"[OK] Recorded {len(metrics_res['metrics'])} telemetry points")

    print("10. Checking AI Performance Doctor Analysis...")
    r = client.get(f"/api/tests/{test_id}/analysis")
    assert r.status_code == 200
    analysis = r.json()
    assert len(analysis["facts"]) > 0
    assert len(analysis["observations"]) > 0
    assert len(analysis["possible_causes"]) > 0
    assert len(analysis["recommendations"]) > 0
    assert len(analysis["correlated_events"]) > 0
    print(f"[OK] AI Doctor Analysis: Verdict={analysis['verdict']}, Correlated Events={len(analysis['correlated_events'])}")

    print("11. Testing PDF Report Generation...")
    r = client.get(f"/api/tests/{test_id}/report")
    assert r.status_code == 200
    assert r.content.startswith(b"%PDF")
    print(f"[OK] PDF successfully generated! File size: {len(r.content)} bytes")

    print("ALL BACKEND AUTOMATED TESTS PASSED!")

if __name__ == "__main__":
    test_full_pipeline()
