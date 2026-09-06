# TestPilot AI

> **Autonomous AI-Powered Website Performance Testing Platform**  
> *"Performance Testing That Thinks."*

Describe your performance goal in simple language. TestPilot plans, executes, adapts and explains the performance test.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2, SQLite
- **Engines**: ReportLab (PDF Generation), k6 (JavaScript Load Generator), Autonomous Adaptive Load Engine

---

## Complete Project Structure

```text
testpilot-ai/
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── AppLayout.tsx # Complete sidebar navigation + header
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Public hero page with Start Testing CTA
│   │   │   ├── DashboardPage.tsx # Executive overview & quick actions
│   │   │   ├── NewTestPage.tsx   # 22-step interactive autonomous wizard
│   │   │   ├── DiscoveryPage.tsx # Website resource scanner
│   │   │   ├── DependencyMapPage.tsx # Observable topology graph
│   │   │   ├── LiveTestPage.tsx  # Real-time telemetry & adaptive timeline
│   │   │   ├── TestHistoryPage.tsx   # Searchable audit & test history
│   │   │   ├── TestResultPage.tsx    # AI Performance Doctor, 6 charts, PDF
│   │   │   ├── CompareRunsPage.tsx   # Regression detection comparison
│   │   │   ├── ReportsPage.tsx   # Centralized PDF reports library
│   │   │   └── SettingsPage.tsx  # Environment & engine configuration
│   │   ├── App.tsx               # 11 routes mapped
│   │   └── index.css             # Dark modern DevOps design system
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # FastAPI + SQLite Backend
│   ├── main.py                   # Full REST API endpoints
│   ├── database.py               # SQLite schema & session connection
│   ├── models/
│   │   └── schemas.py            # Pydantic schemas
│   ├── planning/
│   │   └── nlp_planner.py        # Natural language requirement planner
│   ├── discovery/
│   │   ├── scanner.py            # Safe resource scanner
│   │   └── dependency_mapper.py  # Observable node-edge mapper
│   ├── safety/
│   │   └── guard.py              # Safety Guard parameter validation
│   ├── testing/
│   │   ├── test_data_generator.py# Synthetic test data generator
│   │   ├── k6_generator.py       # k6 JavaScript workload compiler
│   │   ├── adaptive_engine.py    # Autonomous search algorithm
│   │   └── execution_engine.py   # Background thread runner (Demo/Real)
│   ├── analysis/
│   │   ├── performance_doctor.py # AI Doctor & Alert Correlation
│   │   └── regression.py         # Baseline regression comparison
│   ├── reporting/
│   │   └── pdf_generator.py      # Professional ReportLab PDF generation
│   ├── requirements.txt
│   └── test_app.py               # Automated test suite
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ (tested on Node v22)
- **Python**: 3.10+ (tested on Python 3.13)
- **k6** (optional for Real Mode; Demo Mode works out of the box)

---

### 1. Backend Setup & Execution

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt reportlab pillow
   ```

3. Run the automated backend test suite:
   ```bash
   python test_app.py
   ```

4. Start the FastAPI development server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

   - API Health Probe: [http://localhost:8000/api/health](http://localhost:8000/api/health)
   - Interactive OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup & Execution

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Complete Demo Flow (Steps 1 to 22)

1. Open **[http://localhost:5173/](http://localhost:5173/)** and click **"Start Testing"** or navigate to **New Test**.
2. Enter Target URL (`https://demo.example.com`).
3. Enter requirement: *"Can this website support 2000 concurrent users with P95 below 500ms and error rate below 1%?"*
4. Click **"Understand My Requirement"** → Review the structured AI Test Plan.
5. Click **"Discover Website & Endpoints"** → Review discovered HTML pages and routes with strict internal database observability disclaimers.
6. Click **"Generate Dependency Map"** → Inspect the interactive topology graph.
7. Click **"Run Safety Guard"** → Review green safety audit checks and check the operator approval box.
8. Click **"Generate k6 Script"** → View the syntax-highlighted k6 workload script.
9. Click **"Launch Autonomous Test"** → Live test dashboard initiates adaptive exploration.
10. Watch the **Adaptive Load Timeline** identify the degradation boundary at `~1350 VUs`.
11. Inspect the **AI Decision Engine Activity Log** for live step-by-step reasoning.
12. Click **"View Deep Analysis & Report"** upon test completion.
13. Review:
    - Verdict banner (`WARNING` / `PASSED` / `FAILED`)
    - Safe Capacity (`~1350 VUs`) & Degradation Range (`1300–1400 VUs`)
    - 6 Core Performance Charts (Load vs P95, Load vs P99, Load vs Error, Load vs RPS, VUs vs Time, Response Time vs Time)
    - AI Performance Doctor Findings (Executive Summary, Facts, Observations, Possible Causes, Recommendations)
    - Correlated Performance Event ("Possible saturation event detected")
    - Regression comparison against baseline
    - Safe Auto-Remediation button ("Increase application worker capacity")
14. Click **"Download Performance Report (PDF)"** to download the professional ReportLab report (`TestPilot_Performance_Report_<id>.pdf`).

---

## API Catalog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/plan` | Natural language requirement planner |
| `POST` | `/api/discovery` | Passive website & endpoint scanner |
| `POST` | `/api/dependencies` | Topology dependency mapper |
| `POST` | `/api/safety/validate` | Safety guard validator |
| `POST` | `/api/tests/generate-script`| k6 JavaScript workload compiler |
| `POST` | `/api/tests` | Create new performance test |
| `POST` | `/api/tests/{id}/start` | Launch execution runner |
| `GET` | `/api/tests/{id}/status` | Execution status & safe capacity |
| `GET` | `/api/tests/{id}/metrics` | Time-series telemetry points |
| `POST` | `/api/tests/{id}/stop` | Cancel running test |
| `GET` | `/api/tests/{id}/analysis` | AI Doctor report & correlated alerts |
| `GET` | `/api/tests/{id}/dependencies` | Test-specific dependency graph |
| `GET` | `/api/tests/{id}/report` | Download generated PDF report |
| `GET` | `/api/tests` | Test history audit list |
| `POST` | `/api/tests/compare` | Regression detection comparison |
| `POST` | `/api/remediation/action` | Execute allowlisted remediation |
