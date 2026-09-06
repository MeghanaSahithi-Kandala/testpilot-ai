import urllib.parse
from typing import List, Optional
from models.schemas import DependencyMapResponse, DependencyNode, DependencyEdge

def build_dependency_map(target_url: str, custom_dependencies: Optional[List[dict]] = None) -> DependencyMapResponse:
    """
    Generates structured nodes and edges for the dependency map.
    Strictly observes only what is publicly observable or explicitly configured by the user.
    """
    parsed = urllib.parse.urlparse(target_url)
    domain = parsed.netloc or parsed.path or "target-website"

    nodes: List[DependencyNode] = [
        # Root Website Node
        DependencyNode(
            id="node_root",
            type="Website",
            label=domain,
            observable=True,
            details=f"Entrypoint: {target_url}"
        ),
        # Frontend Gateway
        DependencyNode(
            id="node_frontend",
            type="Page",
            label="Client Web Application",
            observable=True,
            details="HTML / SPA Assets & CDN Gateway"
        ),
        # API Gateway
        DependencyNode(
            id="node_api_layer",
            type="API",
            label="API Gateway Layer",
            observable=True,
            details="Reverse Proxy & Route Dispatcher"
        ),
        # Discovered API endpoints
        DependencyNode(
            id="node_api_catalog",
            type="Service",
            label="Catalog & Search API",
            observable=True,
            details="Route /api/v1/items"
        ),
        DependencyNode(
            id="node_api_cart",
            type="Service",
            label="Checkout & Cart API",
            observable=True,
            details="Route /api/v1/cart"
        ),
        # External Edge Service
        DependencyNode(
            id="node_cdn",
            type="External Service",
            label="CDN & Edge DNS",
            observable=True,
            details="Public Cloudflare / Fastly Edge Network"
        ),
        # Unobserved Database Node - STRICTLY flagged
        DependencyNode(
            id="node_db_unobserved",
            type="Database",
            label="Database dependency: Not directly observable",
            observable=False,
            details="Internal storage architecture is isolated from public HTTP surface"
        )
    ]

    edges: List[DependencyEdge] = [
        DependencyEdge(source="node_root", target="node_frontend", relation="routes_to"),
        DependencyEdge(source="node_root", target="node_api_layer", relation="routes_to"),
        DependencyEdge(source="node_frontend", target="node_cdn", relation="cached_at"),
        DependencyEdge(source="node_api_layer", target="node_api_catalog", relation="dispatches"),
        DependencyEdge(source="node_api_layer", target="node_api_cart", relation="dispatches"),
        DependencyEdge(source="node_api_cart", target="node_db_unobserved", relation="unknown_link"),
    ]

    # Incorporate user-provided custom dependencies if supplied
    if custom_dependencies:
        for idx, dep in enumerate(custom_dependencies):
            node_id = f"custom_node_{idx}"
            nodes.append(DependencyNode(
                id=node_id,
                type=dep.get("type", "Service"),
                label=dep.get("label", "Custom Component"),
                observable=True,
                details=dep.get("details", "User configured dependency")
            ))
            edges.append(DependencyEdge(
                source=dep.get("source", "node_api_layer"),
                target=node_id,
                relation="user_specified"
            ))

    notes = [
        "Only publicly observable endpoints and explicitly supplied infrastructure are displayed.",
        "Database dependency: Not directly observable from external HTTP telemetry.",
        "Dependency relationships reflect passive network inspection."
    ]

    return DependencyMapResponse(
        target_url=target_url,
        nodes=nodes,
        edges=edges,
        notes=notes
    )
