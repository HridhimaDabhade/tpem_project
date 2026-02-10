import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CandidateProfile } from './pages/CandidateProfile';
import { CandidateOnboarding } from './pages/CandidateOnboarding';
import { PublicOnboarding } from './pages/PublicOnboarding';
import { PublicFormQR } from './pages/PublicFormQR';
import { UserProfile } from './pages/UserProfile';
import { Reports } from './pages/Reports';
import { ReInterviewAdmin } from './pages/ReInterviewAdmin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<PublicOnboarding />} />
          <Route path="/qr-code" element={<PublicFormQR />} />
          <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/:candidateId"
            element={
              <ProtectedRoute>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <CandidateOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/re-interview"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReInterviewAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr-code"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <PublicFormQR />
              </ProtectedRoute>
            }
          />
          
          {/* Public route - no auth required */}
          <Route path="/apply" element={<PublicOnboarding />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
