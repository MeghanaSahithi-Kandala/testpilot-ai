import random
from typing import Dict, Any, List

DISCLAIMER = "SYNTHETIC TEST DATA - Generated autonomously by TestPilot AI for non-destructive performance testing."

FIRST_NAMES = ["alex", "jordan", "taylor", "morgan", "casey", "riley", "sam", "jamie", "cameron", "avery"]
LAST_NAMES = ["chen", "smith", "garcia", "miller", "patel", "kim", "rossi", "tanaka", "novak", "johansson"]
DOMAINS = ["testpilot-synthetic.local", "example-perf.test", "mock-sandbox.internal"]
PRODUCTS = [
    {"id": "prod_perf_101", "name": "Standard Synthetic Widget", "category": "components", "price": 29.99},
    {"id": "prod_perf_102", "name": "Enterprise Pro SKU", "category": "appliances", "price": 149.00},
    {"id": "prod_perf_103", "name": "Microservices Gateway Module", "category": "software", "price": 79.50},
    {"id": "prod_perf_104", "name": "Telemetry Node Kit", "category": "hardware", "price": 210.00},
    {"id": "prod_perf_105", "name": "Load Test Token Bundle", "category": "tokens", "price": 12.00},
]
SEARCH_QUERIES = [
    "synthetic load test benchmark",
    "p95 latency optimization",
    "checkout flow test item",
    "high throughput telemetry",
    "scalability index 2026",
    "cache warm-up query",
]

def generate_synthetic_user() -> Dict[str, str]:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    idx = random.randint(100, 9999)
    username = f"user_{first}_{last}_{idx}"
    email = f"{username}@{random.choice(DOMAINS)}"
    return {
        "_notice": DISCLAIMER,
        "username": username,
        "email": email,
        "first_name": first.capitalize(),
        "last_name": last.capitalize(),
    }

def generate_synthetic_address() -> Dict[str, str]:
    num = random.randint(100, 9999)
    return {
        "_notice": DISCLAIMER,
        "street": f"{num} Benchmark Way",
        "city": "PerfCity",
        "state": "TS",
        "postal_code": "90210",
        "country": "US-SYNTHETIC"
    }

def generate_synthetic_cart_payload() -> Dict[str, Any]:
    selected_prods = random.sample(PRODUCTS, k=random.randint(1, 3))
    items = []
    total = 0.0
    for prod in selected_prods:
        qty = random.randint(1, 4)
        total += prod["price"] * qty
        items.append({
            "product_id": prod["id"],
            "product_name": prod["name"],
            "quantity": qty,
            "unit_price": prod["price"],
        })
    return {
        "_notice": DISCLAIMER,
        "user": generate_synthetic_user(),
        "items": items,
        "total_amount": round(total, 2),
        "currency": "USD",
        "timestamp_epoch": 1788680000 + random.randint(1, 100000),
    }

def generate_synthetic_search_payload() -> Dict[str, Any]:
    return {
        "_notice": DISCLAIMER,
        "query": random.choice(SEARCH_QUERIES),
        "page": random.randint(1, 5),
        "page_size": 20,
        "filters": {
            "in_stock": True,
            "max_price": 500,
        }
    }

def generate_synthetic_auth_payload() -> Dict[str, str]:
    user = generate_synthetic_user()
    return {
        "_notice": DISCLAIMER,
        "username": user["username"],
        "password": "SyntheticPerfTestPass!2026",
        "client_id": "testpilot-load-runner",
    }

def generate_synthetic_payload_for_endpoint(endpoint_path: str) -> Dict[str, Any]:
    """
    Returns appropriate safe synthetic payload based on endpoint route conventions.
    """
    path = endpoint_path.lower()
    if "cart" in path or "order" in path or "checkout" in path:
        return generate_synthetic_cart_payload()
    elif "search" in path or "item" in path or "catalog" in path:
        return generate_synthetic_search_payload()
    elif "login" in path or "auth" in path or "token" in path:
        return generate_synthetic_auth_payload()
    else:
        return {
            "_notice": DISCLAIMER,
            "user": generate_synthetic_user(),
            "target": endpoint_path,
            "synthetic_id": f"syn_{random.randint(1000, 9999)}"
        }
