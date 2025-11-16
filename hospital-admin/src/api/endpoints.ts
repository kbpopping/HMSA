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
  date_of_birth?: string;
  created_at: string;
};

export type Clinician = {
  id: number;
  name: string;
  specialty?: string | string[]; // Can be a single specialty (string) or multiple specialties (string[])
  email?: string;
  phone?: string;
  role?: string; // Staff role/category (e.g., "Clinician", "Nurse", "Support Staff", etc.)
  created_at: string;
  // Extended fields for staff profile
  marital_status?: string;
  next_of_kin?: {
    name?: string;
    relationship?: string;
  };
  home_address?: string;
  qualifications?: string;
  date_joined?: string; // Date when staff joined the hospital
  profile_picture?: string; // Base64 data URL or image URL
  // Invite and password management
  password_set?: boolean; // Whether password has been set for this staff member
  needs_invite?: boolean; // Whether staff member needs to be invited
};

export type StaffEmploymentFinancial = {
  bankAccount: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  salaryAndBenefits: {
    baseSalary: string; // e.g., "$250,000 / Annum"
    healthcareBenefits: string;
    bonusStructure: string;
    retirementPlan: string;
    netSalary?: string; // Net salary after tax deductions
    taxDeductions?: string; // Tax deductions breakdown
  };
  promotions: Array<{
    title: string;
    date: string; // Date string in format "Month Day, Year"
  }>;
};

export type StaffMedicalInfo = {
  conditions: string; // e.g., "None Declared"
  allergies: string; // e.g., "Penicillin (Anaphylaxis)"
  emergencyContact: {
    name: string;
    relationship: string;
    contact: string;
  };
  immunizations: Array<{
    name: string;
    status: string; // e.g., "Completed" or "Last dose: Oct 2023"
  }>;
  assessments: Array<{
    title: string;
    completedDate: string; // e.g., "March 15, 2024"
    status: 'Cleared' | 'Pass' | 'Negative' | 'Pending';
  }>;
};

export type AssignedPatient = {
  id: number;
  name: string;
  mrn: string;
  lastAppointment: string; // Date string
};

export type ActivityReport = {
  consultations: string; // e.g., "42 consultations this week."
  proceduresPerformed: string; // e.g., "5 cardiac catheterizations, 2 angioplasties."
  keyObservations: string; // e.g., "Noted an unusual trend..."
  weekly?: {
    consultations: string;
    proceduresPerformed: string;
    keyObservations: string;
  };
  monthly?: {
    consultations: string;
    proceduresPerformed: string;
    keyObservations: string;
  };
};

export type StaffPatientsReports = {
  assignedPatients: AssignedPatient[];
  activityReport: ActivityReport;
  totalPatientsAttended: number;
  dateJoined: string; // For "Since" date calculation
  summary: {
    name: string;
    specialty: string;
    description: string;
  };
};

export type StaffReports = {
  reports: Array<{
    id: number;
    title: string;
    type: string;
    date: string;
    description: string;
  }>;
  weeklySummary?: {
    tasksCompleted: number;
    tasksCompletedLabel: string; // e.g., "150 tasks completed this week"
    keyMetrics: string; // e.g., "Average response time: 2.5 minutes"
    highlights: string; // e.g., "Improved efficiency by 15%"
  };
  summary: {
    name: string;
    role: string;
    description: string;
  };
};

export type AllPatientsData = {
  patients: Array<{
    id: number;
    name: string;
    mrn: string;
    lastAppointment: string;
    totalAppointments: number;
    firstAppointment: string;
  }>;
  totalCount: number;
  staffInfo: {
    name: string;
    role: string;
    specialty?: string;
  };
};

export type StaffDocument = {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // MIME type
  documentType: string; // e.g., 'certificate', 'license', 'contract', 'id', 'other'
  uploadedAt: string;
  uploadedBy?: string;
  description?: string;
};

export type StaffDocumentsData = {
  documents: StaffDocument[];
  totalSize: number; // Total size of all documents in bytes
};

