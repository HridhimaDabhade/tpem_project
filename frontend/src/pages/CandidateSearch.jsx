import { useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusTag } from '../components/StatusTag';
import { search, list, create } from '../services/candidates';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../styles/layout.css';

export function CandidateSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', qualifications: '', experience_years: '', role_applied: '' });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAdd = user?.role === 'admin' || user?.role === 'hr';

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      if (q.trim()) {
        const r = await search(q.trim());
        setResults(r.candidates || []);
        setTotal(r.total ?? 0);
      } else {
        const r = await list({ limit: 50 });
        setResults(r.candidates || []);
        setTotal(r.total ?? 0);
      }
    } catch (err) {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    setAddSubmitting(true);
    setAddError('');
    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim() || undefined,
        phone: addForm.phone.trim() || undefined,
        qualifications: addForm.qualifications.trim() || undefined,
        experience_years: addForm.experience_years ? parseFloat(addForm.experience_years) : undefined,
        role_applied: addForm.role_applied.trim() || undefined,
      };
      const c = await create(payload);
      setAddModal(false);
      setAddForm({ name: '', email: '', phone: '', qualifications: '', experience_years: '', role_applied: '' });
      navigate(`/candidates/${encodeURIComponent(c.candidate_id)}`);
    } catch (err) {
      setAddError(err.message || 'Create failed');
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Candidate Search</h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: '1 1 320px' }}>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Candidate ID (e.g. TPEML-2026-ENG-00001) or name / email"
              style={{ flex: '1 1 280px', maxWidth: 420, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
            />
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>
          {canAdd && (
            <button type="button" className="btn btn--secondary" onClick={() => { setAddModal(true); setAddError(''); }}>
              Add Candidate
            </button>
          )}
        </div>
        {searched && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Eligibility</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  results.map((c) => (
                    <tr key={c.candidate_id}>
                      <td><code>{c.candidate_id}</code></td>
                      <td>{c.name}</td>
                      <td>{c.role_applied || '–'}</td>
                      <td><StatusTag value={c.status} /></td>
                      <td><StatusTag value={c.eligibility} /></td>
                      <td>
                        <Link to={`/candidates/${encodeURIComponent(c.candidate_id)}`} className="btn btn--secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {searched && total > 0 && (
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing {results.length} of {total} candidate(s).
          </p>
        )}
        {addModal && (
          <div className="modal-overlay" onClick={() => setAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Add Candidate</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Manual entry when MS Forms is not used. Generates Candidate ID and QR.</p>
              <form onSubmit={handleAddSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Qualifications</label>
                  <input value={addForm.qualifications} onChange={(e) => setAddForm({ ...addForm, qualifications: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input type="number" step="0.5" min="0" value={addForm.experience_years} onChange={(e) => setAddForm({ ...addForm, experience_years: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role applied</label>
                  <input value={addForm.role_applied} onChange={(e) => setAddForm({ ...addForm, role_applied: e.target.value })} />
                </div>
                {addError && <div className="error-msg">{addError}</div>}
                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn--primary" disabled={addSubmitting}>{addSubmitting ? 'Creating…' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: var(--white); border-radius: var(--radius); padding: 24px; max-width: 420px; width: 90%; box-shadow: var(--shadow); max-height: 90vh; overflow-y: auto; }
        .modal h3 { margin: 0 0 8px; font-size: 16px; }
        .modal .form-group input { max-width: none; }
      `}</style>
    </Layout>
  );
}
