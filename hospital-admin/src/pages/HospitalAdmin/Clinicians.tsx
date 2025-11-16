import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, Clinician, StaffRole } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Modal from '../../components/modals/Modal';
import TextField from '../../components/forms/TextField';
import PhoneField from '../../components/forms/PhoneField';
import Select from '../../components/forms/Select';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';
import ProfilePicture from '../../components/ProfilePicture';

/**
 * Clinicians Page
 * 
 * Features:
 * - Statistics cards (Total, Active)
 * - Table view with name, role, specialty, email, phone, actions
 * - Search and filter by role, specialty, status
 * - Create, edit, delete clinician
 * - Export to CSV
 * - Navigate to staff profile
 * - Mobile responsive design
 */
const Clinicians = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState<Clinician | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialties: [] as string[],
    email: '',
    phone: '',
    role: '',
    date_joined: '',
    marital_status: '',
    home_address: '',
    qualifications: '',
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

  // Marital status options
  const maritalStatusOptions = [
    { value: '', label: 'Select status...' },
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' },
  ];

  // Fetch clinicians
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

  // Fetch staff roles
  const { data: staffRoles = [] } = useQuery<StaffRole[]>({
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

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = clinicians.length;
    // Assume all clinicians are active for now (can be enhanced with status field)
    const active = clinicians.length;
    
    // Count by specialty
    const specialtyCount: Record<string, number> = {};
    clinicians.forEach((c) => {
      const specs = Array.isArray(c.specialty) ? c.specialty : (c.specialty ? [c.specialty] : []);
      specs.forEach((spec) => {
        specialtyCount[spec] = (specialtyCount[spec] || 0) + 1;
      });
    });

    return { total, active, specialtyCount };
  }, [clinicians]);

  // Filter clinicians based on search query and filters
  const filteredClinicians = useMemo(() => {
    let result = clinicians;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((clinician) => {
        const specialty = clinician.specialty;
        const specialtyStr = Array.isArray(specialty) ? specialty.join(' ') : (specialty || '');
        return (
          clinician.name.toLowerCase().includes(query) ||
          clinician.email?.toLowerCase().includes(query) ||
          specialtyStr.toLowerCase().includes(query) ||
          clinician.phone?.toLowerCase().includes(query) ||
          clinician.role?.toLowerCase().includes(query)
        );
      });
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter((c) => c.role === roleFilter);
    }

    // Apply specialty filter
    if (specialtyFilter) {
      result = result.filter((c) => {
        const specs = Array.isArray(c.specialty) ? c.specialty : (c.specialty ? [c.specialty] : []);
        return specs.includes(specialtyFilter);
      });
    }

    return result;
  }, [clinicians, searchQuery, roleFilter, specialtyFilter]);

  // Get unique specialties for filter dropdown
  const uniqueSpecialties = useMemo(() => {
    const specs = new Set<string>();
    clinicians.forEach((c) => {
      const clinicianSpecs = Array.isArray(c.specialty) ? c.specialty : (c.specialty ? [c.specialty] : []);
      clinicianSpecs.forEach((s) => specs.add(s));
    });
    return Array.from(specs).sort();
  }, [clinicians]);

  // Create clinician mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => HospitalAPI.createClinician(hospitalId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'staff-roles'], exact: false });
      toast.success('Clinician created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create clinician');
    },
  });

  // Update clinician mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      HospitalAPI.updateClinician(hospitalId, id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      toast.success('Clinician updated successfully!');
      setIsEditModalOpen(false);
      setSelectedClinician(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update clinician');
    },
  });

  // Delete clinician mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => HospitalAPI.deleteClinician(hospitalId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'staff-roles'], exact: false });
      toast.success('Clinician deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedClinician(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete clinician. Staff member may have existing appointments.');
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      specialties: [],
      email: '',
      phone: '',
      role: '',
      date_joined: '',
      marital_status: '',
      home_address: '',
      qualifications: '',
    });
  };

  // Handle create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      specialty: formData.specialties.length > 0 ? (formData.specialties.length === 1 ? formData.specialties[0] : formData.specialties) : undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      role: formData.role || undefined,
      date_joined: formData.date_joined || undefined,
      marital_status: formData.marital_status || undefined,
      home_address: formData.home_address.trim() || undefined,
      qualifications: formData.qualifications.trim() || undefined,
    });
  };

  // Handle edit
  const handleEdit = (clinician: Clinician) => {
    setSelectedClinician(clinician);
    const specs = Array.isArray(clinician.specialty) ? clinician.specialty : (clinician.specialty ? [clinician.specialty] : []);
    setFormData({
      name: clinician.name,
      specialties: specs,
      email: clinician.email || '',
      phone: clinician.phone || '',
      role: clinician.role || '',
      date_joined: clinician.date_joined || '',
      marital_status: clinician.marital_status || '',
      home_address: clinician.home_address || '',
      qualifications: clinician.qualifications || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinician) return;

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    updateMutation.mutate({
      id: String(selectedClinician.id),
      payload: {
        name: formData.name.trim(),
        specialty: formData.specialties.length > 0 ? (formData.specialties.length === 1 ? formData.specialties[0] : formData.specialties.join(', ')) : undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role: formData.role || undefined,
        date_joined: formData.date_joined || undefined,
        marital_status: formData.marital_status || undefined,
        home_address: formData.home_address.trim() || undefined,
        qualifications: formData.qualifications.trim() || undefined,
      },
    });
  };

  // Handle delete
  const handleDelete = (clinician: Clinician) => {
    setSelectedClinician(clinician);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!selectedClinician) return;
    deleteMutation.mutate(String(selectedClinician.id));
  };

  // Handle row click - navigate to profile
  const handleRowClick = (clinician: Clinician) => {
    if (!clinician.role) {
      toast.error('Staff member has no role assigned');
      return;
    }
    const roleRoute = clinician.role.toLowerCase().replace(/\s+/g, '-');
    navigate(`/hospital/staff/${roleRoute}/${clinician.id}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setSpecialtyFilter('');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredClinicians.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Name', 'Role', 'Specialty', 'Email', 'Phone', 'Date Joined', 'Created'];
    const rows = filteredClinicians.map((c) => {
      const specs = Array.isArray(c.specialty) ? c.specialty.join('; ') : (c.specialty || '-');
      return [
        c.name,
        c.role || '-',
        specs,
        c.email || '-',
        c.phone || '-',
        c.date_joined || '-',
        new Date(c.created_at).toLocaleDateString(),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clinicians_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Clinicians exported successfully');
  };

  // Active filters count
  const activeFiltersCount = [searchQuery, roleFilter, specialtyFilter].filter(Boolean).length;

  // Table columns
  const columns = useMemo<ColumnDef<Clinician>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <button
            onClick={() => handleRowClick(row.original)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
          >
            <ProfilePicture
              src={row.original.profile_picture}
              alt={row.original.name}
              size="sm"
            />
            <span className="font-medium text-foreground-light dark:text-foreground-dark">
              {row.original.name}
            </span>
          </button>
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
            <div className="flex flex-wrap gap-1">
              {specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                >
                  {spec}
                </span>
              ))}
            </div>
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
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.original);
              }}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
              title="Edit"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.original);
              }}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
              title="Delete"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            Clinicians
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredClinicians.length === 0}
              className="px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors font-medium flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 justify-center"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Clinician</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">
                  Total Clinicians
                </p>
                <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                  {statistics.total}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary text-2xl">
                  medical_services
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">
                  Active Clinicians
                </p>
                <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                  {statistics.active}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                  check_circle
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">
                  Top Specialty
                </p>
                <p className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
                  {Object.keys(statistics.specialtyCount).length > 0
                    ? Object.entries(statistics.specialtyCount).sort((a, b) => b[1] - a[1])[0][0]
                    : 'N/A'}
                </p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                  {Object.keys(statistics.specialtyCount).length > 0
                    ? `${Object.entries(statistics.specialtyCount).sort((a, b) => b[1] - a[1])[0][1]} clinicians`
                    : 'No specialties recorded'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                  star
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, specialty, phone, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              label=""
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1"
            >
              <option value="">All Roles</option>
              {staffRoles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name} ({role.staffCount})
                </option>
              ))}
            </Select>

            <Select
              label=""
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="flex-1"
            >
              <option value="">All Specialties</option>
              {uniqueSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </Select>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors font-medium flex items-center gap-2 justify-center whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                <span>Clear Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-300">
              Error loading clinicians. Please try refreshing the page.
            </p>
          </div>
        ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <DataTable
                data={filteredClinicians}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No clinicians found"
                emptyIcon="medical_services"
              />
            </div>
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
          title="Add New Clinician"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark border-b border-border-light dark:border-border-dark pb-2">
                Basic Information
              </h3>
              
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Role (Optional)"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select role...</option>
                  {staffRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Marital Status (Optional)"
                  value={formData.marital_status}
                  onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                >
                  {maritalStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <TextField
                label="Date Joined (Optional)"
                type="date"
                value={formData.date_joined}
                onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
              />
            </div>

            {/* Specialty Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
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
                          setFormData({ ...formData, specialties: formData.specialties.filter((s) => s !== spec) });
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

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark border-b border-border-light dark:border-border-dark pb-2">
                Additional Information
              </h3>

              <TextField
                label="Home Address (Optional)"
                value={formData.home_address}
                onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                placeholder="123 Main Street, City, State"
              />

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Qualifications (Optional)
                </label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="MD, PhD, Board Certified in..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-base resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {createMutation.isPending ? 'Creating...' : 'Add Clinician'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClinician(null);
            resetForm();
          }}
          title="Edit Clinician"
          size="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Same form fields as create modal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark border-b border-border-light dark:border-border-dark pb-2">
                Basic Information
              </h3>
              
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Role (Optional)"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select role...</option>
                  {staffRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Marital Status (Optional)"
                  value={formData.marital_status}
                  onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                >
                  {maritalStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <TextField
                label="Date Joined (Optional)"
                type="date"
                value={formData.date_joined}
                onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
              />
            </div>

            {/* Specialty Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
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
                          setFormData({ ...formData, specialties: formData.specialties.filter((s) => s !== spec) });
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

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark border-b border-border-light dark:border-border-dark pb-2">
                Additional Information
              </h3>

              <TextField
                label="Home Address (Optional)"
                value={formData.home_address}
                onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                placeholder="123 Main Street, City, State"
              />

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Qualifications (Optional)
                </label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="MD, PhD, Board Certified in..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-base resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedClinician(null);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Clinician'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedClinician(null);
          }}
          title="Delete Clinician"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-foreground-light dark:text-foreground-dark">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{selectedClinician?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedClinician(null);
                }}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
};

export default Clinicians;
