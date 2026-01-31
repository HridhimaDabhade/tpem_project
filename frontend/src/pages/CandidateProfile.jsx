import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusTag } from '../components/StatusTag';
import { getById } from '../services/candidates';
import { submitInterview } from '../services/interviews';
import { useAuth } from '../auth/AuthContext';
import { requestReInterview } from '../services/reInterview';
import '../styles/layout.css';

const API_BASE = '';

export function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reInterviewReason, setReInterviewReason] = useState('');
  const [reInterviewSubmitting, setReInterviewSubmitting] = useState(false);
  const [reInterviewMsg, setReInterviewMsg] = useState('');
  const [interviewModal, setInterviewModal] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [interviewDecision, setInterviewDecision] = useState('shortlist');
  const [interviewSubmitting, setInterviewSubmitting] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    getById(candidateId)
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const handleRequestReInterview = async (e) => {
    e.preventDefault();
    if (!reInterviewReason.trim() || !['admin', 'hr', 'interviewer'].includes(user?.role)) return;
    setReInterviewSubmitting(true);
    setReInterviewMsg('');
    try {
      await requestReInterview(candidateId, reInterviewReason.trim());
      setReInterviewMsg('Re-interview requested.');
      setReInterviewReason('');
    } catch (e) {
      setReInterviewMsg(e.message || 'Request failed');
    } finally {
      setReInterviewSubmitting(false);
    }
  };

  const handleAddInterview = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setInterviewSubmitting(true);
    try {
      await submitInterview(profile.candidate_id, {
        notes: interviewNotes.trim(),
        decision: interviewDecision,
      });
      setInterviewModal(false);
      setInterviewNotes('');
      setInterviewDecision('shortlist');
      // Refresh profile to show updated status
      const updated = await getById(candidateId);
      setProfile(updated);
    } catch (e) {
      alert(e.message || 'Interview submission failed');
    } finally {
      setInterviewSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="page"><p>Loading…</p></div></Layout>;
  if (error || !profile) {
    return (
      <Layout>
        <div className="page">
          <p className="error-msg">{error || 'Candidate not found.'}</p>
          <Link to="/candidates" className="btn btn--secondary">Back to Search</Link>
        </div>
      </Layout>
    );
  }

  const qrUrl = profile.qr_code_path
    ? `${API_BASE}${profile.qr_code_path.startsWith('/') ? '' : '/'}${profile.qr_code_path}`
    : `${API_BASE}/api/qr/${encodeURIComponent(profile.candidate_id)}`;

  return (
    <Layout>
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h1 className="page__title" style={{ margin: 0 }}>{profile.name}</h1>
          <Link to="/candidates" className="btn btn--secondary">Back to Search</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 24, alignItems: 'start' }}>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><th style={{ width: 160 }}>Candidate ID</th><td><code>{profile.candidate_id}</code></td></tr>
                <tr><th>Name</th><td>{profile.name}</td></tr>
                <tr><th>Email</th><td>{profile.email || '–'}</td></tr>
                <tr><th>Phone</th><td>{profile.phone || '–'}</td></tr>
                <tr><th>Qualifications</th><td>{profile.qualifications || '–'}</td></tr>
                <tr><th>Experience (years)</th><td>{profile.experience_years ?? '–'}</td></tr>
                <tr><th>Role applied</th><td>{profile.role_applied || '–'}</td></tr>
                <tr><th>Status</th><td><StatusTag value={profile.status} /></td></tr>
                <tr><th>Eligibility</th><td><StatusTag value={profile.eligibility} /></td></tr>
                {profile.status === 'interview_completed' && (
                  <>
                    <tr><th>Interview Decision</th><td><StatusTag value={profile.interview_status || profile.decision} /></td></tr>
                    <tr><th>Interview Notes</th><td>{profile.interview_notes || '–'}</td></tr>
                  </>
                )}
                <tr><th>Registered</th><td>{profile.created_at ? new Date(profile.created_at).toLocaleString() : '–'}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
              <img src={qrUrl} alt="Candidate QR" style={{ maxWidth: 160, height: 'auto' }} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 0' }}>Candidate QR</p>
            </div>
          </div>
        </div>
        {profile.status === 'yet_to_interview' && ['admin', 'hr', 'interviewer'].includes(user?.role) && (
          <div style={{ marginTop: 24, maxWidth: 480 }}>
            <button type="button" className="btn btn--primary" onClick={() => setInterviewModal(true)}>
              Add Interview
            </button>
          </div>
        )}
        {profile.status === 'interview_completed' && ['admin', 'hr', 'interviewer'].includes(user?.role) && user?.role !== 'admin' && (
          <div style={{ marginTop: 24, maxWidth: 480 }}>
            <h3 style={{ marginBottom: 12 }}>Request Re-Interview</h3>
            <form onSubmit={handleRequestReInterview}>
              <div className="form-group">
                <label>Reason</label>
                <textarea value={reInterviewReason} onChange={(e) => setReInterviewReason(e.target.value)} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn--secondary" disabled={reInterviewSubmitting}>
                  {reInterviewSubmitting ? 'Submitting…' : 'Request Re-Interview'}
                </button>
              </div>
              {reInterviewMsg && <div className={reInterviewMsg.includes('requested') ? 'success-msg' : 'error-msg'}>{reInterviewMsg}</div>}
            </form>
          </div>
        )}
        {interviewModal && (
          <div className="modal-overlay" onClick={() => !interviewSubmitting && setInterviewModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Add Interview</h3>
              <form onSubmit={handleAddInterview}>
                <div className="form-group">
                  <label>Interview Notes</label>
                  <textarea 
                    value={interviewNotes} 
                    onChange={(e) => setInterviewNotes(e.target.value)} 
                    placeholder="Add notes from the interview..."
                    rows={4}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label>Decision *</label>
                  <select 
                    value={interviewDecision} 
                    onChange={(e) => setInterviewDecision(e.target.value)} 
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
                  >
                    <option value="shortlist">Shortlist</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setInterviewModal(false)} disabled={interviewSubmitting}>Cancel</button>
                  <button type="submit" className="btn btn--primary" disabled={interviewSubmitting}>
                    {interviewSubmitting ? 'Submitting…' : 'Submit Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}