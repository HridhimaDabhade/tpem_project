import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../auth/AuthContext';
import { me } from '../services/auth';
import '../styles/layout.css';

export function UserProfile() {
  const { user: contextUser, login } = useAuth();
  const [user, setUser] = useState(contextUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch fresh user data when profile page loads (only once)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      try {
        const freshUserData = await me();
        const updatedUser = {
          id: freshUserData.id,
          email: freshUserData.email,
          full_name: freshUserData.full_name,
          role: freshUserData.role,
        };
        setUser(updatedUser);
        // Update the context as well
        login(updatedUser);
        localStorage.setItem('tpeml_user', JSON.stringify(updatedUser));
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only runs once on mount

  if (loading && !user) {
    return (
      <Layout>
        <div className="page" style={{ textAlign: 'center', padding: 60 }}>
          <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
          <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 className="page__title" style={{ margin: 0 }}>User Profile</h1>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
              Refreshing...
            </div>
          )}
        </div>

        {error && (
          <div className="error-msg" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}
        
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ 
            background: 'var(--white)', 
            padding: 32, 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)', 
            boxShadow: 'var(--shadow-sm)' 
          }}>
            {/* Profile Header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: '2px solid var(--border)'
            }}>
              <div style={{ 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--tata-blue) 0%, var(--tata-blue-dark) 100%)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                fontWeight: 700,
                color: 'var(--white)',
                boxShadow: '0 4px 12px rgba(0, 102, 179, 0.3)'
              }}>
                {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                {user?.full_name}
              </h2>
              <div style={{ 
                display: 'inline-block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--white)',
                background: 'linear-gradient(135deg, var(--tata-blue) 0%, var(--tata-blue-dark) 100%)',
                padding: '6px 16px',
                borderRadius: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                {user?.role}
              </div>
            </div>

            {/* Profile Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="profile-field">
                <label className="profile-field__label">User ID</label>
                <div className="profile-field__value">{user?.id || '–'}</div>
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Email Address</label>
                <div className="profile-field__value">{user?.email || '–'}</div>
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Full Name</label>
                <div className="profile-field__value">{user?.full_name || '–'}</div>
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Role</label>
                <div className="profile-field__value" style={{ textTransform: 'capitalize' }}>
                  {user?.role || '–'}
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Access Level</label>
                <div className="profile-field__value">
                  {user?.role === 'admin' && 'Full System Access'}
                  {user?.role === 'hr' && 'HR Management Access'}
                  {user?.role === 'recruiter' && 'Interview Management Access'}
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div style={{ 
              marginTop: 32, 
              padding: 20, 
              background: 'var(--grey-50)', 
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>
                Permissions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>View Dashboard</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: user?.role === 'admin' || user?.role === 'hr' ? 'var(--success)' : 'var(--grey-300)', fontSize: 18 }}>
                    {user?.role === 'admin' || user?.role === 'hr' ? '✓' : '✗'}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Onboard Candidates</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Manage Interviews</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: user?.role === 'admin' || user?.role === 'hr' ? 'var(--success)' : 'var(--grey-300)', fontSize: 18 }}>
                    {user?.role === 'admin' || user?.role === 'hr' ? '✓' : '✗'}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Generate Reports</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: user?.role === 'admin' ? 'var(--success)' : 'var(--grey-300)', fontSize: 18 }}>
                    {user?.role === 'admin' ? '✓' : '✗'}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Re-Interview Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .profile-field__label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-field__value {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
          padding: 10px 14px;
          background: var(--grey-50);
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
      `}</style>
    </Layout>
  );
}
