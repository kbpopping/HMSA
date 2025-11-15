import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import clsx from 'clsx';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, Patient, Appointment, Clinician, PatientBill, PatientPayment } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import TextField from '../../components/forms/TextField';
import PhoneField from '../../components/forms/PhoneField';
import DateTimePicker from '../../components/forms/DateTimePicker';
import Select from '../../components/forms/Select';
import Spinner from '../../components/feedback/Spinner';
import EmptyState from '../../components/feedback/EmptyState';
import DataTable from '../../components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import Modal from '../../components/modals/Modal';

type TabType = 'overview' | 'appointments' | 'health' | 'notes' | 'billing';

type PatientWithExtras = Patient & {
  contact_preferences?: {
    email?: boolean;
    sms?: boolean;
    voice?: boolean;
  };
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
};

// Health Records Tab Component
const HealthRecordsTab = ({ 
  hospitalId, 
  patientId, 
  patient,
  assignedClinician,
  formData 
}: { 
  hospitalId: string; 
  patientId: string; 
  patient: PatientWithExtras | undefined;
  assignedClinician?: Clinician;
  formData: any;
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch health records
  const { data: healthRecords, isLoading: isLoadingHealthRecords } = useQuery({
    queryKey: ['hospital', 'patient', 'health-records', hospitalId, patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      return await HospitalAPI.getHealthRecords(hospitalId, patientId);
    },
    enabled: !!patientId,
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      await HospitalAPI.uploadHealthDocument(hospitalId, patientId, file);
      toast.success('Document uploaded successfully. AI processing will begin shortly.');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh health records
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'patient', 'health-records', hospitalId, patientId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle download summary
  const handleDownloadSummary = async () => {
    if (!patientId) {
      toast.error('Patient ID is required');
      return;
    }

    setIsDownloading(true);
    try {
      await HospitalAPI.downloadHealthReport(hospitalId, patientId);
      toast.success('Health report downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download health report');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="mb-6 flex justify-end items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="health-record-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="health-record-upload"
          className={clsx(
            "h-11 px-4 rounded-lg font-semibold border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <Spinner size="sm" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">upload_file</span>
              <span>Upload Record</span>
            </>
          )}
        </label>
        <button
          onClick={handleDownloadSummary}
          disabled={isDownloading}
          className={clsx(
            "h-11 px-4 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors flex items-center gap-2",
            isDownloading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isDownloading ? (
            <>
              <Spinner size="sm" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">download</span>
              <span>Download Summary</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
              Medical History Timeline
            </h3>
            {isLoadingHealthRecords ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : healthRecords?.medicalHistory && healthRecords.medicalHistory.length > 0 ? (
              <div className="relative pl-8 border-l-2 border-border-light dark:border-border-dark">
                {healthRecords.medicalHistory.map((record, idx) => (
                  <div key={record.id} className={clsx(idx < healthRecords.medicalHistory.length - 1 && "mb-10")}>
                    <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] mt-1.5 border-2 border-card-light dark:border-card-dark"></div>
                    <time className="mb-1 text-sm font-normal leading-none text-subtle-light dark:text-subtle-dark block">
                      {new Date(record.record_date).toLocaleDateString()}
                    </time>
                    <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                      {record.title}
                    </h4>
                    {record.clinician_name && (
                      <p className="mb-2 text-base font-normal text-subtle-light dark:text-subtle-dark">
                        {record.clinician_name}
                      </p>
                    )}
                    {record.description && (
                      <div className="bg-background-light dark:bg-background-dark/50 p-4 rounded-lg border border-border-light dark:border-border-dark">
                        <p className="text-subtle-light dark:text-subtle-dark">
                          {record.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="medical_services"
                message="No medical history records found"
                description="Medical history will appear here once records are added."
              />
            )}

            {/* Uploaded Documents Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                Uploaded Documents
              </h3>
              {healthRecords?.documents && healthRecords.documents.length > 0 ? (
                <div className="space-y-3">
                  {healthRecords.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-primary">description</span>
                        <div>
                          <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                            {doc.file_name}
                          </p>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">
                            {doc.document_type || 'Medical Record'} • {new Date(doc.created_at).toLocaleDateString()}
                            {doc.ai_processed && ' • AI Processed'}
                          </p>
                        </div>
                      </div>
                      <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        doc.status === 'processed' ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
                        doc.status === 'processing' ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300" :
                        doc.status === 'failed' ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300" :
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="upload_file"
                  message="No documents uploaded"
                  description="Upload PDF documents to transfer health records from other providers."
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Key Information Card */}
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
              Key Information
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-subtle-light dark:text-subtle-dark">
                  Blood Type
                </h4>
                <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                  {formData.blood_type || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-subtle-light dark:text-subtle-dark">
                  Primary Physician
                </h4>
                <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                  {assignedClinician ? assignedClinician.name : 'Not assigned'}
                </p>
              </div>
              {healthRecords?.documents && healthRecords.documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-subtle-light dark:text-subtle-dark">
                    Total Documents
                  </h4>
                  <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                    {healthRecords.documents.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Instructions Card */}
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <h3 className="text-xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">
              Upload Instructions
            </h3>
            <div className="space-y-3 text-sm text-subtle-light dark:text-subtle-dark">
              <p>• Only PDF files are accepted</p>
              <p>• Maximum file size: 10MB</p>
              <p>• Documents will be automatically scanned by AI</p>
              <p>• Health information will be extracted and added to patient records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Patient Profile Page
 * 
 * Features:
 * - Tabs: Overview, Appointments, Health Records, Notes, Billing
 * - Overview tab with patient information, address, contact preferences, medical info, next of kin, and assigned clinician
 * - View patient's appointments
 * - Health records summary
 * - Notes management
 */
const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    blood_type: '',
  });
  const [contactPreferences, setContactPreferences] = useState({
    email: true,
    sms: true,
    voice: false,
  });
  const [nextOfKin, setNextOfKin] = useState({
    name: '',
    relationship: '',
    contact_number: '',
  });
  const [notes, setNotes] = useState('');
  const [assignedClinicianId, setAssignedClinicianId] = useState<number | undefined>(undefined);

  // Fetch patient data
  const { data: patient, isLoading: isLoadingPatient, error: patientError } = useQuery<PatientWithExtras>({
    queryKey: ['hospital', 'patient', hospitalId, patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      return await HospitalAPI.getPatient(hospitalId, patientId);
    },
    enabled: !!patientId,
  });

  // Fetch clinicians for assignment
  const { data: clinicians = [] } = useQuery<Clinician[]>({
    queryKey: ['hospital', 'clinicians', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listClinicians(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching clinicians:', err);
        return [];
      }
    },
  });

  // Fetch patient's appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['hospital', 'appointments', hospitalId, 'patient', patientId],
    queryFn: async () => {
      try {
        const allAppointments = await HospitalAPI.listAppointments(hospitalId, {});
        return Array.isArray(allAppointments)
          ? allAppointments.filter(apt => apt.patient_id === Number(patientId))
          : [];
      } catch (err) {
        console.error('Error fetching patient appointments:', err);
        return [];
      }
    },
    enabled: !!patientId,
  });

  // Fetch patient billing data
  const { data: billingData, isLoading: isLoadingBilling } = useQuery<{
    outstandingBills: PatientBill[];
    paymentHistory: PatientPayment[];
  }>({
    queryKey: ['hospital', 'patient', 'billing', hospitalId, patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      return await HospitalAPI.getPatientBilling(hospitalId, patientId);
    },
    enabled: !!patientId,
  });

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: (payload: any) => {
      if (!patientId) throw new Error('Patient ID is required');
      return HospitalAPI.updatePatient(hospitalId, patientId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'patient', hospitalId, patientId] });
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'patients'] });
      toast.success('Patient information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update patient');
    },
  });

  // Initialize form data when patient loads
  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        gender: (patient as any).gender || '',
        street_address: (patient as any).street_address || '',
        city: (patient as any).city || '',
        state: (patient as any).state || '',
        zip_code: (patient as any).zip_code || '',
        blood_type: (patient as any).blood_type || '',
      });
      if (patient.contact_preferences) {
        setContactPreferences({
          email: patient.contact_preferences.email ?? true,
          sms: patient.contact_preferences.sms ?? true,
          voice: patient.contact_preferences.voice ?? false,
        });
      }
      setNotes(patient.notes || '');
      setNextOfKin((patient as any).next_of_kin || { name: '', relationship: '', contact_number: '' });
      setAssignedClinicianId((patient as any).assigned_clinician_id);
    }
  }, [patient]);

  // Get assigned clinician
  const assignedClinician = clinicians.find(c => c.id === assignedClinicianId);

  // Handle form submission
  const handleSaveChanges = () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error('First name and last name are required');
      return;
    }
    updatePatientMutation.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender || undefined,
      street_address: formData.street_address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zip_code: formData.zip_code || undefined,
      blood_type: formData.blood_type || undefined,
      contact_preferences: contactPreferences,
      next_of_kin: nextOfKin,
      assigned_clinician_id: assignedClinicianId,
    });
  };

  // Handle assign staff
  const handleAssignStaff = (clinicianId: number) => {
    updatePatientMutation.mutate(
      {
        assigned_clinician_id: clinicianId,
      },
      {
        onSuccess: async () => {
          setAssignedClinicianId(clinicianId);
          await queryClient.invalidateQueries({ queryKey: ['hospital', 'patient', hospitalId, patientId] });
          setShowAssignStaffModal(false);
          toast.success('Staff assigned successfully');
        },
      }
    );
  };

  // Handle unassign staff
  const handleUnassignStaff = () => {
    updatePatientMutation.mutate(
      {
        assigned_clinician_id: null,
      },
      {
        onSuccess: async () => {
          setAssignedClinicianId(undefined);
          await queryClient.invalidateQueries({ queryKey: ['hospital', 'patient', hospitalId, patientId] });
          setShowAssignStaffModal(false);
          toast.success('Staff unassigned successfully');
        },
      }
    );
  };

  // Handle contact preferences update
  const handleContactPreferenceChange = (key: 'email' | 'sms' | 'voice', value: boolean) => {
    const newPrefs = { ...contactPreferences, [key]: value };
    setContactPreferences(newPrefs);
    updatePatientMutation.mutate({ contact_preferences: newPrefs });
  };

  // Handle notes save
  const handleNotesSave = () => {
    updatePatientMutation.mutate({ notes: notes });
  };

  // Mark bill as paid mutation
  const markBillAsPaidMutation = useMutation({
    mutationFn: (billId: number) => {
      if (!patientId) throw new Error('Patient ID is required');
      return HospitalAPI.markBillAsPaid(hospitalId, patientId, billId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'patient', 'billing', hospitalId, patientId] });
      toast.success('Bill marked as paid successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark bill as paid');
    },
  });

  // Send bill reminder mutation
  const sendBillReminderMutation = useMutation({
    mutationFn: (billId: number) => {
      if (!patientId) throw new Error('Patient ID is required');
      return HospitalAPI.sendBillReminder(hospitalId, patientId, billId);
    },
    onSuccess: async () => {
      toast.success('Reminder sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send reminder');
    },
  });

  // Handle mark bill as paid
  const handleMarkAsPaid = (billId: number) => {
    markBillAsPaidMutation.mutate(billId);
  };

  // Handle send reminder
  const handleSendReminder = (billId: number) => {
    sendBillReminderMutation.mutate(billId);
  };

  // Handle view invoice
  const handleViewInvoice = (invoiceNumber: string) => {
    navigate(`/hospital/patients/${patientId}/invoice/${invoiceNumber}`);
  };

  // Handle new transaction
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
  const handleNewTransaction = () => {
    setShowNewTransactionModal(true);
  };

  // Appointments table columns
  const appointmentColumns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'appointment_date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-foreground-light dark:text-foreground-dark">
          {new Date(row.original.appointment_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'appointment_time',
      header: 'Time',
      cell: ({ row }) => (
        <span className="text-sm text-foreground-light dark:text-foreground-dark">
          {row.original.appointment_time}
        </span>
      ),
    },
    {
      accessorKey: 'clinician_name',
      header: 'Clinician',
      cell: ({ row }) => (
        <span className="text-sm text-foreground-light dark:text-foreground-dark">
          {row.original.clinician_names && row.original.clinician_names.length > 0
            ? row.original.clinician_names.join(', ')
            : row.original.clinician_name}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors: Record<string, string> = {
          scheduled: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          confirmed: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
          completed: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          cancelled: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
          'no-show': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        };
        return (
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
            statusColors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="text-sm text-subtle-light dark:text-subtle-dark">
          {row.original.reason || '-'}
        </span>
      ),
    },
  ];

  if (isLoadingPatient) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (patientError || !patient) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Patient not found. Please check the patient ID.
            </p>
            <button
              onClick={() => navigate('/hospital/patients')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Patients
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Extract patient name with fallback
  const patientFullName = patient 
    ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient'
    : 'Unknown Patient';

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/hospital/patients')}
            className="flex items-center gap-2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm">Back to Patients</span>
          </button>
          <span className="text-subtle-light dark:text-subtle-dark hidden sm:inline">|</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark">
            {patientFullName}
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-light dark:border-border-dark mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview' as TabType, label: 'Overview', icon: 'person' },
              { id: 'appointments' as TabType, label: 'Appointments', icon: 'event', badge: appointments.length },
              { id: 'health' as TabType, label: 'Health Records', icon: 'medical_services' },
              { id: 'notes' as TabType, label: 'Notes', icon: 'note' },
              { id: 'billing' as TabType, label: 'Billing', icon: 'receipt_long' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-1 py-4 border-b-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-primary hover:border-primary/50'
                )}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-background-light dark:bg-background-dark rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Patient Information Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                      Medical Record Number (MRN)
                    </label>
                    <input
                      type="text"
                      value={patient.mrn}
                      readOnly
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed"
                    />
                  </div>
                  <div></div>
                  <TextField
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                  <TextField
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                  <DateTimePicker
                    label="Date of Birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    options={[
                      { value: '', label: 'Select gender' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <PhoneField
                    label="Contact Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <TextField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <TextField
                      label="Street Address"
                      value={formData.street_address}
                      onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                    />
                  </div>
                  <TextField
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  <TextField
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                  <TextField
                    label="Zip Code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => navigate('/hospital/patients')}
                  className="h-12 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={updatePatientMutation.isPending}
                  className="h-12 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePatientMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              {/* Contact Preferences Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Contact Preferences
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactPreferences.email}
                      onChange={(e) => handleContactPreferenceChange('email', e.target.checked)}
                      className="h-5 w-5 rounded border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-primary focus:ring-primary"
                    />
                    <span className="text-foreground-light dark:text-foreground-dark">Email</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactPreferences.sms}
                      onChange={(e) => handleContactPreferenceChange('sms', e.target.checked)}
                      className="h-5 w-5 rounded border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-primary focus:ring-primary"
                    />
                    <span className="text-foreground-light dark:text-foreground-dark">SMS</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactPreferences.voice}
                      onChange={(e) => handleContactPreferenceChange('voice', e.target.checked)}
                      className="h-5 w-5 rounded border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-primary focus:ring-primary"
                    />
                    <span className="text-foreground-light dark:text-foreground-dark">Voice</span>
                  </label>
                </div>
              </div>

              {/* Medical Information Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Medical Information
                </h3>
                <Select
                  label="Blood Type"
                  value={formData.blood_type}
                  onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                  options={[
                    { value: '', label: 'Select blood type' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                  ]}
                />
              </div>

              {/* Next of Kin Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Next of Kin
                </h3>
                <div className="space-y-4">
                  <TextField
                    label="Name"
                    value={nextOfKin.name}
                    onChange={(e) => setNextOfKin({ ...nextOfKin, name: e.target.value })}
                  />
                  <TextField
                    label="Relationship"
                    value={nextOfKin.relationship}
                    onChange={(e) => setNextOfKin({ ...nextOfKin, relationship: e.target.value })}
                  />
                  <PhoneField
                    label="Contact Number"
                    value={nextOfKin.contact_number}
                    onChange={(e) => setNextOfKin({ ...nextOfKin, contact_number: e.target.value })}
                  />
                </div>
              </div>

              {/* Assigned Clinician Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">
                  Assigned Clinician
                </h3>
                {assignedClinician ? (
                  <>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {assignedClinician.profile_picture ? (
                          <img
                            src={assignedClinician.profile_picture}
                            alt={assignedClinician.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.material-symbols-outlined')) {
                                const icon = document.createElement('span');
                                icon.className = 'material-symbols-outlined text-primary text-2xl';
                                icon.textContent = 'person';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-primary text-2xl">person</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground-light dark:text-foreground-dark truncate">
                          {assignedClinician.name}
                        </p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">
                          {Array.isArray(assignedClinician.specialty) 
                            ? assignedClinician.specialty.join(', ') 
                            : (assignedClinician.specialty || 'General Medicine')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAssignStaffModal(true)}
                      className="w-full h-11 px-4 rounded-lg font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                    >
                      Assign New Staff
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAssignStaffModal(true)}
                    className="w-full h-11 px-4 rounded-lg font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                  >
                    Assign Clinician
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
              Appointments
            </h2>
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <DataTable
                data={appointments}
                columns={appointmentColumns}
                emptyMessage="No appointments found for this patient"
                emptyIcon="event_busy"
                onRowClick={(row) => navigate(`/hospital/appointments?appointmentId=${row.id}&date=${row.appointment_date}`)}
              />
            )}
          </div>
        )}

        {/* Health Records Tab */}
        {activeTab === 'health' && (
          <HealthRecordsTab 
            hospitalId={hospitalId} 
            patientId={patientId || ''} 
            patient={patient}
            assignedClinician={assignedClinician}
            formData={formData}
          />
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
              Notes
            </h2>
            <div className="space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this patient..."
                className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleNotesSave}
                  disabled={updatePatientMutation.isPending}
                  className="h-12 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePatientMutation.isPending ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-8">
            {isLoadingBilling ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* Outstanding Bills Section */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                  <h2 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                    Outstanding Bills
                  </h2>
                  {billingData?.outstandingBills && billingData.outstandingBills.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {billingData.outstandingBills.map((bill) => {
                        const dueDate = new Date(bill.due_date);
                        const today = new Date();
                        const isOverdue = dueDate < today && bill.status === 'overdue';
                        const isPending = bill.status === 'pending';
                        
                        return (
                          <div
                            key={bill.id}
                            className={clsx(
                              'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                              isOverdue
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : isPending
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark'
                            )}
                            onClick={() => handleViewInvoice(bill.invoice_number)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                                    Invoice #{bill.invoice_number}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p className="text-subtle-light dark:text-subtle-dark">
                                    Due: {dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    {isOverdue && (
                                      <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
                                        (Overdue)
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                                    ${bill.amount.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewInvoice(bill.invoice_number);
                                }}
                                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                              >
                                View Invoice
                              </button>
                            </div>
                            <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleSendReminder(bill.id)}
                                disabled={sendBillReminderMutation.isPending}
                                className="h-10 px-4 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {sendBillReminderMutation.isPending ? 'Sending...' : 'Send Reminder'}
                              </button>
                              <button
                                onClick={() => handleMarkAsPaid(bill.id)}
                                disabled={markBillAsPaidMutation.isPending}
                                className="h-10 px-4 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {markBillAsPaidMutation.isPending ? 'Processing...' : 'Mark as Paid'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                      No outstanding bills
                    </div>
                  )}
                </div>

                {/* Payment History Section */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
                      Payment History
                    </h2>
                    <button
                      onClick={handleNewTransaction}
                      className="h-10 px-4 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      New Transaction
                    </button>
                  </div>
                  
                  {billingData?.paymentHistory && billingData.paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border-light dark:border-border-dark">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-subtle-light dark:text-subtle-dark">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-subtle-light dark:text-subtle-dark">
                              Service
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-subtle-light dark:text-subtle-dark">
                              Amount
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-subtle-light dark:text-subtle-dark">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-subtle-light dark:text-subtle-dark">
                              Invoice
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingData.paymentHistory.map((payment) => (
                            <tr
                              key={payment.id}
                              className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors cursor-pointer"
                              onClick={() => handleViewInvoice(payment.invoice_number)}
                            >
                              <td className="py-3 px-4 text-sm text-foreground-light dark:text-foreground-dark">
                                {new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground-light dark:text-foreground-dark">
                                {payment.service}
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                                ${payment.amount.toFixed(2)}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={clsx(
                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                    payment.status === 'paid'
                                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                  )}
                                >
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleViewInvoice(payment.invoice_number)}
                                  className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                                >
                                  View Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                      No payment history available
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Assign Staff Modal */}
      <Modal
        isOpen={showAssignStaffModal}
        onClose={() => setShowAssignStaffModal(false)}
        title="Assign Staff to Patient"
        size="lg"
      >
        <AssignStaffModalContent
          clinicians={clinicians}
          assignedClinicianId={assignedClinicianId}
          onAssign={handleAssignStaff}
          onUnassign={handleUnassignStaff}
          onClose={() => setShowAssignStaffModal(false)}
        />
      </Modal>

      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={showNewTransactionModal}
        onClose={() => setShowNewTransactionModal(false)}
        patientId={patientId || ''}
        hospitalId={hospitalId}
        patientName={patientFullName}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['hospital', 'patient', 'billing', hospitalId, patientId] });
          setShowNewTransactionModal(false);
        }}
      />
    </AppShell>
  );
};

// Assign Staff Modal Content Component
const AssignStaffModalContent = ({
  clinicians,
  assignedClinicianId,
  onAssign,
  onUnassign,
  onClose,
}: {
  clinicians: Clinician[];
  assignedClinicianId?: number;
  onAssign: (clinicianId: number) => void;
  onUnassign: () => void;
  onClose: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter clinicians based on search
  const filteredClinicians = clinicians.filter((clinician) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = clinician.name.toLowerCase();
    const role = (clinician.role || '').toLowerCase();
    const specialty = Array.isArray(clinician.specialty)
      ? clinician.specialty.join(' ').toLowerCase()
      : (clinician.specialty || '').toLowerCase();
    const email = (clinician.email || '').toLowerCase();

    return (
      name.includes(query) ||
      role.includes(query) ||
      specialty.includes(query) ||
      email.includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
        Select a staff member to assign to this patient. You can search by name, role, or specialty.
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-sm">
          search
        </span>
        <input
          type="text"
          placeholder="Search staff by name, role, or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {/* Staff List */}
      <div className="max-h-96 overflow-y-auto space-y-2 border border-border-light dark:border-border-dark rounded-lg p-2">
        {filteredClinicians.length === 0 ? (
          <div className="text-center py-8 text-subtle-light dark:text-subtle-dark">
            <span className="material-symbols-outlined text-4xl mb-2 block">people</span>
            <p>{searchQuery ? 'No staff members found' : 'No staff members available'}</p>
          </div>
        ) : (
          filteredClinicians.map((clinician) => {
            const isAssigned = clinician.id === assignedClinicianId;
            const specialties = Array.isArray(clinician.specialty)
              ? clinician.specialty.join(', ')
              : clinician.specialty || 'General Medicine';

            return (
              <div
                key={clinician.id}
                className={clsx(
                  'w-full p-3 rounded-lg border transition-colors',
                  isAssigned
                    ? 'bg-primary/20 dark:bg-primary/30 border-primary dark:border-primary/50'
                    : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {clinician.profile_picture ? (
                      <img
                        src={clinician.profile_picture}
                        alt={clinician.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.material-symbols-outlined')) {
                            const icon = document.createElement('span');
                            icon.className = 'material-symbols-outlined text-primary';
                            icon.textContent = 'person';
                            parent.appendChild(icon);
                          }
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary">person</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground-light dark:text-foreground-dark truncate">
                        {clinician.name}
                      </p>
                      {isAssigned && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white flex-shrink-0">
                          Assigned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
                      {clinician.role && (
                        <>
                          <span className="truncate">{clinician.role}</span>
                          <span>•</span>
                        </>
                      )}
                      <span className="truncate">{specialties}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isAssigned ? (
                      <button
                        type="button"
                        onClick={onUnassign}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Unassign
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAssign(clinician.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// New Transaction Modal Component
const NewTransactionModal = ({
  isOpen,
  onClose,
  patientId,
  hospitalId,
  patientName,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  hospitalId: string;
  patientName: string;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    service: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'paid' as 'paid' | 'pending' | 'refunded',
    invoice_number: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.service.trim()) {
      newErrors.service = 'Service is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.invoice_number.trim()) {
      newErrors.invoice_number = 'Invoice number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate invoice number if not provided
      const invoiceNumber = formData.invoice_number || `INV-${Date.now()}`;
      
      await HospitalAPI.createTransaction(hospitalId, patientId, {
        service: formData.service,
        amount: parseFloat(formData.amount),
        date: formData.date,
        status: formData.status,
        invoice_number: invoiceNumber,
      });
      
      toast.success('Transaction created successfully');
      onSuccess();
      
      // Reset form
      setFormData({
        service: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        invoice_number: '',
      });
      setErrors({});
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Transaction"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
            Patient
          </label>
          <input
            type="text"
            value={patientName}
            disabled
            className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
          />
        </div>

        <TextField
          label="Service"
          value={formData.service}
          onChange={(e) => handleChange('service', e.target.value)}
          required
          error={errors.service}
          placeholder="e.g., Cardiology Consultation"
        />

        <div>
          <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className={clsx(
                "w-full h-12 pl-8 pr-4 rounded-lg border bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary",
                errors.amount
                  ? "border-red-500 dark:border-red-500"
                  : "border-border-light dark:border-border-dark"
              )}
              placeholder="0.00"
              required
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
          )}
        </div>

        <DateTimePicker
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
        )}

        <TextField
          label="Invoice Number"
          value={formData.invoice_number}
          onChange={(e) => handleChange('invoice_number', e.target.value)}
          required
          error={errors.invoice_number}
          placeholder="e.g., INV-00123"
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'refunded', label: 'Refunded' },
          ]}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientProfile;
