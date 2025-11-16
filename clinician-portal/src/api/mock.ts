import type { 
  User, 
  ClinicianProfile, 
  Appointment, 
  EarningsSummary,
  EarningRecord,
  WeeklySchedule,
  ScheduleSlot,
  AvailabilityPreferences,
  Patient,
  PatientHealthRecords,
  HealthRecord,
  HealthRecordDocument,
} from './endpoints';

// Mock user session storage
let currentUser: User | null = null;
let needsPasswordChange = true; // Force password change on first login
let onboardingComplete = false;

// Mock clinician profile
const mockClinicianProfile: ClinicianProfile = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@hospital.com',
  phone: '+1 (555) 123-4567',
  role: 'clinician',
  specialty: ['Cardiology', 'Internal Medicine'],
  profile_picture: '',
  marital_status: 'Married',
  home_address: '123 Medical Plaza, New York, NY 10001',
  qualifications: 'MD, Board Certified in Cardiology',
  date_joined: '2020-01-15',
  next_of_kin: {
    name: 'John Johnson',
    relationship: 'Spouse',
    contact_number: '+1 (555) 987-6543',
  },
  hospital_id: '1',
  permissions: ['Patient Management', 'Appointments', 'Medical Records'],
  onboarding_complete: false,
};

// Mock appointments
const mockAppointments: Appointment[] = [
  {
    id: 1,
    appointment_number: '#APT-001',
    patient_id: 101,
    patient_name: 'John Doe',
    patient_mrn: 'MRN-2024-001',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00 AM',
    status: 'scheduled',
    reason: 'Annual checkup',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    appointment_number: '#APT-002',
    patient_id: 102,
    patient_name: 'Jane Smith',
    patient_mrn: 'MRN-2024-002',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:30 AM',
    status: 'confirmed',
    reason: 'Follow-up consultation',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    appointment_number: '#APT-003',
    patient_id: 103,
    patient_name: 'Robert Brown',
    patient_mrn: 'MRN-2024-003',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '02:00 PM',
    status: 'scheduled',
    reason: 'Cardiac evaluation',
    created_at: new Date().toISOString(),
  },
];

// Mock earnings
const mockEarnings: EarningRecord[] = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    service: 'Consultation',
    patient_name: 'John Doe',
    amount: 250,
    status: 'paid',
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    service: 'Follow-up',
    patient_name: 'Jane Smith',
    amount: 150,
    status: 'paid',
  },
  {
    id: 3,
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    service: 'Procedure',
    patient_name: 'Robert Brown',
    amount: 500,
    status: 'paid',
  },
];

// Mock patients
const mockPatients: Patient[] = [
  {
    id: 101,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 111-2222',
    mrn: 'MRN-2024-001',
    date_of_birth: '1980-05-15',
    last_appointment: new Date().toISOString().split('T')[0],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 102,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@email.com',
    phone: '+1 (555) 333-4444',
    mrn: 'MRN-2024-002',
    date_of_birth: '1975-08-20',
    last_appointment: new Date().toISOString().split('T')[0],
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 103,
    first_name: 'Robert',
    last_name: 'Brown',
    email: 'robert.brown@email.com',
    phone: '+1 (555) 555-6666',
    mrn: 'MRN-2024-003',
    date_of_birth: '1985-12-10',
    last_appointment: new Date().toISOString().split('T')[0],
    created_at: '2024-01-10T00:00:00Z',
  },
];

// Mock health records
const mockHealthRecords: Record<number, PatientHealthRecords> = {
  101: {
    medicalHistory: [
      {
        id: 1,
        record_date: '2024-01-15',
        title: 'Annual Physical Examination',
        description: 'Patient in good health. Blood pressure normal, cholesterol levels within range.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 2,
        record_date: '2023-06-20',
        title: 'Flu Vaccination',
        description: 'Administered annual flu vaccine. No adverse reactions.',
        clinician_name: 'Dr. Sarah Johnson',
      },
    ],
    documents: [
      {
        id: '1',
        file_name: 'lab_results_2024.pdf',
        document_type: 'Lab Results',
        status: 'processed',
        ai_processed: true,
        created_at: '2024-01-15T10:00:00Z',
      },
    ],
  },
};

