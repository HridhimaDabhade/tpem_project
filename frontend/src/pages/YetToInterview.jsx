import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusTag } from '../components/StatusTag';
import { listYetToInterview, submitInterview } from '../services/interviews';
import { Link } from 'react-router-dom';
import '../styles/layout.css';

export function YetToInterview() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [modal, setModal] = useState(null); // { candidate, notes, decision }

  const fetchList = () => {
    setLoading(true);
    listYetToInterview({ role: roleFilter || undefined, eligibility: eligibilityFilter || undefined })
      .then((r) => setCandidates(r.candidates || []))
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [roleFilter, eligibilityFilter]);

  const openSubmit = (c) => {
    setModal({ candidate: c, notes: '', decision: 'shortlist' });
  };

  const closeModal = () => {
    setModal(null);
    setSubmitting(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modal?.candidate) return;
    setSubmitting(modal.candidate.candidate_id);
    try {
      await submitInterview(modal.candidate.candidate_id, {
        notes: modal.notes,
        decision: modal.decision,
      });
      closeModal();
      fetchList();
    } catch (err) {
      setSubmitting(null);
      alert(err.message || 'Submit failed');
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Yet To Interview</h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Filter by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, maxWidth: 180 }}
          />
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
          >
            <option value="">All eligibility</option>
            <option value="criteria_met">Criteria Met</option>
            <option value="not_met">Not Met</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Eligibility</th>
                <th>Experience</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading…</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No candidates yet to interview.</td></tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.candidate_id}>
                    <td><code>{c.candidate_id}</code></td>
                    <td>{c.name}</td>
                    <td>{c.role_applied || '–'}</td>
                    <td><StatusTag value={c.eligibility} /></td>
                    <td>{c.experience_years ?? '–'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/candidates/${encodeURIComponent(c.candidate_id)}`} className="btn btn--secondary" style={{ padding: '6px 12px', fontSize: 13 }}>View</Link>
                        <button type="button" className="btn btn--primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openSubmit(c)}>Add Interview</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Submit Interview – {modal.candidate.name}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Decision</label>
                  <select value={modal.decision} onChange={(e) => setModal({ ...modal, decision: e.target.value })}>
                    <option value="shortlist">Shortlist</option>
                    <option value="reject">Reject</option>
                    <option value="hold">Hold</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={modal.notes} onChange={(e) => setModal({ ...modal, notes: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn--primary" disabled={!!submitting}>
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: var(--white); border-radius: var(--radius); padding: 24px; max-width: 420px; width: 90%; box-shadow: var(--shadow); }
        .modal h3 { margin: 0 0 16px; font-size: 16px; }
        .modal .form-group input, .modal .form-group select, .modal .form-group textarea { max-width: none; }
      `}</style>
    </Layout>
  );
}
