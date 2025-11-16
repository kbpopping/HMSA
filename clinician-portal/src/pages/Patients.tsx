import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import AppShell from '../components/layout/AppShell';
import { ClinicianAPI, Patient } from '../api/endpoints';
import { useAuth } from '../store/auth';
import DataTable from '../components/tables/DataTable';
import Spinner from '../components/feedback/Spinner';
import EmptyState from '../components/feedback/EmptyState';
import clsx from 'clsx';

/**
 * Patients Page - Clinician Portal
 * 
 * Features:
 * - Table view with MRN, name, email, phone, DOB
 * - Only shows assigned patients
 * - Search by name/MRN/phone
 * - Row click navigation to Patient Profile
 * - No create patient button (only hospital admin can create)
 */
const Patients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';
  const clinicianId = user?.id?.toString() || '1';

  // State
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch assigned patients
  const { data: allPatients = [], isLoading, error } = useQuery<Patient[]>({
    queryKey: ['clinician', 'assigned-patients', hospitalId, clinicianId, searchQuery],
    queryFn: async () => {
      try {
        const result = await ClinicianAPI.getAssignedPatients(hospitalId, clinicianId, { search: searchQuery || null });
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching assigned patients:', err);
        return [];
      }
    },
  });

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
    ],
    []
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
            My Patients
          </h1>
          <p className="text-subtle-light dark:text-subtle-dark">
            View and manage your assigned patients. Search by name, MRN, or phone number.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, MRN, or phone number..."
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : allPatients.length === 0 ? (
              <EmptyState
                icon="people"
                message={searchQuery ? "No patients found" : "No assigned patients"}
                description={searchQuery 
                  ? "Try adjusting your search criteria" 
                  : "You don't have any assigned patients yet. Patients will appear here once they are assigned to you by the hospital admin."}
              />
            ) : (
              <DataTable
                data={allPatients}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No patients found"
                emptyIcon="people"
                onRowClick={(row) => navigate(`/patients/${row.id}`)}
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Patients;

