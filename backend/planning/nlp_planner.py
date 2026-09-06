import re
import os
from typing import Optional
from models.schemas import PlanResponse, Thresholds, LoadStage

def generate_progressive_stages(max_users: int, duration_minutes: int) -> list[LoadStage]:
    """
    Generates sensible progressive load stages ramping up to max_users.
    Example: 100 -> 250 -> 500 -> 750 -> 1000 -> 1500 -> 2000
    """
    if max_users <= 100:
        targets = [25, 50, 75, max_users]
    elif max_users <= 500:
        targets = [50, 100, 250, 400, max_users]
    elif max_users <= 1000:
        targets = [100, 250, 500, 750, max_users]
    elif max_users <= 2500:
        targets = [100, 250, 500, 750, 1000, 1500, max_users]
    else:
        targets = [250, 500, 1000, 2000, 3500, max_users]

    # Calculate stage duration in seconds or minutes
    total_stages = len(targets)
    stage_sec = max(20, int((duration_minutes * 60) / (total_stages + 1)))

    stages = []
    for tgt in targets:
        stages.append(LoadStage(duration=f"{stage_sec}s", target=tgt))
    # Cooldown ramp-down
    stages.append(LoadStage(duration="30s", target=0))
    return stages

def plan_test(target_url: str, instruction: str) -> PlanResponse:
    """
    Parses natural language performance testing requirements into a validated PlanResponse.
    Uses deterministic NLP extraction with optional pluggable LLM support.
    """
    text = (instruction or "").strip().lower()

    # Default fallback values
    max_users = 2000
    p95_threshold = 500.0
    p99_threshold = None
    error_threshold = 1.0
    duration_minutes = 10
    test_type = "stress"
    load_strategy = "progressive"

    # Check for empty / vague prompt -> autonomous mode
    is_vague = (
        not text
        or text in ["test this website thoroughly", "test thoroughly", "test", "benchmark", "full test", "thorough test"]
        or "thoroughly" in text
        or "autonomous" in text
    )

    if is_vague:
        test_type = "autonomous"
        max_users = 1500
        duration_minutes = 8
        objective = (
            "Autonomous multi-phase strategy: determine baseline latency, apply progressive stress, "
            "and execute adaptive search to discover safe-capacity and breaking-point boundaries."
        )
        thresholds = Thresholds(
            p95_latency_ms=450.0,
            error_rate_percent=1.0,
            p99_latency_ms=800.0
        )
        stages = generate_progressive_stages(max_users, duration_minutes)
        return PlanResponse(
            target_url=target_url,
            objective=objective,
            test_type=test_type,
            max_users=max_users,
            duration_minutes=duration_minutes,
            thresholds=thresholds,
            load_strategy="adaptive-progressive",
            stages=stages
        )

    # 1. Parse Concurrent Users / VUs
    # Match: 2000 concurrent users, 2000 users, 2000 vus, 2000 users at a time, maximum 2000 users
    user_match = re.search(r'(\d+[\d,]*)\s*(?:concurrent\s+users|users\s+at\s+a\s+time|users|vus|maximum\s+users|max\s+users)', text)
    if not user_match:
        # Match 'handle 2000' or 'support 2000'
        user_match = re.search(r'(?:handle|support|reach|test\s+up\s+to)\s+(\d+[\d,]*)', text)

    if user_match:
        try:
            parsed_users = int(user_match.group(1).replace(',', ''))
            # Safe boundary check (cap at 5000 max)
            max_users = min(max(10, parsed_users), 5000)
        except ValueError:
            pass

    # 2. Parse Latency Thresholds (P95, P99, response time, latency)
    # Match: response time below 500ms, latency < 500ms, p95 below 500ms, p95 < 500 ms
    p95_match = re.search(r'(?:p95|response\s+time|latency)\s*(?:below|<|under|<=|is\s+less\s+than)\s*(\d+[\d.]*)\s*(?:ms|milliseconds)?', text)
    if p95_match:
        try:
            p95_threshold = float(p95_match.group(1))
        except ValueError:
            pass

    p99_match = re.search(r'p99\s*(?:below|<|under|<=)\s*(\d+[\d.]*)\s*(?:ms|milliseconds)?', text)
    if p99_match:
        try:
            p99_threshold = float(p99_match.group(1))
        except ValueError:
            pass

    # 3. Parse Error Rate Threshold
    # Match: error rate below 1%, error < 1%
    error_match = re.search(r'error(?:\s+rate)?\s*(?:below|<|under|<=)\s*(\d+[\d.]*)\s*%', text)
    if error_match:
        try:
            error_threshold = float(error_match.group(1))
        except ValueError:
            pass

    # 4. Parse Duration
    dur_match = re.search(r'(?:for|duration(?:\s+of)?)\s*(\d+)\s*(?:min|minutes|m\b)', text)
    if dur_match:
        try:
            duration_minutes = min(max(1, int(dur_match.group(1))), 30)
        except ValueError:
            pass

    # 5. Determine Test Type
    if "soak" in text or "endurance" in text or "sustained" in text:
        test_type = "soak"
        load_strategy = "constant"
    elif "breaking point" in text or "breaking-point" in text or "find limit" in text or "find boundary" in text:
        test_type = "breaking-point"
        load_strategy = "adaptive"
    elif "baseline" in text:
        test_type = "baseline"
        load_strategy = "constant"
    elif "stress" in text or "gradually increase" in text or "spike" in text or max_users >= 1000:
        test_type = "stress"
        load_strategy = "progressive"

    objective = (
        f"Verify whether {target_url} can support {max_users} concurrent users "
        f"while maintaining P95 latency under {p95_threshold:.0f}ms and error rate under {error_threshold:.1f}%."
    )

    thresholds = Thresholds(
        p95_latency_ms=p95_threshold,
        error_rate_percent=error_threshold,
        p99_latency_ms=p99_threshold or (p95_threshold * 1.5)
    )

    stages = generate_progressive_stages(max_users, duration_minutes)

    return PlanResponse(
        target_url=target_url,
        objective=objective,
        test_type=test_type,
        max_users=max_users,
        duration_minutes=duration_minutes,
        thresholds=thresholds,
        load_strategy=load_strategy,
        stages=stages
    )
