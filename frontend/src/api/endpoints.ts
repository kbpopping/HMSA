import { apiFetch } from './http';

export type Role = 'super_admin' | 'hospital_admin';

export type Hospital = {
  id: string;
  name: string;
  country: string | null;
  timezone: string;
  created_at: string;
};

export type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mrn: string;
  created_at: string;
};

export type Clinician = {
  id: number;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  created_at: string;
};

// Auth API
export const AuthAPI = {
  login: (email: string, password: string) =>
    apiFetch<{ ok: true; role: Role; hospital_id?: string }>('/api/auth/login', {
      method: 'POST',
      json: { email, password },
    }),
  
  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),
  
  refresh: () =>
    apiFetch('/api/auth/refresh', { method: 'POST' }),
};

// Super Admin API
export const SuperAPI = {
  listHospitals: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const queryString = query.toString();
    return apiFetch<Hospital[]>(
      `/api/super/hospitals${queryString ? `?${queryString}` : ''}`
    );
  },
  
  createHospital: (payload: {
    name: string;
    country?: string | null;
    timezone?: string;
    adminEmail: string;
    adminPassword: string;
  }) =>
    apiFetch<{ id: string; name: string }>('/api/super/hospitals', {
      method: 'POST',
      json: payload,
    }),
  
  impersonate: (hospital_id: string) =>
    apiFetch<{ ok: true; hospital_id: string }>('/api/super/impersonate', {
      method: 'POST',
      json: { hospital_id },
    }),
  
  // PRODUCTION: Replace with real update endpoint
  updateHospital: (hospital_id: string, payload: { name: string; country?: string | null; timezone?: string }) =>
    apiFetch<{ ok: true }>(`/api/super/hospitals/${hospital_id}`, {
      method: 'PUT',
      json: payload,
    }),
  
  // PRODUCTION: Replace with real delete endpoint that requires admin password verification
  deleteHospital: (hospital_id: string) =>
    apiFetch<{ ok: true }>(`/api/super/hospitals/${hospital_id}`, {
      method: 'DELETE',
    }),
  
  // PRODUCTION: Replace with real user management endpoints
  listUsers: () =>
    apiFetch<Array<{ id: string; name: string; email: string; role: 'Super Admin' | 'Hospital Admin'; lastActive: string; hospital: string | null; hospital_id?: string | null }>>('/api/super/users'),
  
  createUser: (payload: { name: string; email: string; role: 'Super Admin' | 'Hospital Admin'; password: string; hospital_id?: string | null }) =>
    apiFetch<{ id: string; name: string }>('/api/super/users', {
      method: 'POST',
      json: payload,
    }),
  
  updateUser: (user_id: string, payload: { name: string; email: string; role: 'Super Admin' | 'Hospital Admin'; hospital_id?: string | null }) =>
    apiFetch<{ ok: true }>(`/api/super/users/${user_id}`, {
      method: 'PUT',
      json: payload,
    }),
  
  // PRODUCTION: Replace with real role management endpoints
  listRoles: () =>
    apiFetch<Array<{ id: string; name: string; description: string; permissions: string[]; userCount: number; createdAt: string }>>('/api/super/roles'),
  
  createRole: (payload: { name: string; description: string; permissions: string[] }) =>
    apiFetch<{ id: string; name: string }>('/api/super/roles', {
      method: 'POST',
      json: payload,
    }),
  
  updateRole: (role_id: string, payload: { name: string; description: string; permissions: string[] }) =>
    apiFetch<{ ok: true }>(`/api/super/roles/${role_id}`, {
      method: 'PUT',
      json: payload,
    }),
  
  deleteRole: (role_id: string) =>
    apiFetch<{ ok: true }>(`/api/super/roles/${role_id}`, {
      method: 'DELETE',
    }),
  
  // PRODUCTION: Replace with real monitoring endpoints
  getQueueOverview: () =>
    apiFetch<{
      queued: number;
      sent: number;
      failed: number;
      retryRate: number;
      providers?: Array<{ name: string; queued: number; sent: number; failed: number }>;
    }>('/api/super/monitoring/queue'),
  
  getNotificationsBreakdown: () =>
    apiFetch<Array<{
      channel: string;
      provider: string;
      status: 'Queued' | 'Sent' | 'Failed';
      count: number;
      trend: number;
      trendDirection: 'up' | 'down';
    }>>('/api/super/monitoring/notifications'),
  
  getN8nHealth: () =>
    apiFetch<Array<{
      name: string;
      lastSuccess: string;
      lastError: string | null;
      avgDuration: string;
    }>>('/api/super/monitoring/n8n-health'),
};

// Hospital Admin API
export const HospitalAPI = {
  me: (id?: string) =>
    apiFetch<Hospital>(
      `/api/hospitals/me${id ? `?id=${id}` : ''}`
    ),
  
  listPatients: (
    hospitalId: string,
    params?: { search?: string; page?: number; pageSize?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    const queryString = query.toString();
    return apiFetch<Patient[]>(
      `/api/hospitals/${hospitalId}/patients${queryString ? `?${queryString}` : ''}`
    );
  },
  
  createPatient: (
    hospitalId: string,
    payload: {
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
      date_of_birth?: string;
    }
  ) =>
    apiFetch<{ id: number; mrn: string }>(
      `/api/hospitals/${hospitalId}/patients`,
      { method: 'POST', json: payload }
    ),
  
  listClinicians: (hospitalId: string) =>
    apiFetch<Clinician[]>(`/api/hospitals/${hospitalId}/clinicians`),
  
  createClinician: (
    hospitalId: string,
    payload: {
      name: string;
      specialty?: string;
      email?: string;
      phone?: string;
    }
  ) =>
    apiFetch<{ id: number }>(`/api/hospitals/${hospitalId}/clinicians`, {
      method: 'POST',
      json: payload,
    }),
  
  metrics: (hospitalId: string, start?: string, end?: string) => {
    const query = new URLSearchParams();
    if (start) query.set('start', start);
    if (end) query.set('end', end);
    const queryString = query.toString();
    return apiFetch<{
      range: { start: string; end: string };
      totalAppointments: number;
      byStatus: Array<{ status: string; count: number }>;
      notifBreakdown: Array<any>;
    }>(`/api/hospitals/${hospitalId}/metrics${queryString ? `?${queryString}` : ''}`);
  },
};