// Comprehensive staff update data type for the wizard
export type StaffUpdateData = {
  // Step 1: Overview (Personal & Professional Information)
  overview: {
    name: string;
    email?: string;
    phone?: string;
    marital_status?: string;
    next_of_kin_name?: string;
    next_of_kin_relationship?: string;
    home_address?: string;
    qualifications?: string;
    date_joined?: string;
    specialty?: string;
    profile_picture?: File | string; // File for upload or existing URL
  };
  // Step 2: Employment/Financial
  employment: {
    bankAccount: {
      bankName?: string;
      accountNumber?: string;
      routingNumber?: string;
    };
    salaryAndBenefits: {
      baseSalary?: string;
      healthcareBenefits?: string;
      bonusStructure?: string;
      retirementPlan?: string;
    };
    promotions?: Array<{
      title: string;
      date: string;
    }>;
  };
  // Step 3: Medical Info
  medical: {
    conditions?: string;
    allergies?: string;
    emergencyContact: {
      name?: string;
      relationship?: string;
      contact?: string;
    };
    immunizations?: Array<{
      name: string;
      status: string;
    }>;
    assessments?: Array<{
      title: string;
      completedDate: string;
      status: 'Cleared' | 'Pass' | 'Negative' | 'Pending';
    }>;
  };
  // Step 4: Patients/Reports (for clinicians/nurses only)
  patientsReports?: {
    assignedPatients?: Array<{
      id: number;
      name: string;
      mrn: string;
      lastAppointment: string;
    }>;
    activityReport?: {
      consultations?: string;
      proceduresPerformed?: string;
      keyObservations?: string;
    };
  };
  // Step 5: Documents
  documents?: Array<{
    file: File;
    documentType: string;
    description?: string;
  }>;
};

export type StaffUpdateDraft = {
  staffId: string;
  hospitalId: string;
  currentStep: number;
  data: Partial<StaffUpdateData>;
  lastSaved: string;
};

export type StaffRole = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  staffCount: number;
  created_at: string;
};

export type Appointment = {
  id: number;
  appointment_number?: string; // Unique appointment number (e.g., "#12345")
  patient_id: number;
  patient_name: string;
  patient_mrn?: string;
  clinician_id: number; // Keep for backward compatibility
  clinician_name: string; // Keep for backward compatibility
  clinician_ids?: number[]; // Support multiple clinicians
  clinician_names?: string[]; // Support multiple clinicians
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  created_at: string;
};

export type Template = {
  id: number;
  name: string;
  channel: 'email' | 'sms' | 'voice';
  subject?: string;
  body_text: string;
  is_active: boolean;
  updated_at: string;
  created_at: string;
};

export type OutboundQueueItem = {
  id: number;
  appointment_id: number;
  appointment_number?: string; // Appointment number (e.g., "#12345")
  patient_name?: string; // Patient name for display
  clinician_name?: string; // Clinician name for display
  channel: 'email' | 'sms' | 'voice';
  provider: string;
  status: 'queued' | 'sent' | 'failed';
  attempts: number;
  next_retry?: string;
  created_at: string;
};

export type Notification = {
  id: number;
  appointment_id?: number;
  appointment_number?: string; // Appointment number (e.g., "#12345")
  patient_name?: string; // Patient name for display
  clinician_name?: string; // Clinician name for display
  channel: 'email' | 'sms' | 'voice';
  provider: string;
  status: 'queued' | 'sent' | 'failed';
  attempts?: number; // Number of attempts
  next_retry?: string; // Next retry time
  created_at: string;
};

export type BillingData = {
  overview?: {
    totalEarnings: number;
    totalRevenue: number;
    accountsReceivable: number;
    revenueChart: Array<{ date: string; amount: number }>;
    topContributors: Array<{ name: string; amount: number }>;
  };
  accountsPayable?: Array<{
    id: number;
    vendor: string;
    description: string;
    amount: number;
    status: 'pending' | 'paid';
    category: string;
    due_date: string;
  }>;
  accountsReceivable?: Array<{
    id: number;
    patient_name: string;
    invoice_number: string;
    service_rendered: string;
    amount_due: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'collection';
  }>;
  payroll?: Array<{
    id: number;
    name: string;
    role: string;
    department: string;
    salary: number;
    benefits?: string[];
    pay_frequency?: string;
    last_paid_date?: string;
  }>;
  taxes?: {
    incomeTax: number;
    payrollTax: number;
    propertyTax: number;
  };
  financialReports?: {
    availableReports: Array<{
      id: string;
      name: string;
      period: string;
      generatedDate?: string;
      size?: string;
    }>;
  };
};

export type PatientBill = {
  id: number;
  invoice_number: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'overdue' | 'paid';
  service?: string;
};

