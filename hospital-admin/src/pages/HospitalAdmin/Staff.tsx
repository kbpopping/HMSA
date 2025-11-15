import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
 * Staff Page - Shows all staff members
 * 
 * Features:
 * - Table view with name, role, specialty, email, phone, created_at
 * - Search by name, email, specialty, or phone
 * - Create staff modal with role selection
 * - Clickable names to navigate to category-specific pages
 */
const Staff = () => {
  const navigate = useNavigate();
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
    role: '',
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

  // Fetch staff (clinicians)
  const { data: staff = [], isLoading, error } = useQuery<Clinician[]>({
    queryKey: ['hospital', 'clinicians', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listClinicians(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching staff:', err);
        return [];
      }
    },
  });

  // Fetch staff roles for the create modal
  const { data: staffRoles = [] } = useQuery({
    queryKey: ['hospital', 'staff-roles', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listStaffRoles(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        return [];
      }
    },
  });

  // Filter staff based on search query
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staff;
    
    const query = searchQuery.toLowerCase();
    return staff.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.specialty?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
    );
  }, [staff, searchQuery]);
  
  // Handle row click - navigate to category page
  const handleRowClick = (row: Clinician) => {
    if (!row.role) {
      toast.error('Staff member has no role assigned');
      return;
    }
    // Convert role name to route format
    const roleRoute = row.role.toLowerCase().replace(/\s+/g, '-');
    navigate(`/hospital/staff/${roleRoute}/${row.id}`);
  };

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => HospitalAPI.createClinician(hospitalId, payload),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'staff-roles'], exact: false });
      toast.success(`Staff member added successfully!`);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        specialties: [],
        email: '',
        phone: '',
        role: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add staff member');
    },
  });

  // Handle form submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!formData.role) {
      toast.error('Please select a role');
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
      role: formData.role,
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
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {row.original.role || '-'}
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
            Staff
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 justify-center sm:justify-start"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Staff</span>
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
              placeholder="Search by name, email, specialty, role, or phone..."
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
              Error loading staff. Please try refreshing the page.
            </p>
          </div>
        ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <DataTable
              data={filteredStaff}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No staff members found"
              emptyIcon="people"
              onRowClick={handleRowClick}
            />
          </div>
        )}

        {/* Add Staff Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Staff Member"
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
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: '', label: 'Select role' },
                ...staffRoles.map((role) => ({ value: role.name, label: role.name })),
              ]}
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
                {createMutation.isPending ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </AppShell>
  );
};

export default Staff;

