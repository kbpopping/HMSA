import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import PassThroughRoute from './routes/PassThroughRoute'
import Dashboard from './pages/HospitalAdmin/Dashboard'
import Appointments from './pages/HospitalAdmin/Appointments'
import Patients from './pages/HospitalAdmin/Patients'
import PatientProfile from './pages/HospitalAdmin/PatientProfile'
import Invoice from './pages/HospitalAdmin/Invoice'
import Staff from './pages/HospitalAdmin/Staff'
import StaffCategory from './pages/HospitalAdmin/StaffCategory'
import StaffProfile from './pages/HospitalAdmin/StaffProfile'
import AllStaffPatients from './pages/HospitalAdmin/AllStaffPatients'
import StaffRoles from './pages/HospitalAdmin/StaffRoles'
import Templates from './pages/HospitalAdmin/Templates'
import Messaging from './pages/HospitalAdmin/Messaging'
import Settings from './pages/HospitalAdmin/Settings'
import Billings from './pages/HospitalAdmin/Billings'
import SalarySettings from './pages/HospitalAdmin/SalarySettings'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes - Currently using PassThroughRoute (no auth) */}
        <Route element={<PassThroughRoute />}>
          {/* Hospital Admin routes */}
          <Route path="/hospital/dashboard" element={<Dashboard />} />
          <Route path="/hospital/appointments" element={<Appointments />} />
          <Route path="/hospital/patients" element={<Patients />} />
          <Route path="/hospital/patients/:patientId" element={<PatientProfile />} />
          <Route path="/hospital/patients/:patientId/invoice/:invoiceNumber" element={<Invoice />} />
          <Route path="/hospital/staff/roles" element={<StaffRoles />} />
          <Route path="/hospital/staff/:category/:staffId" element={<StaffProfile />} />
          <Route path="/hospital/staff/:category/:staffId/all-patients" element={<AllStaffPatients />} />
          <Route path="/hospital/staff/:category" element={<StaffCategory />} />
          <Route path="/hospital/staff" element={<Staff />} />
          <Route path="/hospital/templates" element={<Templates />} />
          <Route path="/hospital/messaging" element={<Messaging />} />
          <Route path="/hospital/settings" element={<Settings />} />
          <Route path="/hospital/billings" element={<Billings />} />
          <Route path="/hospital/billings/payroll/:employeeId" element={<SalarySettings />} />
        </Route>
        
        {/* Redirect root to login (or dashboard if authenticated) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </>
  )
}

export default App

