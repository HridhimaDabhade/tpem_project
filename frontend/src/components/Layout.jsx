import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../styles/layout.css';

const NAV = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/reports', label: 'Reports', icon: '📄', roles: ['admin', 'hr'] },
  { path: '/re-interview', label: 'Re-Interview', icon: '🔄', roles: ['admin'] },
];

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const links = NAV.filter((n) => !n.roles || (user && n.roles.includes(user.role)));

  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__brand" style={{ textDecoration: 'none' }}>
          <div className="layout__brand-logo">T</div>
          <div className="layout__brand-text">
            <span className="layout__brand-name">TPEML</span>
            <span className="layout__brand-sub">HR Recruitment</span>
          </div>
        </Link>
        <nav className="layout__nav">
          {links.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`layout__nav-link ${location.pathname === path ? 'layout__nav-link--active' : ''}`}
            >
              {icon && <span className="layout__nav-icon">{icon}</span>}
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="layout__user-menu" ref={dropdownRef}>
          <button 
            type="button" 
            className="layout__user-menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="layout__user-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="layout__user-info">
              <span className="layout__user-name">{user?.full_name}</span>
              <span className="layout__user-role">{user?.role}</span>
            </span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              style={{ 
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="layout__user-dropdown">
              <button 
                type="button" 
                className="layout__dropdown-item"
                onClick={handleProfile}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>View Profile</span>
              </button>
              <div className="layout__dropdown-divider"></div>
              <button 
                type="button" 
                className="layout__dropdown-item layout__dropdown-item--danger"
                onClick={handleLogout}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="layout__main">{children}</main>
    </div>
  );
}
