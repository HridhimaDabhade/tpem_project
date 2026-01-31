"""
Unique Candidate ID generation: TPEML-YYYY-{ROLE_PREFIX}-{SEQ}.
e.g. TPEML-2026-ENG-00412
"""
from datetime import datetime

from pymongo.database import Database

from database import CANDIDATES

ROLE_PREFIXES = {
    "engineer": "ENG",
    "engineering": "ENG",
    "hr": "HR",
    "finance": "FIN",
    "operations": "OPS",
    "default": "GEN",
}


def _prefix_for_role(role_applied: str | None) -> str:
    if not role_applied:
        return ROLE_PREFIXES["default"]
    r = role_applied.lower().strip()
    for k, v in ROLE_PREFIXES.items():
        if k in r:
            return v
    return ROLE_PREFIXES["default"]


def generate_candidate_id(db: Database, role_applied: str | None = None) -> str:
    """
    Generate next Candidate ID: TPEML-YYYY-PREFIX-NNNNN.
    Uses max existing seq for same year+prefix.
    """
    year = datetime.utcnow().year
    prefix = _prefix_for_role(role_applied)
    cursor = db[CANDIDATES].find(
        {"candidate_id": {"$regex": f"^TPEML-{year}-{prefix}-"}},
        {"candidate_id": 1},
    )
    max_seq = 0
    for d in cursor:
        cid = d.get("candidate_id") or ""
        try:
            parts = cid.split("-")
            if len(parts) >= 4:
                max_seq = max(max_seq, int(parts[-1]))
        except (ValueError, IndexError):
            continue
    next_seq = max_seq + 1
    return f"TPEML-{year}-{prefix}-{next_seq:05d}"
