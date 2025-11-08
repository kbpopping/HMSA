import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PassThroughRoute from './routes/PassThroughRoute'
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard'
import Hospitals from './pages/SuperAdmin/Hospitals'
import CreateHospital from './pages/SuperAdmin/CreateHospital'
import Users from './pages/SuperAdmin/Users'
import Roles from './pages/SuperAdmin/Roles'
import UsersRoles from './pages/SuperAdmin/UsersRoles'
import Monitoring from './pages/SuperAdmin/Monitoring'
import Settings from './pages/SuperAdmin/Settings'
import N8nLogs from './pages/SuperAdmin/N8nLogs'
import HospitalAdminDashboard from './pages/HospitalAdmin/Dashboard'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes - Currently using PassThroughRoute (no auth) */}
        <Route element={<PassThroughRoute />}>
          {/* Super Admin routes */}
          <Route path="/super/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super/hospitals" element={<Hospitals />} />
          <Route path="/super/users" element={<Users />} />
          <Route path="/super/settings" element={<Settings />} />
          <Route path="/super/create-hospital" element={<CreateHospital />} />
          <Route path="/super/users-roles" element={<Roles />} />
          <Route path="/super/users/roles" element={<Roles />} />
          <Route path="/super/users/monitoring" element={<Monitoring />} />
          <Route path="/super/n8n-logs" element={<N8nLogs />} />
          
          {/* Hospital Admin routes */}
          <Route path="/hospital/dashboard" element={<HospitalAdminDashboard />} />
        </Route>
        
        {/* Redirect root to dashboard (changed from /login for dev mode) */}
        <Route path="/" element={<Navigate to="/super/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/super/dashboard" replace />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </>
  )
}

export default App
