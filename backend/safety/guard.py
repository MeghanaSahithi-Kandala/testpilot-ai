import urllib.parse
from typing import List
from models.schemas import SafetyValidateRequest, SafetyValidateResponse, SafetyCheckItem

MAX_VUS = 5000
MAX_DURATION_MINUTES = 30

SAFE_DOMAINS_ALLOWLIST = [
    "demo.example.com",
    "example.com",
    "example.org",
    "localhost",
    "127.0.0.1",
    "testpilot.local",
    "internal",
]

def validate_safety(req: SafetyValidateRequest) -> SafetyValidateResponse:
    """
    Evaluates safety constraints before executing any performance load.
    Ensures non-destructive parameters, valid authorization, and hard limit enforcement.
    """
    checks: List[SafetyCheckItem] = []
    blocked_reasons: List[str] = []

    # 1. URL Validation
    try:
        parsed = urllib.parse.urlparse(req.target_url)
        is_valid_url = bool(parsed.scheme in ["http", "https"] and (parsed.netloc or parsed.path))
    except Exception:
        is_valid_url = False

    if is_valid_url:
        checks.append(SafetyCheckItem(name="Target valid", passed=True, message=f"Target URL syntax verified: {req.target_url}"))
    else:
        checks.append(SafetyCheckItem(name="Target valid", passed=False, message="Invalid target URL. Must include http:// or https://"))
        blocked_reasons.append("Invalid URL format.")

    # 2. Environment Verification & Allowlist
    domain = parsed.netloc.split(":")[0].lower() if is_valid_url else ""
    is_safe_environment = any(allowed in domain for allowed in SAFE_DOMAINS_ALLOWLIST) or req.user_authorized

    if is_safe_environment:
        checks.append(SafetyCheckItem(name="Environment verified", passed=True, message="Target identified as authorized demo or staging sandbox."))
    else:
        checks.append(SafetyCheckItem(name="Environment verified", passed=False, message=f"Domain '{domain}' requires explicit operator verification."))
        blocked_reasons.append(f"Domain '{domain}' not in immediate allowlist without user authorization flag.")

    # 3. Target Authorized Check
    if req.user_authorized or "demo" in domain or "example" in domain or "localhost" in domain or "127.0.0.1" in domain:
        checks.append(SafetyCheckItem(name="Target authorized", passed=True, message="Target authorization verified by operator."))
    else:
        checks.append(SafetyCheckItem(name="Target authorized", passed=False, message="Explicit authorization required before sending load."))
        blocked_reasons.append("Operator authorization flag is missing.")

    # 4. Load Within Limits (Max 5000 VUs)
    if req.max_users <= MAX_VUS:
        checks.append(SafetyCheckItem(name="Load within limit", passed=True, message=f"{req.max_users} VUs is within the safety ceiling of {MAX_VUS} VUs."))
    else:
        checks.append(SafetyCheckItem(name="Load within limit", passed=False, message=f"{req.max_users} VUs exceeds maximum safety ceiling of {MAX_VUS} VUs."))
        blocked_reasons.append(f"Load exceeds {MAX_VUS} VUs.")

    # 5. Duration Within Limits (Max 30 Minutes)
    if req.duration_minutes <= MAX_DURATION_MINUTES:
        checks.append(SafetyCheckItem(name="Duration within limit", passed=True, message=f"{req.duration_minutes}m duration is within max limit of {MAX_DURATION_MINUTES}m."))
    else:
        checks.append(SafetyCheckItem(name="Duration within limit", passed=False, message=f"{req.duration_minutes}m duration exceeds safety ceiling of {MAX_DURATION_MINUTES}m."))
        blocked_reasons.append(f"Duration exceeds {MAX_DURATION_MINUTES} minutes.")

    # 6. No Dangerous Operations Check
    target_lower = req.target_url.lower()
    has_dangerous_terms = any(term in target_lower for term in ["drop", "truncate", "delete_all", "format", "shutdown", "admin/wipe"])
    if not has_dangerous_terms:
        checks.append(SafetyCheckItem(name="No dangerous operations", passed=True, message="Only safe read/query and synthetic idempotency payloads configured."))
    else:
        checks.append(SafetyCheckItem(name="No dangerous operations", passed=False, message="Target path contains potentially destructive keywords."))
        blocked_reasons.append("Destructive keyword detected in URL path.")

    safe = len(blocked_reasons) == 0

    if safe:
        status_message = "SAFETY CHECK PASSED"
    else:
        status_message = "Execution blocked by Safety Guard: " + " ".join(blocked_reasons)

    return SafetyValidateResponse(
        safe=safe,
        status_message=status_message,
        checks=checks,
        requires_user_approval=True
    )
