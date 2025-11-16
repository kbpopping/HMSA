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
  ScheduleItem,
  ScheduleType,
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

// Mock appointments - Expanded with past and future appointments
const mockAppointments: Appointment[] = [
  // Today's appointments
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
  // Past appointments
  {
    id: 4,
    appointment_number: '#APT-004',
    patient_id: 101,
    patient_name: 'John Doe',
    patient_mrn: 'MRN-2024-001',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointment_time: '11:00 AM',
    status: 'completed',
    reason: 'Routine checkup',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    appointment_number: '#APT-005',
    patient_id: 104,
    patient_name: 'Emily Davis',
    patient_mrn: 'MRN-2024-004',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointment_time: '03:00 PM',
    status: 'completed',
    reason: 'General consultation',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    appointment_number: '#APT-006',
    patient_id: 105,
    patient_name: 'Michael Wilson',
    patient_mrn: 'MRN-2024-005',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointment_time: '10:00 AM',
    status: 'completed',
    reason: 'Blood pressure monitoring',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Future appointments
  {
    id: 7,
    appointment_number: '#APT-007',
    patient_id: 104,
    patient_name: 'Emily Davis',
    patient_mrn: 'MRN-2024-004',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointment_time: '09:30 AM',
    status: 'confirmed',
    reason: 'Follow-up appointment',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    appointment_number: '#APT-008',
    patient_id: 106,
    patient_name: 'Sarah Anderson',
    patient_mrn: 'MRN-2024-006',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointment_time: '11:00 AM',
    status: 'scheduled',
    reason: 'Annual physical examination',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    appointment_number: '#APT-009',
    patient_id: 102,
    patient_name: 'Jane Smith',
    patient_mrn: 'MRN-2024-002',
    clinician_id: 1,
    clinician_name: 'Dr. Sarah Johnson',
    appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointment_time: '02:30 PM',
    status: 'scheduled',
    reason: 'Medication review',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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

// Mock patients - Expanded with more data
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
  {
    id: 104,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 777-8888',
    mrn: 'MRN-2024-004',
    date_of_birth: '1990-03-25',
    last_appointment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 105,
    first_name: 'Michael',
    last_name: 'Wilson',
    email: 'michael.wilson@email.com',
    phone: '+1 (555) 999-0000',
    mrn: 'MRN-2024-005',
    date_of_birth: '1972-11-08',
    last_appointment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 106,
    first_name: 'Sarah',
    last_name: 'Anderson',
    email: 'sarah.anderson@email.com',
    phone: '+1 (555) 222-3333',
    mrn: 'MRN-2024-006',
    date_of_birth: '1988-07-14',
    last_appointment: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: '2024-02-01T00:00:00Z',
  },
];

// Mock health records - Expanded with comprehensive data for all patients
const mockHealthRecords: Record<number, PatientHealthRecords> = {
  101: {
    medicalHistory: [
      {
        id: 1,
        record_date: new Date().toISOString().split('T')[0],
        title: 'Routine Check-up',
        description: 'Patient reports feeling well. Blood pressure: 120/80 mmHg. Heart rate: 72 bpm. No concerns noted. Recommended to continue current medication regimen.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 2,
        record_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Annual Physical Examination',
        description: 'Complete physical examination performed. Blood pressure normal, cholesterol levels within range. BMI: 24.5. All vital signs stable.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 3,
        record_date: '2024-01-15',
        title: 'Lab Results Review',
        description: 'Reviewed comprehensive metabolic panel. All values within normal limits. Lipid panel shows improvement from previous visit.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 4,
        record_date: '2023-06-20',
        title: 'Flu Vaccination',
        description: 'Administered annual flu vaccine. No adverse reactions. Patient advised to return for booster if needed.',
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
      {
        id: '2',
        file_name: 'xray_chest_2024.pdf',
        document_type: 'Radiology Report',
        status: 'processed',
        ai_processed: true,
        created_at: '2024-01-10T14:30:00Z',
      },
    ],
  },
  102: {
    medicalHistory: [
      {
        id: 5,
        record_date: new Date().toISOString().split('T')[0],
        title: 'Follow-up Consultation',
        description: 'Patient reports improvement in symptoms. Blood pressure well controlled. Adjusted medication dosage. Patient to return in 3 months.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 6,
        record_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Medication Review',
        description: 'Reviewed current medications. Patient tolerating well. No side effects reported. Continue current regimen.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 7,
        record_date: '2024-01-05',
        title: 'Cardiac Evaluation',
        description: 'ECG performed. Results normal. No arrhythmias detected. Patient advised on lifestyle modifications.',
        clinician_name: 'Dr. Sarah Johnson',
      },
    ],
    documents: [
      {
        id: '3',
        file_name: 'ecg_report_2024.pdf',
        document_type: 'Cardiology Report',
        status: 'processed',
        ai_processed: true,
        created_at: '2024-01-05T11:00:00Z',
      },
    ],
  },
  103: {
    medicalHistory: [
      {
        id: 8,
        record_date: new Date().toISOString().split('T')[0],
        title: 'Cardiac Evaluation',
        description: 'Comprehensive cardiac assessment. Patient reports occasional chest discomfort. Ordered stress test and echocardiogram. Patient advised to monitor symptoms.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 9,
        record_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Initial Consultation',
        description: 'New patient consultation. Medical history reviewed. Family history of cardiovascular disease noted. Baseline tests ordered.',
        clinician_name: 'Dr. Sarah Johnson',
      },
    ],
    documents: [
      {
        id: '4',
        file_name: 'medical_history_transfer.pdf',
        document_type: 'Medical Record',
        status: 'processed',
        ai_processed: true,
        created_at: '2024-01-10T09:00:00Z',
      },
    ],
  },
  104: {
    medicalHistory: [
      {
        id: 10,
        record_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'General Consultation',
        description: 'Patient presents with seasonal allergies. Prescribed antihistamine. Advised on allergy management strategies.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 11,
        record_date: '2024-01-20',
        title: 'Wellness Visit',
        description: 'Annual wellness examination. Patient in good health. Recommended routine screenings. All vaccinations up to date.',
        clinician_name: 'Dr. Sarah Johnson',
      },
    ],
    documents: [],
  },
  105: {
    medicalHistory: [
      {
        id: 12,
        record_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Blood Pressure Monitoring',
        description: 'Blood pressure: 135/85 mmHg. Slightly elevated. Discussed lifestyle modifications including diet and exercise. Patient to monitor at home.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 13,
        record_date: '2024-01-25',
        title: 'Diabetes Management',
        description: 'HbA1c: 6.8%. Blood glucose well controlled. Reviewed diet plan. Patient educated on glucose monitoring.',
        clinician_name: 'Dr. Sarah Johnson',
      },
    ],
    documents: [
      {
        id: '5',
        file_name: 'diabetes_management_plan.pdf',
        document_type: 'Treatment Plan',
        status: 'processed',
        ai_processed: true,
        created_at: '2024-01-25T13:00:00Z',
      },
    ],
  },
  106: {
    medicalHistory: [
      {
        id: 14,
        record_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Preventive Care Visit',
        description: 'Routine preventive care. Pap smear and mammogram scheduled. Patient educated on breast self-examination.',
        clinician_name: 'Dr. Sarah Johnson',
      },
      {
        id: 15,
        record_date: '2024-02-05',
        title: 'Annual Physical',
        description: 'Complete physical examination. All systems normal. Patient maintains active lifestyle. Recommended to continue current health practices.',
        clinician_name: 'Dr. Sarah Johnson',
      },
    ],
    documents: [
      {
        id: '6',
        file_name: 'mammogram_results_2024.pdf',
        document_type: 'Radiology Report',
        status: 'processing',
        ai_processed: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    
    createAppointment: async (hospitalId: string, data: {
      patient_id: number;
      appointment_date: string;
      appointment_time: string;
      reason?: string;
      room?: string;
    }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find patient name
      const patient = mockPatients.find(p => p.id === data.patient_id);
      const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
      
      const newAppointment: Appointment = {
        id: mockAppointments.length + 1,
        appointment_number: `#APT-${String(mockAppointments.length + 1).padStart(3, '0')}`,
        patient_id: data.patient_id,
        patient_name: patientName,
        patient_mrn: patient?.mrn,
        clinician_id: 1,
        clinician_name: mockClinicianProfile.name,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        status: 'scheduled',
        reason: data.reason,
        created_at: new Date().toISOString(),
      };
      
      mockAppointments.push(newAppointment);
      return newAppointment;
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
    
    getSchedule: async (hospitalId: string, clinicianId: string, filters?: { start?: string | null; end?: string | null; type?: string | null; status?: string | null }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock schedule items
      const mockSchedules: ScheduleItem[] = [
        {
          id: 1,
          title: 'Cardiac Surgery - Patient John Doe',
          description: 'Scheduled cardiac surgery procedure',
          type: 'surgery',
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00 AM',
          endTime: '12:00 PM',
          location: 'Operating Room 1',
          room: 'OR-1',
          assignedBy: 'Hospital Admin',
          patientId: 101,
          patientName: 'John Doe',
          priority: 'urgent',
          requiresApproval: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          title: 'Team Meeting',
          description: 'Weekly team coordination meeting',
          type: 'meeting',
          status: 'accepted',
          date: new Date().toISOString().split('T')[0],
          startTime: '02:00 PM',
          endTime: '03:00 PM',
          location: 'Conference Room A',
          room: 'CR-A',
          priority: 'medium',
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 3,
          title: 'Complete Patient Reports',
          description: 'Review and complete pending patient reports',
          type: 'administrative',
          status: 'accepted',
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          priority: 'high',
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 4,
          title: 'Training Session - New Equipment',
          description: 'Training on new surgical equipment',
          type: 'training',
          status: 'approved',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '09:00 AM',
          endTime: '11:00 AM',
          location: 'Training Center',
          assignedBy: 'Hospital Admin',
          priority: 'medium',
          requiresApproval: true,
          created_at: new Date(Date.now() - 345600000).toISOString(),
        },
        {
          id: 5,
          title: 'Consultation - Follow-up',
          description: 'Follow-up consultation with patient',
          type: 'consultation',
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          startTime: '03:00 PM',
          endTime: '03:30 PM',
          patientId: 102,
          patientName: 'Jane Smith',
          priority: 'low',
          created_at: new Date(Date.now() - 432000000).toISOString(),
        },
      ];
      
      let filtered = [...mockSchedules];
      
      // Filter by date range
      if (filters?.start && filters?.end) {
        filtered = filtered.filter(s => {
          const scheduleDate = new Date(s.date);
          const startDate = new Date(filters.start!);
          const endDate = new Date(filters.end!);
          return scheduleDate >= startDate && scheduleDate <= endDate;
        });
      }
      
      // Filter by type
      if (filters?.type) {
        filtered = filtered.filter(s => s.type === filters.type);
      }
      
      // Filter by status
      if (filters?.status) {
        filtered = filtered.filter(s => s.status === filters.status);
      }
      
      return filtered;
    },
    
    createSchedule: async (hospitalId: string, clinicianId: string, data: {
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
    }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSchedule: ScheduleItem = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'accepted',
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        room: data.room,
        priority: data.priority || 'medium',
        notes: data.notes,
        created_at: new Date().toISOString(),
      };
      
      return newSchedule;
    },
    
    updateSchedule: async (hospitalId: string, clinicianId: string, scheduleId: string, data: Partial<ScheduleItem>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would update the schedule in the database
      return {
        id: Number(scheduleId),
        ...data,
      } as ScheduleItem;
    },
    
    approveSchedule: async (hospitalId: string, clinicianId: string, scheduleId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: Number(scheduleId),
        status: 'approved',
      } as ScheduleItem;
    },
    
    rejectSchedule: async (hospitalId: string, clinicianId: string, scheduleId: string, reason?: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: Number(scheduleId),
        status: 'rejected',
        notes: reason ? `Rejected: ${reason}` : undefined,
      } as ScheduleItem;
    },
    
    acceptSchedule: async (hospitalId: string, clinicianId: string, scheduleId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: Number(scheduleId),
        status: 'accepted',
      } as ScheduleItem;
    },
    
    completeSchedule: async (hospitalId: string, clinicianId: string, scheduleId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: Number(scheduleId),
        status: 'completed',
      } as ScheduleItem;
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
    
    // Patients - Only assigned patients
    getAssignedPatients: async (hospitalId: string, clinicianId: string, filters?: { search?: string | null }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('[Mock API] getAssignedPatients called:', { hospitalId, clinicianId, filters, totalPatients: mockPatients.length });
      
      // Only return patients assigned to this clinician (assigned_clinician_id === clinicianId)
      // For mock, assume all patients are assigned to clinician 1
      let filtered = mockPatients.filter(patient => {
        // In real app, check assigned_clinician_id
        // For mock, return all patients if clinicianId is '1' or matches the user's ID
        return clinicianId === '1' || clinicianId === currentUser?.id;
      });
      
      console.log('[Mock API] Filtered patients (before search):', filtered.length);
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(patient => 
          patient.first_name.toLowerCase().includes(search) ||
          patient.last_name.toLowerCase().includes(search) ||
          patient.mrn.toLowerCase().includes(search) ||
          patient.email?.toLowerCase().includes(search) ||
          patient.phone?.toLowerCase().includes(search)
        );
        console.log('[Mock API] Filtered patients (after search):', filtered.length);
      }
      
      console.log('[Mock API] Returning patients:', filtered);
      return filtered;
    },

    searchPatient: async (hospitalId: string, clinicianId: string, query: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const search = query.toLowerCase();
      const patient = mockPatients.find(p => 
        (p.mrn.toLowerCase() === search || 
         `${p.first_name} ${p.last_name}`.toLowerCase().includes(search)) &&
        // Only return if assigned to this clinician
        clinicianId === '1'
      );
      
      return patient || null;
    },

    getPatient: async (hospitalId: string, clinicianId: string, patientId: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const patient = mockPatients.find(p => p.id === Number(patientId));
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      // Check if patient is assigned to this clinician
      if (clinicianId !== '1') {
        throw new Error('You do not have access to this patient');
      }
      
      // Return patient with extended fields based on patient ID
      const patientExtras: Record<number, any> = {
        101: {
          gender: 'Male',
          street_address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zip_code: '10001',
          blood_type: 'O+',
          next_of_kin: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            contact_number: '+1 (555) 111-2223',
          },
          notes: 'Regular patient, follows up monthly. Compliant with medication regimen.',
          contact_preferences: {
            email: true,
            sms: true,
            voice: false,
          },
        },
        102: {
          gender: 'Female',
          street_address: '456 Oak Avenue',
          city: 'Brooklyn',
          state: 'NY',
          zip_code: '11201',
          blood_type: 'A+',
          next_of_kin: {
            name: 'John Smith',
            relationship: 'Husband',
            contact_number: '+1 (555) 333-4445',
          },
          notes: 'Patient with history of hypertension. Monitoring blood pressure regularly.',
          contact_preferences: {
            email: true,
            sms: false,
            voice: true,
          },
        },
        103: {
          gender: 'Male',
          street_address: '789 Pine Road',
          city: 'Queens',
          state: 'NY',
          zip_code: '11375',
          blood_type: 'B+',
          next_of_kin: {
            name: 'Mary Brown',
            relationship: 'Wife',
            contact_number: '+1 (555) 555-6667',
          },
          notes: 'New patient with cardiac concerns. Requires close monitoring.',
          contact_preferences: {
            email: false,
            sms: true,
            voice: true,
          },
        },
        104: {
          gender: 'Female',
          street_address: '321 Elm Street',
          city: 'Manhattan',
          state: 'NY',
          zip_code: '10002',
          blood_type: 'AB+',
          next_of_kin: {
            name: 'David Davis',
            relationship: 'Brother',
            contact_number: '+1 (555) 777-8889',
          },
          notes: 'Young patient, generally healthy. Seasonal allergy management.',
          contact_preferences: {
            email: true,
            sms: true,
            voice: false,
          },
        },
        105: {
          gender: 'Male',
          street_address: '654 Maple Drive',
          city: 'Bronx',
          state: 'NY',
          zip_code: '10451',
          blood_type: 'O-',
          next_of_kin: {
            name: 'Patricia Wilson',
            relationship: 'Daughter',
            contact_number: '+1 (555) 999-0001',
          },
          notes: 'Patient with Type 2 diabetes. Requires regular monitoring and medication adjustments.',
          contact_preferences: {
            email: true,
            sms: true,
            voice: true,
          },
        },
        106: {
          gender: 'Female',
          street_address: '987 Cedar Lane',
          city: 'Staten Island',
          state: 'NY',
          zip_code: '10301',
          blood_type: 'A-',
          next_of_kin: {
            name: 'James Anderson',
            relationship: 'Husband',
            contact_number: '+1 (555) 222-3334',
          },
          notes: 'Active patient, maintains good health practices. Regular preventive care.',
          contact_preferences: {
            email: true,
            sms: false,
            voice: false,
          },
        },
      };

      return {
        ...patient,
        ...(patientExtras[patient.id] || {
          gender: 'Not specified',
          street_address: '',
          city: '',
          state: '',
          zip_code: '',
          blood_type: 'Not specified',
          next_of_kin: {
            name: '',
            relationship: '',
            contact_number: '',
          },
          notes: '',
          contact_preferences: {
            email: true,
            sms: true,
            voice: false,
          },
        }),
        assigned_clinician_id: 1,
      };
    },

    getPatientAppointments: async (hospitalId: string, clinicianId: string, patientId: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockAppointments.filter(apt => apt.patient_id === Number(patientId));
    },

    // Health Records
    getHealthRecords: async (hospitalId: string, clinicianId: string, patientId: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const patientIdNum = Number(patientId);
      const records = mockHealthRecords[patientIdNum] || {
        medicalHistory: [],
        documents: [],
      };
      
      // Convert to expected format
      return {
        medicalHistory: records.medicalHistory.map((mh, idx) => ({
          id: `mh-${mh.id || idx}`,
          record_type: 'note',
          title: mh.title,
          description: mh.description,
          clinician_name: mh.clinician_name,
          record_date: mh.record_date,
          created_at: new Date().toISOString(),
        })),
        documents: records.documents.map(doc => ({
          id: doc.id,
          file_name: doc.file_name,
          file_size: 1024000, // Mock size
          mime_type: 'application/pdf',
          document_type: doc.document_type,
          ai_processed: doc.ai_processed,
          status: doc.status,
          created_at: doc.created_at,
        })),
      };
    },

    uploadHealthDocument: async (hospitalId: string, clinicianId: string, patientId: string, file: File, documentType?: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const patientIdNum = Number(patientId);
      
      // Initialize records if they don't exist
      if (!mockHealthRecords[patientIdNum]) {
        mockHealthRecords[patientIdNum] = {
          medicalHistory: [],
          documents: [],
        };
      }

      // Create new document entry
      const newDocument = {
        id: `doc-${Date.now()}`,
        file_name: file.name,
        document_type: documentType || 'medical_record',
        ai_processed: false,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      mockHealthRecords[patientIdNum].documents.unshift(newDocument);

      // Simulate AI processing after a delay
      setTimeout(() => {
        if (mockHealthRecords[patientIdNum]) {
          const doc = mockHealthRecords[patientIdNum].documents.find(d => d.id === newDocument.id);
          if (doc) {
            doc.status = 'processing';
            // Simulate AI processing completion
            setTimeout(() => {
              if (doc) {
                doc.status = 'processed';
                doc.ai_processed = true;
                // Add extracted data to medical history
                mockHealthRecords[patientIdNum].medicalHistory.unshift({
                  id: Date.now(),
                  record_date: new Date().toISOString().split('T')[0],
                  title: `Health Record from ${file.name}`,
                  description: `Information extracted from uploaded document: ${file.name}`,
                  clinician_name: currentUser?.name || 'Dr. Sarah Johnson',
                });
              }
            }, 2000);
          }
        }
      }, 500);

      return {
        ok: true,
        document: newDocument,
        message: 'Document uploaded successfully. AI processing will begin shortly.',
      };
    },

    addMedicalHistory: async (hospitalId: string, clinicianId: string, patientId: string, data: {
      title: string;
      description?: string;
      record_type?: string;
      record_date?: string;
    }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const patientIdNum = Number(patientId);
      
      // Initialize records if they don't exist
      if (!mockHealthRecords[patientIdNum]) {
        mockHealthRecords[patientIdNum] = {
          medicalHistory: [],
          documents: [],
        };
      }

      const newRecord = {
        id: Date.now(),
        record_date: data.record_date || new Date().toISOString().split('T')[0],
        title: data.title,
        description: data.description,
        clinician_name: currentUser?.name || 'Dr. Sarah Johnson',
      };

      mockHealthRecords[patientIdNum].medicalHistory.unshift(newRecord);

      return {
        ok: true,
        record: {
          id: `mh-${newRecord.id}`,
          record_type: data.record_type || 'note',
          title: newRecord.title,
          description: newRecord.description,
          clinician_name: newRecord.clinician_name,
          record_date: newRecord.record_date,
          created_at: new Date().toISOString(),
        },
      };
    },

    updatePatientNotes: async (hospitalId: string, clinicianId: string, patientId: string, notes: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would update the patient's notes in the database
      // For mock, we just return success
      return { ok: true };
    },
  },
};

