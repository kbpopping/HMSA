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
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
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
  
  // Super Admin endpoints
  if (pathWithoutQuery.startsWith('/api/super/hospitals')) {
    if (method === 'GET') {
      return MockAPI.super.listHospitals() as T;
    }
    if (method === 'POST') {
      return MockAPI.super.createHospital(json) as T;
    }
    // PRODUCTION: Add validation and permission checks
    if (method === 'PUT') {
      const hospitalId = pathWithoutQuery.split('/').pop();
      if (hospitalId && json) {
        return MockAPI.super.updateHospital(hospitalId, json) as T;
      }
    }
    // PRODUCTION: Add password verification before deletion
    if (method === 'DELETE') {
      const hospitalId = pathWithoutQuery.split('/').pop();
      if (hospitalId) {
        return MockAPI.super.deleteHospital(hospitalId) as T;
      }
    }
  }
  if (path === '/api/super/impersonate' && method === 'POST') {
    return MockAPI.super.impersonate(json.hospital_id) as T;
  }
  
  // Super Admin user management endpoints
  if (pathWithoutQuery.startsWith('/api/super/users')) {
    if (method === 'GET') {
      return MockAPI.super.listUsers() as T;
    }
    if (method === 'POST') {
      return MockAPI.super.createUser(json) as T;
    }
    // PRODUCTION: Add validation and permission checks
    if (method === 'PUT') {
      const userId = pathWithoutQuery.split('/').pop();
      if (userId && json) {
        return MockAPI.super.updateUser(userId, json) as T;
      }
    }
  }
  
  // Super Admin role management endpoints
  if (pathWithoutQuery.startsWith('/api/super/roles')) {
    if (method === 'GET') {
      return MockAPI.super.listRoles() as T;
    }
    if (method === 'POST') {
      return MockAPI.super.createRole(json) as T;
    }
    // PRODUCTION: Add validation and permission checks
    if (method === 'PUT') {
      const roleId = pathWithoutQuery.split('/').pop();
      if (roleId && json) {
        return MockAPI.super.updateRole(roleId, json) as T;
      }
    }
    // PRODUCTION: Add validation to prevent deletion of roles with active users
    if (method === 'DELETE') {
      const roleId = pathWithoutQuery.split('/').pop();
      if (roleId) {
        return MockAPI.super.deleteRole(roleId) as T;
      }
    }
  }
  
  // Super Admin monitoring endpoints
  if (pathWithoutQuery.startsWith('/api/super/monitoring')) {
    if (pathWithoutQuery === '/api/super/monitoring/queue' && method === 'GET') {
      return MockAPI.super.getQueueOverview() as T;
    }
    if (pathWithoutQuery === '/api/super/monitoring/notifications' && method === 'GET') {
      return MockAPI.super.getNotificationsBreakdown() as T;
    }
    if (pathWithoutQuery === '/api/super/monitoring/n8n-health' && method === 'GET') {
      return MockAPI.super.getN8nHealth() as T;
    }
  }
  
  // Hospital Admin endpoints
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
  
  if (path.startsWith('/api/hospitals/') && path.endsWith('/clinicians')) {
    const hospitalId = path.split('/')[3];
    if (method === 'GET') {
      return MockAPI.hospital.listClinicians(hospitalId) as T;
    }
    if (method === 'POST') {
      return MockAPI.hospital.createClinician(hospitalId, json) as T;
    }
  }
  
  if (path === '/api/hospitals/me') {
    const url = new URL(path, 'http://localhost');
    const id = url.searchParams.get('id');
    return MockAPI.hospital.me(id || undefined) as T;
  }
  
  if (path.startsWith('/api/hospitals/') && path.includes('/metrics')) {
    const hospitalId = path.split('/')[3];
    const url = new URL(path, 'http://localhost');
    const start = url.searchParams.get('start') || undefined;
    const end = url.searchParams.get('end') || undefined;
    return MockAPI.hospital.metrics(hospitalId, start, end) as T;
  }
  
  // Default: return empty response
  console.warn(`[Mock API] No handler for ${method} ${pathWithoutQuery}`);
  return {} as T;
}
