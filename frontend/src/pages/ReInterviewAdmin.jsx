import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { listPending, resolveReInterview } from '../services/reInterview';
import { Link } from 'react-router-dom';
import '../styles/layout.css';

export function ReInterviewAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  const fetchList = () => {
    setLoading(true);
    listPending()
      .then((r) => setRequests(r.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleResolve = async (requestId, approved) => {
    setResolving(requestId);
    try {
      await resolveReInterview(requestId, approved);
      fetchList();
    } catch (e) {
      alert(e.message || 'Failed');
    } finally {
      setResolving(null);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Re-Interview Approval</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Approve or reject re-interview requests. Admin only.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Requested by</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading…</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No pending requests.</td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/candidates/${encodeURIComponent(r.candidate_id)}`}>{r.candidate_name}</Link>
                      <br /><code style={{ fontSize: 12 }}>{r.candidate_id}</code>
                    </td>
                    <td>{r.requested_by}</td>
                    <td>{r.reason}</td>
                    <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '–'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn--primary"
                          style={{ padding: '6px 12px', fontSize: 13 }}
                          disabled={!!resolving}
                          onClick={() => handleResolve(r.id, true)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn--secondary"
                          style={{ padding: '6px 12px', fontSize: 13 }}
                          disabled={!!resolving}
                          onClick={() => handleResolve(r.id, false)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