export type PatientPayment = {
  id: number;
  date: string;
  service: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  invoice_number: string;
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

// Hospital Admin API
export const HospitalAPI = {
  me: (id?: string) =>
    apiFetch<Hospital>(
      `/api/hospitals/me${id ? `?id=${id}` : ''}`
    ),
  
  updateHospital: (
    hospitalId: string,
    payload: {
      name?: string;
      country?: string;
      timezone?: string;
    }
  ) =>
    apiFetch<{ ok: true }>(`/api/hospitals/${hospitalId}`, {
      method: 'PUT',
      json: payload,
    }),
  
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
  
  getPatient: (hospitalId: string, patientId: string) =>
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
    }>(
      `/api/hospitals/${hospitalId}/patients/${patientId}`
    ),
  
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
  
  updatePatient: (
    hospitalId: string,
    patientId: string,
    payload: Partial<Patient> & { 
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
    }
  ) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/patients/${patientId}`,
      { method: 'PUT', json: payload }
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
      role?: string;
    }
  ) =>
    apiFetch<{ id: number }>(`/api/hospitals/${hospitalId}/clinicians`, {
      method: 'POST',
      json: payload,
    }),
  
  updateClinician: (
    hospitalId: string,
    clinicianId: string,
    payload: {
      name?: string;
      specialty?: string;
      email?: string;
      phone?: string;
      role?: string;
      marital_status?: string;
      next_of_kin?: {
        name?: string;
        relationship?: string;
      };
      home_address?: string;
      qualifications?: string;
      date_joined?: string;
      profile_picture?: string;
    }
  ) =>
    apiFetch<{ ok: true }>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}`, {
      method: 'PUT',
      json: payload,
    }),

  deleteClinician: (hospitalId: string, clinicianId: string) =>
    apiFetch<{ ok: true }>(`/api/hospitals/${hospitalId}/clinicians/${clinicianId}`, {
      method: 'DELETE',
    }),

  uploadStaffProfilePicture: (hospitalId: string, staffId: string, file: File) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return apiFetch<{ ok: true; profile_picture: string }>(
      `/api/hospitals/${hospitalId}/clinicians/${staffId}/profile-picture`,
      {
        method: 'POST',
        body: formData,
        headers: {},
      }
    );
  },
  
  // Staff Roles Management
  listStaffRoles: (hospitalId: string) =>
    apiFetch<StaffRole[]>(`/api/hospitals/${hospitalId}/staff-roles`),
  
  createStaffRole: (
    hospitalId: string,
    payload: {
      name: string;
      description: string;
      permissions: string[];
    }
  ) =>
    apiFetch<{ id: string }>(`/api/hospitals/${hospitalId}/staff-roles`, {
      method: 'POST',
      json: payload,
    }),
  
  updateStaffRole: (
    hospitalId: string,
    roleId: string,
    payload: {
      name?: string;
      description?: string;
      permissions?: string[];
    }
  ) =>
    apiFetch<{ ok: true }>(`/api/hospitals/${hospitalId}/staff-roles/${roleId}`, {
      method: 'PUT',
      json: payload,
    }),
  
  deleteStaffRole: (hospitalId: string, roleId: string) =>
    apiFetch<{ ok: true }>(`/api/hospitals/${hospitalId}/staff-roles/${roleId}`, {
      method: 'DELETE',
    }),
  
  listAppointments: (
    hospitalId: string,
    params?: {
      status?: string;
      clinicianId?: string;
      start?: string;
      end?: string;
    }
  ) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.clinicianId) query.set('clinicianId', params.clinicianId);
    if (params?.start) query.set('start', params.start);
    if (params?.end) query.set('end', params.end);
    const queryString = query.toString();
    return apiFetch<Appointment[]>(
      `/api/hospitals/${hospitalId}/appointments${queryString ? `?${queryString}` : ''}`
    );
  },
  
  createAppointment: (
    hospitalId: string,
    payload: {
      patient_id: number;
      clinician_id?: number; // Keep for backward compatibility
      clinician_ids?: number[]; // Support multiple clinicians
      appointment_date: string;
      appointment_time: string;
      reason?: string;
    }
  ) =>
    apiFetch<{ id: number }>(`/api/hospitals/${hospitalId}/appointments`, {
      method: 'POST',
      json: payload,
    }),
  
  updateAppointment: (
    hospitalId: string,
    appointmentId: string,
    payload: {
      status?: Appointment['status'];
      appointment_date?: string;
      appointment_time?: string;
      reason?: string;
    }
  ) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/appointments/${appointmentId}`,
      { method: 'PUT', json: payload }
    ),
  
  listTemplates: (hospitalId: string) =>
    apiFetch<Template[]>(`/api/hospitals/${hospitalId}/templates`),
  
  createTemplate: (
    hospitalId: string,
    payload: {
      name: string;
      channel: 'email' | 'sms' | 'voice';
      subject?: string;
      body_text: string;
      is_active?: boolean;
    }
  ) =>
    apiFetch<{ id: number }>(`/api/hospitals/${hospitalId}/templates`, {
      method: 'POST',
      json: payload,
    }),
  
  updateTemplate: (
    hospitalId: string,
    templateId: string,
    payload: Partial<Template>
  ) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/templates/${templateId}`,
      { method: 'PUT', json: payload }
    ),
  
  deleteTemplate: (hospitalId: string, templateId: string) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/templates/${templateId}`,
      { method: 'DELETE' }
    ),

  // Staff Password and Invite Management
  setStaffPassword: (
    hospitalId: string,
    staffId: string,
    payload: {
      password: string;
    }
  ) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/clinicians/${staffId}/password`,
      { method: 'POST', json: payload }
    ),

  sendStaffInvite: (
    hospitalId: string,
    staffId: string,
    payload: {
      templateId: string;
      password?: string; // Optional password to include in invite
    }
  ) =>
    apiFetch<{ ok: true; message: string }>(
      `/api/hospitals/${hospitalId}/clinicians/${staffId}/invite`,
      { method: 'POST', json: payload }
    ),
  
  listOutboundQueue: (hospitalId: string) =>
    apiFetch<OutboundQueueItem[]>(`/api/hospitals/${hospitalId}/outbound-queue`),
  
  listNotifications: (
    hospitalId: string,
    params?: {
      status?: string;
      provider?: string;
      channel?: string;
      start?: string;
      end?: string;
    }
  ) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.provider) query.set('provider', params.provider);
    if (params?.channel) query.set('channel', params.channel);
    if (params?.start) query.set('start', params.start);
    if (params?.end) query.set('end', params.end);
    const queryString = query.toString();
    return apiFetch<Notification[]>(
      `/api/hospitals/${hospitalId}/notifications${queryString ? `?${queryString}` : ''}`
    );
  },
  
  metrics: (hospitalId: string, start?: string, end?: string) => {
    const query = new URLSearchParams();
    if (start) query.set('start', start);
    if (end) query.set('end', end);
    const queryString = query.toString();
    return apiFetch<{
      range: { start: string; end: string };
      totalAppointments: number;
      appointmentsToday: number;
      noShowsThisWeek: number;
      remindersSentToday: number;
      optOutRate: number;
      byStatus: Array<{ status: string; count: number }>;
      sevenDayTrend?: Array<{ day: string; value: number }>;
      notifBreakdown: Array<any>;
      upcomingAppointments: Array<{
        id: number;
        patient_name: string;
        appointment_time: string;
        clinician_name: string;
      }>;
      templateCoverage: {
        email: number;
        sms: number;
        voice: number;
        overall?: number;
      };
    }>(`/api/hospitals/${hospitalId}/metrics${queryString ? `?${queryString}` : ''}`);
  },
  
  getBillings: (hospitalId: string, tab: string = 'overview', period: string = 'monthly') =>
    apiFetch<BillingData>(
      `/api/hospitals/${hospitalId}/billings?tab=${tab}&period=${period}`
    ),
  
  getPatientBilling: (hospitalId: string, patientId: string) =>
    apiFetch<{
      outstandingBills: PatientBill[];
      paymentHistory: PatientPayment[];
    }>(`/api/hospitals/${hospitalId}/patients/${patientId}/billing`),
  
  markBillAsPaid: (hospitalId: string, patientId: string, billId: number) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/patients/${patientId}/billing/${billId}/mark-paid`,
      { method: 'POST' }
    ),
  
  sendBillReminder: (hospitalId: string, patientId: string, billId: number) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/patients/${patientId}/billing/${billId}/send-reminder`,
      { method: 'POST' }
    ),

  createTransaction: (
    hospitalId: string,
    patientId: string,
    payload: {
      service: string;
      amount: number;
      date: string;
      status: 'paid' | 'pending' | 'refunded';
      invoice_number: string;
    }
  ) =>
    apiFetch<{ ok: true; payment: PatientPayment }>(
      `/api/hospitals/${hospitalId}/patients/${patientId}/billing/transactions`,
      { method: 'POST', json: payload }
    ),

  // Health Records
  getHealthRecords: (hospitalId: string, patientId: string) =>
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
    }>(`/api/hospitals/${hospitalId}/patients/${patientId}/health-records`),

  uploadHealthDocument: (hospitalId: string, patientId: string, file: File, documentType?: string) => {
    const formData = new FormData();
    formData.append('document', file);
    if (documentType) {
      formData.append('document_type', documentType);
    }
    return apiFetch<{ ok: true; document: any; message: string }>(
      `/api/hospitals/${hospitalId}/patients/${patientId}/health-records/upload`,
      {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
        headers: {},
      }
    );
  },

  downloadHealthReport: (hospitalId: string, patientId: string) => {
    // Use apiFetch to go through mock routing
    return apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/patients/${patientId}/health-records/download`,
      { method: 'GET' }
    );
  },

  // Staff Employment/Financial
  getStaffEmploymentFinancial: (hospitalId: string, staffId: string) =>
    apiFetch<StaffEmploymentFinancial>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/employment-financial`
    ),

  // Staff Medical Info
  getStaffMedicalInfo: (hospitalId: string, staffId: string) =>
    apiFetch<StaffMedicalInfo>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/medical-info`
    ),

  // Verify password for medical info access (mock)
  verifyMedicalInfoPassword: (hospitalId: string, password: string) =>
    apiFetch<{ ok: true; token: string }>(
      `/api/hospitals/${hospitalId}/staff/medical-info/verify-password`,
      { method: 'POST', json: { password } }
    ),

  // Staff Patients/Reports (for clinicians and nurses)
  getStaffPatientsReports: (hospitalId: string, staffId: string) =>
    apiFetch<StaffPatientsReports>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/patients-reports`
    ),

  // Staff Reports (for non-clinicians)
  getStaffReports: (hospitalId: string, staffId: string) =>
    apiFetch<StaffReports>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/reports`
    ),

  // Staff Patients/Reports with timeframe
  getStaffPatientsReportsWithTimeframe: (hospitalId: string, staffId: string, timeframe: 'weekly' | 'monthly') =>
    apiFetch<StaffPatientsReports>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/patients-reports?timeframe=${timeframe}`
    ),

  // Get all patients for a staff member
  getAllStaffPatients: (hospitalId: string, staffId: string) =>
    apiFetch<AllPatientsData>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/all-patients`
    ),

  // Staff Documents
  getStaffDocuments: (hospitalId: string, staffId: string) =>
    apiFetch<StaffDocumentsData>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/documents`
    ),

  uploadStaffDocument: (hospitalId: string, staffId: string, file: File, documentType?: string, description?: string) => {
    const formData = new FormData();
    formData.append('document', file);
    if (documentType) {
      formData.append('document_type', documentType);
    }
    if (description) {
      formData.append('description', description);
    }
    return apiFetch<{ ok: true; document: StaffDocument }>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/documents`,
      {
        method: 'POST',
        body: formData,
        headers: {}, // Don't set Content-Type header, let browser set it with boundary
      }
    );
  },

  downloadStaffDocument: (hospitalId: string, staffId: string, documentId: string) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/documents/${documentId}/download`,
      { method: 'GET' }
    ),

  deleteStaffDocument: (hospitalId: string, staffId: string, documentId: string) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/documents/${documentId}`,
      { method: 'DELETE' }
    ),

  // Staff Update Wizard
  saveStaffUpdateDraft: (hospitalId: string, staffId: string, draft: Partial<StaffUpdateData>, currentStep: number) =>
    apiFetch<{ ok: true; draft: StaffUpdateDraft }>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/update-draft`,
      { method: 'POST', json: { draft, currentStep } }
    ),

  getStaffUpdateDraft: (hospitalId: string, staffId: string) =>
    apiFetch<StaffUpdateDraft | null>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/update-draft`
    ),

  clearStaffUpdateDraft: (hospitalId: string, staffId: string) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/update-draft`,
      { method: 'DELETE' }
    ),

  submitStaffUpdate: (hospitalId: string, staffId: string, data: StaffUpdateData) =>
    apiFetch<{ ok: true }>(
      `/api/hospitals/${hospitalId}/staff/${staffId}/update-complete`,
      { method: 'POST', json: data }
    ),
};

