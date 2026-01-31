import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CandidateSearch } from './pages/CandidateSearch';
import { CandidateProfile } from './pages/CandidateProfile';
import { YetToInterview } from './pages/YetToInterview';
import { InterviewCompleted } from './pages/InterviewCompleted';
import { Reports } from './pages/Reports';
import { ReInterviewAdmin } from './pages/ReInterviewAdmin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <CandidateSearch />
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
            path="/yet-to-interview"
            element={
              <ProtectedRoute>
                <YetToInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-completed"
            element={
              <ProtectedRoute>
                <InterviewCompleted />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
