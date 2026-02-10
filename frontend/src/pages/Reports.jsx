import { useState } from 'react';
import { Layout } from '../components/Layout';
import { downloadAllCandidates, downloadBranchSummary } from '../services/reports';
import { useAuth } from '../auth/AuthContext';
import '../styles/layout.css';

export function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const isHrOrAdmin = user?.role === 'hr' || user?.role === 'admin';

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
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Download recruitment Excel reports.
        </p>

        {msg.text && (
          <div
            className={msg.type === 'success' ? 'success-msg' : 'error-msg'}
            style={{ marginBottom: 16 }}
          >
            {msg.text}
          </div>
        )}

        {isHrOrAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <strong>All Candidates Details</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                Complete form details of all registered candidates.
              </p>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!!loading}
                onClick={() => run(() => downloadAllCandidates(), 'all')}
              >
                {loading === 'all' ? 'Downloading…' : 'Download All Candidates'}
              </button>
            </div>

            <div>
              <strong>Branch-wise Summary</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                Branch, Shortlisted Count, Rejected Count, Grand Total.
              </p>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!!loading}
                onClick={() => run(() => downloadBranchSummary(), 'summary')}
              >
                {loading === 'summary' ? 'Downloading…' : 'Download Branch Summary'}
              </button>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}
