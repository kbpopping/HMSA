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

export type ScheduleType = 
  | 'appointment' 
  | 'surgery' 
  | 'task' 
  | 'administrative' 
  | 'meeting' 
  | 'training' 
  | 'consultation' 
  | 'on-call' 
  | 'break' 
  | 'other';

export type ScheduleStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'accepted' 
  | 'completed' 
  | 'cancelled';

export type ScheduleItem = {
  id: number;
  title: string;
  description?: string;
  type: ScheduleType;
  status: ScheduleStatus;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  assignedBy?: string; // Hospital admin who assigned it
  assignedById?: number;
  patientId?: number;
  patientName?: string;
  room?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  created_at: string;
  updated_at?: string;
  requiresApproval?: boolean; // If assigned by admin, needs approval
};

export type ScheduleSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointment?: Appointment;
  schedule?: ScheduleItem;
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
  
  createAppointment: (hospitalId: string, data: {
    patient_id: number;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
    room?: string;
  }) =>
    apiFetch<Appointment>(`/api/hospitals/${hospitalId}/appointments`, {
      method: 'POST',
      json: data,
    }),
  
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
  getSchedule: (hospitalId: string, clinicianId: string, filters?: { 
    start?: string | null; 
    end?: string | null; 
    type?: string | null;
    status?: string | null;
  }) => {
    const params = new URLSearchParams();
    if (filters?.start) params.set('start', filters.start);
    if (filters?.end) params.set('end', filters.end);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    const query = params.toString();
    return apiFetch<ScheduleItem[]>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule${query ? `?${query}` : ''}`);
  },
  
  createSchedule: (hospitalId: string, clinicianId: string, data: {
    title: string;
    description?: string;
    type: ScheduleType;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    room?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
  }) =>
    apiFetch<ScheduleItem>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule`, {
      method: 'POST',
      json: data,
    }),
  
  updateSchedule: (hospitalId: string, clinicianId: string, scheduleId: string, data: Partial<ScheduleItem>) =>
    apiFetch<ScheduleItem>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule/${scheduleId}`, {
      method: 'PATCH',
      json: data,
    }),
  
  approveSchedule: (hospitalId: string, clinicianId: string, scheduleId: string) =>
    apiFetch<ScheduleItem>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule/${scheduleId}/approve`, {
      method: 'POST',
    }),
  
  rejectSchedule: (hospitalId: string, clinicianId: string, scheduleId: string, reason?: string) =>
    apiFetch<ScheduleItem>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule/${scheduleId}/reject`, {
      method: 'POST',
      json: { reason },
    }),
  
  acceptSchedule: (hospitalId: string, clinicianId: string, scheduleId: string) =>
    apiFetch<ScheduleItem>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule/${scheduleId}/accept`, {
      method: 'POST',
    }),
  
  completeSchedule: (hospitalId: string, clinicianId: string, scheduleId: string) =>
    apiFetch<ScheduleItem>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/schedule/${scheduleId}/complete`, {
      method: 'POST',
    }),
  
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
  
  // Patients (permission-based) - Only assigned patients
  getAssignedPatients: (hospitalId: string, clinicianId: string, filters?: { search?: string | null }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return apiFetch<Patient[]>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients${query ? `?${query}` : ''}`);
  },

  searchPatient: (hospitalId: string, clinicianId: string, query: string) =>
    apiFetch<Patient | null>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients/search?q=${encodeURIComponent(query)}`),

  getPatient: (hospitalId: string, clinicianId: string, patientId: string) =>
    apiFetch<Patient & { 
      contact_preferences?: any; 
      notes?: string;
      gender?: string;
      street_address?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      blood_type?: string;
      next_of_kin?: {
        name?: string;
        relationship?: string;
        contact_number?: string;
      };
      assigned_clinician_id?: number;
    }>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients/${patientId}`),

  getPatientAppointments: (hospitalId: string, clinicianId: string, patientId: string) =>
    apiFetch<Appointment[]>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients/${patientId}/appointments`),

  // Health Records
  getHealthRecords: (hospitalId: string, clinicianId: string, patientId: string) =>
    apiFetch<{
      medicalHistory: Array<{
        id: string;
        record_type: string;
        title: string;
        description?: string;
        clinician_name?: string;
        record_date: string;
        metadata?: any;
        created_at: string;
      }>;
      documents: Array<{
        id: string;
        file_name: string;
        file_size: number;
        mime_type: string;
        document_type?: string;
        ai_processed: boolean;
        status: string;
        created_at: string;
      }>;
    }>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients/${patientId}/health-records`),

  uploadHealthDocument: (hospitalId: string, clinicianId: string, patientId: string, file: File, documentType?: string) => {
    const formData = new FormData();
    formData.append('document', file);
    if (documentType) {
      formData.append('document_type', documentType);
    }
    return apiFetch<{ ok: true; document: any; message: string }>(
      `/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients/${patientId}/health-records/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {},
      }
    );
  },

  addMedicalHistory: (hospitalId: string, clinicianId: string, patientId: string, data: {
    title: string;
    description?: string;
    record_type?: string;
    record_date?: string;
  }) =>
    apiFetch<{ ok: true; record: any }>(
      `/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients/${patientId}/health-records/history`,
      {
        method: 'POST',
        json: data,
      }
    ),

  updatePatientNotes: (hospitalId: string, clinicianId: string, patientId: string, notes: string) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/clinicians/${clinicianId}/patients/${patientId}/notes`,
      {
        method: 'PATCH',
        json: { notes },
      }
    ),
};

