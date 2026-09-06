from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Thresholds(BaseModel):
    p95_latency_ms: float = Field(default=500.0, description="P95 latency SLA threshold in ms")
    error_rate_percent: float = Field(default=1.0, description="Error rate threshold in %")
    p99_latency_ms: Optional[float] = Field(default=None, description="P99 latency SLA threshold in ms")

class LoadStage(BaseModel):
    duration: str = Field(description="Stage duration e.g. 1m, 30s")
    target: int = Field(description="Target Virtual Users for this stage")

class PlanRequest(BaseModel):
    target_url: str = Field(..., description="Target service URL e.g. https://demo.example.com")
    instruction: str = Field(default="", description="Natural language performance requirement prompt")

class PlanResponse(BaseModel):
    target_url: str
    objective: str
    test_type: str = Field(description="baseline, stress, soak, breaking-point, or autonomous")
    max_users: int
    duration_minutes: int
    thresholds: Thresholds
    load_strategy: str = Field(default="progressive")
    stages: List[LoadStage] = []

class DiscoveredResource(BaseModel):
    type: str = Field(description="page, api, asset, form")
    path: str
    method: str = "GET"
    status: str = "observable"

class DiscoveryRequest(BaseModel):
    target_url: str

class DiscoveryResponse(BaseModel):
    target_url: str
    status: str
    pages: List[DiscoveredResource]
    api_endpoints: List[DiscoveredResource]
    external_dependencies: List[str]
    warnings: List[str]

class DependencyNode(BaseModel):
    id: str
    type: str = Field(description="Website, Page, API, Service, Database, External Service")
    label: str
    observable: bool = True
    details: str = ""

class DependencyEdge(BaseModel):
    source: str
    target: str
    relation: str = "connects_to"

class DependencyMapResponse(BaseModel):
    target_url: str
    nodes: List[DependencyNode]
    edges: List[DependencyEdge]
    notes: List[str]

class SafetyCheckItem(BaseModel):
    name: str
    passed: bool
    message: str

class SafetyValidateRequest(BaseModel):
    target_url: str
    max_users: int = 2000
    duration_minutes: int = 10
    user_authorized: bool = False

class SafetyValidateResponse(BaseModel):
    safe: bool
    status_message: str
    checks: List[SafetyCheckItem]
    requires_user_approval: bool = True

class K6GenerateRequest(BaseModel):
    test_plan: PlanResponse
    test_id: Optional[str] = ""

class K6GenerateResponse(BaseModel):
    test_id: str
    script: str
    config: Dict[str, Any]

class TestCreateRequest(BaseModel):
    name: Optional[str] = None
    target_url: str
    requirement: str
    plan: PlanResponse
    mode: str = "demo"

class MetricsSnapshot(BaseModel):
    timestamp: float
    elapsed_sec: int
    vus: int
    rps: float
    p50: float
    p95: float
    p99: float
    error_rate: float
    phase: str

class TestStatusResponse(BaseModel):
    test_id: str
    status: str
    mode: str
    current_vus: int = 0
    peak_vus: int = 0
    latest_metrics: Optional[MetricsSnapshot] = None
    safe_capacity: int = 0
    degradation_range: str = ""
    verdict: str = "PENDING"
    verdict_reason: str = ""

class CorrelatedEvent(BaseModel):
    title: str
    confidence: str
    signals: List[str]
    timestamp: str

class DoctorAnalysisResponse(BaseModel):
    test_id: str
    executive_summary: str
    facts: List[str]
    observations: List[str]
    possible_causes: List[str]
    recommendations: List[str]
    correlated_events: List[CorrelatedEvent]
    verdict: str
    verdict_reason: str
    safe_capacity: int
    degradation_range: str
    peak_tested: int
    p50: float
    p95: float
    p99: float
    error_rate: float
    throughput_rps: float

class RemediationActionRequest(BaseModel):
    test_id: str
    action: str
    approved: bool = True

class RemediationActionResponse(BaseModel):
    id: int
    action: str
    status: str
    result: str
    timestamp: str

class CompareRequest(BaseModel):
    base_test_id: str
    target_test_id: str

class CompareResponse(BaseModel):
    base_test_id: str
    target_test_id: str
    verdict: str
    summary: str
    safe_capacity_delta: int
    safe_capacity_delta_pct: float
    p95_delta_ms: float
    error_rate_delta_pct: float
