import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import clsx from 'clsx';
import AppShell from '../components/layout/AppShell';
import { ClinicianAPI, Appointment } from '../api/endpoints';
import { useAuth } from '../store/auth';
import TextField from '../components/forms/TextField';
import DateTimePicker from '../components/forms/DateTimePicker';
import Select from '../components/forms/Select';
import Spinner from '../components/feedback/Spinner';
import EmptyState from '../components/feedback/EmptyState';
import DataTable from '../components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import Modal from '../components/modals/Modal';
import { formatDate, formatTime, getDayOfWeek } from '../utils/date';

type TabType = 'overview' | 'appointments' | 'health' | 'notes';

type PatientWithExtras = {
  id: number;
  mrn: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
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
  clinicianId,
  patientId, 
  patient,
  clinicianName,
}: { 
  hospitalId: string; 
  clinicianId: string;
  patientId: string; 
  patient: PatientWithExtras | undefined;
  clinicianName: string;
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [historyFormData, setHistoryFormData] = useState({
    title: '',
    description: '',
    record_type: 'note',
    record_date: new Date().toISOString().split('T')[0],
  });

  // Fetch health records
  const { data: healthRecords, isLoading: isLoadingHealthRecords } = useQuery({
    queryKey: ['clinician', 'patient', 'health-records', hospitalId, clinicianId, patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      return await ClinicianAPI.getHealthRecords(hospitalId, clinicianId, patientId);
    },
    enabled: !!patientId,
  });

  // Add medical history mutation
  const addHistoryMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; record_type?: string; record_date?: string }) =>
      ClinicianAPI.addMedicalHistory(hospitalId, clinicianId, patientId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinician', 'patient', 'health-records', hospitalId, clinicianId, patientId] });
      toast.success('Medical history entry added successfully');
      setShowAddHistoryModal(false);
      setHistoryFormData({
        title: '',
        description: '',
        record_type: 'note',
        record_date: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add medical history entry');
    },
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
      await ClinicianAPI.uploadHealthDocument(hospitalId, clinicianId, patientId, file);
      toast.success('Document uploaded successfully. AI processing will begin shortly.');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh health records
      await queryClient.invalidateQueries({ queryKey: ['clinician', 'patient', 'health-records', hospitalId, clinicianId, patientId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle add history
  const handleAddHistory = () => {
    if (!historyFormData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    addHistoryMutation.mutate(historyFormData);
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
          onClick={() => setShowAddHistoryModal(true)}
          className="h-11 px-4 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add Medical History</span>
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
                  {patient?.blood_type || 'Not specified'}
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

      {/* Add Medical History Modal */}
      <Modal
        isOpen={showAddHistoryModal}
        onClose={() => setShowAddHistoryModal(false)}
        title="Add Medical History Entry"
        size="lg"
      >
        <div className="space-y-4">
          <TextField
            label="Title"
            value={historyFormData.title}
            onChange={(e) => setHistoryFormData({ ...historyFormData, title: e.target.value })}
            placeholder="e.g., Routine Check-up, Follow-up Consultation"
            required
          />
          <div>
            <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
              Description
            </label>
            <textarea
              value={historyFormData.description}
              onChange={(e) => setHistoryFormData({ ...historyFormData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter detailed notes about the visit, diagnosis, treatment, or observations..."
            />
          </div>
          <Select
            label="Record Type"
            value={historyFormData.record_type}
            onChange={(e) => setHistoryFormData({ ...historyFormData, record_type: e.target.value })}
            options={[
              { value: 'note', label: 'Note' },
              { value: 'diagnosis', label: 'Diagnosis' },
              { value: 'treatment', label: 'Treatment' },
              { value: 'procedure', label: 'Procedure' },
              { value: 'follow-up', label: 'Follow-up' },
            ]}
          />
          <DateTimePicker
            label="Record Date"
            type="date"
            value={historyFormData.record_date}
            onChange={(e) => setHistoryFormData({ ...historyFormData, record_date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
            <button
              onClick={() => setShowAddHistoryModal(false)}
              className="h-11 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHistory}
              disabled={addHistoryMutation.isPending}
              className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addHistoryMutation.isPending ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * Patient Profile Page - Clinician Portal
 * 
 * Features:
 * - Tabs: Overview, Appointments, Health Records, Notes
 * - Overview tab with patient information (read-only)
 * - View patient's appointments
 * - Health records with ability to add entries and upload documents
 * - Notes management
 */
const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';
  const clinicianId = user?.id?.toString() || '1';
  const clinicianName = user?.name || 'Clinician';

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [notes, setNotes] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch patient data
  const { data: patient, isLoading: isLoadingPatient, error: patientError } = useQuery<PatientWithExtras>({
    queryKey: ['clinician', 'patient', hospitalId, clinicianId, patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      return await ClinicianAPI.getPatient(hospitalId, clinicianId, patientId);
    },
    enabled: !!patientId,
  });

  // Fetch patient's appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['clinician', 'appointments', hospitalId, clinicianId, 'patient', patientId],
    queryFn: async () => {
      try {
        const result = await ClinicianAPI.getPatientAppointments(hospitalId, clinicianId, patientId || '');
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching patient appointments:', err);
        return [];
      }
    },
    enabled: !!patientId,
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: (notes: string) => {
      if (!patientId) throw new Error('Patient ID is required');
      return ClinicianAPI.updatePatientNotes(hospitalId, clinicianId, patientId, notes);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinician', 'patient', hospitalId, clinicianId, patientId] });
      toast.success('Notes updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notes');
    },
  });

  // Initialize notes when patient loads
  useEffect(() => {
    if (patient) {
      setNotes(patient.notes || '');
    }
  }, [patient]);

  // Handle notes save
  const handleNotesSave = () => {
    updateNotesMutation.mutate(notes);
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
              Patient not found or you don't have access to this patient. Please check the patient ID.
            </p>
            <button
              onClick={() => navigate('/patients')}
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
            onClick={() => navigate('/patients')}
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
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={patient.first_name}
                      readOnly
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={patient.last_name}
                      readOnly
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}
                      readOnly
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={patient.gender || '-'}
                      readOnly
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={patient.phone || '-'}
                      readOnly
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                    />
                  </div>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={patient.email || ''}
                    onChange={() => {}}
                    disabled
                  />
                </div>
              </div>

              {/* Address Card */}
              {patient.street_address && (
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                  <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                    Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={patient.street_address}
                        readOnly
                        className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                      />
                    </div>
                    <TextField
                      label="City"
                      value={patient.city || ''}
                      onChange={() => {}}
                      disabled
                    />
                    <TextField
                      label="State"
                      value={patient.state || ''}
                      onChange={() => {}}
                      disabled
                    />
                    <TextField
                      label="Zip Code"
                      value={patient.zip_code || ''}
                      onChange={() => {}}
                      disabled
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              {/* Medical Information Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Medical Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    value={patient.blood_type || 'Not specified'}
                    readOnly
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              {/* Next of Kin Card */}
              {patient.next_of_kin && (
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                  <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                    Next of Kin
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={patient.next_of_kin.name || '-'}
                        readOnly
                        className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={patient.next_of_kin.relationship || '-'}
                        readOnly
                        className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={patient.next_of_kin.contact_number || '-'}
                        readOnly
                        className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark cursor-not-allowed opacity-60"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                onRowClick={(row) => setSelectedAppointment(row)}
              />
            )}
          </div>
        )}

        {/* Health Records Tab */}
        {activeTab === 'health' && (
          <HealthRecordsTab 
            hospitalId={hospitalId} 
            clinicianId={clinicianId}
            patientId={patientId || ''} 
            patient={patient}
            clinicianName={clinicianName}
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
                  disabled={updateNotesMutation.isPending}
                  className="h-12 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                  Appointment Details
                </h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                    Appointment Number
                  </label>
                  <p className="text-foreground-light dark:text-foreground-dark font-semibold">
                    {selectedAppointment.appointment_number || `#${selectedAppointment.id}`}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                    Status
                  </label>
                  <span
                    className={clsx(
                      'inline-block px-3 py-1 rounded-lg text-sm font-medium border',
                      selectedAppointment.status === 'scheduled' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                      selectedAppointment.status === 'confirmed' && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                      selectedAppointment.status === 'completed' && 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
                      selectedAppointment.status === 'cancelled' && 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                      selectedAppointment.status === 'no-show' && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                    )}
                  >
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                  Patient
                </label>
                <p className="text-foreground-light dark:text-foreground-dark font-semibold text-lg">
                  {selectedAppointment.patient_name}
                </p>
                {selectedAppointment.patient_mrn && (
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                    MRN: {selectedAppointment.patient_mrn}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                  Date & Time
                </label>
                <p className="text-foreground-light dark:text-foreground-dark font-semibold">
                  {formatDate(selectedAppointment.appointment_date)} ({getDayOfWeek(selectedAppointment.appointment_date)})
                </p>
                <p className="text-foreground-light dark:text-foreground-dark">
                  {formatTime(selectedAppointment.appointment_time)}
                </p>
              </div>

              {selectedAppointment.clinician_name && (
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                    Clinician
                  </label>
                  <p className="text-foreground-light dark:text-foreground-dark">
                    {selectedAppointment.clinician_names && selectedAppointment.clinician_names.length > 0
                      ? selectedAppointment.clinician_names.join(', ')
                      : selectedAppointment.clinician_name}
                  </p>
                </div>
              )}
              
              {selectedAppointment.reason && (
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                    Reason
                  </label>
                  <p className="text-foreground-light dark:text-foreground-dark">
                    {selectedAppointment.reason}
                  </p>
                </div>
              )}
              
              {(selectedAppointment as any).notes && (
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                    Notes
                  </label>
                  <p className="text-foreground-light dark:text-foreground-dark">
                    {(selectedAppointment as any).notes}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-2">
                  Created
                </label>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {new Date(selectedAppointment.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default PatientProfile;

