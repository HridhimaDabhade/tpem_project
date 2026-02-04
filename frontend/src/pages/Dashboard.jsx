import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { KpiCard } from '../components/KpiCard';
import { StatusTag } from '../components/StatusTag';
import { getKpis } from '../services/dashboard';
import { list } from '../services/candidates';
import { useAuth } from '../auth/AuthContext';
import '../styles/layout.css';
import '../styles/dashboard.css';

export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpisData, candidatesData] = await Promise.all([
        getKpis().catch(() => ({ yet_to_interview: 0, interview_completed: 0, total_candidates: 0 })),
        list({ limit: 200 }).catch(() => ({ candidates: [], total: 0 }))
      ]);
      setKpis(kpisData);
      setCandidates(candidatesData.candidates || []);
      setFilteredCandidates(candidatesData.candidates || []);
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates based on search and status
  useEffect(() => {
    let filtered = [...candidates];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.candidate_id?.toLowerCase().includes(query) ||
        c.name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.role_applied?.toLowerCase().includes(query)
      );
    }

    setFilteredCandidates(filtered);
  }, [searchQuery, statusFilter, candidates]);

  const canOnboard = user?.role === 'admin' || user?.role === 'hr';

  const handleRowClick = (candidateId) => {
    navigate(`/candidates/${encodeURIComponent(candidateId)}`);
  };

  return (
    <Layout>
      <div className="page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page__title" style={{ marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
              Welcome back, {user?.full_name}
            </p>
          </div>
          {canOnboard && (
            <Link to="/onboarding" className="btn btn--primary" style={{ fontSize: 15, padding: '12px 24px' }}>
              ➕ Onboard New Candidate
            </Link>
          )}
        </div>

        {/* KPI Cards - Clickable Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div 
            onClick={() => {
              setStatusFilter('yet_to_interview');
              setSearchQuery('');
            }} 
            style={{ cursor: 'pointer' }}
            title="Click to filter: Yet to Interview"
          >
            <KpiCard 
              title="Yet to Interview" 
              value={kpis?.yet_to_interview ?? '–'} 
              active={statusFilter === 'yet_to_interview'}
            />
          </div>
          <div 
            onClick={() => {
              setStatusFilter('interview_completed');
              setSearchQuery('');
            }} 
            style={{ cursor: 'pointer' }}
            title="Click to filter: Interview Completed"
          >
            <KpiCard 
              title="Interview Completed" 
              value={kpis?.interview_completed ?? '–'}
              active={statusFilter === 'interview_completed'}
            />
          </div>
          <div 
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
            }} 
            style={{ cursor: 'pointer' }}
            title="Click to show all candidates"
          >
            <KpiCard 
              title="Total Candidates" 
              value={kpis?.total_candidates ?? '–'}
              active={statusFilter === 'all'}
            />
          </div>
        </div>

        {/* Candidates Section */}
        <div style={{ background: 'var(--white)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              All Candidates
            </h2>
            <button
              onClick={loadData}
              disabled={loading}
              className="btn btn--secondary"
              style={{ padding: '8px 16px', fontSize: 13 }}
              title="Refresh data"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search by ID, name, email, or role..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--tata-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  minWidth: 180
                }}
              >
                <option value="all">All Candidates ({candidates.length})</option>
                <option value="yet_to_interview">Yet to Interview ({kpis?.yet_to_interview ?? 0})</option>
                <option value="interview_completed">Interview Completed ({kpis?.interview_completed ?? 0})</option>
              </select>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="btn btn--secondary"
                  style={{ padding: '10px 16px', fontSize: 13 }}
                  title="Clear all filters"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Helpful hint */}
          {statusFilter === 'all' && !searchQuery && (
            <div style={{ 
              marginBottom: 16, 
              padding: '12px 16px', 
              background: 'var(--tata-blue-light)', 
              borderRadius: 'var(--radius)',
              fontSize: 13,
              color: 'var(--tata-blue-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span><strong>Tip:</strong> Click on the KPI cards above to quickly filter candidates by status</span>
            </div>
          )}

          {/* Results Count */}
          <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing {filteredCandidates.length} of {candidates.length} candidate(s)
            {searchQuery && ` matching "${searchQuery}"`}
            {candidates.length >= 200 && (
              <span style={{ color: 'var(--warning)', fontWeight: 500, marginLeft: 8 }}>
                (Displaying first 200 - use search to find more)
              </span>
            )}
          </div>

          {/* Candidates Table */}
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Loading candidates...</div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {searchQuery || statusFilter !== 'all' ? '🔍' : '📋'}
              </div>
              <div className="empty-state-title">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No candidates found'
                  : 'No candidates yet'}
              </div>
              <div className="empty-state-text">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by onboarding your first candidate!'}
              </div>
              {canOnboard && !searchQuery && statusFilter === 'all' && (
                <Link to="/onboarding" className="btn btn--primary">
                  ➕ Onboard New Candidate
                </Link>
              )}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Candidate ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Diploma Branch</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => (
                    <tr 
                      key={c.candidate_id} 
                      onClick={() => handleRowClick(c.candidate_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><code style={{ fontSize: 12, fontWeight: 600 }}>{c.candidate_id}</code></td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.email || '–'}</td>
                      <td>{c.diploma_branch || '–'}</td>
                      <td><StatusTag value={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
