import json
from models.schemas import PlanResponse

def generate_k6_script(plan: PlanResponse, test_id: str = "TP-100") -> str:
    """
    Generates a production-grade k6 JavaScript workload script
    based on the structured PlanResponse parameters.
    """
    stages_js = []
    for s in plan.stages:
        stages_js.append(f"    {{ duration: '{s.duration}', target: {s.target} }},")
    stages_str = "\n".join(stages_js)

    p95_limit = int(plan.thresholds.p95_latency_ms)
    error_rate_limit = plan.thresholds.error_rate_percent / 100.0

    script = f"""// ============================================================================
// TestPilot AI - Autonomous Performance Workload
// Test ID: {test_id}
// Strategy: {plan.load_strategy.upper()} | Type: {plan.test_type.upper()}
// Target: {plan.target_url}
// Notice: SYNTHETIC TEST DATA ONLY - DO NOT EXECUTE ARBITRARY SHELL COMMANDS
// ============================================================================

import http from 'k6/http';
import {{ check, sleep }} from 'k6';
import {{ Counter, Rate, Trend }} from 'k6/metrics';

// Custom Telemetry Trends
export const LatencyP95 = new Trend('testpilot_latency_p95');
export const FailureRate = new Rate('testpilot_error_rate');

export const options = {{
  scenarios: {{
    adaptive_workload: {{
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
{stages_str}
      ],
      gracefulRampDown: '15s',
    }},
  }},
  thresholds: {{
    'http_req_duration': ['p(95)<{p95_limit}'], // SLA Threshold: P95 < {p95_limit}ms
    'http_req_failed': ['rate<{error_rate_limit:.4f}'], // Error rate < {plan.thresholds.error_rate_percent:.1f}%
    'checks': ['rate>0.98'],
  }},
  userAgent: 'TestPilotAI-AutonomousLoadEngine/1.0',
}};

// Synthetic payload dispatcher
export default function () {{
  const targetUrl = '{plan.target_url}';
  const params = {{
    headers: {{
      'Content-Type': 'application/json',
      'X-TestPilot-Synthetic': 'true',
      'X-TestPilot-Run-Id': '{test_id}',
    }},
    timeout: '10s',
  }};

  // Execute benchmark probe
  const res = http.get(targetUrl, params);

  // Validate response contract
  const passed = check(res, {{
    'status is 200 or 304': (r) => r.status === 200 || r.status === 304,
    'response received': (r) => r.body && r.body.length > 0,
  }});

  // Record Telemetry
  LatencyP95.add(res.timings.duration);
  FailureRate.add(!passed);

  // Realistic user think-time pacing (100ms - 400ms)
  sleep(0.2);
}}
"""
    return script
