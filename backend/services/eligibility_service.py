"""
Eligibility evaluation: Qualification match + Experience range.
Updates candidate.eligibility → criteria_met | not_met | partial.
"""
from datetime import datetime
from pymongo.database import Database

from database import CANDIDATES


def evaluate_eligibility(db: Database, candidate_doc: dict) -> str:
    """Set candidate.eligibility based on qualifications and experience. Returns the new eligibility value."""
    qual_ok = bool(candidate_doc.get("qualifications") and len(candidate_doc["qualifications"].strip()) > 2)
    exp = candidate_doc.get("experience_years")
    exp_ok = exp is not None and 0 <= exp <= 50

    if qual_ok and exp_ok:
        eligibility = "criteria_met"
    elif not qual_ok and (exp is None or exp < 0):
        eligibility = "not_met"
    else:
        eligibility = "partial"

    db[CANDIDATES].update_one(
        {"_id": candidate_doc["_id"]},
        {"$set": {"eligibility": eligibility, "updated_at": datetime.utcnow()}},
    )
    return eligibility


def re_evaluate_all_yet_to_interview(db: Database) -> int:
    """Re-run eligibility for all yet_to_interview candidates. Returns count updated."""
    candidates = list(db[CANDIDATES].find({"status": "yet_to_interview"}))
    for c in candidates:
        evaluate_eligibility(db, c)
    return len(candidates)
