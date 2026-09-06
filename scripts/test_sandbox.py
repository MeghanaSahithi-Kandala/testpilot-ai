#!/usr/bin/env python3
"""
TestPilot AI - Virtual Sandbox E2E Verification Script
Runs full pipeline testing against the containerized Docker sandbox environment.
"""

import sys
import time
import urllib.request
import urllib.error
import json

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"
MOCK_SUT_URL = "http://localhost:8080"

def log(step: str, msg: str):
    print(f"[{step}] {msg}")

def request_json(url: str, method: str = "GET", data: dict = None) -> dict:
    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"} if req_data else {},
        method=method
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("==================================================")
    print("🚀 TestPilot AI: Docker Sandbox Virtual Testing")
    print("==================================================")

    # 1. Verify Backend Health
    log("1/7", f"Checking backend health at {BACKEND_URL}/api/health...")
    health = request_json(f"{BACKEND_URL}/api/health")
    assert health.get("status") == "ok", f"Health status not ok: {health}"
    log("1/7", "✅ Backend container is healthy!")

    # 2. Verify Frontend Delivery
    log("2/7", f"Checking frontend web app delivery at {FRONTEND_URL}...")
    req_front = urllib.request.Request(FRONTEND_URL, method="GET")
    with urllib.request.urlopen(req_front, timeout=10) as resp:
        assert resp.status == 200, f"Frontend returned status {resp.status}"
    log("2/7", "✅ Frontend container is serving UI (HTTP 200)!")

    # 3. Verify Mock SUT Target
    log("3/7", f"Checking mock SUT sandbox target at {MOCK_SUT_URL}...")
    req_sut = urllib.request.Request(MOCK_SUT_URL, method="GET")
    with urllib.request.urlopen(req_sut, timeout=10) as resp:
        assert resp.status == 200, f"Mock SUT returned status {resp.status}"
    log("3/7", "✅ Mock System Under Test (SUT) is reachable!")

    # 4. Generate AI Test Plan from Natural Language
    log("4/7", "Invoking NLP Planner for virtual testing scenario...")
    plan_payload = {
        "target_url": MOCK_SUT_URL,
        "instruction": "Test whether mock service handles 1500 concurrent users under 400ms latency and 1% errors."
    }
    plan = request_json(f"{BACKEND_URL}/api/plan", method="POST", data=plan_payload)
    assert plan["max_users"] == 1500, f"Expected 1500 VUs, got {plan.get('max_users')}"
    log("4/7", f"✅ AI Planner created plan: {plan['max_users']} VUs, {plan['test_type']} strategy.")

    # 5. Create Test Record & Start Adaptive Load Test
    log("5/7", "Starting adaptive load execution in sandbox...")
    create_payload = {
        "target_url": MOCK_SUT_URL,
        "test_type": plan["test_type"],
        "load_strategy": "adaptive",
        "max_users": plan["max_users"],
        "duration_minutes": 1,
        "thresholds": plan["thresholds"],
        "requirement": plan_payload["instruction"]
    }
    test_record = request_json(f"{BACKEND_URL}/api/tests", method="POST", data=create_payload)
    test_id = test_record["id"]
    log("5/7", f"Test record created with ID: {test_id}")

    start_res = request_json(f"{BACKEND_URL}/api/tests/start", method="POST", data={"test_id": test_id, "mode": "demo"})
    assert start_res["status"] == "running"
    log("5/7", "✅ Adaptive test running in sandbox background...")

    # 6. Poll Live Status until Completion
    log("6/7", "Polling real-time telemetry stream...")
    max_wait = 40
    start_time = time.time()
    completed = False

    while time.time() - start_time < max_wait:
        status_res = request_json(f"{BACKEND_URL}/api/tests/{test_id}/status")
        status = status_res.get("status")
        current_vus = status_res.get("current_vus", 0)
        print(f"   [Telemetry] Status: {status} | Current Load: {current_vus} VUs")

        if status in ("completed", "stopped"):
            completed = True
            log("6/7", f"✅ Test completed! Safe Capacity: {status_res.get('safe_capacity')} VUs")
            break
        time.sleep(1.5)

    assert completed, "Test timed out before completing!"

    # 7. Verify AI Doctor Diagnostics & PDF Generation
    log("7/7", "Validating AI Performance Doctor diagnostics & PDF report...")
    doctor_res = request_json(f"{BACKEND_URL}/api/tests/{test_id}/doctor")
    assert "verdict" in doctor_res, "AI Doctor verdict missing!"
    log("7/7", f"✅ AI Doctor Verdict: {doctor_res['verdict']} ({len(doctor_res.get('facts', []))} facts)")

    # Verify PDF report endpoint
    pdf_url = f"{BACKEND_URL}/api/reports/{test_id}/pdf"
    with urllib.request.urlopen(pdf_url, timeout=10) as pdf_resp:
        assert pdf_resp.status == 200
        pdf_bytes = pdf_resp.read()
        assert len(pdf_bytes) > 1000, "PDF bytes too small!"
        assert pdf_bytes.startswith(b"%PDF"), "Response is not a valid PDF document!"
    log("7/7", f"✅ PDF report validated! ({len(pdf_bytes)} bytes)")

    print("==================================================")
    print("🎉 ALL DOCKER SANDBOX VIRTUAL TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Virtual sandbox test failed: {e}", file=sys.stderr)
        sys.exit(1)
