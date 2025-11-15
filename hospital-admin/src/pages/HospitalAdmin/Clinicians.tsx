import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, Clinician } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Modal from '../../components/modals/Modal';
import TextField from '../../components/forms/TextField';
import PhoneField from '../../components/forms/PhoneField';
import Select from '../../components/forms/Select';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';

/**
 * Clinicians Page
 * 
 * Features:
 * - Table view with name, specialty, email, phone, created_at
 * - Search by name, email, specialty, or phone
 * - Create clinician modal with form validation
 */
const Clinicians = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialties: [] as string[],
    email: '',
    phone: '',
  });

  // Common specialties
  const specialties = [
    'Cardiology',
    'Pediatrics',
    'General Medicine',
    'Orthopedics',
    'Neurology',
    'Dermatology',
    'Oncology',
    'Psychiatry',
    'Emergency Medicine',
    'Internal Medicine',
    'Surgery',
    'Radiology',
    'Anesthesiology',
    'Pathology',
    'Other',
  ];

  // Fetch clinicians with search
  const { data: clinicians = [], isLoading, error } = useQuery<Clinician[]>({
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

  // Filter clinicians based on search query
  const filteredClinicians = useMemo(() => {
    if (!searchQuery.trim()) return clinicians;
    const query = searchQuery.toLowerCase();
    return clinicians.filter(
      (clinician) => {
        const specialty = clinician.specialty;
        const specialtyStr = Array.isArray(specialty) ? specialty.join(' ') : (specialty || '');
        return (
          clinician.name.toLowerCase().includes(query) ||
          clinician.email?.toLowerCase().includes(query) ||
          specialtyStr.toLowerCase().includes(query) ||
          clinician.phone?.toLowerCase().includes(query)
        );
      }
    );
  }, [clinicians, searchQuery]);

  // Create clinician mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => HospitalAPI.createClinician(hospitalId, payload),
    onSuccess: async (data) => {
      // Invalidate and refetch clinicians list
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      toast.success(`Clinician created successfully!`);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        specialties: [],
        email: '',
        phone: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create clinician');
    },
  });

  // Handle form submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      specialty: formData.specialties.length > 0 ? (formData.specialties.length === 1 ? formData.specialties[0] : formData.specialties) : undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
    });
  };

  // Table columns
  const columns = useMemo<ColumnDef<Clinician>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-foreground-light dark:text-foreground-dark">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'specialty',
        header: 'Specialty',
        cell: ({ row }) => {
          const specialty = row.original.specialty;
          if (!specialty) return <span className="text-sm text-subtle-light dark:text-subtle-dark">-</span>;
          const specialties = Array.isArray(specialty) ? specialty : [specialty];
          return (
            <span className="text-sm text-subtle-light dark:text-subtle-dark">
              {specialties.join(', ')}
            </span>
          );
        },
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
            Clinicians
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 justify-center sm:justify-start"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Clinician</span>
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
              placeholder="Search by name, email, specialty, or phone..."
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
              Error loading clinicians. Please try refreshing the page.
            </p>
          </div>
        ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <DataTable
              data={filteredClinicians}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No clinicians found"
              emptyIcon="medical_services"
            />
          </div>
        )}

        {/* Create Clinician Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Clinician"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. John Doe"
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                Specialty (Optional) - Select one or more
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-border-light dark:border-border-dark rounded-lg p-3 bg-background-light dark:bg-background-dark">
                {specialties.map((spec) => (
                  <label
                    key={spec}
                    className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(spec)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, specialties: [...formData.specialties, spec] });
                        } else {
                          setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== spec) });
                        }
                      }}
                      className="w-4 h-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-foreground-light dark:text-foreground-dark">{spec}</span>
                  </label>
                ))}
              </div>
              {formData.specialties.length > 0 && (
                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">
                  Selected: {formData.specialties.join(', ')}
                </p>
              )}
            </div>
            <TextField
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@hospital.com"
            />
            <PhoneField
              label="Phone (Optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
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
                {createMutation.isPending ? 'Creating...' : 'Add Clinician'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
};

export default Clinicians;
