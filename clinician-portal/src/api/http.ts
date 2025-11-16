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
    
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const week = url.searchParams.get('week');
      return MockAPI.clinician.getSchedule(hospitalId, clinicianId, week || undefined) as T;
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
  
  // Patients list (permission-based)
  if (path.startsWith('/api/hospitals/') && path.endsWith('/patients')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const search = url.searchParams.get('search');
      return MockAPI.clinician.getPatients(hospitalId, { search }) as T;
    }
  }
  
  // Patient Health Records (permission-based)
  if (path.startsWith('/api/hospitals/') && path.includes('/patients/') && path.includes('/health-records')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const patientId = parts[5];
    
    if (path.endsWith('/health-records') && method === 'GET') {
      return MockAPI.clinician.getPatientHealthRecords(hospitalId, patientId) as T;
    }
  }
  
  // Default: return empty response
  console.warn(`[Mock API] No handler for ${method} ${pathWithoutQuery}`);
  return {} as T;
}

