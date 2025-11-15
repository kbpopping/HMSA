// hospital-admin/src/api/mock.ts
import type { 
  Role, 
  Hospital, 
  Patient, 
  Clinician, 
  Appointment, 
  Template, 
  OutboundQueueItem, 
  Notification,
  BillingData,
  StaffRole,
  StaffEmploymentFinancial,
  StaffMedicalInfo,
  StaffPatientsReports,
  StaffReports,
  AllPatientsData,
  StaffDocument,
  StaffDocumentsData,
  StaffUpdateData,
  StaffUpdateDraft
} from './endpoints';

// Persistent mock data for accounts payable
type AccountsPayableItem = {
  id: number;
  vendor: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid';
  category: string;
  due_date: string;
};

// Persistent mock data for accounts receivable
type AccountsReceivableItem = {
  id: number;
  patient_name: string;
  invoice_number: string;
  service_rendered: string;
  amount_due: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'collection';
};

// Load from localStorage or initialize
const loadAccountsPayable = (): AccountsPayableItem[] => {
  try {
    const stored = localStorage.getItem('hospital-admin-accounts-payable');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading accounts payable from localStorage:', err);
  }
  // Default data
  return [
    {
      id: 1,
      vendor: 'MedSupply Co.',
      description: 'Medical Supplies',
      amount: 50000,
      status: 'pending' as const,
      category: 'Supplies',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      vendor: 'TechMaintenance Inc.',
      description: 'Equipment Maintenance',
      amount: 25000,
      status: 'paid' as const,
      category: 'Maintenance',
      due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      vendor: 'PowerGrid Utilities',
      description: 'Electricity Bill',
      amount: 15000,
      status: 'pending' as const,
      category: 'Utilities',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      vendor: 'HealthGuard Insurance',
      description: 'Health Insurance Premium',
      amount: 35000,
      status: 'paid' as const,
      category: 'Insurance',
      due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

let mockAccountsPayable: AccountsPayableItem[] = loadAccountsPayable();

// Save to localStorage
const saveAccountsPayable = (data: AccountsPayableItem[]) => {
  try {
    localStorage.setItem('hospital-admin-accounts-payable', JSON.stringify(data));
    mockAccountsPayable = data;
  } catch (err) {
    console.error('Error saving accounts payable to localStorage:', err);
  }
};

// Load from localStorage or initialize
const loadAccountsReceivable = (): AccountsReceivableItem[] => {
  try {
    const stored = localStorage.getItem('hospital-admin-accounts-receivable');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading accounts receivable from localStorage:', err);
  }
  // Default data - will be populated from patient billing
  return [];
};

let mockAccountsReceivable: AccountsReceivableItem[] = loadAccountsReceivable();

// Save to localStorage
const saveAccountsReceivable = (data: AccountsReceivableItem[]) => {
  try {
    localStorage.setItem('hospital-admin-accounts-receivable', JSON.stringify(data));
    mockAccountsReceivable = data;
  } catch (err) {
    console.error('Error saving accounts receivable to localStorage:', err);
  }
};

// Generate invoice number
const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 1000) + 1;
  return `INV-${year}-${String(num).padStart(3, '0')}`;
};

// Mock data generators
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'North Valley General Hospital',
    country: 'USA',
    timezone: 'America/Los_Angeles', // PST timezone
    created_at: new Date().toISOString(),
  },
];

const mockPatients: Patient[] = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+2348012345678',
    mrn: 'MRN001',
    date_of_birth: '1985-05-15',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+2348023456789',
    mrn: 'MRN002',
    date_of_birth: '1990-08-22',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.j@example.com',
    phone: '+2348034567890',
    mrn: 'MRN003',
    date_of_birth: '1978-12-10',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.w@example.com',
    phone: '+2348045678901',
    mrn: 'MRN004',
    date_of_birth: '1992-03-25',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 5,
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@example.com',
    phone: '+2348056789012',
    mrn: 'MRN005',
    date_of_birth: '1988-07-18',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

const mockStaffRoles: StaffRole[] = [
  {
    id: '1',
    name: 'Clinician',
    description: 'Medical professionals providing patient care',
    permissions: ['Patient Management', 'Appointments', 'Medical Records'],
    staffCount: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Nurse',
    description: 'Nursing staff providing patient care and support',
    permissions: ['Patient Management', 'Appointments', 'Basic Reports'],
    staffCount: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Support Staff',
    description: 'Administrative and support personnel',
    permissions: ['Administrative Tasks', 'Basic Reports'],
    staffCount: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Security',
    description: 'Security personnel maintaining hospital safety',
    permissions: ['Basic Reports'],
    staffCount: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Receptionist',
    description: 'Front desk staff managing appointments and check-ins',
    permissions: ['Appointments', 'Patient Check-in', 'Basic Reports'],
    staffCount: 0,
    created_at: new Date().toISOString(),
  },
];

