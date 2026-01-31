import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Layout } from './Layout';

/**
 * Protects routes that require authentication.
 * Optionally restrict by role: allowedRoles = ['admin', 'hr', 'interviewer'].
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <span>Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <div className="page">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You do not have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  return children;
}
