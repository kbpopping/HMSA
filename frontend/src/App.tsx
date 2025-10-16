import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './layouts/DashboardLayout'
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard'
import CreateHospital from './pages/SuperAdmin/CreateHospital'
import UsersRoles from './pages/SuperAdmin/UsersRoles'
import Settings from './pages/SuperAdmin/Settings'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Super Admin routes */}
      <Route path="/super" element={<DashboardLayout role="super-admin" />}>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="create-hospital" element={<CreateHospital />} />
        <Route path="users-roles" element={<UsersRoles />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
