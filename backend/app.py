"""
Neer Safai — Python Flask + SQLite backend
==========================================
REST API for the Neer Safai water sanitation portal.

Run:
    pip install -r requirements.txt
    python app.py

The server listens on http://127.0.0.1:5000 by default. The frontend
automatically detects this backend (GET /api/health) and falls back to
localStorage demo mode when it is unavailable.
"""

import os
import re
import json
import random
import secrets
import sqlite3
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

ADMIN_EMAIL = os.environ.get("NS_ADMIN_EMAIL", "admin@gov.in")
ADMIN_PASSWORD = os.environ.get("NS_ADMIN_PASSWORD", "admin123")

ALLOWED_STATUSES = ["Pending", "Under Review", "Resolved", "Rejected"]
PHONE_RE = re.compile(r"^[6-9]\d{9}$")
PIN_RE = re.compile(r"^[1-9]\d{5}$")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS complaints (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            name         TEXT NOT NULL,
            phone        TEXT NOT NULL,
            state        TEXT NOT NULL,
            district     TEXT NOT NULL,
            issue_type   TEXT NOT NULL,
            description  TEXT NOT NULL,
            status       TEXT NOT NULL DEFAULT 'Pending',
            remarks      TEXT DEFAULT '',
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            type       TEXT,
            name       TEXT,
            email      TEXT,
            role       TEXT,
            rating     INTEGER,
            message    TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()

    count = cur.execute("SELECT COUNT(*) AS c FROM complaints").fetchone()["c"]
    if count == 0:
        seed_complaints(cur)
    conn.commit()
    conn.close()


def seed_complaints(cur):
    """Seed a handful of realistic demo complaints so the dashboard is not empty."""
    now = datetime.now()
    seeds = [
        ("Aarav Sharma", "9876543210", "Uttar Pradesh", "Varanasi", "Contaminated / Dirty Water",
         "Brownish water is coming from the main pipeline near Lanka crossing since three days.", "Resolved", 26,
         "Field team inspected and restored supply."),
        ("Priya Nair", "9822334455", "Kerala", "Ernakulam", "Pipeline Leakage",
         "Major leakage near the community tap causing water wastage and low pressure.", "Under Review", 19, ""),
        ("Rohit Yadav", "9911223344", "Bihar", "Patna", "No Water Supply",
         "No water supply in Rajendra Nagar block for the last four days.", "Pending", 12, ""),
        ("Sneha Kulkarni", "9765432109", "Maharashtra", "Pune", "High TDS / Hard Water",
         "Water is extremely hard and leaves white deposits on utensils.", "Under Review", 8, ""),
        ("Imran Khan", "9700112233", "Telangana", "Hyderabad", "Sewage Mixing in Water",
         "Sewage appears to be mixing into the drinking water line in Old City area.", "Pending", 5, ""),
        ("Kavya Reddy", "9611223399", "Karnataka", "Bengaluru", "Broken Public Tap / Handpump",
         "Public handpump near the school is broken and children have no drinking water.", "Resolved", 3,
         "Handpump repaired by the municipal team."),
        ("Manish Gupta", "9555667788", "Rajasthan", "Jaipur", "Low Water Pressure",
         "Water pressure is very low in the morning hours for the entire colony.", "Pending", 2, ""),
        ("Fatima Sheikh", "9444556677", "Gujarat", "Ahmedabad", "Contaminated / Dirty Water",
         "Water has a foul smell and visible particles after supply resumes.", "Rejected", 1,
         "Sample was found within limits on re-testing."),
    ]
    year = now.year
    for i, (name, phone, state, district, issue, desc, status, days_ago, remarks) in enumerate(seeds):
        created = (now - timedelta(days=days_ago)).isoformat(timespec="seconds")
        complaint_id = f"NS-{year}-{1001 + i}"
        cur.execute(
            """
            INSERT OR IGNORE INTO complaints
            (complaint_id, name, phone, state, district, issue_type, description,
             status, remarks, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (complaint_id, name, phone, state, district, issue, desc, status, remarks, created, created),
        )


def row_to_complaint(row):
    return {
        "complaintId": row["complaint_id"],
        "name": row["name"],
        "phone": row["phone"],
        "state": row["state"],
        "district": row["district"],
        "issueType": row["issue_type"],
        "description": row["description"],
        "status": row["status"],
        "remarks": row["remarks"] or "",
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def generate_complaint_id(db):
    year = datetime.now().year
    for _ in range(50):
        cid = f"NS-{year}-{random.randint(1000, 9999)}"
        exists = db.execute(
            "SELECT 1 FROM complaints WHERE complaint_id = ? LIMIT 1", (cid,)
        ).fetchone()
        if not exists:
            return cid
    return f"NS-{year}-{int(datetime.now().timestamp()) % 10000:04d}"


# ---------------------------------------------------------------------------
# Simple bearer-token session (demo only)
# ---------------------------------------------------------------------------
SESSIONS = {}


def make_token():
    return secrets.token_hex(24)


def require_token(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header.replace("Bearer ", "", 1).strip()
        if not token or token not in SESSIONS:
            return jsonify({"error": "Unauthorised. Please log in as an official."}), 401
        return view(*args, **kwargs)

    return wrapped


# ---------------------------------------------------------------------------
# Health & auth
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    try:
        db = get_db()
        total = db.execute("SELECT COUNT(*) AS c FROM complaints").fetchone()["c"]
    except Exception:
        total = 0
    return jsonify(
        {
            "ok": True,
            "service": "Neer Safai API",
            "version": "1.0.0",
            "time": datetime.now().isoformat(timespec="seconds"),
            "complaints": total,
        }
    )


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if email == ADMIN_EMAIL.lower() and password == ADMIN_PASSWORD:
        token = make_token()
        SESSIONS[token] = {"email": email, "created_at": datetime.now().isoformat()}
        return jsonify(
            {
                "message": "Login successful",
                "token": token,
                "officer": {
                    "name": "Administrator",
                    "email": email,
                    "role": "Senior Water Officer",
                },
            }
        )
    return jsonify({"error": "Invalid email or password."}), 401


# ---------------------------------------------------------------------------
# Complaints CRUD
# ---------------------------------------------------------------------------
@app.post("/api/complaints")
def create_complaint():
    data = request.get_json(silent=True) or {}
    errors = {}

    name = str(data.get("name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    state = str(data.get("state", "")).strip()
    district = str(data.get("district", "")).strip()
    issue_type = str(data.get("issueType", "")).strip()
    description = str(data.get("description", "")).strip()

    if len(name) < 3:
        errors["name"] = "Name must be at least 3 characters."
    if not PHONE_RE.match(phone):
        errors["phone"] = "Enter a valid 10-digit Indian mobile number."
    if not state:
        errors["state"] = "State is required."
    if len(district) < 2:
        errors["district"] = "District is required."
    if not issue_type:
        errors["issueType"] = "Issue type is required."
    if len(description) < 10:
        errors["description"] = "Description must be at least 10 characters."

    if errors:
        return jsonify({"error": "Validation failed", "fields": errors}), 400

    db = get_db()
    cid = generate_complaint_id(db)
    now = datetime.now().isoformat(timespec="seconds")
    db.execute(
        """
        INSERT INTO complaints
        (complaint_id, name, phone, state, district, issue_type, description,
         status, remarks, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', '', ?, ?)
        """,
        (cid, name, phone, state, district, issue_type, description, now, now),
    )
    db.commit()
    row = db.execute("SELECT * FROM complaints WHERE complaint_id = ?", (cid,)).fetchone()
    return jsonify({"message": "Complaint filed successfully", "complaint": row_to_complaint(row)}), 201


@app.get("/api/complaints")
def list_complaints():
    db = get_db()
    rows = db.execute("SELECT * FROM complaints ORDER BY id DESC").fetchall()
    return jsonify(
        {
            "count": len(rows),
            "complaints": [row_to_complaint(r) for r in rows],
        }
    )


@app.get("/api/complaints/<complaint_id>")
def get_complaint(complaint_id):
    db = get_db()
    row = db.execute(
        "SELECT * FROM complaints WHERE complaint_id = ?",
        (complaint_id.strip().upper(),),
    ).fetchone()
    if not row:
        return jsonify({"error": "Complaint not found."}), 404
    return jsonify({"complaint": row_to_complaint(row)})


@app.put("/api/complaints/<complaint_id>")
def update_complaint(complaint_id):
    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip()
    remarks = data.get("remarks", None)

    if status not in ALLOWED_STATUSES:
        return jsonify({"error": f"status must be one of {ALLOWED_STATUSES}"}), 400

    db = get_db()
    row = db.execute(
        "SELECT * FROM complaints WHERE complaint_id = ?",
        (complaint_id.strip().upper(),),
    ).fetchone()
    if not row:
        return jsonify({"error": "Complaint not found."}), 404

    now = datetime.now().isoformat(timespec="seconds")
    new_remarks = row["remarks"] if remarks is None else str(remarks)
    db.execute(
        "UPDATE complaints SET status = ?, remarks = ?, updated_at = ? WHERE id = ?",
        (status, new_remarks, now, row["id"]),
    )
    db.commit()
    updated = db.execute("SELECT * FROM complaints WHERE id = ?", (row["id"],)).fetchone()
    return jsonify({"message": "Complaint updated", "complaint": row_to_complaint(updated)})


# ---------------------------------------------------------------------------
# Water quality (deterministic demo model, mirrors the frontend)
# ---------------------------------------------------------------------------
def quality_for_pincode(pincode):
    h = 0
    for ch in pincode:
        h = (h * 31 + ord(ch)) % 100000
    tds = 70 + (h % 380)
    ph = round(6.4 + ((h >> 3) % 24) / 10, 1)
    hardness = 80 + (h % 240)
    turbidity = round(0.2 + ((h >> 5) % 30) / 10, 1)
    safe = tds <= 500 and 6.5 <= ph <= 8.5 and turbidity <= 5.0

    states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
    ]
    return {
        "pincode": pincode,
        "tds": tds,
        "ph": ph,
        "hardness": hardness,
        "turbidity": turbidity,
        "safe": safe,
        "status": "Safe" if safe else "Unsafe",
        "zone": states[h % len(states)],
        "testedOn": datetime.now().date().isoformat(),
        "lab": "District Public Health Laboratory",
        "source": "Flask demo model (BIS 10500 reference)",
    }


@app.get("/api/quality/<pincode>")
def quality(pincode):
    pin = str(pincode).strip()
    if not PIN_RE.match(pin):
        return jsonify({"error": "Enter a valid 6-digit pincode."}), 400
    return jsonify({"quality": quality_for_pincode(pin)})


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------
@app.get("/api/stats")
def stats():
    db = get_db()
    total = db.execute("SELECT COUNT(*) AS c FROM complaints").fetchone()["c"]
    by_status = {
        r["status"]: r["c"]
        for r in db.execute(
            "SELECT status, COUNT(*) AS c FROM complaints GROUP BY status"
        ).fetchall()
    }
    by_state = [
        {"state": r["state"], "count": r["c"]}
        for r in db.execute(
            "SELECT state, COUNT(*) AS c FROM complaints GROUP BY state ORDER BY c DESC"
        ).fetchall()
    ]
    by_issue = [
        {"issueType": r["issue_type"], "count": r["c"]}
        for r in db.execute(
            "SELECT issue_type, COUNT(*) AS c FROM complaints GROUP BY issue_type ORDER BY c DESC"
        ).fetchall()
    ]
    return jsonify(
        {
            "total": total,
            "byStatus": by_status,
            "byState": by_state,
            "byIssue": by_issue,
        }
    )


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------
@app.post("/api/feedback")
def create_feedback():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    if len(message) < 5:
        return jsonify({"error": "Message is too short."}), 400

    db = get_db()
    now = datetime.now().isoformat(timespec="seconds")
    db.execute(
        """
        INSERT INTO feedback (type, name, email, role, rating, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.get("type", "feedback"),
            data.get("name", ""),
            data.get("email", ""),
            data.get("role", ""),
            data.get("rating"),
            message,
            now,
        ),
    )
    db.commit()
    return jsonify({"message": "Feedback received. Thank you!"}), 201


@app.get("/api/feedback")
def list_feedback():
    db = get_db()
    rows = db.execute("SELECT * FROM feedback ORDER BY id DESC").fetchall()
    return jsonify(
        {
            "feedback": [
                {
                    "id": r["id"],
                    "type": r["type"],
                    "name": r["name"],
                    "email": r["email"],
                    "role": r["role"],
                    "rating": r["rating"],
                    "message": r["message"],
                    "createdAt": r["created_at"],
                }
                for r in rows
            ]
        }
    )


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found."}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed."}), 405


@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error."}), 500


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    host = os.environ.get("HOST", "0.0.0.0")
    print("=" * 62)
    print("  Neer Safai API — Python Flask + SQLite")
    print(f"  Database : {DB_PATH}")
    print(f"  Running  : http://127.0.0.1:{port}")
    print(f"  Login    : {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print("=" * 62)
    app.run(host=host, port=port, debug=True)
