import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, AllPatientsData } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Spinner from '../../components/feedback/Spinner';
import DataTable from '../../components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';

/**
 * All Staff Patients Page
 * Shows all patients ever handled by a staff member
 */
const AllStaffPatients = () => {
  const { category, staffId } = useParams<{ category: string; staffId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  const { data: patientsData, isLoading, error } = useQuery<AllPatientsData>({
    queryKey: ['hospital', 'staff', 'all-patients', hospitalId, staffId],
    queryFn: () => HospitalAPI.getAllStaffPatients(hospitalId, staffId || ''),
    enabled: !!staffId,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const columns: ColumnDef<AllPatientsData['patients'][0]>[] = [
    {
      accessorKey: 'name',
      header: 'Patient Name',
      cell: ({ row }) => (
        <span className="font-medium text-foreground-light dark:text-foreground-dark">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'mrn',
      header: 'MRN',
      cell: ({ row }) => (
        <span className="text-sm text-subtle-light dark:text-subtle-dark">
          {row.original.mrn}
        </span>
      ),
    },
    {
      accessorKey: 'firstAppointment',
      header: 'First Appointment',
      cell: ({ row }) => (
        <span className="text-sm text-subtle-light dark:text-subtle-dark">
          {formatDate(row.original.firstAppointment)}
        </span>
      ),
    },
    {
      accessorKey: 'lastAppointment',
      header: 'Last Appointment',
      cell: ({ row }) => (
        <span className="text-sm text-subtle-light dark:text-subtle-dark">
          {formatDate(row.original.lastAppointment)}
        </span>
      ),
    },
    {
      accessorKey: 'totalAppointments',
      header: 'Total Appointments',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
          {row.original.totalAppointments}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !patientsData) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Error loading patients. Please try refreshing the page.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Use category from URL params, or derive from role if not available
  const finalCategory = category || (() => {
    const roleLower = patientsData.staffInfo.role.toLowerCase();
    if (roleLower.includes('clinician')) return 'clinicians';
    if (roleLower.includes('nurse')) return 'nurses';
    if (roleLower.includes('reception')) return 'receptionists';
    if (roleLower.includes('security')) return 'security';
    if (roleLower.includes('support')) return 'support-staff';
    return 'staff';
  })();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
            <button
              onClick={() => navigate('/hospital/staff')}
              className="hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
            >
              Staff
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/hospital/staff/${finalCategory}`)}
              className="hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
            >
              {patientsData.staffInfo.role}
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/hospital/staff/${finalCategory}/${staffId}`)}
              className="hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
            >
              {patientsData.staffInfo.name}
            </button>
            <span>/</span>
            <span className="text-foreground-light dark:text-foreground-dark">All Patients</span>
          </div>

          {/* Title and Back Button */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
                All Patients
              </h1>
              <p className="text-subtle-light dark:text-subtle-dark">
                Total: {patientsData.totalCount.toLocaleString()} patients handled by {patientsData.staffInfo.name}
                {patientsData.staffInfo.specialty && ` (${patientsData.staffInfo.specialty})`}
              </p>
            </div>
            <button
              onClick={() => navigate(`/hospital/staff/${finalCategory}/${staffId}`)}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors flex items-center gap-2 font-medium"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Profile</span>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
          <DataTable
            data={patientsData.patients}
            columns={columns}
            isLoading={false}
            emptyMessage="No patients found"
            emptyIcon="people"
            onRowClick={(row) => navigate(`/hospital/patients/${row.id}`)}
          />
        </div>
      </div>
    </AppShell>
  );
};

export default AllStaffPatients;

