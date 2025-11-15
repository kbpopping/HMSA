import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, Patient } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Modal from '../../components/modals/Modal';
import TextField from '../../components/forms/TextField';
import PhoneField from '../../components/forms/PhoneField';
import DateTimePicker from '../../components/forms/DateTimePicker';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';
import clsx from 'clsx';

/**
 * Patients Page
 * 
 * Features:
 * - Table view with MRN, name, email, phone, DOB, created_at
 * - Search by name/email/MRN/phone
 * - Create patient modal
 * - Row click navigation to Patient Profile
 */
const Patients = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
  });

  // Fetch all patients
  const { data: allPatients = [], isLoading, error } = useQuery<Patient[]>({
    queryKey: ['hospital', 'patients', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listPatients(hospitalId, {});
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching patients:', err);
        return [];
      }
    },
  });

  // Filter patients client-side based on search query
  const patients = useMemo(() => {
    if (!searchQuery.trim()) return allPatients;
    
    const query = searchQuery.toLowerCase();
    return allPatients.filter((patient) => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const email = (patient.email || '').toLowerCase();
      const mrn = (patient.mrn || '').toLowerCase();
      const phone = (patient.phone || '').toLowerCase();
      
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        mrn.includes(query) ||
        phone.includes(query)
      );
    });
  }, [allPatients, searchQuery]);

  // Create patient mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => HospitalAPI.createPatient(hospitalId, payload),
    onSuccess: async (data) => {
      // Invalidate and refetch patients list
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'patients'], exact: false });
      toast.success(`Patient created successfully! MRN: ${data.mrn}`);
      setIsCreateModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create patient');
    },
  });

  // Handle form submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      toast.error('First name and last name are required');
      return;
    }
    createMutation.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      date_of_birth: formData.date_of_birth || undefined,
    });
  };

  // Table columns
  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        accessorKey: 'mrn',
        header: 'MRN',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium text-foreground-light dark:text-foreground-dark">
            {row.original.mrn}
          </span>
        ),
      },
      {
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-foreground-light dark:text-foreground-dark">
            {row.original.first_name} {row.original.last_name}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {row.original.email || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {row.original.phone || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'date_of_birth',
        header: 'Date of Birth',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {row.original.date_of_birth
              ? new Date(row.original.date_of_birth).toLocaleDateString()
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            Patients
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 justify-center sm:justify-start"
          >
            <span className="material-symbols-outlined">add</span>
            <span>New Patient</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, MRN, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Error loading patients. Please try refreshing the page.
            </p>
          </div>
        ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <DataTable
              data={patients}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No patients found"
              emptyIcon="people"
              onRowClick={(row) => navigate(`/hospital/patients/${row.id}`)}
            />
          </div>
        )}

        {/* Create Patient Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Patient"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                required
              />
              <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
            <TextField
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
            />
            <PhoneField
              label="Phone (Optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
            />
            <DateTimePicker
              label="Date of Birth (Optional)"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Patient'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
};

export default Patients;
