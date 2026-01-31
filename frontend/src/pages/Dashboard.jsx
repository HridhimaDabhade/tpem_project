import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { KpiCard } from '../components/KpiCard';
import { getKpis } from '../services/dashboard';
import { useAuth } from '../auth/AuthContext';
import '../styles/layout.css';

export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [syncMsg, setSyncMsg] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getKpis().then(setKpis).catch(() => setKpis({ yet_to_interview: 0, interview_completed: 0, total_candidates: 0 }));
  }, []);

  // MS Forms sync removed — use manual candidate creation UI (`/candidates`)

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Dashboard</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <KpiCard title="Yet to Interview" value={kpis?.yet_to_interview ?? '–'} />
          <KpiCard title="Interview Completed" value={kpis?.interview_completed ?? '–'} />
          <KpiCard title="Total Candidates" value={kpis?.total_candidates ?? '–'} />
        </div>
        {/* MS Forms sync removed — manual entry available under Candidate Search */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/candidates" className="btn btn--primary">Candidate Search</Link>
          <Link to="/yet-to-interview" className="btn btn--secondary">Yet To Interview</Link>
          <Link to="/interview-completed" className="btn btn--secondary">Interview Completed</Link>
          {(user?.role === 'admin' || user?.role === 'hr') && <Link to="/reports" className="btn btn--secondary">Reports</Link>}
        </div>
      </div>
    </Layout>
  );
}
