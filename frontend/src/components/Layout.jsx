import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../styles/layout.css';

const NAV = [
  { path: '/', label: 'Dashboard' },
  { path: '/candidates', label: 'Candidate Search' },
  { path: '/yet-to-interview', label: 'Yet To Interview' },
  { path: '/interview-completed', label: 'Interview Completed' },
  { path: '/reports', label: 'Reports', roles: ['admin', 'hr'] },
  { path: '/re-interview', label: 'Re-Interview', roles: ['admin'] },
];

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = NAV.filter((n) => !n.roles || (user && n.roles.includes(user.role)));

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__brand">
          <span className="layout__brand-name">TPEML</span>
          <span className="layout__brand-sub">HR Recruitment Portal</span>
        </div>
        <nav className="layout__nav">
          {links.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`layout__nav-link ${location.pathname === path ? 'layout__nav-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="layout__user">
          <span className="layout__user-name">{user?.full_name}</span>
          <span className="layout__user-role">{user?.role}</span>
          <button type="button" className="layout__btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="layout__main">{children}</main>
    </div>
  );
}
