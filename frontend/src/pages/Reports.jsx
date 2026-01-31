import { useState } from 'react';
import { Layout } from '../components/Layout';
import { downloadDailyLog, downloadInterviewResults, downloadAuditLogs } from '../services/reports';
import { useAuth } from '../auth/AuthContext';
import '../styles/layout.css';

export function Reports() {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [role, setRole] = useState('');
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const isHrOrAdmin = user?.role === 'hr' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const run = async (fn, name) => {
    setLoading(name);
    setMsg({ type: '', text: '' });
    try {
      await fn();
      setMsg({ type: 'success', text: 'Download started.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Download failed' });
    } finally {
      setLoading('');
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Reports</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Download Excel reports. Use filters optionally.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
          <input type="text" placeholder="Role filter" value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, maxWidth: 160 }} />
          <select value={decision} onChange={(e) => setDecision(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}>
            <option value="">All decisions</option>
            <option value="shortlist">Shortlist</option>
            <option value="reject">Reject</option>
            <option value="hold">Hold</option>
          </select>
        </div>
        {msg.text && <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginBottom: 16 }}>{msg.text}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isHrOrAdmin && (
            <>
              <div>
                <strong>Daily recruitment log</strong>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 8px' }}>Registration date, interview date, interviewer, decision, status.</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!!loading}
                  onClick={() => run(() => downloadDailyLog(fromDate || undefined, toDate || undefined), 'daily')}
                >
                  {loading === 'daily' ? 'Downloading…' : 'Download Daily Log'}
                </button>
              </div>
              <div>
                <strong>Interview results</strong>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 8px' }}>Filter by date, role, decision.</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!!loading}
                  onClick={() => run(() => downloadInterviewResults(fromDate || undefined, toDate || undefined, role || undefined, decision || undefined), 'interview')}
                >
                  {loading === 'interview' ? 'Downloading…' : 'Download Interview Results'}
                </button>
              </div>
            </>
          )}
          {isAdmin && (
            <div>
              <strong>Audit logs (Admin)</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 8px' }}>All actions logged.</p>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!!loading}
                onClick={() => run(() => downloadAuditLogs(fromDate || undefined, toDate || undefined), 'audit')}
              >
                {loading === 'audit' ? 'Downloading…' : 'Download Audit Logs'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
