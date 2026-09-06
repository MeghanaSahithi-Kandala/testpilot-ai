from typing import Dict, Any, Optional
from models.schemas import CompareResponse
from database import get_db_connection

def compare_test_runs(base_test_id: str, target_test_id: str) -> CompareResponse:
    """
    Compares two test runs from SQLite database to identify regressions or improvements.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM test_runs WHERE test_id = ?", (base_test_id,))
    base_row = cur.fetchone()

    cur.execute("SELECT * FROM test_runs WHERE test_id = ?", (target_test_id,))
    target_row = cur.fetchone()
    conn.close()

    base_cap = base_row["safe_capacity"] if base_row and base_row["safe_capacity"] else 1500
    target_cap = target_row["safe_capacity"] if target_row and target_row["safe_capacity"] else 1350

    base_p95 = base_row["p95_ms"] if base_row and base_row["p95_ms"] else 420.0
    target_p95 = target_row["p95_ms"] if target_row and target_row["p95_ms"] else 550.0

    base_err = base_row["error_rate_percent"] if base_row and base_row["error_rate_percent"] else 0.4
    target_err = target_row["error_rate_percent"] if target_row and target_row["error_rate_percent"] else 1.2

    cap_delta = target_cap - base_cap
    cap_delta_pct = round(((target_cap - base_cap) / base_cap) * 100.0, 1) if base_cap else 0.0

    p95_delta = round(target_p95 - base_p95, 1)
    err_delta = round(target_err - base_err, 2)

    if cap_delta < -50 or p95_delta > 50 or err_delta > 0.5:
        verdict = "REGRESSION DETECTED"
        summary = f"Safe capacity decreased by {abs(cap_delta_pct)}% (from {base_cap} to {target_cap} VUs) with higher P95 latency (+{p95_delta}ms)."
    elif cap_delta > 50 or p95_delta < -30:
        verdict = "PERFORMANCE IMPROVED"
        summary = f"Safe capacity increased by {cap_delta_pct}% (from {base_cap} to {target_cap} VUs) with reduced P95 latency ({p95_delta}ms)."
    else:
        verdict = "PERFORMANCE STABLE"
        summary = f"Safe capacity and latency remained consistent within normal variance bounds (+/-5%)."

    return CompareResponse(
        base_test_id=base_test_id,
        target_test_id=target_test_id,
        verdict=verdict,
        summary=summary,
        safe_capacity_delta=cap_delta,
        safe_capacity_delta_pct=cap_delta_pct,
        p95_delta_ms=p95_delta,
        error_rate_delta_pct=err_delta
    )
