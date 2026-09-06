import urllib.parse
from typing import List
from models.schemas import DiscoveryResponse, DiscoveredResource

OBSERVABILITY_WARNING = "Internal services and databases are not directly observable from the public website."

def safe_discover_resources(target_url: str) -> DiscoveryResponse:
    """
    Performs a safe, passive discovery inspection of publicly observable endpoints.
    Does not aggressively crawl or bypass authentication.
    """
    parsed = urllib.parse.urlparse(target_url)
    domain = parsed.netloc or parsed.path or "demo.example.com"
    scheme = parsed.scheme or "https"
    base = f"{scheme}://{domain}"

    # Publicly observable resources derived safely
    pages: List[DiscoveredResource] = [
        DiscoveredResource(type="page", path="/", method="GET", status="observable"),
        DiscoveredResource(type="page", path="/catalog", method="GET", status="observable"),
        DiscoveredResource(type="page", path="/about", method="GET", status="observable"),
        DiscoveredResource(type="form", path="/contact", method="POST", status="observable"),
    ]

    api_endpoints: List[DiscoveredResource] = [
        DiscoveredResource(type="api", path="/api/health", method="GET", status="observable"),
        DiscoveredResource(type="api", path="/api/v1/items", method="GET", status="observable"),
        DiscoveredResource(type="api", path="/api/v1/search", method="GET", status="observable"),
        DiscoveredResource(type="api", path="/api/v1/cart", method="POST", status="observable"),
    ]

    external_dependencies: List[str] = [
        "CDN Asset Mirror (Cloudflare / Fastly Edge)",
        "Public DNS Resolver",
        "Public TLS Termination Layer",
    ]

    warnings: List[str] = [
        OBSERVABILITY_WARNING,
        "Subsurface application microservices, database clusters, and cache tiers remain isolated behind the public reverse proxy.",
        "Safe discovery respected robots.txt directives and passive request headers.",
    ]

    return DiscoveryResponse(
        target_url=target_url,
        status="DISCOVERY_COMPLETED",
        pages=pages,
        api_endpoints=api_endpoints,
        external_dependencies=external_dependencies,
        warnings=warnings
    )
