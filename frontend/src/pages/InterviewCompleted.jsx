import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatusTag } from '../components/StatusTag';
import { listCompleted } from '../services/interviews';
import { Link } from 'react-router-dom';
import '../styles/layout.css';

export function InterviewCompleted() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');

  const fetchList = () => {
    setLoading(true);
    listCompleted({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      role: roleFilter || undefined,
      decision: decisionFilter || undefined,
    })
      .then((r) => setInterviews(r.interviews || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [fromDate, toDate, roleFilter, decisionFilter]);

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Interview Completed</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Read-only view. Filter by date, role, or decision.</p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
          <input type="text" placeholder="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, maxWidth: 160 }} />
          <select value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}>
            <option value="">All decisions</option>
            <option value="shortlist">Shortlist</option>
            <option value="reject">Reject</option>
            <option value="hold">Hold</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Interview Date</th>
                <th>Interviewer</th>
                <th>Decision</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading…</td></tr>
              ) : interviews.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No completed interviews.</td></tr>
              ) : (
                interviews.map((i) => (
                  <tr key={i.id}>
                    <td><code>{i.candidate_id}</code></td>
                    <td>{i.candidate_name}</td>
                    <td>{i.role_applied || '–'}</td>
                    <td>{i.interview_date ? new Date(i.interview_date).toLocaleString() : '–'}</td>
                    <td>{i.interviewer_name}</td>
                    <td><StatusTag value={i.decision} /></td>
                    <td>
                      <Link to={`/candidates/${encodeURIComponent(i.candidate_id)}`} className="btn btn--secondary" style={{ padding: '6px 12px', fontSize: 13 }}>View Profile</Link>
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
