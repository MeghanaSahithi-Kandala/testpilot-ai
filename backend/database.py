import os
import sqlite3
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "testpilot.db"
DATABASE_URL = os.getenv("DATABASE_URL", str(DEFAULT_DB_PATH))

def get_db_path() -> str:
    return DATABASE_URL.replace("sqlite:///", "")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Tests master table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS tests (
        id TEXT PRIMARY KEY,
        name TEXT,
        target_url TEXT,
        requirement TEXT,
        status TEXT DEFAULT 'planned',
        mode TEXT DEFAULT 'demo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Test Plans table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS test_plans (
        test_id TEXT PRIMARY KEY,
        target_url TEXT,
        objective TEXT,
        test_type TEXT,
        max_users INTEGER,
        duration_minutes INTEGER,
        thresholds_json TEXT,
        load_strategy TEXT,
        stages_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
    );
    """)

    # Test Runs table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS test_runs (
        id TEXT PRIMARY KEY,
        test_id TEXT,
        status TEXT DEFAULT 'created',
        mode TEXT DEFAULT 'demo',
        started_at TIMESTAMP,
        finished_at TIMESTAMP,
        peak_vus INTEGER DEFAULT 0,
        p50_ms REAL DEFAULT 0,
        p95_ms REAL DEFAULT 0,
        p99_ms REAL DEFAULT 0,
        avg_latency_ms REAL DEFAULT 0,
        error_rate_percent REAL DEFAULT 0,
        throughput_rps REAL DEFAULT 0,
        safe_capacity INTEGER DEFAULT 0,
        degradation_range TEXT DEFAULT '',
        verdict TEXT DEFAULT 'PENDING',
        verdict_reason TEXT DEFAULT '',
        FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
    );
    """)

    # Telemetry Metrics table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT,
        run_id TEXT,
        timestamp REAL,
        elapsed_sec INTEGER,
        vus INTEGER,
        rps REAL,
        p50 REAL,
        p95 REAL,
        p99 REAL,
        error_rate REAL,
        phase TEXT
    );
    """)

    # Dependencies table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT,
        source TEXT,
        target TEXT,
        node_type TEXT,
        label TEXT,
        status TEXT,
        observable INTEGER DEFAULT 1
    );
    """)

    # AI Doctor Analysis table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS analysis (
        test_id TEXT PRIMARY KEY,
        executive_summary TEXT,
        facts_json TEXT,
        observations_json TEXT,
        possible_causes_json TEXT,
        recommendations_json TEXT,
        correlated_events_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
    );
    """)

    # Safe Remediation table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT,
        action TEXT,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        approved INTEGER DEFAULT 0,
        result TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Audit Logs table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT,
        event_type TEXT,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

# Initialize tables immediately on module load
init_db()