export const MockAPI = {
  auth: {
    login: async (email: string, password: string) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Mock successful login for any clinician email
      if (email.includes('@') && password.length >= 4) {
        currentUser = {
          id: '1',
          name: 'Dr. Sarah Johnson',
          email,
          role: 'clinician',
          hospital_id: '1',
          profile_picture: '',
          needsPasswordChange,
          onboardingComplete,
          permissions: ['Patient Management', 'Appointments', 'Medical Records'],
        };
        
        return {
          ok: true as const,
          role: 'clinician' as const,
          hospital_id: '1',
          user: currentUser,
        };
      }
      
      throw new Error('Invalid email or password');
    },
    
    logout: async () => {
      currentUser = null;
      return { ok: true as const };
    },
    
    refresh: async () => {
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      return { ok: true as const };
    },
    
    changePassword: async (oldPassword: string, newPassword: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!oldPassword || !newPassword) {
        throw new Error('Both old and new passwords are required');
      }
      
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Mark password as changed
      needsPasswordChange = false;
      if (currentUser) {
        currentUser.needsPasswordChange = false;
      }
      
      return { ok: true as const };
    },
    
    checkFirstLogin: async () => {
      return {
        needsPasswordChange,
        onboardingComplete,
      };
    },
  },
  
  clinician: {
    getProfile: async (hospitalId: string, clinicianId: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockClinicianProfile, onboarding_complete: onboardingComplete };
    },
    
    updateProfile: async (hospitalId: string, clinicianId: string, data: Partial<ClinicianProfile>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      Object.assign(mockClinicianProfile, data);
      return mockClinicianProfile;
    },
    
    uploadDocument: async (hospitalId: string, clinicianId: string, file: File) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: `doc-${Date.now()}`,
        fileName: file.name,
      };
    },
    
    getAppointments: async (hospitalId: string, clinicianId: string, filters?: { status?: string | null; start?: string | null; end?: string | null }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filtered = [...mockAppointments];
      
      if (filters?.status) {
        filtered = filtered.filter(apt => apt.status === filters.status);
      }
      
      return filtered;
    },
    
    updateAppointmentStatus: async (hospitalId: string, appointmentId: string, status: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const appointment = mockAppointments.find(apt => apt.id === Number(appointmentId));
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      appointment.status = status as any;
      return appointment;
    },
    
    getEarnings: async (hospitalId: string, clinicianId: string, dateRange?: { start?: string | null; end?: string | null }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentMonth = mockEarnings.reduce((sum, record) => sum + record.amount, 0);
      const thisWeek = mockEarnings.slice(0, 2).reduce((sum, record) => sum + record.amount, 0);
      const lastMonth = 8500;
      
      const chart = mockEarnings.map(record => ({
        date: record.date,
        amount: record.amount,
      }));
      
      const summary: EarningsSummary = {
        currentMonth,
        thisWeek,
        lastMonth,
        records: mockEarnings,
        chart,
      };
      
      return summary;
    },
    
    getSchedule: async (hospitalId: string, clinicianId: string, week?: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const today = new Date();
      const slots: ScheduleSlot[] = mockAppointments.map(apt => ({
        id: `slot-${apt.id}`,
        date: apt.appointment_date,
        startTime: apt.appointment_time,
        endTime: '', // Would be calculated
        appointment: apt,
        type: 'appointment' as const,
      }));
      
      const schedule: WeeklySchedule = {
        week: week || `${today.getFullYear()}-W${Math.ceil(today.getDate() / 7)}`,
        slots,
      };
      
      return schedule;
    },
    
    updateAvailability: async (hospitalId: string, clinicianId: string, availability: AvailabilityPreferences) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return availability;
    },
    
    completeOnboarding: async (hospitalId: string, clinicianId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      onboardingComplete = true;
      mockClinicianProfile.onboarding_complete = true;
      if (currentUser) {
        currentUser.onboardingComplete = true;
      }
      return { ok: true as const };
    },
    
    getPatients: async (hospitalId: string, filters?: { search?: string | null }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filtered = [...mockPatients];
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(patient => 
          patient.first_name.toLowerCase().includes(search) ||
          patient.last_name.toLowerCase().includes(search) ||
          patient.mrn.toLowerCase().includes(search) ||
          patient.email?.toLowerCase().includes(search)
        );
      }
      
      return filtered;
    },
    
    getPatientHealthRecords: async (hospitalId: string, patientId: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const records = mockHealthRecords[Number(patientId)] || {
        medicalHistory: [],
        documents: [],
      };
      
      return records;
    },
  },
};

