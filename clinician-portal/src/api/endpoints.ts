import { apiFetch } from './http';

export type Role = 'clinician' | 'nurse' | 'receptionist' | 'support_staff';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospital_id: string;
  profile_picture?: string;
  needsPasswordChange?: boolean;
  onboardingComplete?: boolean;
  permissions?: string[];
};

export type ClinicianProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  specialty?: string | string[];
  profile_picture?: string;
  marital_status?: string;
  home_address?: string;
  qualifications?: string;
  date_joined?: string;
  next_of_kin?: {
    name?: string;
    relationship?: string;
    contact_number?: string;
  };
  hospital_id: string;
  permissions?: string[];
  onboarding_complete?: boolean;
};

export type Document = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  uploadedAt: string;
  uploadedBy?: string;
  description?: string;
};

export type Appointment = {
  id: number;
  appointment_number?: string;
  patient_id: number;
  patient_name: string;
  patient_mrn?: string;
  clinician_id: number;
  clinician_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  notes?: string;
  created_at: string;
};

export type EarningRecord = {
  id: number;
  date: string;
  service: string;
  patient_name?: string;
  amount: number;
  status: 'paid' | 'pending' | 'processing';
};

export type EarningsSummary = {
  currentMonth: number;
  thisWeek: number;
  lastMonth: number;
  records: EarningRecord[];
  chart: Array<{ date: string; amount: number }>;
};

export type ScheduleSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointment?: Appointment;
  type: 'appointment' | 'available' | 'break' | 'unavailable';
};

export type WeeklySchedule = {
  week: string;
  slots: ScheduleSlot[];
};

export type AvailabilityPreferences = {
  monday: { available: boolean; startTime?: string; endTime?: string };
  tuesday: { available: boolean; startTime?: string; endTime?: string };
  wednesday: { available: boolean; startTime?: string; endTime?: string };
  thursday: { available: boolean; startTime?: string; endTime?: string };
  friday: { available: boolean; startTime?: string; endTime?: string };
  saturday: { available: boolean; startTime?: string; endTime?: string };
  sunday: { available: boolean; startTime?: string; endTime?: string };
  preferredDuration?: number; // in minutes
  breakTimes?: Array<{ startTime: string; endTime: string }>;
  timezone?: string;
};

export type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mrn: string;
  date_of_birth?: string;
  last_appointment?: string;
  created_at: string;
};

export type HealthRecord = {
  id: number;
  record_date: string;
  title: string;
  description?: string;
  clinician_name?: string;
};

export type HealthRecordDocument = {
  id: string;
  file_name: string;
  document_type?: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  ai_processed: boolean;
  created_at: string;
};

export type PatientHealthRecords = {
  medicalHistory: HealthRecord[];
  documents: HealthRecordDocument[];
};

// Auth API
export const AuthAPI = {
  login: (email: string, password: string) =>
    apiFetch<{ ok: true; role: Role; hospital_id: string; user: User }>('/api/auth/login', {
      method: 'POST',
      json: { email, password },
    }),
  
  logout: () =>
    apiFetch<{ ok: true }>('/api/auth/logout', {
      method: 'POST',
    }),
  
  refresh: () =>
    apiFetch<{ ok: true }>('/api/auth/refresh', {
      method: 'POST',
    }),
  
  changePassword: (oldPassword: string, newPassword: string) =>
    apiFetch<{ ok: true }>('/api/auth/change-password', {
      method: 'POST',
      json: { oldPassword, newPassword },
    }),
  
  checkFirstLogin: () =>
    apiFetch<{ needsPasswordChange: boolean; onboardingComplete: boolean }>('/api/auth/first-login-check'),
};

// Clinician API
export const ClinicianAPI = {
  // Profile
  getProfile: (hospitalId: string, clinicianId: string) =>
    apiFetch<ClinicianProfile>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}`),
  
  updateProfile: (hospitalId: string, clinicianId: string, data: Partial<ClinicianProfile>) =>
    apiFetch<ClinicianProfile>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}`, {
      method: 'PATCH',
      json: data,
    }),
  
  uploadDocument: (hospitalId: string, clinicianId: string, file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    return apiFetch<{ id: string; fileName: string }>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },
  
  // Appointments
  getAppointments: (hospitalId: string, clinicianId: string, filters?: { status?: string | null; start?: string | null; end?: string | null }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.start) params.set('start', filters.start);
    if (filters?.end) params.set('end', filters.end);
    const query = params.toString();
    return apiFetch<Appointment[]>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/appointments${query ? `?${query}` : ''}`);
  },
  
  updateAppointmentStatus: (hospitalId: string, appointmentId: string, status: string) =>
    apiFetch<Appointment>(`/api/hospitals/${hospitalId}/appointments/${appointmentId}`, {
      method: 'PATCH',
      json: { status },
    }),
  
  // Earnings
  getEarnings: (hospitalId: string, clinicianId: string, dateRange?: { start?: string | null; end?: string | null }) => {
    const params = new URLSearchParams();
    if (dateRange?.start) params.set('start', dateRange.start);
    if (dateRange?.end) params.set('end', dateRange.end);
    const query = params.toString();
    return apiFetch<EarningsSummary>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/earnings${query ? `?${query}` : ''}`);
  },
  
  // Schedule
  getSchedule: (hospitalId: string, clinicianId: string, week?: string) => {
    const params = new URLSearchParams();
    if (week) params.set('week', week);
    const query = params.toString();
    return apiFetch<WeeklySchedule>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule${query ? `?${query}` : ''}`);
  },
  
  // Availability
  updateAvailability: (hospitalId: string, clinicianId: string, availability: AvailabilityPreferences) =>
    apiFetch<AvailabilityPreferences>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/availability`, {
      method: 'PATCH',
      json: availability,
    }),
  
  // Onboarding
  completeOnboarding: (hospitalId: string, clinicianId: string) =>
    apiFetch<{ ok: true }>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/complete-onboarding`, {
      method: 'POST',
    }),
  
  // Patients (permission-based)
  getPatients: (hospitalId: string, filters?: { search?: string | null }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return apiFetch<Patient[]>(`/api/hospitals/${hospitalId}/patients${query ? `?${query}` : ''}`);
  },
  
  getPatientHealthRecords: (hospitalId: string, patientId: string) =>
    apiFetch<PatientHealthRecords>(`/api/hospitals/${hospitalId}/patients/${patientId}/health-records`),
};