const mockClinicians: Clinician[] = [
  {
    id: 1,
    name: 'Dr. Amelia Harper',
    specialty: 'Cardiology',
    email: 'amelia.harper@hospital.com',
    phone: '+2348034567890',
    role: 'Clinician',
    marital_status: 'Single',
    next_of_kin: {
      name: 'John Harper',
      relationship: 'Brother',
    },
    home_address: '123 Wellness Ave, Meditown',
    qualifications: 'MD, Cardiology Fellowship',
    date_joined: '2020-08-15',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Dr. Emily Carter',
    specialty: 'Cardiology',
    email: 'emily.carter@hospital.com',
    phone: '+2348034567890',
    role: 'Clinician',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Dr. Michael Brown',
    specialty: 'Pediatrics',
    email: 'michael.brown@hospital.com',
    phone: '+2348045678901',
    role: 'Clinician',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Dr. Sarah Williams',
    specialty: 'General Medicine',
    email: 'sarah.williams@hospital.com',
    phone: '+2348056789012',
    role: 'Clinician',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 5,
    name: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    email: 'james.wilson@hospital.com',
    phone: '+2348067890123',
    role: 'Clinician',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Generate appointment number
const generateAppointmentNumber = (): string => {
  // Generate a random 5-digit number
  const num = Math.floor(10000 + Math.random() * 90000);
  return `#${num}`;
};

// Generate mock appointments
const generateMockAppointments = (): Appointment[] => {
  const now = new Date();
  const appointments: Appointment[] = [];
  
  // October 2024 appointments (matching the image)
  const october2024 = new Date(2024, 9, 1); // October is month 9 (0-indexed)
  
  // Add appointments for October 18, 2024 (highlighted in image)
  appointments.push({
    id: 1,
    appointment_number: generateAppointmentNumber(),
    patient_id: 1,
    patient_name: `${mockPatients[0].first_name} ${mockPatients[0].last_name}`,
    patient_mrn: mockPatients[0].mrn,
    clinician_id: 1,
    clinician_name: mockClinicians[0].name,
    appointment_date: '2024-10-18',
    appointment_time: '10:00',
    status: 'confirmed',
    reason: 'Regular checkup',
    created_at: new Date(2024, 8, 15).toISOString(),
  });
  
  // Add more October appointments
  for (let i = 0; i < 5; i++) {
    const day = 15 + i;
    const hour = 9 + (i % 4) * 2;
    appointments.push({
      id: 2 + i,
      appointment_number: generateAppointmentNumber(),
      patient_id: (i % mockPatients.length) + 1,
      patient_name: `${mockPatients[i % mockPatients.length].first_name} ${mockPatients[i % mockPatients.length].last_name}`,
      patient_mrn: mockPatients[i % mockPatients.length].mrn,
      clinician_id: (i % mockClinicians.length) + 1,
      clinician_name: mockClinicians[i % mockClinicians.length].name,
      appointment_date: `2024-10-${String(day).padStart(2, '0')}`,
      appointment_time: `${String(hour).padStart(2, '0')}:00`,
      status: i === 0 ? 'confirmed' : 'scheduled',
      reason: 'Regular checkup',
      created_at: new Date(2024, 8, day - 3).toISOString(),
    });
  }
  
  // November 2024 appointments
  for (let i = 0; i < 8; i++) {
    const day = 1 + i;
    const hour = 9 + (i % 4) * 2;
    const isPast = new Date(2024, 10, day) < now;
    appointments.push({
      id: 7 + i,
      appointment_number: generateAppointmentNumber(),
      patient_id: (i % mockPatients.length) + 1,
      patient_name: `${mockPatients[i % mockPatients.length].first_name} ${mockPatients[i % mockPatients.length].last_name}`,
      patient_mrn: mockPatients[i % mockPatients.length].mrn,
      clinician_id: (i % mockClinicians.length) + 1,
      clinician_name: mockClinicians[i % mockClinicians.length].name,
      appointment_date: `2024-11-${String(day).padStart(2, '0')}`,
      appointment_time: `${String(hour).padStart(2, '0')}:00`,
      status: isPast ? 'completed' : i === 0 ? 'confirmed' : 'scheduled',
      reason: 'Regular checkup',
      created_at: new Date(2024, 9, day - 3).toISOString(),
    });
  }
  
  // Today's appointments
  const todayStr = now.toISOString().split('T')[0];
  for (let i = 0; i < 3; i++) {
    const hour = 9 + i * 2;
    appointments.push({
      id: 15 + i,
      appointment_number: generateAppointmentNumber(),
      patient_id: (i % mockPatients.length) + 1,
      patient_name: `${mockPatients[i % mockPatients.length].first_name} ${mockPatients[i % mockPatients.length].last_name}`,
      patient_mrn: mockPatients[i % mockPatients.length].mrn,
      clinician_id: (i % mockClinicians.length) + 1,
      clinician_name: mockClinicians[i % mockClinicians.length].name,
      appointment_date: todayStr,
      appointment_time: `${String(hour).padStart(2, '0')}:00`,
      status: i === 0 ? 'confirmed' : 'scheduled',
      reason: 'Regular checkup',
      created_at: new Date(now.getTime() - i * 86400000).toISOString(),
    });
  }
  
  // Past appointments (before today)
  for (let i = 1; i <= 5; i++) {
    const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    appointments.push({
      id: 18 + i,
      appointment_number: generateAppointmentNumber(),
      patient_id: (i % mockPatients.length) + 1,
      patient_name: `${mockPatients[i % mockPatients.length].first_name} ${mockPatients[i % mockPatients.length].last_name}`,
      patient_mrn: mockPatients[i % mockPatients.length].mrn,
      clinician_id: (i % mockClinicians.length) + 1,
      clinician_name: mockClinicians[i % mockClinicians.length].name,
      appointment_date: pastDate.toISOString().split('T')[0],
      appointment_time: '10:00',
      status: i < 4 ? 'completed' : 'no-show',
      reason: 'Regular checkup',
      created_at: pastDate.toISOString(),
    });
  }
  
  return appointments;
};

const mockAppointments = generateMockAppointments();

const mockTemplates: Template[] = [
  {
    id: 1,
    name: 'Appointment Reminder - Email',
    channel: 'email',
    subject: 'Appointment Reminder - {{hospital_name}}',
    body_text: 'Dear {{patient_first}}, your appointment with {{clinician_name}} is scheduled for {{start_time_local}}.',
    is_active: true,
    updated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Appointment Reminder - SMS',
    channel: 'sms',
    body_text: 'Hi {{patient_first}}, reminder: appointment with {{clinician_name}} on {{start_time_local}} at {{hospital_name}}.',
    is_active: true,
    updated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'Appointment Confirmation - Email',
    channel: 'email',
    subject: 'Appointment Confirmed - {{hospital_name}}',
    body_text: 'Your appointment with {{clinician_name}} has been confirmed for {{start_time_local}}.',
    is_active: true,
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'Appointment Reminder - Voice',
    channel: 'voice',
    body_text: 'Hello, this is a reminder from {{hospital_name}}. You have an appointment with {{clinician_name}} on {{start_time_local}}. Please call us if you need to reschedule.',
    is_active: false,
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Generate mock outbound queue and notifications with appointment details
const generateMockQueueAndNotifications = () => {
  // Wait for appointments to be generated first
  const appointments = mockAppointments;
  
  const queue: OutboundQueueItem[] = [];
  const notifications: Notification[] = [];
  
  // Sample patient and clinician names for notifications
  const samplePatients = ['Sophia Clark', 'Liam Walker', 'Ava Turner', 'Owen Reed', 'Emma Davis'];
  const sampleClinicians = ['Dr. Ethan Carter', 'Dr. Olivia Bennett', 'Dr. Noah Harris', 'Dr. Mia Foster', 'Dr. James Wilson'];
  const providers = ['Telus', 'Gmail', 'Twilio', 'SendGrid'];
  
  // Generate queue items
  for (let i = 0; i < 10; i++) {
    const appointment = appointments[i % appointments.length];
    const statuses: Array<'queued' | 'sent' | 'failed'> = ['queued', 'sent', 'failed'];
    const status = statuses[i % 3];
    
    queue.push({
      id: i + 1,
      appointment_id: appointment.id,
      appointment_number: appointment.appointment_number || `#${10000 + appointment.id}`,
      patient_name: appointment.patient_name || samplePatients[i % samplePatients.length],
      clinician_name: appointment.clinician_name || sampleClinicians[i % sampleClinicians.length],
      channel: i % 3 === 0 ? 'email' : i % 3 === 1 ? 'sms' : 'voice',
      provider: providers[i % providers.length],
      status,
      attempts: status === 'failed' ? 3 : status === 'sent' ? 1 : 0,
      next_retry: status === 'queued' || status === 'failed' 
        ? new Date(Date.now() + (i + 1) * 5 * 60 * 1000).toISOString()
        : undefined,
      created_at: new Date(Date.now() - i * 10 * 60 * 1000).toISOString(),
    });
  }
  
  // Generate notifications (history)
  for (let i = 0; i < 42; i++) {
    const appointment = appointments[i % appointments.length];
    const statuses: Array<'queued' | 'sent' | 'failed'> = ['sent', 'sent', 'sent', 'queued', 'failed'];
    const status = statuses[i % 5];
    
    notifications.push({
      id: i + 1,
      appointment_id: appointment.id,
      appointment_number: appointment.appointment_number || `#${10000 + appointment.id}`,
      patient_name: appointment.patient_name || samplePatients[i % samplePatients.length],
      clinician_name: appointment.clinician_name || sampleClinicians[i % sampleClinicians.length],
      channel: i % 3 === 0 ? 'email' : i % 3 === 1 ? 'sms' : 'voice',
      provider: providers[i % providers.length],
      status,
      attempts: status === 'failed' ? 2 : status === 'sent' ? 1 : 0,
      next_retry: status === 'queued' || status === 'failed'
        ? new Date(Date.now() + (i + 1) * 30 * 60 * 1000).toISOString()
        : undefined,
      created_at: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return { queue, notifications };
};

// Initialize mock data after appointments are generated
let mockOutboundQueue: OutboundQueueItem[] = [];
let mockNotifications: Notification[] = [];

// Function to initialize queue and notifications (called after appointments are ready)
const initializeQueueAndNotifications = () => {
  const { queue, notifications } = generateMockQueueAndNotifications();
  mockOutboundQueue = queue;
  mockNotifications = notifications;
};

// Mock patient billing data (stored per patient, can be modified)
// Mock staff documents storage (in-memory, per staff member)
const mockStaffDocuments: Record<number, StaffDocument[]> = {};

// Mock staff update drafts storage (in-memory, per staff member)
const mockStaffUpdateDrafts: Record<number, StaffUpdateDraft> = {};

// Mock staff employment/financial data storage (in-memory, per staff member)
const mockStaffEmploymentFinancial: Record<number, StaffEmploymentFinancial> = {};

// Mock staff medical info storage (in-memory, per staff member)
const mockStaffMedicalInfo: Record<number, StaffMedicalInfo> = {};

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper function to create a minimal valid PDF
function createMockPDF(fileName: string, doc: StaffDocument): string {
  const content = `Document: ${fileName}\n\nFile Size: ${(doc.fileSize / 1024).toFixed(2)} KB\nFile Type: ${doc.fileType}\nUploaded: ${new Date(doc.uploadedAt).toLocaleString()}\n\nThis is a mock PDF document. In production, this would contain the actual file content.`;
  
  // Create a minimal valid PDF structure
  // PDF header
  let pdf = '%PDF-1.4\n';
  
  // Object 1: Catalog
  pdf += '1 0 obj\n';
  pdf += '<< /Type /Catalog /Pages 2 0 R >>\n';
  pdf += 'endobj\n';
  
  // Object 2: Pages
  pdf += '2 0 obj\n';
  pdf += '<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n';
  pdf += 'endobj\n';
  
  // Object 3: Page
  pdf += '3 0 obj\n';
  pdf += '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n';
  pdf += 'endobj\n';
  
  // Object 4: Content stream
  const contentStream = `BT\n/F1 12 Tf\n50 750 Td\n(${content.replace(/[()\\]/g, '\\$&').replace(/\n/g, '\\n')}) Tj\nET`;
  pdf += '4 0 obj\n';
  pdf += `<< /Length ${contentStream.length} >>\n`;
  pdf += 'stream\n';
  pdf += contentStream + '\n';
  pdf += 'endstream\n';
  pdf += 'endobj\n';
  
  // Object 5: Font
  pdf += '5 0 obj\n';
  pdf += '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n';
  pdf += 'endobj\n';
  
  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += 'xref\n';
  pdf += '0 6\n';
  pdf += '0000000000 65535 f \n';
  pdf += '0000000009 00000 n \n';
  pdf += '0000000058 00000 n \n';
  pdf += '0000000115 00000 n \n';
  pdf += '0000000250 00000 n \n';
  pdf += '0000000350 00000 n \n';
  
  // Trailer
  pdf += 'trailer\n';
  pdf += '<< /Size 6 /Root 1 0 R >>\n';
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF';
  
  return pdf;
}

// Helper function to create a mock image (SVG)
function createMockImage(fileName: string, doc: StaffDocument): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f0f0f0"/>
  <text x="400" y="250" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">
    ${fileName}
  </text>
  <text x="400" y="300" font-family="Arial" font-size="16" text-anchor="middle" fill="#666">
    File Size: ${(doc.fileSize / 1024).toFixed(2)} KB
  </text>
  <text x="400" y="330" font-family="Arial" font-size="14" text-anchor="middle" fill="#999">
    Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}
  </text>
  <text x="400" y="360" font-family="Arial" font-size="12" text-anchor="middle" fill="#999">
    This is a mock image. In production, this would show the actual image.
  </text>
</svg>`;
}

// Helper function to create a mock document (text)
function createMockDocument(fileName: string, doc: StaffDocument): string {
  return `Document: ${fileName}

File Size: ${(doc.fileSize / 1024).toFixed(2)} KB
File Type: ${doc.fileType}
Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}
${doc.description ? `Description: ${doc.description}` : ''}

This is a mock document. In production, this would contain the actual file content.

---
Generated by Hospital Management System
`;
}

const mockPatientBilling: Record<number, {
  outstandingBills: Array<{
    id: number;
    invoice_number: string;
    due_date: string;
    amount: number;
    status: 'pending' | 'overdue' | 'paid';
    service?: string;
  }>;
  paymentHistory: Array<{
    id: number;
    date: string;
    service: string;
    amount: number;
    status: 'paid' | 'pending' | 'refunded';
    invoice_number: string;
  }>;
}> = {};

// Mock health records data (stored per patient)
const mockHealthRecords: Record<number, {
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
}> = {
  1: {
    medicalHistory: [
      {
        id: '1',
        record_type: 'diagnosis',
        title: 'Annual Check-up',
        description: 'Routine examination with Dr. Emily Carter.',
        clinician_name: 'Dr. Emily Carter',
        record_date: '2023-10-15',
        metadata: {
          findings: [
            'Blood Pressure: 120/80 mmHg (Normal)',
            'Cholesterol: Total 190 mg/dL (Desirable)',
            'Blood Sugar: Fasting 85 mg/dL (Normal)'
          ]
        },
        created_at: new Date('2023-10-15').toISOString(),
      },
      {
        id: '2',
        record_type: 'test_result',
        title: 'X-Ray: Left Ankle',
        description: 'Following a minor fall. Referred by Dr. Carter.',
        clinician_name: 'Dr. Emily Carter',
        record_date: '2023-07-22',
        metadata: {
          diagnosis: 'Minor sprain, no fracture detected. Recommended rest and ice.'
        },
        created_at: new Date('2023-07-22').toISOString(),
      },
      {
        id: '3',
        record_type: 'diagnosis',
        title: 'Diagnosis: Influenza',
        description: 'Presented with flu-like symptoms. Treated by Dr. Ben Adams.',
        clinician_name: 'Dr. Ben Adams',
        record_date: '2023-03-05',
        metadata: {
          treatment: 'Prescribed antiviral medication and advised rest.'
        },
        created_at: new Date('2023-03-05').toISOString(),
      },
      {
        id: '4',
        record_type: 'note',
        title: 'Initial Consultation',
        description: 'First visit establishing care with the hospital.',
        clinician_name: 'Dr. Emily Carter',
        record_date: '2022-01-10',
        metadata: {
          assessment: 'General health assessment, allergies noted (Penicillin).'
        },
        created_at: new Date('2022-01-10').toISOString(),
      },
    ],
    documents: [
      {
        id: 'doc1',
        file_name: 'lab-results-2023-10.pdf',
        file_size: 245760,
        mime_type: 'application/pdf',
        document_type: 'lab_report',
        ai_processed: true,
        status: 'processed',
        created_at: new Date('2023-10-16').toISOString(),
      },
      {
        id: 'doc2',
        file_name: 'xray-ankle-2023-07.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        document_type: 'imaging',
        ai_processed: true,
        status: 'processed',
        created_at: new Date('2023-07-23').toISOString(),
      },
    ],
  },
  2: {
    medicalHistory: [
      {
        id: '5',
        record_type: 'diagnosis',
        title: 'Routine Physical Examination',
        description: 'Annual physical check-up completed.',
        clinician_name: 'Dr. Michael Brown',
        record_date: '2023-09-20',
        created_at: new Date('2023-09-20').toISOString(),
      },
    ],
    documents: [],
  },
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementations
export const MockAPI = {
  auth: {
    login: async (email: string, password: string) => {
      await delay(300);
      return {
        ok: true,
        role: 'hospital_admin' as Role,
        hospital_id: '1',
      };
    },
    
    logout: async () => {
      await delay(100);
      return { ok: true };
    },
    
    refresh: async () => {
      await delay(100);
      return { ok: true };
    },
  },
  
  hospital: {
    me: async (id?: string) => {
      await delay(400);
      // Return hospital from mock data (will reflect updates)
      const hospitalId = id || '1';
      const hospital = mockHospitals.find(h => h.id === hospitalId);
      console.log('[Mock API] me() called with id:', id, 'Found hospital:', hospital);
      if (hospital) {
        // Return a copy to ensure we're returning the latest data
        return { ...hospital };
      }
      // Fallback if not found
      return {
        id: hospitalId,
        name: 'North Valley General Hospital',
        country: 'USA',
        timezone: 'America/Los_Angeles',
        created_at: new Date().toISOString(),
      };
    },
    
    updateHospital: async (hospitalId: string, payload: any) => {
      await delay(600);
      // Update the mock hospital data
      const hospital = mockHospitals.find(h => h.id === hospitalId);
      if (hospital) {
        if (payload.name !== undefined) hospital.name = payload.name;
        if (payload.country !== undefined) hospital.country = payload.country;
        if (payload.timezone !== undefined) hospital.timezone = payload.timezone;
        console.log('[Mock API] Hospital updated:', hospital);
      } else {
        console.error('[Mock API] Hospital not found:', hospitalId);
      }
      return { ok: true };
    },
    
    listPatients: async (hospitalId: string, params?: any) => {
      await delay(500);
      let results = [...mockPatients];
      
      if (params?.search) {
        const search = params.search.toLowerCase();
        results = results.filter(
          p =>
            p.first_name.toLowerCase().includes(search) ||
            p.last_name.toLowerCase().includes(search) ||
            p.email?.toLowerCase().includes(search) ||
            p.mrn.toLowerCase().includes(search) ||
            p.phone?.toLowerCase().includes(search)
        );
      }
      
      return results;
    },
    
    getPatient: async (hospitalId: string, patientId: string) => {
      await delay(400);
      const patient = mockPatients.find(p => p.id === Number(patientId));
      if (!patient) throw new Error('Patient not found');
      
      // Try to load from localStorage first (for persistence across sessions)
      let patientData: any = {};
      try {
        const stored = localStorage.getItem(`patient_${patientId}_data`);
        if (stored) {
          patientData = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load patient data from localStorage:', e);
      }
      
      return {
        ...patient,
        contact_preferences: patientData.contact_preferences || {
          email: true,
          sms: true,
          voice: false,
        },
        notes: patientData.notes || 'Patient prefers morning appointments.',
        gender: patientData.gender || (patient.id === 1 ? 'Female' : patient.id === 2 ? 'Female' : 'Male'),
        street_address: patientData.street_address || '123 Wellness Ave',
        city: patientData.city || 'Healthville',
        state: patientData.state || 'CA',
        zip_code: patientData.zip_code || '90210',
        blood_type: patientData.blood_type || 'O+',
        next_of_kin: patientData.next_of_kin || {
          name: 'John Doe',
          relationship: 'Spouse',
          contact_number: '+1 (555) 789-0123',
        },
        assigned_clinician_id: patientData.assigned_clinician_id !== undefined ? patientData.assigned_clinician_id : ((patient as any).assigned_clinician_id !== undefined ? (patient as any).assigned_clinician_id : 1),
      };
    },
    
    createPatient: async (hospitalId: string, payload: any) => {
      await delay(600);
      const newPatient: Patient = {
        id: mockPatients.length + 1,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        date_of_birth: payload.date_of_birth,
        mrn: `MRN${String(mockPatients.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
      };
      mockPatients.push(newPatient);
      return { id: newPatient.id, mrn: newPatient.mrn };
    },
    
    updatePatient: async (hospitalId: string, patientId: string, payload: any) => {
      await delay(500);
      const index = mockPatients.findIndex(p => p.id === Number(patientId));
      if (index === -1) throw new Error('Patient not found');
      mockPatients[index] = { ...mockPatients[index], ...payload };
      
      // Also persist to localStorage for cross-session persistence
      try {
        const stored = localStorage.getItem(`patient_${patientId}_data`);
        const existingData = stored ? JSON.parse(stored) : {};
        const updatedData = { ...existingData, ...payload };
        localStorage.setItem(`patient_${patientId}_data`, JSON.stringify(updatedData));
      } catch (e) {
        console.warn('Failed to save patient data to localStorage:', e);
      }
      
      return { ok: true };
    },
    
    listClinicians: async (hospitalId: string) => {
      await delay(400);
      return mockClinicians;
    },
    
    createClinician: async (hospitalId: string, payload: any) => {
      await delay(600);
      const newClinician: Clinician = {
        id: mockClinicians.length + 1,
        name: payload.name,
        specialty: payload.specialty, // Can be string or string[]
        email: payload.email,
        phone: payload.phone,
        role: payload.role || 'Clinician',
        created_at: new Date().toISOString(),
      };
      mockClinicians.push(newClinician);
      // Update staff count for the role
      const role = mockStaffRoles.find(r => r.name === newClinician.role);
      if (role) {
        role.staffCount = mockClinicians.filter(c => c.role === role.name).length;
      }
      return { id: newClinician.id };
    },
    
    updateClinician: async (hospitalId: string, clinicianId: string, payload: any) => {
      await delay(500);
      const index = mockClinicians.findIndex(c => c.id === Number(clinicianId));
      if (index === -1) throw new Error('Clinician not found');
      mockClinicians[index] = { ...mockClinicians[index], ...payload };
      // Update staff count for roles if role changed
      if (payload.role) {
        mockStaffRoles.forEach(role => {
          role.staffCount = mockClinicians.filter(c => c.role === role.name).length;
        });
      }
      return { ok: true };
    },

    uploadStaffProfilePicture: async (hospitalId: string, staffId: string, file: File) => {
      await delay(600);
      const index = mockClinicians.findIndex(c => c.id === Number(staffId));
      if (index === -1) throw new Error('Staff member not found');

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Convert file to base64 data URL for persistence
      return new Promise<{ ok: true; profile_picture: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          // Update the clinician's profile picture
          mockClinicians[index].profile_picture = base64String;
          resolve({ ok: true, profile_picture: base64String });
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    },
    
    listStaffRoles: async (hospitalId: string) => {
      await delay(400);
      // Update staff counts dynamically
      mockStaffRoles.forEach(role => {
        role.staffCount = mockClinicians.filter(c => c.role === role.name).length;
      });
      return [...mockStaffRoles]; // Return a copy to ensure reactivity
    },
    
    createStaffRole: async (hospitalId: string, payload: any) => {
      await delay(600);
      const newRole: StaffRole = {
        id: String(mockStaffRoles.length + 1),
        name: payload.name,
        description: payload.description,
        permissions: payload.permissions || [],
        staffCount: 0,
        created_at: new Date().toISOString(),
      };
      mockStaffRoles.push(newRole);
      return { id: newRole.id };
    },
    
    updateStaffRole: async (hospitalId: string, roleId: string, payload: any) => {
      await delay(500);
      const index = mockStaffRoles.findIndex(r => r.id === roleId);
      if (index === -1) throw new Error('Role not found');
      mockStaffRoles[index] = { ...mockStaffRoles[index], ...payload };
      return { ok: true };
    },
    
    deleteStaffRole: async (hospitalId: string, roleId: string) => {
      await delay(500);
      const index = mockStaffRoles.findIndex(r => r.id === roleId);
      if (index === -1) throw new Error('Role not found');
      // Check if any staff members have this role
      const staffWithRole = mockClinicians.filter(c => c.role === mockStaffRoles[index].name);
      if (staffWithRole.length > 0) {
        throw new Error(`Cannot delete role. ${staffWithRole.length} staff member(s) are assigned to this role.`);
      }
      mockStaffRoles.splice(index, 1);
      return { ok: true };
    },
    
    listAppointments: async (hospitalId: string, params?: any) => {
      await delay(500);
      let results = [...mockAppointments];
      
      if (params?.status) {
        results = results.filter(a => a.status === params.status);
      }
      if (params?.clinicianId) {
        results = results.filter(a => 
          a.clinician_id === Number(params.clinicianId) ||
          (a.clinician_ids && a.clinician_ids.includes(Number(params.clinicianId)))
        );
      }
      if (params?.start && params?.end) {
        results = results.filter(a => {
          const appointmentDateStr = a.appointment_date;
          // Compare date strings directly (YYYY-MM-DD format)
          return appointmentDateStr >= params.start && appointmentDateStr <= params.end;
        });
      }
      
      return results;
    },
    
    createAppointment: async (hospitalId: string, payload: any) => {
      await delay(600);
      const patient = mockPatients.find(p => p.id === payload.patient_id);
      
      // Handle multiple clinicians
      const clinicianIds = payload.clinician_ids || (payload.clinician_id ? [payload.clinician_id] : []);
      const selectedClinicians = clinicianIds
        .map((id: number) => mockClinicians.find(c => c.id === id))
        .filter(Boolean) as Clinician[];
      
      const clinicianNames = selectedClinicians.map(c => c.name);
      const primaryClinician = selectedClinicians[0];
      
      const newAppointment: Appointment = {
        id: Math.max(...mockAppointments.map(a => a.id), 0) + 1,
        appointment_number: generateAppointmentNumber(),
        patient_id: payload.patient_id,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
        patient_mrn: patient?.mrn,
        clinician_id: primaryClinician?.id || 0, // Keep for backward compatibility
        clinician_name: primaryClinician?.name || 'Unknown', // Keep for backward compatibility
        clinician_ids: clinicianIds.length > 0 ? clinicianIds : undefined,
        clinician_names: clinicianNames.length > 0 ? clinicianNames : undefined,
        appointment_date: payload.appointment_date,
        appointment_time: payload.appointment_time,
        status: 'scheduled',
        reason: payload.reason,
        created_at: new Date().toISOString(),
      };
      // Add to the array (persistent like Super Admin)
      mockAppointments.push(newAppointment);
      return { id: newAppointment.id };
    },
    
    updateAppointment: async (hospitalId: string, appointmentId: string, payload: any) => {
      await delay(500);
      const index = mockAppointments.findIndex(a => a.id === Number(appointmentId));
      if (index === -1) throw new Error('Appointment not found');
      mockAppointments[index] = { ...mockAppointments[index], ...payload };
      return { ok: true };
    },
    
    listTemplates: async (hospitalId: string) => {
      await delay(400);
      return mockTemplates;
    },
    
    createTemplate: async (hospitalId: string, payload: any) => {
      await delay(600);
      const newTemplate: Template = {
        id: mockTemplates.length + 1,
        name: payload.name,
        channel: payload.channel,
        subject: payload.subject,
        body_text: payload.body_text,
        is_active: payload.is_active !== false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      mockTemplates.push(newTemplate);
      return { id: newTemplate.id };
    },
    
    updateTemplate: async (hospitalId: string, templateId: string, payload: any) => {
      await delay(500);
      const index = mockTemplates.findIndex(t => t.id === Number(templateId));
      if (index === -1) throw new Error('Template not found');
      mockTemplates[index] = { ...mockTemplates[index], ...payload, updated_at: new Date().toISOString() };
      return { ok: true };
    },
    
    deleteTemplate: async (hospitalId: string, templateId: string) => {
      await delay(500);
      const index = mockTemplates.findIndex(t => t.id === Number(templateId));
      if (index === -1) throw new Error('Template not found');
      mockTemplates.splice(index, 1);
      return { ok: true };
    },
    
    listOutboundQueue: async (hospitalId: string) => {
      await delay(400);
      // Initialize if not already done
      if (mockOutboundQueue.length === 0) {
        initializeQueueAndNotifications();
      }
      
      // Enrich queue items with latest appointment data
      return mockOutboundQueue.map(item => {
        const appointment = mockAppointments.find(a => a.id === item.appointment_id);
        if (appointment) {
          return {
            ...item,
            appointment_number: appointment.appointment_number || item.appointment_number,
            patient_name: appointment.patient_name || item.patient_name,
            clinician_name: appointment.clinician_name || item.clinician_name,
          };
        }
        return item;
      });
    },
    
    listNotifications: async (hospitalId: string, params?: any) => {
      await delay(400);
      // Initialize if not already done
      if (mockNotifications.length === 0) {
        initializeQueueAndNotifications();
      }
      
      let results = [...mockNotifications];
      
      // Enrich notifications with latest appointment data
      results = results.map(item => {
        if (item.appointment_id) {
          const appointment = mockAppointments.find(a => a.id === item.appointment_id);
          if (appointment) {
            return {
              ...item,
              appointment_number: appointment.appointment_number || item.appointment_number,
              patient_name: appointment.patient_name || item.patient_name,
              clinician_name: appointment.clinician_name || item.clinician_name,
            };
          }
        }
        return item;
      });
      
      // Apply filters
      if (params?.status) {
        results = results.filter(n => n.status === params.status);
      }
      if (params?.provider) {
        results = results.filter(n => n.provider === params.provider);
      }
      if (params?.channel) {
        results = results.filter(n => n.channel === params.channel);
      }
      if (params?.start) {
        results = results.filter(n => new Date(n.created_at) >= new Date(params.start));
      }
      if (params?.end) {
        const endDate = new Date(params.end);
        endDate.setHours(23, 59, 59, 999);
        results = results.filter(n => new Date(n.created_at) <= endDate);
      }
      
      return results;
    },
    
    metrics: async (hospitalId: string, start?: string, end?: string) => {
      await delay(500);
      const now = new Date();
      const upcoming = [
        {
          id: 1,
          patient_name: 'Sophia Carter',
          appointment_time: '10:00 AM',
          clinician_name: 'Dr. Ethan Bennett',
        },
        {
          id: 2,
          patient_name: 'Liam Harper',
          appointment_time: '10:30 AM',
          clinician_name: 'Dr. Olivia Hayes',
        },
        {
          id: 3,
          patient_name: 'Ava Morgan',
          appointment_time: '11:00 AM',
          clinician_name: 'Dr. Noah Clark',
        },
      ];
      
      // 7-day trend data
      const sevenDayTrend = [
        { day: 'Mon', value: 45 },
        { day: 'Tue', value: 52 },
        { day: 'Wed', value: 48 },
        { day: 'Thu', value: 61 },
        { day: 'Fri', value: 55 },
        { day: 'Sat', value: 38 },
        { day: 'Sun', value: 42 },
      ];
      
      return {
        range: {
          start: start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: end || new Date().toISOString(),
        },
        totalAppointments: 245,
        appointmentsToday: 24,
        noShowsThisWeek: 3,
        remindersSentToday: 150,
        optOutRate: 0.5,
        byStatus: [
          { status: 'booked', count: 45 },
          { status: 'confirmed', count: 75 },
          { status: 'cancelled', count: 15 },
          { status: 'no-show', count: 5 },
        ],
        sevenDayTrend,
        notifBreakdown: [
          { channel: 'email', sent: 1200, failed: 5 },
          { channel: 'sms', sent: 800, failed: 2 },
          { channel: 'voice', sent: 150, failed: 1 },
        ],
        upcomingAppointments: upcoming,
        templateCoverage: {
          email: 100,
          sms: 100,
          voice: 75,
          overall: 75, // Overall coverage percentage
        },
      };
    },
    
    getBillings: async (hospitalId: string, tab: string = 'overview', period: string = 'monthly') => {
      await delay(500);
      
      if (tab === 'overview') {
        // Generate revenue chart data based on period
        let revenueChart: Array<{ date: string; amount: number }> = [];
        
        if (period === 'daily') {
          // Last 7 days
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            revenueChart.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              amount: Math.floor(Math.random() * 20000) + 15000,
            });
          }
        } else if (period === 'weekly') {
          // Last 8 weeks
          const today = new Date();
          for (let i = 7; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i * 7));
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            revenueChart.push({
              date: `Week ${8 - i}`,
              amount: Math.floor(Math.random() * 50000) + 80000,
            });
          }
        } else if (period === 'monthly') {
          // Last 12 months
          const today = new Date();
          for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            revenueChart.push({
              date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              amount: Math.floor(Math.random() * 50000) + 100000,
            });
          }
        } else if (period === 'yearly') {
          // Last 5 years
          const today = new Date();
          for (let i = 4; i >= 0; i--) {
            const year = today.getFullYear() - i;
            revenueChart.push({
              date: year.toString(),
              amount: Math.floor(Math.random() * 500000) + 1200000,
            });
          }
        }
        
        return {
          overview: {
            totalEarnings: 1250000,
            totalRevenue: 1500000,
            accountsReceivable: 250000,
            revenueChart,
            topContributors: [
              { name: 'Cardiology', amount: 450000 },
              { name: 'Pediatrics', amount: 320000 },
              { name: 'General Medicine', amount: 280000 },
            ],
          },
        };
      }
      
      if (tab === 'accounts-payable') {
        // Reload from localStorage to get latest data
        mockAccountsPayable = loadAccountsPayable();
        return {
          accountsPayable: [...mockAccountsPayable],
        };
      }
      
      if (tab === 'accounts-receivable') {
        // Reload from localStorage to get latest data
        mockAccountsReceivable = loadAccountsReceivable();
        
        // Also fetch from patient billing to get outstanding bills
        const allReceivables: AccountsReceivableItem[] = [...mockAccountsReceivable];
        
        // Fetch outstanding bills from all patients
        for (const patient of mockPatients) {
          try {
            const patientBilling = await MockAPI.hospital.getPatientBilling(hospitalId, String(patient.id));
            if (patientBilling?.outstandingBills) {
              for (const bill of patientBilling.outstandingBills) {
                // Check if this bill already exists in receivables
                const exists = allReceivables.some(r => r.invoice_number === bill.invoice_number);
                if (!exists) {
                  // Determine status based on due date
                  const dueDate = new Date(bill.due_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  dueDate.setHours(0, 0, 0, 0);
                  
                  let status: 'pending' | 'paid' | 'overdue' | 'collection' = 'pending';
                  if (bill.status === 'paid') {
                    status = 'paid';
                  } else if (dueDate < today) {
                    // Overdue if past due date
                    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    status = daysOverdue > 90 ? 'collection' : 'overdue';
                  }
                  
                  allReceivables.push({
                    id: allReceivables.length + 1,
                    patient_name: `${patient.first_name} ${patient.last_name}`,
                    invoice_number: bill.invoice_number,
                    service_rendered: bill.service || 'Unknown Service',
                    amount_due: bill.amount,
                    due_date: bill.due_date,
                    status: status,
                  });
                }
              }
            }
          } catch (err) {
            // Skip if patient billing fails
            console.error(`Error fetching billing for patient ${patient.id}:`, err);
          }
        }
        
        return {
          accountsReceivable: allReceivables,
        };
      }
      
      if (tab === 'payroll') {
        // Generate payroll data from staff/clinicians
        const payrollData = mockClinicians.map((clinician, index) => {
          // Map specialty to department
          const departmentMap: Record<string, string> = {
            'Cardiology': 'Cardiology',
            'Pediatrics': 'Pediatrics',
            'Orthopedics': 'Orthopedics',
            'Neurology': 'Neurology',
            'General Practice': 'General Medicine',
            'Emergency Medicine': 'Emergency',
            'Surgery': 'Surgery',
            'Radiology': 'Radiology',
          };
          
          const department = departmentMap[clinician.specialty] || clinician.specialty || 'General Medicine';
          
          // Base salary by specialty/role
          const baseSalaries: Record<string, number> = {
            'Cardiology': 180000,
            'Pediatrics': 160000,
            'Orthopedics': 190000,
            'Neurology': 175000,
            'General Practice': 140000,
            'Emergency Medicine': 165000,
            'Surgery': 200000,
            'Radiology': 170000,
          };
          
          const baseSalary = baseSalaries[clinician.specialty] || 150000;
          // Add some variation based on index
          const salary = baseSalary + (index % 3) * 5000;
          
          // Benefits based on specialty/role
          const benefitsOptions = [
            ['Health', 'Dental', 'Vision'],
            ['Health', 'Dental'],
            ['Health', 'Vision'],
          ];
          const benefits = benefitsOptions[index % benefitsOptions.length];
          
          // Pay frequency (most are bi-weekly)
          const payFrequency = 'Bi-weekly';
          
          // Last paid date (recent dates)
          const lastPaidDate = new Date();
          lastPaidDate.setDate(lastPaidDate.getDate() - (index % 14)); // Vary by up to 14 days
          
          return {
            id: clinician.id,
            name: clinician.name,
            role: clinician.specialty || clinician.role || 'Clinician',
            department: department,
            salary: salary,
            benefits: benefits,
            pay_frequency: payFrequency,
            last_paid_date: lastPaidDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          };
        });
        
        return {
          payroll: payrollData,
        };
      }
      
      if (tab === 'financial-reports') {
        // Generate available financial reports
        const now = new Date();
        const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const currentQuarter = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
        const lastQuarter = `Q${Math.floor((now.getMonth() - 3) / 3) + 1} ${now.getFullYear()}`;
        const currentYear = now.getFullYear().toString();
        
        return {
          financialReports: {
            availableReports: [
              {
                id: 'monthly-current',
                name: 'Monthly Financial Report',
                period: currentMonth,
                generatedDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                size: '2.4 MB',
              },
              {
                id: 'monthly-last',
                name: 'Monthly Financial Report',
                period: lastMonth,
                generatedDate: new Date(now.getFullYear(), now.getMonth() - 1, 15).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                size: '2.1 MB',
              },
              {
                id: 'quarterly-current',
                name: 'Quarterly Financial Report',
                period: currentQuarter,
                generatedDate: new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                size: '5.8 MB',
              },
              {
                id: 'quarterly-last',
                name: 'Quarterly Financial Report',
                period: lastQuarter,
                generatedDate: new Date(now.getFullYear(), now.getMonth() - 3, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                size: '5.5 MB',
              },
              {
                id: 'annual-current',
                name: 'Annual Financial Report',
                period: currentYear,
                generatedDate: new Date(now.getFullYear(), 0, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                size: '18.2 MB',
              },
            ],
          },
        };
      }
      
      if (tab === 'taxes') {
        return {
          taxes: {
            incomeTax: 125000,
            payrollTax: 45000,
            propertyTax: 30000,
          },
        };
      }
      
      return {};
    },
    
    // Mock patient billing data (stored per patient, can be modified)
    getPatientBilling: async (hospitalId: string, patientId: string) => {
      await delay(300);
      const patientIdNum = Number(patientId);
      
      // Initialize billing data if it doesn't exist
      if (!mockPatientBilling[patientIdNum]) {
        mockPatientBilling[patientIdNum] = {
          outstandingBills: [
            {
              id: 1,
              invoice_number: 'INV-00123',
              due_date: '2023-10-25',
              amount: 150.00,
              status: 'pending' as const,
              service: 'Routine Check-up',
            },
            {
              id: 2,
              invoice_number: 'INV-00119',
              due_date: '2023-09-15',
              amount: 75.00,
              status: 'overdue' as const,
              service: 'Lab Work - Blood Panel',
            },
          ],
          paymentHistory: [
            {
              id: 1,
              date: '2023-08-20',
              service: 'Cardiology Consultation',
              amount: 250.00,
              status: 'paid' as const,
              invoice_number: 'INV-00098',
            },
            {
              id: 2,
              date: '2023-07-15',
              service: 'Lab Work - Blood Panel',
              amount: 120.00,
              status: 'paid' as const,
              invoice_number: 'INV-00087',
            },
            {
              id: 3,
              date: '2023-06-01',
              service: 'Routine Check-up',
              amount: 75.00,
              status: 'paid' as const,
              invoice_number: 'INV-00076',
            },
            {
              id: 4,
              date: '2023-05-10',
              service: 'X-Ray',
              amount: 180.00,
              status: 'paid' as const,
              invoice_number: 'INV-00065',
            },
          ],
        };
      }
      
      return mockPatientBilling[patientIdNum];
    },
    
    markBillAsPaid: async (hospitalId: string, patientId: string, billId: number) => {
      await delay(400);
      const patientIdNum = Number(patientId);
      
      if (!mockPatientBilling[patientIdNum]) {
        // Initialize if needed
        await MockAPI.hospital.getPatientBilling(hospitalId, patientId);
      }
      
      const billing = mockPatientBilling[patientIdNum];
      if (!billing) throw new Error('Billing data not found');
      
      const bill = billing.outstandingBills.find(b => b.id === billId);
      if (!bill) throw new Error('Bill not found');
      
      // Move bill from outstanding to payment history
      const paymentRecord = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        service: bill.service || 'Medical Services',
        amount: bill.amount,
        status: 'paid' as const,
        invoice_number: bill.invoice_number,
      };
      
      billing.paymentHistory.unshift(paymentRecord);
      billing.outstandingBills = billing.outstandingBills.filter(b => b.id !== billId);
      
      return { ok: true };
    },
    
    sendBillReminder: async (hospitalId: string, patientId: string, billId: number) => {
      await delay(400);
      const patientIdNum = Number(patientId);
      
      if (!mockPatientBilling[patientIdNum]) {
        await MockAPI.hospital.getPatientBilling(hospitalId, patientId);
      }
      
      const billing = mockPatientBilling[patientIdNum];
      if (!billing) throw new Error('Billing data not found');
      
      const bill = billing.outstandingBills.find(b => b.id === billId);
      if (!bill) throw new Error('Bill not found');
      
      // In a real implementation, this would send an email/SMS reminder
      // For mock, we just simulate success
      return { ok: true };
    },

    createTransaction: async (hospitalId: string, patientId: string, payload: {
      service: string;
      amount: number;
      date: string;
      status: 'paid' | 'pending' | 'refunded';
      invoice_number: string;
    }) => {
      await delay(500);
      const patientIdNum = Number(patientId);
      
      if (!mockPatientBilling[patientIdNum]) {
        await MockAPI.hospital.getPatientBilling(hospitalId, patientId);
      }
      
      const billing = mockPatientBilling[patientIdNum];
      if (!billing) throw new Error('Billing data not found');
      
      const newPayment: typeof billing.paymentHistory[0] = {
        id: Date.now(),
        date: payload.date,
        service: payload.service,
        amount: payload.amount,
        status: payload.status,
        invoice_number: payload.invoice_number,
      };
      
      billing.paymentHistory.unshift(newPayment);
      
      return { ok: true, payment: newPayment };
    },

    // Health Records
    getHealthRecords: async (hospitalId: string, patientId: string) => {
      await delay(400);
      const patientIdNum = Number(patientId);
      const records = mockHealthRecords[patientIdNum] || {
        medicalHistory: [],
        documents: [],
      };
      return records;
    },

    uploadHealthDocument: async (hospitalId: string, patientId: string, file: File, documentType?: string) => {
      await delay(800);
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
        file_size: file.size,
        mime_type: file.type,
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
                  id: `mh-${Date.now()}`,
                  record_type: 'note',
                  title: `Health Record from ${file.name}`,
                  description: `Information extracted from uploaded document: ${file.name}`,
                  record_date: new Date().toISOString().split('T')[0],
                  created_at: new Date().toISOString(),
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

    downloadHealthReport: async (hospitalId: string, patientId: string) => {
      await delay(500);
      const patientIdNum = Number(patientId);
      const patient = mockPatients.find(p => p.id === patientIdNum);
      if (!patient) throw new Error('Patient not found');

      const records = mockHealthRecords[patientIdNum] || {
        medicalHistory: [],
        documents: [],
      };

      // Get patient appointments
      const patientAppointments = mockAppointments.filter(a => a.patient_id === patientIdNum);

      // Generate PDF using jsPDF (we'll need to add this library or use a simpler approach)
      // For now, let's create a simple text-based PDF using browser's built-in capabilities
      // or we can use a library like jsPDF
      
      // Generate comprehensive health report
      const generateReport = () => {
        const reportLines: string[] = [];
        
        reportLines.push('='.repeat(60));
        reportLines.push('COMPREHENSIVE HEALTH REPORT');
        reportLines.push('='.repeat(60));
        reportLines.push(`Generated: ${new Date().toLocaleString()}`);
        reportLines.push('');
        
        reportLines.push('PATIENT INFORMATION');
        reportLines.push('-'.repeat(60));
        reportLines.push(`Name: ${patient.first_name} ${patient.last_name}`);
        reportLines.push(`MRN: ${patient.mrn}`);
        if (patient.date_of_birth) {
          const dob = new Date(patient.date_of_birth);
          const age = Math.floor((new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          reportLines.push(`Date of Birth: ${dob.toLocaleDateString()} (Age: ${age})`);
        }
        if (patient.email) reportLines.push(`Email: ${patient.email}`);
        if (patient.phone) reportLines.push(`Phone: ${patient.phone}`);
        // Get hospital name from mock data
        const hospital = mockHospitals.find(h => h.id === hospitalId);
        reportLines.push(`Hospital: ${hospital?.name || 'Hospital'}`);
        reportLines.push('');
        
        reportLines.push('MEDICAL HISTORY');
        reportLines.push('-'.repeat(60));
        if (records.medicalHistory.length > 0) {
          records.medicalHistory.forEach((record, idx) => {
            reportLines.push(`${idx + 1}. ${record.title}`);
            reportLines.push(`   Date: ${new Date(record.record_date).toLocaleDateString()}`);
            if (record.clinician_name) {
              reportLines.push(`   Clinician: ${record.clinician_name}`);
            }
            if (record.description) {
              reportLines.push(`   Details: ${record.description}`);
            }
            if (record.metadata) {
              const meta = typeof record.metadata === 'string' ? JSON.parse(record.metadata) : record.metadata;
              if (meta.findings) {
                reportLines.push(`   Findings:`);
                meta.findings.forEach((finding: string) => {
                  reportLines.push(`     - ${finding}`);
                });
              }
              if (meta.diagnosis) {
                reportLines.push(`   Diagnosis: ${meta.diagnosis}`);
              }
              if (meta.treatment) {
                reportLines.push(`   Treatment: ${meta.treatment}`);
              }
            }
            reportLines.push('');
          });
        } else {
          reportLines.push('No medical history records found.');
          reportLines.push('');
        }
        
        reportLines.push('RECENT APPOINTMENTS');
        reportLines.push('-'.repeat(60));
        if (patientAppointments.length > 0) {
          patientAppointments.slice(0, 20).forEach((apt, idx) => {
            const aptDate = new Date(apt.appointment_date);
            reportLines.push(`${idx + 1}. ${aptDate.toLocaleDateString()} - ${apt.status}`);
            reportLines.push(`   Clinician: ${apt.clinician_name}`);
            if (apt.reason) {
              reportLines.push(`   Reason: ${apt.reason}`);
            }
            reportLines.push('');
          });
        } else {
          reportLines.push('No appointments found.');
          reportLines.push('');
        }
        
        reportLines.push('UPLOADED DOCUMENTS');
        reportLines.push('-'.repeat(60));
        if (records.documents.length > 0) {
          records.documents.forEach((doc, idx) => {
            reportLines.push(`${idx + 1}. ${doc.file_name}`);
            reportLines.push(`   Type: ${doc.document_type || 'N/A'}`);
            reportLines.push(`   Uploaded: ${new Date(doc.created_at).toLocaleDateString()}`);
            reportLines.push(`   AI Processed: ${doc.ai_processed ? 'Yes' : 'No'}`);
            reportLines.push(`   Status: ${doc.status}`);
            reportLines.push('');
          });
        } else {
          reportLines.push('No documents uploaded.');
          reportLines.push('');
        }
        
        reportLines.push('='.repeat(60));
        reportLines.push('This is a comprehensive health report generated from the HMSA system.');
        reportLines.push('For questions or concerns, please contact your healthcare provider.');
        reportLines.push('='.repeat(60));

        const content = reportLines.join('\n');
        
        // Create a blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-report-${patient.mrn}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      };

      generateReport();
      return { ok: true };
    },

    // Staff Employment/Financial
    getStaffEmploymentFinancial: async (hospitalId: string, staffId: string) => {
      await delay(300);
      const staffIdNum = Number(staffId);
      
      // Try to load salary structure from localStorage first
      let salaryStructure: { baseSalary: number; taxTypes: Array<{ name: string; percentage: number }>; netSalary: number } | null = null;
      try {
        const salaryStored = localStorage.getItem(`hospital-admin-salary-${staffId}`);
        if (salaryStored) {
          salaryStructure = JSON.parse(salaryStored);
        }
      } catch (e) {
        console.warn('Failed to load salary structure from localStorage:', e);
      }
      
      // Check if we have updated data stored
      if (mockStaffEmploymentFinancial[staffIdNum]) {
        const data = { ...mockStaffEmploymentFinancial[staffIdNum] };
        
        // Override with salary structure from localStorage if available
        if (salaryStructure) {
          const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(amount);
          };
          
          data.salaryAndBenefits = {
            ...data.salaryAndBenefits,
            baseSalary: `${formatCurrency(salaryStructure.baseSalary)} / Month`,
            netSalary: `${formatCurrency(salaryStructure.netSalary)} / Month`,
            taxDeductions: salaryStructure.taxTypes
              .filter(tax => tax.percentage > 0)
              .map(tax => `${tax.name}: ${tax.percentage}%`)
              .join(', ') || 'None',
          };
        }
        
        return data;
      }
      
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(`staff_${staffId}_data`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.employment) {
            const data = { ...parsed.employment };
            
            // Override with salary structure from localStorage if available
            if (salaryStructure) {
              const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(amount);
              };
              
              data.salaryAndBenefits = {
                ...data.salaryAndBenefits,
                baseSalary: `${formatCurrency(salaryStructure.baseSalary)} / Month`,
                netSalary: `${formatCurrency(salaryStructure.netSalary)} / Month`,
                taxDeductions: salaryStructure.taxTypes
                  .filter(tax => tax.percentage > 0)
                  .map(tax => `${tax.name}: ${tax.percentage}%`)
                  .join(', ') || 'None',
              };
            }
            
            mockStaffEmploymentFinancial[staffIdNum] = data;
            return data;
          }
        }
      } catch (e) {
        console.warn('Failed to load employment data from localStorage:', e);
      }
      
      // Mock data for Dr. Amelia Harper (id: 1) - matching the image
      if (staffIdNum === 1) {
        const defaultData: StaffEmploymentFinancial = {
          bankAccount: {
            bankName: 'Global Trust Bank',
            accountNumber: '1234567890',
            routingNumber: '987654321',
          },
          salaryAndBenefits: {
            baseSalary: salaryStructure 
              ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salaryStructure.baseSalary)} / Month`
              : '$250,000 / Annum',
            healthcareBenefits: 'Premium Family Plan (Medical, Dental, Vision)',
            bonusStructure: 'Performance-based, up to 15%',
            retirementPlan: '401(k) with 6% Employer Match',
            ...(salaryStructure && {
              netSalary: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salaryStructure.netSalary)} / Month`,
              taxDeductions: salaryStructure.taxTypes
                .filter(tax => tax.percentage > 0)
                .map(tax => `${tax.name}: ${tax.percentage}%`)
                .join(', ') || 'None',
            }),
          },
          promotions: [
            {
              title: 'Senior Cardiologist',
              date: 'June 1, 2023',
            },
            {
              title: 'Cardiologist',
              date: 'August 15, 2020',
            },
          ],
        };
        // Store default data
        mockStaffEmploymentFinancial[staffIdNum] = defaultData;
        return defaultData;
      }
      
      // Default empty data for other staff
      const defaultData: StaffEmploymentFinancial = {
        bankAccount: {
          bankName: '',
          accountNumber: '',
          routingNumber: '',
        },
        salaryAndBenefits: {
          baseSalary: salaryStructure 
            ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salaryStructure.baseSalary)} / Month`
            : '',
          healthcareBenefits: '',
          bonusStructure: '',
          retirementPlan: '',
          ...(salaryStructure && {
            netSalary: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salaryStructure.netSalary)} / Month`,
            taxDeductions: salaryStructure.taxTypes
              .filter(tax => tax.percentage > 0)
              .map(tax => `${tax.name}: ${tax.percentage}%`)
              .join(', ') || 'None',
          }),
        },
        promotions: [],
      };
      mockStaffEmploymentFinancial[staffIdNum] = defaultData;
      return defaultData;
    },

    // Staff Medical Info
    getStaffMedicalInfo: async (hospitalId: string, staffId: string) => {
      await delay(300);
      const staffIdNum = Number(staffId);
      
      // Check if we have updated data stored
      if (mockStaffMedicalInfo[staffIdNum]) {
        return mockStaffMedicalInfo[staffIdNum];
      }
      
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(`staff_${staffId}_data`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.medical) {
            mockStaffMedicalInfo[staffIdNum] = parsed.medical;
            return parsed.medical;
          }
        }
      } catch (e) {
        console.warn('Failed to load medical data from localStorage:', e);
      }
      
      // Mock data for Dr. Amelia Harper (id: 1) - matching the image
      if (staffIdNum === 1) {
        const defaultData: StaffMedicalInfo = {
          conditions: 'None Declared',
          allergies: 'Penicillin (Anaphylaxis)',
          emergencyContact: {
            name: 'Sarah Jenkins',
            relationship: 'Partner',
            contact: '+1 (555) 987-6543',
          },
          immunizations: [
            {
              name: 'Hepatitis B (Series of 3)',
              status: 'Completed',
            },
            {
              name: 'Influenza (Annual)',
              status: 'Last dose: Oct 2023',
            },
            {
              name: 'COVID-19 (Bivalent Booster)',
              status: 'Last dose: Sep 2023',
            },
            {
              name: 'Tetanus, Diphtheria, Pertussis (Tdap)',
              status: 'Last dose: 2021',
            },
          ],
          assessments: [
            {
              title: 'Annual Health Screening',
              completedDate: 'March 15, 2024',
              status: 'Cleared' as const,
            },
            {
              title: 'Respirator Fit Test',
              completedDate: 'January 20, 2024',
              status: 'Pass' as const,
            },
            {
              title: 'Tuberculosis (TB) Screening',
              completedDate: 'December 05, 2023',
              status: 'Negative' as const,
            },
          ],
        } as StaffMedicalInfo;
      }
      
      // Default data for other staff members
      return {
        conditions: 'None Declared',
        allergies: 'None',
        emergencyContact: {
          name: 'N/A',
          relationship: 'N/A',
          contact: 'N/A',
        },
        immunizations: [],
        assessments: [],
      } as StaffMedicalInfo;
    },

    // Verify password for medical info access (mock)
    verifyMedicalInfoPassword: async (hospitalId: string, password: string) => {
      await delay(500);
      // Mock password verification - accept any password for now
      // In production, this would verify against actual admin password
      if (password && password.length > 0) {
        // Generate a mock token (in production, this would be a JWT)
        const token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        return { ok: true, token };
      }
      throw new Error('Password is required');
    },

    // Staff Patients/Reports (for clinicians and nurses)
    getStaffPatientsReports: async (hospitalId: string, staffId: string, timeframe?: 'weekly' | 'monthly') => {
      await delay(300);
      const staffIdNum = Number(staffId);
      const staffMember = mockClinicians.find(c => c.id === staffIdNum);
      const isMonthly = timeframe === 'monthly';
      
      // Mock data for Dr. Amelia Harper (id: 1) - matching the image
      if (staffIdNum === 1) {
        return {
          assignedPatients: [
            { id: 1, name: 'Liam Gallagher', mrn: 'MRN789012', lastAppointment: '2023-10-15' },
            { id: 2, name: 'Sophia Chen', mrn: 'MRN345678', lastAppointment: '2023-10-12' },
            { id: 3, name: 'Noah Patel', mrn: 'MRN901234', lastAppointment: '2023-10-10' },
            { id: 4, name: 'Olivia Rodriguez', mrn: 'MRN567890', lastAppointment: '2023-10-08' },
          ],
          activityReport: {
            consultations: isMonthly ? '168 consultations this month.' : '42 consultations this week.',
            proceduresPerformed: isMonthly ? '22 cardiac catheterizations, 8 angioplasties, 3 pacemaker implantations.' : '5 cardiac catheterizations, 2 angioplasties.',
            keyObservations: isMonthly 
              ? 'Noted an unusual trend in arrhythmia cases among patients from the industrial district. Further investigation recommended. Monthly analysis shows 15% increase in cardiac cases compared to previous month.'
              : 'Noted an unusual trend in arrhythmia cases among patients from the industrial district. Further investigation recommended.',
            weekly: {
              consultations: '42 consultations this week.',
              proceduresPerformed: '5 cardiac catheterizations, 2 angioplasties.',
              keyObservations: 'Noted an unusual trend in arrhythmia cases among patients from the industrial district. Further investigation recommended.',
            },
            monthly: {
              consultations: '168 consultations this month.',
              proceduresPerformed: '22 cardiac catheterizations, 8 angioplasties, 3 pacemaker implantations.',
              keyObservations: 'Noted an unusual trend in arrhythmia cases among patients from the industrial district. Further investigation recommended. Monthly analysis shows 15% increase in cardiac cases compared to previous month.',
            },
          },
          totalPatientsAttended: 1284,
          dateJoined: '2020-08-15',
          summary: {
            name: 'Dr. Amelia Harper',
            specialty: 'Cardiologist',
            description: 'Dr. Harper is a dedicated cardiologist with over 10 years of experience, specializing in interventional cardiology.',
          },
        } as StaffPatientsReports;
      }
      
      // Default data for other clinicians/nurses
      return {
        assignedPatients: [
          { id: 1, name: 'John Doe', mrn: 'MRN123456', lastAppointment: '2023-10-14' },
          { id: 2, name: 'Jane Smith', mrn: 'MRN234567', lastAppointment: '2023-10-13' },
        ],
        activityReport: {
          consultations: isMonthly ? '100 consultations this month.' : '25 consultations this week.',
          proceduresPerformed: isMonthly ? 'Various procedures performed throughout the month.' : 'Various procedures performed.',
          keyObservations: isMonthly ? 'Standard observations noted. Monthly performance consistent with expectations.' : 'Standard observations noted.',
          weekly: {
            consultations: '25 consultations this week.',
            proceduresPerformed: 'Various procedures performed.',
            keyObservations: 'Standard observations noted.',
          },
          monthly: {
            consultations: '100 consultations this month.',
            proceduresPerformed: 'Various procedures performed throughout the month.',
            keyObservations: 'Standard observations noted. Monthly performance consistent with expectations.',
          },
        },
        totalPatientsAttended: 500,
        dateJoined: staffMember?.date_joined || '2020-01-01',
        summary: {
          name: staffMember?.name || 'Staff Member',
          specialty: staffMember?.specialty || 'General',
          description: `${staffMember?.name || 'Staff member'} is a dedicated healthcare professional.`,
        },
      } as StaffPatientsReports;
    },

    // Staff Reports (for non-clinicians)
    getStaffReports: async (hospitalId: string, staffId: string) => {
      await delay(300);
      const staffIdNum = Number(staffId);
      const staffMember = mockClinicians.find(c => c.id === staffIdNum);
      
      // Generate role-appropriate reports based on staff role
      const role = staffMember?.role?.toLowerCase() || 'staff';
      
      let reports = [];
      let weeklySummary = undefined;
      
      if (role.includes('receptionist') || role.includes('reception')) {
        reports = [
          { id: 1, title: 'Daily Appointment Summary', type: 'Daily Report', date: '2023-10-15', description: 'Summary of appointments scheduled and completed today.' },
          { id: 2, title: 'Patient Check-in Report', type: 'Weekly Report', date: '2023-10-14', description: 'Weekly summary of patient check-ins and wait times.' },
          { id: 3, title: 'Phone Call Log', type: 'Weekly Report', date: '2023-10-13', description: 'Log of incoming and outgoing phone calls.' },
        ];
        weeklySummary = {
          tasksCompleted: 450,
          tasksCompletedLabel: '450 appointments scheduled this week',
          keyMetrics: 'Average wait time: 8 minutes',
          highlights: 'Maintained 98% appointment accuracy rate',
        };
      } else if (role.includes('security')) {
        reports = [
          { id: 1, title: 'Security Incident Report', type: 'Incident Report', date: '2023-10-15', description: 'Report of security incidents and responses.' },
          { id: 2, title: 'Patrol Log', type: 'Daily Report', date: '2023-10-14', description: 'Daily patrol rounds and observations.' },
          { id: 3, title: 'Access Control Log', type: 'Weekly Report', date: '2023-10-13', description: 'Weekly access control and visitor management summary.' },
        ];
        weeklySummary = {
          tasksCompleted: 168,
          tasksCompletedLabel: '168 patrol rounds completed this week',
          keyMetrics: 'Zero security incidents reported',
          highlights: '100% facility coverage maintained',
        };
      } else if (role.includes('support')) {
        reports = [
          { id: 1, title: 'Maintenance Report', type: 'Weekly Report', date: '2023-10-15', description: 'Weekly maintenance and facility management summary.' },
          { id: 2, title: 'Equipment Status', type: 'Daily Report', date: '2023-10-14', description: 'Status of hospital equipment and systems.' },
          { id: 3, title: 'Resource Utilization', type: 'Monthly Report', date: '2023-10-13', description: 'Monthly resource utilization and efficiency report.' },
        ];
        weeklySummary = {
          tasksCompleted: 85,
          tasksCompletedLabel: '85 maintenance tasks completed this week',
          keyMetrics: 'Equipment uptime: 99.2%',
          highlights: 'Reduced maintenance response time by 20%',
        };
      } else {
        reports = [
          { id: 1, title: 'Activity Report', type: 'Weekly Report', date: '2023-10-15', description: 'Weekly activity and task completion summary.' },
          { id: 2, title: 'Performance Summary', type: 'Monthly Report', date: '2023-10-14', description: 'Monthly performance and productivity summary.' },
        ];
        weeklySummary = {
          tasksCompleted: 120,
          tasksCompletedLabel: '120 tasks completed this week',
          keyMetrics: 'Average task completion time: 2.5 hours',
          highlights: 'Improved productivity by 12%',
        };
      }
      
      return {
        reports,
        weeklySummary,
        summary: {
          name: staffMember?.name || 'Staff Member',
          role: staffMember?.role || 'Staff',
          description: `${staffMember?.name || 'Staff member'} is a dedicated ${staffMember?.role || 'staff member'} contributing to hospital operations.`,
        },
      } as StaffReports;
    },

    // Get all patients for a staff member
    getAllStaffPatients: async (hospitalId: string, staffId: string) => {
      await delay(300);
      const staffIdNum = Number(staffId);
      const staffMember = mockClinicians.find(c => c.id === staffIdNum);
      
      // Mock data for Dr. Amelia Harper (id: 1)
      if (staffIdNum === 1) {
        const allPatients = [
          { id: 1, name: 'Liam Gallagher', mrn: 'MRN789012', lastAppointment: '2023-10-15', totalAppointments: 12, firstAppointment: '2022-03-10' },
          { id: 2, name: 'Sophia Chen', mrn: 'MRN345678', lastAppointment: '2023-10-12', totalAppointments: 8, firstAppointment: '2022-05-15' },
          { id: 3, name: 'Noah Patel', mrn: 'MRN901234', lastAppointment: '2023-10-10', totalAppointments: 15, firstAppointment: '2021-11-20' },
          { id: 4, name: 'Olivia Rodriguez', mrn: 'MRN567890', lastAppointment: '2023-10-08', totalAppointments: 6, firstAppointment: '2023-01-05' },
          { id: 5, name: 'Emma Thompson', mrn: 'MRN123456', lastAppointment: '2023-10-05', totalAppointments: 20, firstAppointment: '2020-09-12' },
          { id: 6, name: 'James Wilson', mrn: 'MRN234567', lastAppointment: '2023-10-03', totalAppointments: 10, firstAppointment: '2022-07-18' },
          { id: 7, name: 'Isabella Martinez', mrn: 'MRN345678', lastAppointment: '2023-09-28', totalAppointments: 14, firstAppointment: '2021-12-03' },
          { id: 8, name: 'Michael Brown', mrn: 'MRN456789', lastAppointment: '2023-09-25', totalAppointments: 18, firstAppointment: '2020-11-15' },
        ];
        
        return {
          patients: allPatients,
          totalCount: 1284,
          staffInfo: {
            name: 'Dr. Amelia Harper',
            role: 'Clinician',
            specialty: 'Cardiologist',
          },
        } as AllPatientsData;
      }
      
      // Default data for other staff
      const defaultPatients = [
        { id: 1, name: 'John Doe', mrn: 'MRN123456', lastAppointment: '2023-10-14', totalAppointments: 5, firstAppointment: '2023-01-10' },
        { id: 2, name: 'Jane Smith', mrn: 'MRN234567', lastAppointment: '2023-10-13', totalAppointments: 3, firstAppointment: '2023-03-15' },
      ];
      
      return {
        patients: defaultPatients,
        totalCount: 500,
        staffInfo: {
          name: staffMember?.name || 'Staff Member',
          role: staffMember?.role || 'Staff',
          specialty: staffMember?.specialty,
        },
      } as AllPatientsData;
    },

    // Staff Documents
    getStaffDocuments: async (hospitalId: string, staffId: string) => {
      await delay(300);
      const staffIdNum = Number(staffId);
      
      // Initialize with mock documents if not exists
      if (!mockStaffDocuments[staffIdNum]) {
        // Mock data for Dr. Amelia Harper (id: 1) - matching the image
        if (staffIdNum === 1) {
          mockStaffDocuments[staffIdNum] = [
            {
              id: 'doc-1',
              fileName: 'Curriculum_Vitae_A_Harper.pdf',
              fileSize: 245760, // 240 KB
              fileType: 'application/pdf',
              documentType: 'cv',
              uploadedAt: '2023-10-26T10:30:00Z',
              uploadedBy: 'Dr. Amelia Harper',
            },
            {
              id: 'doc-2',
              fileName: 'Medical_License_CA.pdf',
              fileSize: 512000, // 500 KB
              fileType: 'application/pdf',
              documentType: 'license',
              uploadedAt: '2023-09-15T14:15:00Z',
              uploadedBy: 'Dr. Amelia Harper',
            },
            {
              id: 'doc-3',
              fileName: 'Cardiology_Board_Certification.pdf',
              fileSize: 512000, // 500 KB
              fileType: 'application/pdf',
              documentType: 'certification',
              uploadedAt: '2023-09-15T14:15:00Z',
              uploadedBy: 'Dr. Amelia Harper',
            },
            {
              id: 'doc-4',
              fileName: 'Employment_Contract.docx',
              fileSize: 1024000, // 1 MB
              fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              documentType: 'employment',
              uploadedAt: '2020-08-01T09:00:00Z',
              uploadedBy: 'HR Department',
            },
          ];
        } else {
          // Default documents for other staff
          mockStaffDocuments[staffIdNum] = [
            {
              id: `doc-${staffIdNum}-1`,
              fileName: 'Employment_Contract.pdf',
              fileSize: 1024000,
              fileType: 'application/pdf',
              documentType: 'contract',
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'HR Department',
              description: 'Employment contract',
            },
          ];
        }
      }
      
      const documents = mockStaffDocuments[staffIdNum] || [];
      const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
      
      return {
        documents,
        totalSize,
      } as StaffDocumentsData;
    },

    uploadStaffDocument: async (hospitalId: string, staffId: string, file: File, documentType?: string, description?: string) => {
      await delay(600);
      const staffIdNum = Number(staffId);
      
      // Initialize if needed
      if (!mockStaffDocuments[staffIdNum]) {
        mockStaffDocuments[staffIdNum] = [];
      }
      
      const newDocument: StaffDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType: documentType || 'other',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
        description: description || undefined,
      };
      
      mockStaffDocuments[staffIdNum].unshift(newDocument);
      
      return { ok: true, document: newDocument };
    },

    downloadStaffDocument: async (hospitalId: string, staffId: string, documentId: string) => {
      await delay(300);
      const staffIdNum = Number(staffId);
      
      if (!mockStaffDocuments[staffIdNum]) {
        throw new Error('Staff documents not found');
      }
      
      const doc = mockStaffDocuments[staffIdNum].find(d => d.id === documentId);
      if (!doc) {
        throw new Error('Document not found');
      }
      
      // Create a proper blob based on file type
      let blob: Blob;
      let mimeType = doc.fileType;
      
      if (doc.fileType === 'application/pdf') {
        // Create a minimal valid PDF structure
        const pdfContent = createMockPDF(doc.fileName, doc);
        blob = new Blob([pdfContent], { type: 'application/pdf' });
      } else if (doc.fileType.startsWith('image/')) {
        // For images, create a simple SVG placeholder
        const svgContent = createMockImage(doc.fileName, doc);
        blob = new Blob([svgContent], { type: 'image/svg+xml' });
        mimeType = 'image/svg+xml';
      } else if (doc.fileType.includes('word') || doc.fileType.includes('document')) {
        // For Word documents, create a simple text representation
        const textContent = createMockDocument(doc.fileName, doc);
        blob = new Blob([textContent], { type: 'text/plain' });
        mimeType = 'text/plain';
      } else {
        // Default: create text content
        const textContent = createMockDocument(doc.fileName, doc);
        blob = new Blob([textContent], { type: 'text/plain' });
        mimeType = 'text/plain';
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      return { ok: true };
    },

    deleteStaffDocument: async (hospitalId: string, staffId: string, documentId: string) => {
      await delay(400);
      const staffIdNum = Number(staffId);
      
      if (!mockStaffDocuments[staffIdNum]) {
        throw new Error('Staff documents not found');
      }
      
      const index = mockStaffDocuments[staffIdNum].findIndex(doc => doc.id === documentId);
      if (index === -1) {
        throw new Error('Document not found');
      }
      
      mockStaffDocuments[staffIdNum].splice(index, 1);
      
      return { ok: true };
    },

    // Staff Update Wizard - Draft Management
    saveStaffUpdateDraft: async (hospitalId: string, staffId: string, draft: Partial<StaffUpdateData>, currentStep: number) => {
      await delay(300);
      const staffIdNum = Number(staffId);
      
      const draftData: StaffUpdateDraft = {
        staffId,
        hospitalId,
        currentStep,
        data: draft,
        lastSaved: new Date().toISOString(),
      };
      
      mockStaffUpdateDrafts[staffIdNum] = draftData;
      
      // Also save to localStorage for persistence
      try {
        localStorage.setItem(`staff_update_draft_${staffId}`, JSON.stringify(draftData));
      } catch (e) {
        console.warn('Failed to save draft to localStorage:', e);
      }
      
      return { ok: true, draft: draftData };
    },

    getStaffUpdateDraft: async (hospitalId: string, staffId: string) => {
      await delay(200);
      const staffIdNum = Number(staffId);
      
      // Try to get from localStorage first (for persistence across sessions)
      try {
        const stored = localStorage.getItem(`staff_update_draft_${staffId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Update in-memory storage
          mockStaffUpdateDrafts[staffIdNum] = parsed;
          return parsed as StaffUpdateDraft;
        }
      } catch (e) {
        console.warn('Failed to load draft from localStorage:', e);
      }
      
      // Fallback to in-memory storage
      return mockStaffUpdateDrafts[staffIdNum] || null;
    },

    clearStaffUpdateDraft: async (hospitalId: string, staffId: string) => {
      await delay(200);
      const staffIdNum = Number(staffId);
      
      delete mockStaffUpdateDrafts[staffIdNum];
      
      // Also clear from localStorage
      try {
        localStorage.removeItem(`staff_update_draft_${staffId}`);
      } catch (e) {
        console.warn('Failed to clear draft from localStorage:', e);
      }
      
      return { ok: true };
    },

    submitStaffUpdate: async (hospitalId: string, staffId: string, data: StaffUpdateData) => {
      await delay(800);
      const staffIdNum = Number(staffId);
      
      // Find the staff member in mockClinicians
      const staffIndex = mockClinicians.findIndex(c => c.id === staffIdNum);
      if (staffIndex === -1) {
        throw new Error('Staff member not found');
      }
      
      // Update basic staff information
      if (data.overview) {
        mockClinicians[staffIndex] = {
          ...mockClinicians[staffIndex],
          name: data.overview.name,
          email: data.overview.email,
          phone: data.overview.phone,
          specialty: data.overview.specialty,
          marital_status: data.overview.marital_status,
          next_of_kin: data.overview.next_of_kin_name || data.overview.next_of_kin_relationship
            ? {
                name: data.overview.next_of_kin_name,
                relationship: data.overview.next_of_kin_relationship,
              }
            : undefined,
          home_address: data.overview.home_address,
          qualifications: data.overview.qualifications,
          date_joined: data.overview.date_joined,
          profile_picture: typeof data.overview.profile_picture === 'string' 
            ? data.overview.profile_picture 
            : data.overview.profile_picture 
              ? await fileToBase64(data.overview.profile_picture as File)
              : mockClinicians[staffIndex].profile_picture,
        };
      }
      
      // Update employment/financial data (stored in separate mock object)
      if (data.employment) {
        if (!mockStaffEmploymentFinancial[staffIdNum]) {
          mockStaffEmploymentFinancial[staffIdNum] = {
            bankAccount: {
              bankName: '',
              accountNumber: '',
              routingNumber: '',
            },
            salaryAndBenefits: {
              baseSalary: '',
              healthcareBenefits: '',
              bonusStructure: '',
              retirementPlan: '',
            },
            promotions: [],
          };
        }
        
        if (data.employment.bankAccount) {
          mockStaffEmploymentFinancial[staffIdNum].bankAccount = {
            ...mockStaffEmploymentFinancial[staffIdNum].bankAccount,
            ...data.employment.bankAccount,
          };
        }
        
        if (data.employment.salaryAndBenefits) {
          mockStaffEmploymentFinancial[staffIdNum].salaryAndBenefits = {
            ...mockStaffEmploymentFinancial[staffIdNum].salaryAndBenefits,
            ...data.employment.salaryAndBenefits,
          };
        }
        
        if (data.employment.promotions) {
          mockStaffEmploymentFinancial[staffIdNum].promotions = data.employment.promotions;
        }
      }
      
      // Update medical info (stored in separate mock object)
      if (data.medical) {
        if (!mockStaffMedicalInfo[staffIdNum]) {
          mockStaffMedicalInfo[staffIdNum] = {
            conditions: '',
            allergies: '',
            emergencyContact: {
              name: '',
              relationship: '',
              contact: '',
            },
            immunizations: [],
            assessments: [],
          };
        }
        
        if (data.medical.conditions !== undefined) {
          mockStaffMedicalInfo[staffIdNum].conditions = data.medical.conditions;
        }
        
        if (data.medical.allergies !== undefined) {
          mockStaffMedicalInfo[staffIdNum].allergies = data.medical.allergies;
        }
        
        if (data.medical.emergencyContact) {
          mockStaffMedicalInfo[staffIdNum].emergencyContact = {
            ...mockStaffMedicalInfo[staffIdNum].emergencyContact,
            ...data.medical.emergencyContact,
          };
        }
        
        if (data.medical.immunizations) {
          mockStaffMedicalInfo[staffIdNum].immunizations = data.medical.immunizations;
        }
        
        if (data.medical.assessments) {
          mockStaffMedicalInfo[staffIdNum].assessments = data.medical.assessments;
        }
      }
      
      // Handle document uploads
      if (data.documents && data.documents.length > 0) {
        if (!mockStaffDocuments[staffIdNum]) {
          mockStaffDocuments[staffIdNum] = [];
        }
        
        // Convert File objects to StaffDocument format
        const newDocuments: StaffDocument[] = data.documents.map((doc, index) => ({
          id: `doc-${Date.now()}-${index}-${Math.random().toString(36).substring(7)}`,
          fileName: doc.file.name,
          fileSize: doc.file.size,
          fileType: doc.file.type || 'application/pdf',
          documentType: doc.documentType,
          uploadedAt: new Date().toISOString(),
          description: doc.description,
        }));
        
        mockStaffDocuments[staffIdNum] = [
          ...mockStaffDocuments[staffIdNum],
          ...newDocuments,
        ];
      }
      
      // Clear the draft after successful update
      delete mockStaffUpdateDrafts[staffIdNum];
      
      try {
        localStorage.removeItem(`staff_update_draft_${staffId}`);
        // Also persist updated staff data to localStorage for persistence across sessions
        localStorage.setItem(`staff_${staffId}_data`, JSON.stringify({
          clinician: mockClinicians[staffIndex],
          employment: mockStaffEmploymentFinancial[staffIdNum],
          medical: mockStaffMedicalInfo[staffIdNum],
        }));
      } catch (e) {
        console.warn('Failed to update localStorage:', e);
      }
      
      return { ok: true };
    },
  },
};

