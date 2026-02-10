import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusTag } from '../components/StatusTag';
import { getById } from '../services/candidates';
import { submitInterview } from '../services/interviews';
import { useAuth } from '../auth/AuthContext';
import { requestReInterview } from '../services/reInterview';
import '../styles/layout.css';
import '../styles/candidate-profile.css';

// Uses Vite proxy in dev, environment variable in production
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
          <Link to="/" className="btn btn--secondary">Back to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        {/* Header */}
        <div className="profile-header">
          <div>
            <h1 className="profile-name">{profile.name}</h1>
            <div className="profile-id">
              <code>{profile.candidate_id}</code>
            </div>
          </div>
          <div className="profile-header-actions">
            <Link to="/" className="btn btn--secondary">Back to Dashboard</Link>
          </div>
        </div>

        {/* Status Cards */}
        <div className="status-cards">
          <div className="status-card">
            <span className="status-card-label">Status</span>
            <StatusTag value={profile.status} />
          </div>
          {profile.onboarding_type && (
            <div className="status-card">
              <span className="status-card-label">Onboarding Type</span>
              <span className="status-card-value">{profile.onboarding_type === 'self' ? 'Self-Registered' : 'By Company User'}</span>
            </div>
          )}
          {profile.status === 'interview_completed' && (
            <div className="status-card">
              <span className="status-card-label">Interview Decision</span>
              <StatusTag value={profile.interview_status || profile.decision} />
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="profile-grid">
          {/* Left Column - Details */}
          <div className="profile-details">
            {/* Interview Details */}
            {(profile.interview_location || profile.date_of_interview || profile.year_of_recruitment) && (
              <div className="detail-section">
                <h3 className="section-title">📅 Interview Details</h3>
                <div className="detail-grid">
                  {profile.interview_location && (
                    <div className="detail-item">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{profile.interview_location}</span>
                    </div>
                  )}
                  {profile.date_of_interview && (
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{new Date(profile.date_of_interview).toLocaleDateString()}</span>
                    </div>
                  )}
                  {profile.year_of_recruitment && (
                    <div className="detail-item">
                      <span className="detail-label">Recruitment Year</span>
                      <span className="detail-value">{profile.year_of_recruitment}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="detail-section">
              <h3 className="section-title">👤 Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{profile.name}</span>
                </div>
                {profile.gender && (
                  <div className="detail-item">
                    <span className="detail-label">Gender</span>
                    <span className="detail-value">{profile.gender}</span>
                  </div>
                )}
                {profile.dob && (
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth</span>
                    <span className="detail-value">{new Date(profile.dob).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="detail-section">
              <h3 className="section-title">📧 Contact Information</h3>
              <div className="detail-grid">
                {profile.contact_no && (
                  <div className="detail-item">
                    <span className="detail-label">Contact Number</span>
                    <span className="detail-value">{profile.contact_no}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profile.email}</span>
                  </div>
                )}
                {profile.residential_address && (
                  <div className="detail-item detail-item--full">
                    <span className="detail-label">Residential Address</span>
                    <span className="detail-value">{profile.residential_address}</span>
                  </div>
                )}
                {profile.state_of_domicile && (
                  <div className="detail-item">
                    <span className="detail-label">State of Domicile</span>
                    <span className="detail-value">{profile.state_of_domicile}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Diploma Education */}
            {(profile.college_name || profile.diploma_branch) && (
              <div className="detail-section">
                <h3 className="section-title">🎓 Diploma Education</h3>
                <div className="detail-grid">
                  {profile.college_name && (
                    <div className="detail-item">
                      <span className="detail-label">College</span>
                      <span className="detail-value">{profile.college_name}</span>
                    </div>
                  )}
                  {profile.university_name && (
                    <div className="detail-item">
                      <span className="detail-label">University</span>
                      <span className="detail-value">{profile.university_name}</span>
                    </div>
                  )}
                  {profile.diploma_enrollment_no && (
                    <div className="detail-item">
                      <span className="detail-label">Enrollment Number</span>
                      <span className="detail-value">{profile.diploma_enrollment_no}</span>
                    </div>
                  )}
                  {profile.diploma_branch && (
                    <div className="detail-item">
                      <span className="detail-label">Branch</span>
                      <span className="detail-value">{profile.diploma_branch}</span>
                    </div>
                  )}
                  {profile.diploma_passout_year && (
                    <div className="detail-item">
                      <span className="detail-label">Pass Out Year</span>
                      <span className="detail-value">{profile.diploma_passout_year}</span>
                    </div>
                  )}
                  {profile.diploma_percentage != null && (
                    <div className="detail-item">
                      <span className="detail-label">Percentage</span>
                      <span className="detail-value">{profile.diploma_percentage}%</span>
                    </div>
                  )}
                  {profile.any_backlog_in_diploma && (
                    <div className="detail-item">
                      <span className="detail-label">Backlogs</span>
                      <span className="detail-value">{profile.any_backlog_in_diploma}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 10th & 12th Education */}
            {(profile.tenth_percentage != null || profile.twelfth_percentage != null) && (
              <div className="detail-section">
                <h3 className="section-title">📚 10th & 12th Education</h3>
                <div className="detail-grid">
                  {profile.tenth_percentage != null && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">10th Percentage</span>
                        <span className="detail-value">{profile.tenth_percentage}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">10th Pass Out Year</span>
                        <span className="detail-value">{profile.tenth_passout_year}</span>
                      </div>
                    </>
                  )}
                  {profile.twelfth_percentage != null && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">12th Percentage</span>
                        <span className="detail-value">{profile.twelfth_percentage}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">12th Pass Out Year</span>
                        <span className="detail-value">{profile.twelfth_passout_year}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Interview Results */}
            {profile.status === 'interview_completed' && (
              <div className="detail-section">
                <h3 className="section-title">✓ Interview Results</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Decision</span>
                    <StatusTag value={profile.interview_status || profile.decision} />
                  </div>
                  {profile.interview_notes && (
                    <div className="detail-item detail-item--full">
                      <span className="detail-label">Notes</span>
                      <span className="detail-value">{profile.interview_notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Information */}
            <div className="detail-section">
              <h3 className="section-title">ℹ️ System Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Registered On</span>
                  <span className="detail-value">
                    {profile.created_at ? new Date(profile.created_at).toLocaleString() : '–'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {profile.status === 'yet_to_interview' && ['admin', 'hr', 'interviewer'].includes(user?.role) && (
          <div className="action-section">
            <button type="button" className="btn btn--primary" onClick={() => setInterviewModal(true)}>
              Add Interview
            </button>
          </div>
        )}

        {profile.status === 'interview_completed' && ['admin', 'hr', 'interviewer'].includes(user?.role) && user?.role !== 'admin' && (
          <div className="action-section">
            <h3 style={{ marginBottom: 16 }}>Request Re-Interview</h3>
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

        {/* Interview Modal */}
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
