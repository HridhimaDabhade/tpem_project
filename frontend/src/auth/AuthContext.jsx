import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, isAuthenticated, me, logout as authLogout } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(!!getStoredUser() && isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }
    me()
      .then((u) => {
        setUser({ id: u.id, email: u.email, full_name: u.full_name, role: u.role });
      })
      .catch(() => {
        setUser(null);
        authLogout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
