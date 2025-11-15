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
  
  // Hospital Admin endpoints
  // Handle /api/hospitals/me with or without query parameters
  if (pathWithoutQuery === '/api/hospitals/me') {
    // Extract query parameters from full path
    const queryString = path.includes('?') ? path.split('?')[1] : '';
    const url = queryString 
      ? new URL(`http://localhost${pathWithoutQuery}?${queryString}`)
      : new URL(`http://localhost${pathWithoutQuery}`);
    const id = url.searchParams.get('id');
    return MockAPI.hospital.me(id || undefined) as T;
  }
  
  // Update hospital endpoint - must come before other /api/hospitals/ routes
  if (pathWithoutQuery.startsWith('/api/hospitals/') && pathWithoutQuery.split('/').length === 4) {
    const parts = pathWithoutQuery.split('/');
    const hospitalId = parts[3];
    if (method === 'PUT' || method === 'PATCH') {
      console.log('[HTTP] Update hospital endpoint called:', { path: pathWithoutQuery, hospitalId, payload: json });
      return MockAPI.hospital.updateHospital(hospitalId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/patients')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const search = url.searchParams.get('search');
      const page = url.searchParams.get('page');
      const pageSize = url.searchParams.get('pageSize');
      return MockAPI.hospital.listPatients(hospitalId, { search, page, pageSize }) as T;
    }
    if (method === 'POST') {
      return MockAPI.hospital.createPatient(hospitalId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/patients/') && path.split('/').length === 6) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const patientId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getPatient(hospitalId, patientId) as T;
    }
    if (method === 'PUT' || method === 'PATCH') {
      return MockAPI.hospital.updatePatient(hospitalId, patientId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/clinicians')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      return MockAPI.hospital.listClinicians(hospitalId) as T;
    }
    if (method === 'POST') {
      return MockAPI.hospital.createClinician(hospitalId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/clinicians/')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const clinicianId = parts[5];
    
    // Profile picture upload endpoint
    if (path.endsWith('/profile-picture') && method === 'POST') {
      // Handle file upload - extract file from FormData
      if (opts.body instanceof FormData) {
        const file = opts.body.get('profile_picture') as File;
        return MockAPI.hospital.uploadStaffProfilePicture(hospitalId, clinicianId, file) as T;
      }
      throw new Error('No file provided');
    }
    
    // Update clinician endpoint
    if (path.split('/').length === 6 && (method === 'PUT' || method === 'PATCH')) {
      return MockAPI.hospital.updateClinician(hospitalId, clinicianId, json) as T;
    }
  }

  // Staff Employment/Financial endpoint
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.endsWith('/employment-financial')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getStaffEmploymentFinancial(hospitalId, staffId) as T;
    }
  }

  // Staff Medical Info endpoint
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.endsWith('/medical-info')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getStaffMedicalInfo(hospitalId, staffId) as T;
    }
  }

  // Verify password for medical info access
  if (path.startsWith('/api/hospitals/') && path.endsWith('/staff/medical-info/verify-password') && method === 'POST') {
    const parts = path.split('/');
    const hospitalId = parts[3];
    return MockAPI.hospital.verifyMedicalInfoPassword(hospitalId, json.password) as T;
  }

  // Staff Patients/Reports endpoint
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.includes('/patients-reports')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const timeframe = url.searchParams.get('timeframe') as 'weekly' | 'monthly' | undefined;
      return MockAPI.hospital.getStaffPatientsReports(hospitalId, staffId, timeframe) as T;
    }
  }

  // Staff Reports endpoint
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.endsWith('/reports')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getStaffReports(hospitalId, staffId) as T;
    }
  }

  // Get all patients for a staff member
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.endsWith('/all-patients')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getAllStaffPatients(hospitalId, staffId) as T;
    }
  }

  // Staff Documents endpoints
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.endsWith('/documents')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getStaffDocuments(hospitalId, staffId) as T;
    }
    if (method === 'POST') {
      // Handle file upload - extract file from FormData
      if (opts.body instanceof FormData) {
        const file = opts.body.get('document') as File;
        const documentType = opts.body.get('document_type') as string | undefined;
        const description = opts.body.get('description') as string | undefined;
        return MockAPI.hospital.uploadStaffDocument(hospitalId, staffId, file, documentType, description) as T;
      }
      throw new Error('No file provided');
    }
  }

  // Staff Document download endpoint
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.includes('/documents/') && path.endsWith('/download')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    const documentId = parts[7];
    if (method === 'GET') {
      return MockAPI.hospital.downloadStaffDocument(hospitalId, staffId, documentId) as T;
    }
  }

  // Staff Document delete endpoint
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.includes('/documents/') && !path.endsWith('/download')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    const documentId = parts[7];
    if (method === 'DELETE') {
      return MockAPI.hospital.deleteStaffDocument(hospitalId, staffId, documentId) as T;
    }
  }

  // Staff Update Draft endpoints
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.endsWith('/update-draft')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getStaffUpdateDraft(hospitalId, staffId) as T;
    }
    if (method === 'POST') {
      return MockAPI.hospital.saveStaffUpdateDraft(hospitalId, staffId, json.draft, json.currentStep) as T;
    }
    if (method === 'DELETE') {
      return MockAPI.hospital.clearStaffUpdateDraft(hospitalId, staffId) as T;
    }
  }

  // Staff Update Complete endpoint
  if (path.startsWith('/api/hospitals/') && path.includes('/staff/') && path.endsWith('/update-complete')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const staffId = parts[5];
    if (method === 'POST') {
      return MockAPI.hospital.submitStaffUpdate(hospitalId, staffId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/staff-roles')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      return MockAPI.hospital.listStaffRoles(hospitalId) as T;
    }
    if (method === 'POST') {
      return MockAPI.hospital.createStaffRole(hospitalId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/staff-roles/') && path.split('/').length === 6) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const roleId = parts[5];
    if (method === 'PUT' || method === 'PATCH') {
      return MockAPI.hospital.updateStaffRole(hospitalId, roleId, json) as T;
    }
    if (method === 'DELETE') {
      return MockAPI.hospital.deleteStaffRole(hospitalId, roleId) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/appointments')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const status = url.searchParams.get('status');
      const clinicianId = url.searchParams.get('clinicianId');
      const start = url.searchParams.get('start');
      const end = url.searchParams.get('end');
      return MockAPI.hospital.listAppointments(hospitalId, { status, clinicianId, start, end }) as T;
    }
    if (method === 'POST') {
      return MockAPI.hospital.createAppointment(hospitalId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/appointments/') && path.split('/').length === 6) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const appointmentId = parts[5];
    if (method === 'PUT' || method === 'PATCH') {
      return MockAPI.hospital.updateAppointment(hospitalId, appointmentId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/templates')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      return MockAPI.hospital.listTemplates(hospitalId) as T;
    }
    if (method === 'POST') {
      return MockAPI.hospital.createTemplate(hospitalId, json) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/templates/') && path.split('/').length === 6) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const templateId = parts[5];
    if (method === 'PUT' || method === 'PATCH') {
      return MockAPI.hospital.updateTemplate(hospitalId, templateId, json) as T;
    }
    if (method === 'DELETE') {
      return MockAPI.hospital.deleteTemplate(hospitalId, templateId) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/outbound-queue')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      return MockAPI.hospital.listOutboundQueue(hospitalId) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/notifications')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const status = url.searchParams.get('status');
      const provider = url.searchParams.get('provider');
      const channel = url.searchParams.get('channel');
      const start = url.searchParams.get('start');
      const end = url.searchParams.get('end');
      return MockAPI.hospital.listNotifications(hospitalId, { status, provider, channel, start, end }) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/metrics')) {
    const hospitalId = path.split('/')[3];
    const url = new URL(path, 'http://localhost');
    const start = url.searchParams.get('start') || undefined;
    const end = url.searchParams.get('end') || undefined;
    return MockAPI.hospital.metrics(hospitalId, start, end) as T;
  }
  
  if (pathWithoutQuery.startsWith('/api/hospitals/') && pathWithoutQuery.endsWith('/billings')) {
    const hospitalId = pathWithoutQuery.split('/')[3];
    if (method === 'GET') {
      // Extract query parameters from full path
      const queryString = path.includes('?') ? path.split('?')[1] : '';
      const url = queryString 
        ? new URL(`http://localhost${pathWithoutQuery}?${queryString}`)
        : new URL(`http://localhost${pathWithoutQuery}`);
      const tab = url.searchParams.get('tab') || 'overview';
      const period = url.searchParams.get('period') || 'monthly';
      console.log('[HTTP] Billings endpoint called:', { hospitalId, tab, period });
      return MockAPI.hospital.getBillings(hospitalId, tab, period) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/patients/') && path.endsWith('/billing')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const patientId = parts[5];
    if (method === 'GET') {
      return MockAPI.hospital.getPatientBilling(hospitalId, patientId) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/patients/') && path.includes('/billing/') && path.includes('/mark-paid')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const patientId = parts[5];
    const billId = Number(parts[7]);
    if (method === 'POST') {
      return MockAPI.hospital.markBillAsPaid(hospitalId, patientId, billId) as T;
    }
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/patients/') && path.includes('/billing/') && path.includes('/send-reminder')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const patientId = parts[5];
    const billId = Number(parts[7]);
    if (method === 'POST') {
      return MockAPI.hospital.sendBillReminder(hospitalId, patientId, billId) as T;
    }
  }

  if (path.startsWith('/api/hospitals/') && path.includes('/patients/') && path.includes('/billing/transactions')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const patientId = parts[5];
    if (method === 'POST') {
      return MockAPI.hospital.createTransaction(hospitalId, patientId, json) as T;
    }
  }

  // Health Records endpoints
  if (path.startsWith('/api/hospitals/') && path.includes('/patients/') && path.includes('/health-records')) {
    const parts = path.split('/');
    const hospitalId = parts[3];
    const patientId = parts[5];
    
    if (path.endsWith('/health-records') && method === 'GET') {
      return MockAPI.hospital.getHealthRecords(hospitalId, patientId) as T;
    }
    
    if (path.endsWith('/health-records/upload') && method === 'POST') {
      // Handle file upload - extract file from FormData
      if (opts.body instanceof FormData) {
        const file = opts.body.get('document') as File;
        const documentType = opts.body.get('document_type') as string | undefined;
        return MockAPI.hospital.uploadHealthDocument(hospitalId, patientId, file, documentType) as T;
      }
      throw new Error('No file provided');
    }
    
    if (path.endsWith('/health-records/download') && method === 'GET') {
      return MockAPI.hospital.downloadHealthReport(hospitalId, patientId) as T;
    }
  }
  
  // Default: return empty response
  console.warn(`[Mock API] No handler for ${method} ${pathWithoutQuery}`);
  return {} as T;
}

