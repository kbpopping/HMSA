// frontend/src/api/mock.ts
import type { Role, Hospital, Patient, Clinician } from './endpoints';

// Mock data generators
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    country: 'USA',
    timezone: 'America/New_York',
    created_at: '2023-10-27T00:00:00.000Z',
  },
  {
    id: '2',
    name: "St. Jude's",
    country: 'Canada',
    timezone: 'America/Toronto',
    created_at: '2023-09-15T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Mercy West',
    country: 'USA',
    timezone: 'America/Chicago',
    created_at: '2023-08-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Demo General Hospital',
    country: 'NG',
    timezone: 'Africa/Lagos',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'City Medical Center',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '6',
    name: 'Regional Health Clinic',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Mock users data matching the UI reference
const mockUsers: Array<{
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Hospital Admin';
  lastActive: string;
  hospital: string | null;
  hospital_id?: string | null;
}> = [
  {
    id: '1',
    name: 'Dr. Amelia Harper',
    email: 'amelia.harper@example.com',
    role: 'Super Admin',
    lastActive: '2 days ago',
    hospital: null,
  },
  {
    id: '2',
    name: 'Dr. Benjamin Carter',
    email: 'benjamin.carter@example.com',
    role: 'Hospital Admin',
    lastActive: '1 day ago',
    hospital: 'City General Hospital',
    hospital_id: '1',
  },
  {
    id: '3',
    name: 'Dr. Chloe Bennett',
    email: 'chloe.bennett@example.com',
    role: 'Hospital Admin',
    lastActive: '3 days ago',
    hospital: 'County Medical Center',
    hospital_id: '2',
  },
  {
    id: '4',
    name: 'Dr. Daniel Evans',
    email: 'daniel.evans@example.com',
    role: 'Hospital Admin',
    lastActive: '1 week ago',
    hospital: 'Regional Health System',
    hospital_id: '3',
  },
  {
    id: '5',
    name: 'Dr. Eleanor Foster',
    email: 'eleanor.foster@example.com',
    role: 'Hospital Admin',
    lastActive: '2 days ago',
    hospital: 'Community Wellness Clinic',
    hospital_id: '4',
  },
  {
    id: '6',
    name: 'Dr. Finnigan Graham',
    email: 'finnigan.graham@example.com',
    role: 'Hospital Admin',
    lastActive: '1 day ago',
    hospital: 'MetroCare Hospital',
    hospital_id: '5',
  },
  {
    id: '7',
    name: 'Dr. Gabriel Hughes',
    email: 'gabriel.hughes@example.com',
    role: 'Hospital Admin',
    lastActive: '4 days ago',
    hospital: "St. Mary's Hospital",
    hospital_id: '2',
  },
  {
    id: '8',
    name: 'Dr. Isabella Jones',
    email: 'isabella.jones@example.com',
    role: 'Hospital Admin',
    lastActive: '2 weeks ago',
    hospital: 'Mercy Medical Center',
    hospital_id: '3',
  },
  {
    id: '9',
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    role: 'Hospital Admin',
    lastActive: '5 days ago',
    hospital: 'City General Hospital',
    hospital_id: '1',
  },
  {
    id: '10',
    name: 'Dr. Katherine Lee',
    email: 'katherine.lee@example.com',
    role: 'Hospital Admin',
    lastActive: '3 days ago',
    hospital: 'Regional Health System',
    hospital_id: '3',
  },
  {
    id: '11',
    name: 'Dr. Lucas Martinez',
    email: 'lucas.martinez@example.com',
    role: 'Hospital Admin',
    lastActive: '1 week ago',
    hospital: 'MetroCare Hospital',
    hospital_id: '5',
  },
  {
    id: '12',
    name: 'Dr. Maya Patel',
    email: 'maya.patel@example.com',
    role: 'Hospital Admin',
    lastActive: '2 days ago',
    hospital: 'Community Wellness Clinic',
    hospital_id: '4',
  },
  {
    id: '13',
    name: 'Dr. Nathan Brown',
    email: 'nathan.brown@example.com',
    role: 'Hospital Admin',
    lastActive: '4 days ago',
    hospital: 'City General Hospital',
    hospital_id: '1',
  },
  {
    id: '14',
    name: 'Dr. Olivia Davis',
    email: 'olivia.davis@example.com',
    role: 'Hospital Admin',
    lastActive: '1 day ago',
    hospital: 'County Medical Center',
    hospital_id: '2',
  },
  {
    id: '15',
    name: 'Dr. Patrick Taylor',
    email: 'patrick.taylor@example.com',
    role: 'Hospital Admin',
    lastActive: '6 days ago',
    hospital: 'Regional Health System',
    hospital_id: '3',
  },
  {
    id: '16',
    name: 'Dr. Quinn Anderson',
    email: 'quinn.anderson@example.com',
    role: 'Hospital Admin',
    lastActive: '3 days ago',
    hospital: 'MetroCare Hospital',
    hospital_id: '5',
  },
  {
    id: '17',
    name: 'Dr. Rachel Green',
    email: 'rachel.green@example.com',
    role: 'Hospital Admin',
    lastActive: '2 weeks ago',
    hospital: 'Community Wellness Clinic',
    hospital_id: '4',
  },
  {
    id: '18',
    name: 'Dr. Samuel White',
    email: 'samuel.white@example.com',
    role: 'Hospital Admin',
    lastActive: '1 day ago',
    hospital: 'City General Hospital',
    hospital_id: '1',
  },
  {
    id: '19',
    name: 'Dr. Taylor Johnson',
    email: 'taylor.johnson@example.com',
    role: 'Hospital Admin',
    lastActive: '5 days ago',
    hospital: 'County Medical Center',
    hospital_id: '2',
  },
  {
    id: '20',
    name: 'Dr. Uma Singh',
    email: 'uma.singh@example.com',
    role: 'Hospital Admin',
    lastActive: '4 days ago',
    hospital: 'Regional Health System',
    hospital_id: '3',
  },
  {
    id: '21',
    name: 'Dr. Victor Chen',
    email: 'victor.chen@example.com',
    role: 'Hospital Admin',
    lastActive: '2 days ago',
    hospital: 'MetroCare Hospital',
    hospital_id: '5',
  },
  {
    id: '22',
    name: 'Dr. Wendy Kim',
    email: 'wendy.kim@example.com',
    role: 'Hospital Admin',
    lastActive: '1 week ago',
    hospital: 'Community Wellness Clinic',
    hospital_id: '4',
  },
  {
    id: '23',
    name: 'Dr. Xavier Rodriguez',
    email: 'xavier.rodriguez@example.com',
    role: 'Hospital Admin',
    lastActive: '3 days ago',
    hospital: 'City General Hospital',
    hospital_id: '1',
  },
  {
    id: '24',
    name: 'Dr. Yara Ali',
    email: 'yara.ali@example.com',
    role: 'Hospital Admin',
    lastActive: '1 day ago',
    hospital: 'County Medical Center',
    hospital_id: '2',
  },
];

// Mock roles data - includes the 2 new roles (Patient and Support Staff)
const mockRoles: Array<{
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}> = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access and control',
    permissions: ['All Permissions'],
    userCount: 1,
    createdAt: '2023-01-01',
  },
  {
    id: '2',
    name: 'Hospital Admin',
    description: 'Manage hospital operations and users',
    permissions: ['Hospital Management', 'User Management', 'Reports'],
    userCount: 23,
    createdAt: '2023-01-01',
  },
  {
    id: '3',
    name: 'Clinician',
    description: 'Access patient data and appointments',
    permissions: ['Patient Management', 'Appointments', 'Medical Records'],
    userCount: 156,
    createdAt: '2023-01-01',
  },
  {
    id: '4',
    name: 'Receptionist',
    description: 'Manage appointments and patient check-ins',
    permissions: ['Appointments', 'Patient Check-in', 'Basic Reports'],
    userCount: 89,
    createdAt: '2023-01-01',
  },
  {
    id: '5',
    name: 'Patient',
    description: 'Access personal health information and appointments',
    permissions: ['Personal Health Information', 'View Appointments'],
    userCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Support Staff',
    description: 'Limited access for administrative tasks',
    permissions: ['Administrative Tasks', 'Basic Reports'],
    userCount: 0,
    createdAt: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+2348023456789',
    mrn: 'MRN002',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.j@example.com',
    phone: '+2348034567890',
    mrn: 'MRN003',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockClinicians: Clinician[] = [
  {
    id: 1,
    name: 'Dr. Emily Carter',
    specialty: 'Cardiology',
    email: 'emily.carter@hospital.com',
    phone: '+2348034567890',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Dr. Michael Brown',
    specialty: 'Pediatrics',
    email: 'michael.brown@hospital.com',
    phone: '+2348045678901',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Dr. Sarah Williams',
    specialty: 'General Medicine',
    email: 'sarah.williams@hospital.com',
    phone: '+2348056789012',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Simulate network delay (reduced for faster testing)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementations
export const MockAPI = {
  auth: {
    login: async (email: string, password: string) => {
      // Small delay to simulate network
      await delay(300);
      
      // Accept any credentials in mock mode
      let role: Role = 'super_admin';
      let hospital_id: string | undefined = undefined;
      
      // If email contains 'hospital' or 'admin', set as hospital_admin
      if (email.toLowerCase().includes('hospital') || (email.toLowerCase().includes('admin') && !email.toLowerCase().includes('super'))) {
        role = 'hospital_admin';
        hospital_id = '1';
      }
      
      // Return response matching exactly what auth store expects
      return {
        ok: true,
        role,
        hospital_id,
      };
    },
    
    logout: async () => {
      await delay(100);
      return { ok: true };
    },
    
    refresh: async () => {
      await delay(100);
      // Return a valid refresh response
      return { ok: true };
    },
  },
  
  super: {
    listHospitals: async () => {
      await delay(600);
      return mockHospitals;
    },
    
    createHospital: async (payload: any) => {
      await delay(800);
      const newHospital: Hospital = {
        id: String(mockHospitals.length + 1),
        name: payload.name,
        country: payload.country || null,
        timezone: payload.timezone || 'UTC',
        created_at: new Date().toISOString(),
      };
      mockHospitals.push(newHospital);
      
      // PRODUCTION: This should be handled by backend
      // MOCK MODE: Automatically create a user entry when creating a hospital
      // The admin name will be added later via Users page
      if (payload.adminEmail && payload.adminPassword) {
        const newUser = {
          id: String(mockUsers.length + 1),
          name: `Admin ${payload.name.split(' ')[0]}`, // Placeholder name - will be updated via Users page
          email: payload.adminEmail,
          role: 'Hospital Admin' as const,
          lastActive: 'Today',
          hospital: payload.name,
          hospital_id: newHospital.id,
        };
        mockUsers.push(newUser);
      }
      
      return { id: newHospital.id, name: newHospital.name };
    },
    
    // PRODUCTION: Replace with real update endpoint
    updateHospital: async (hospitalId: string, payload: { name: string; country?: string | null; timezone?: string }) => {
      await delay(500);
      const index = mockHospitals.findIndex(h => h.id === hospitalId);
      if (index !== -1) {
        mockHospitals[index] = {
          ...mockHospitals[index],
          name: payload.name,
          country: payload.country || null,
          timezone: payload.timezone || mockHospitals[index].timezone,
        };
        return { ok: true };
      }
      throw new Error('Hospital not found');
    },
    
    // PRODUCTION: Replace with real delete endpoint that verifies admin password
    deleteHospital: async (hospitalId: string) => {
      await delay(500);
      const index = mockHospitals.findIndex(h => h.id === hospitalId);
      if (index !== -1) {
        mockHospitals.splice(index, 1);
        return { ok: true };
      }
      throw new Error('Hospital not found');
    },
    
    impersonate: async (hospital_id: string) => {
      await delay(400);
      return { ok: true, hospital_id };
    },
    
    // PRODUCTION: Replace with real user management endpoints
    listUsers: async () => {
      await delay(600);
      return mockUsers;
    },
    
    createUser: async (payload: any) => {
      await delay(800);
      const newUser = {
        id: String(mockUsers.length + 1),
        name: payload.name,
        email: payload.email,
        role: payload.role,
        lastActive: 'Today',
        hospital: payload.hospital_id ? mockHospitals.find(h => h.id === payload.hospital_id)?.name || null : null,
        hospital_id: payload.hospital_id || null,
      };
      mockUsers.push(newUser);
      return { id: newUser.id, name: newUser.name };
    },
    
    updateUser: async (userId: string, payload: any) => {
      await delay(500);
      const index = mockUsers.findIndex(u => u.id === userId);
      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          name: payload.name,
          email: payload.email,
          role: payload.role,
          hospital: payload.hospital_id ? mockHospitals.find(h => h.id === payload.hospital_id)?.name || null : null,
          hospital_id: payload.hospital_id || null,
        };
        return { ok: true };
      }
      throw new Error('User not found');
    },
    
    // PRODUCTION: Replace with real role management endpoints
    listRoles: async () => {
      await delay(600);
      return mockRoles;
    },
    
    createRole: async (payload: any) => {
      await delay(800);
      const newRole = {
        id: String(mockRoles.length + 1),
        name: payload.name,
        description: payload.description,
        permissions: payload.permissions || [],
        userCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockRoles.push(newRole);
      return { id: newRole.id, name: newRole.name };
    },
    
    updateRole: async (roleId: string, payload: any) => {
      await delay(500);
      const index = mockRoles.findIndex(r => r.id === roleId);
      if (index !== -1) {
        mockRoles[index] = {
          ...mockRoles[index],
          name: payload.name,
          description: payload.description,
          permissions: payload.permissions || [],
        };
        return { ok: true };
      }
      throw new Error('Role not found');
    },
    
    deleteRole: async (roleId: string) => {
      await delay(500);
      const index = mockRoles.findIndex(r => r.id === roleId);
      if (index !== -1) {
        mockRoles.splice(index, 1);
        return { ok: true };
      }
      throw new Error('Role not found');
    },
    
    // PRODUCTION: Replace with real monitoring endpoints
    getQueueOverview: async () => {
      await delay(600);
      // Calculate from mock data - in production this would come from actual queue
      const totalQueued = 150;
      const totalSent = 1000;
      const totalFailed = 17;
      const retryRate = totalFailed > 0 ? ((totalFailed / (totalSent + totalFailed)) * 100).toFixed(1) : '0.0';
      
      return {
        queued: totalQueued,
        sent: totalSent,
        failed: totalFailed,
        retryRate: parseFloat(retryRate),
        providers: [
          { name: 'Provider A', queued: 120, sent: 500, failed: 10 },
          { name: 'Provider B', queued: 80, sent: 300, failed: 5 },
          { name: 'Provider C', queued: 50, sent: 200, failed: 2 },
        ],
      };
    },
    
    getNotificationsBreakdown: async () => {
      await delay(600);
      return [
        { channel: 'Email', provider: 'Provider A', status: 'Queued' as const, count: 50, trend: 10, trendDirection: 'up' as const },
        { channel: 'Email', provider: 'Provider A', status: 'Sent' as const, count: 200, trend: 5, trendDirection: 'down' as const },
        { channel: 'Email', provider: 'Provider A', status: 'Failed' as const, count: 2, trend: 20, trendDirection: 'up' as const },
        { channel: 'SMS', provider: 'Provider B', status: 'Queued' as const, count: 30, trend: 5, trendDirection: 'up' as const },
        { channel: 'SMS', provider: 'Provider B', status: 'Sent' as const, count: 150, trend: 2, trendDirection: 'down' as const },
      ];
    },
    
    getN8nHealth: async () => {
      await delay(600);
      const now = new Date();
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      };
      
      return [
        {
          name: 'Workflow A',
          lastSuccess: formatDate(new Date(now.getTime() - 5 * 60000)), // 5 minutes ago
          lastError: null,
          avgDuration: '2s',
        },
        {
          name: 'Workflow B',
          lastSuccess: formatDate(new Date(now.getTime() - 10 * 60000)), // 10 minutes ago
          lastError: formatDate(new Date(now.getTime() - 24 * 60 * 60000)), // 24 hours ago
          avgDuration: '3s',
        },
        {
          name: 'Workflow C',
          lastSuccess: formatDate(new Date(now.getTime() - 15 * 60000)), // 15 minutes ago
          lastError: null,
          avgDuration: '1s',
        },
      ];
    },
  },
  
  hospital: {
    me: async (id?: string) => {
      await delay(400);
      return mockHospitals[0];
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
            p.mrn.toLowerCase().includes(search)
        );
      }
      
      return results;
    },
    
    createPatient: async (hospitalId: string, payload: any) => {
      await delay(600);
      const newPatient: Patient = {
        id: mockPatients.length + 1,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        mrn: `MRN${String(mockPatients.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
      };
      mockPatients.push(newPatient);
      return { id: newPatient.id, mrn: newPatient.mrn };
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
        specialty: payload.specialty,
        email: payload.email,
        phone: payload.phone,
        created_at: new Date().toISOString(),
      };
      mockClinicians.push(newClinician);
      return { id: newClinician.id };
    },
    
    metrics: async (hospitalId: string, start?: string, end?: string) => {
      await delay(500);
      return {
        range: {
          start: start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: end || new Date().toISOString(),
        },
        totalAppointments: 245,
        byStatus: [
          { status: 'scheduled', count: 180 },
          { status: 'completed', count: 50 },
          { status: 'cancelled', count: 15 },
        ],
        notifBreakdown: [
          { channel: 'email', sent: 1200, failed: 5 },
          { channel: 'sms', sent: 800, failed: 2 },
          { channel: 'voice', sent: 150, failed: 1 },
        ],
      };
    },
  },
};

