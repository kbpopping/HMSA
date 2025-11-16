export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8082';

// Check if mock mode is enabled
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || true; // Force enabled for now

// Direct import of mock API (no async loading)
import { MockAPI } from './mock';

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit & { json?: any } = {}
): Promise<T> {
  // If mock mode is enabled, route to mock API directly
  if (USE_MOCK_API) {
    return routeMockAPI<T>(path, opts);
  }

  // Real API call
  const { json, ...rest } = opts;
  const isFormData = opts.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> || {}),
  };
  
  // Only set Content-Type for JSON, not for FormData (browser will set it with boundary)
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers,
    ...rest,
    body: json ? JSON.stringify(json) : opts.body,
  });

  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  
  return data as T;
}

// Route mock API calls based on path
async function routeMockAPI<T>(
  path: string,
  opts: RequestInit & { json?: any }
): Promise<T> {
  const { json, method = 'GET' } = opts;
  
  // Remove query parameters from path for matching
  const pathWithoutQuery = path.split('?')[0];
  
  console.log('[HTTP] Routing request:', { path, pathWithoutQuery, method, hasJson: !!json });
  
  // Auth endpoints
  if (path === '/api/auth/login' && method === 'POST') {
    return MockAPI.auth.login(json.email, json.password) as T;
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    return MockAPI.auth.logout() as T;
  }
  if (path === '/api/auth/refresh' && method === 'POST') {
    return MockAPI.auth.refresh() as T;
  }
  if (path === '/api/auth/change-password' && method === 'POST') {
    return MockAPI.auth.changePassword(json.oldPassword, json.newPassword) as T;
  }
  if (path === '/api/auth/first-login-check' && method === 'GET') {
    return MockAPI.auth.checkFirstLogin() as T;
  }
  
  // Clinician Profile endpoints
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && !path.includes('/appointments') && !path.includes('/earnings') && !path.includes('/schedule') && !path.includes('/availability')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    if (path.split('/').length === 6 && method === 'GET') {
      return MockAPI.clinician.getProfile(hospitalId, clinicianId) as T;
    }
    if ((method === 'PUT' || method === 'PATCH') && path.split('/').length === 6) {
      return MockAPI.clinician.updateProfile(hospitalId, clinicianId, json) as T;
    }
  }
  
  // Clinician Documents
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && path.endsWith('/documents')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    if (method === 'POST') {
      if (opts.body instanceof FormData) {
        const file = opts.body.get('document') as File;
        return MockAPI.clinician.uploadDocument(hospitalId, clinicianId, file) as T;
      }
      throw new Error('No file provided');
    }
  }
  
  // Create Appointment
  if (path.startsWith('/api/hospitals/') && path.endsWith('/appointments') && method === 'POST') {
    const parts = path.split('/');
    const hospitalId = parts[3];
    return MockAPI.clinician.createAppointment(hospitalId, json) as T;
  }
  
  // Clinician Appointments
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && path.includes('/appointments')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const status = url.searchParams.get('status');
      const start = url.searchParams.get('start');
      const end = url.searchParams.get('end');
      return MockAPI.clinician.getAppointments(hospitalId, clinicianId, { status, start, end }) as T;
    }
  }
  
  // Update Appointment Status
  if (path.startsWith('/api/hospitals/') && path.includes('/appointments/') && path.split('/').length === 6) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const appointmentId = parts[5];
    if (method === 'PATCH') {
      return MockAPI.clinician.updateAppointmentStatus(hospitalId, appointmentId, json.status) as T;
    }
  }
  
  // Clinician Earnings
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && path.includes('/earnings')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const start = url.searchParams.get('start');
      const end = url.searchParams.get('end');
      return MockAPI.clinician.getEarnings(hospitalId, clinicianId, { start, end }) as T;
    }
  }
  
  // Clinician Schedule
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && path.includes('/schedule')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    // Schedule actions (approve, reject, accept, complete)
    if (path.endsWith('/approve') && method === 'POST') {
      const scheduleId = parts[7];
      return MockAPI.clinician.approveSchedule(hospitalId, clinicianId, scheduleId) as T;
    }
    if (path.endsWith('/reject') && method === 'POST') {
      const scheduleId = parts[7];
      return MockAPI.clinician.rejectSchedule(hospitalId, clinicianId, scheduleId, json.reason) as T;
    }
    if (path.endsWith('/accept') && method === 'POST') {
      const scheduleId = parts[7];
      return MockAPI.clinician.acceptSchedule(hospitalId, clinicianId, scheduleId) as T;
    }
    if (path.endsWith('/complete') && method === 'POST') {
      const scheduleId = parts[7];
      return MockAPI.clinician.completeSchedule(hospitalId, clinicianId, scheduleId) as T;
    }
    
    // Update schedule
    if (path.split('/').length === 8 && (method === 'PATCH' || method === 'PUT')) {
      const scheduleId = parts[7];
      return MockAPI.clinician.updateSchedule(hospitalId, clinicianId, scheduleId, json) as T;
    }
    
    // Create schedule
    if (path.endsWith('/schedule') && method === 'POST') {
      return MockAPI.clinician.createSchedule(hospitalId, clinicianId, json) as T;
    }
    
    // Get schedules
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const start = url.searchParams.get('start');
      const end = url.searchParams.get('end');
      const type = url.searchParams.get('type');
      const status = url.searchParams.get('status');
      return MockAPI.clinician.getSchedule(hospitalId, clinicianId, { start, end, type, status }) as T;
    }
  }
  
  // Clinician Availability
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && path.includes('/availability')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    if (method === 'PATCH') {
      return MockAPI.clinician.updateAvailability(hospitalId, clinicianId, json) as T;
    }
  }
  
  // Onboarding Complete
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && path.endsWith('/complete-onboarding')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    if (method === 'POST') {
      return MockAPI.clinician.completeOnboarding(hospitalId, clinicianId) as T;
    }
  }
  
  // Clinician Patients - Only assigned patients
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/') && path.includes('/patients')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    // Remove query parameters for path matching
    const pathWithoutQuery = path.split('?')[0];
    
    // Search patient
    if (pathWithoutQuery.includes('/patients/search') && method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const query = url.searchParams.get('q');
      return MockAPI.clinician.searchPatient(hospitalId, clinicianId, query || '') as T;
    }
    
    // Get single patient (path: /api/hospitals/{id}/clinicians/{id}/patients/{id})
    if (pathWithoutQuery.split('/').length === 8 && method === 'GET' && !pathWithoutQuery.includes('/search')) {
      const patientId = parts[7];
      return MockAPI.clinician.getPatient(hospitalId, clinicianId, patientId) as T;
    }
    
    // Get patient appointments
    if (pathWithoutQuery.endsWith('/appointments') && method === 'GET') {
      const patientId = parts[7];
      return MockAPI.clinician.getPatientAppointments(hospitalId, clinicianId, patientId) as T;
    }
    
    // Health Records
    if (pathWithoutQuery.includes('/health-records')) {
      const patientId = parts[7];
      
      // Upload document
      if (pathWithoutQuery.endsWith('/upload') && method === 'POST') {
        const file = (opts.body as FormData)?.get('document') as File;
        const documentType = (opts.body as FormData)?.get('document_type') as string;
        return MockAPI.clinician.uploadHealthDocument(hospitalId, clinicianId, patientId, file, documentType) as T;
      }
      
      // Add medical history
      if (pathWithoutQuery.endsWith('/history') && method === 'POST') {
        return MockAPI.clinician.addMedicalHistory(hospitalId, clinicianId, patientId, json) as T;
      }
      
      // Get health records
      if (pathWithoutQuery.endsWith('/health-records') && method === 'GET') {
        return MockAPI.clinician.getHealthRecords(hospitalId, clinicianId, patientId) as T;
      }
    }
    
    // Update patient notes
    if (pathWithoutQuery.endsWith('/notes') && method === 'PATCH') {
      const patientId = parts[7];
      return MockAPI.clinician.updatePatientNotes(hospitalId, clinicianId, patientId, json.notes) as T;
    }
    
    // Get assigned patients list (path: /api/hospitals/{id}/clinicians/{id}/patients)
    // This should match when path ends with /patients (without query params)
    // Check if this is the patients list endpoint (not a specific patient or sub-resource)
    const isPatientsList = pathWithoutQuery.endsWith('/patients') && 
                          method === 'GET' && 
                          parts.length === 7 &&
                          !pathWithoutQuery.includes('/patients/');
    
    if (isPatientsList) {
      const url = new URL(path, 'http://localhost');
      const search = url.searchParams.get('search');
      console.log('[Mock API] Getting assigned patients:', { hospitalId, clinicianId, search });
      const result = await MockAPI.clinician.getAssignedPatients(hospitalId, clinicianId, { search: search || null });
      console.log('[Mock API] Returning patients:', result);
      return result as T;
    }
  }
  
  // Default: return empty response
  console.warn(`[Mock API] No handler for ${method} ${pathWithoutQuery}`);
  return {} as T;
}

