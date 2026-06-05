import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import AdminAuthPage from './pages/AdminAuthPage'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import FormFillPage from './pages/FormFillPage'
import OfficerDashboard from './pages/OfficerDashboard'
import ProfilePage from './pages/ProfilePage'
import WorkflowPage from './pages/WorkflowPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminAuthPage />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/form-fill" element={<FormFillPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/workflow/:id" element={<WorkflowPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route element={<Layout />}>
              <Route path="/officer" element={<OfficerDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
