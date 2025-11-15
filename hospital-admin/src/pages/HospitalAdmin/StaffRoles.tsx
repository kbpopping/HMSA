import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, StaffRole } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import AddStaffRoleModal from './AddStaffRoleModal';
import EditStaffRoleModal from './EditStaffRoleModal';
import Spinner from '../../components/feedback/Spinner';
import clsx from 'clsx';

/**
 * Staff Roles Page
 * 
 * Features:
 * - View all staff roles
 * - Create new roles
 * - Edit existing roles
 * - Delete roles (if no staff assigned)
 */
const StaffRoles = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<StaffRole | null>(null);

  // Fetch staff roles
  const { data: roles = [], isLoading, error } = useQuery<StaffRole[]>({
    queryKey: ['hospital', 'staff-roles', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listStaffRoles(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching staff roles:', err);
        return [];
      }
    },
  });

  // Filter roles based on search
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query) ||
        role.permissions.some(p => p.toLowerCase().includes(query))
    );
  }, [roles, searchQuery]);

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['hospital', 'staff-roles'], exact: false });
    toast.success('Role created successfully!');
  };

  const handleEditSuccess = (isDelete?: boolean) => {
    setRoleToEdit(null);
    queryClient.invalidateQueries({ queryKey: ['hospital', 'staff-roles'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
    toast.success(isDelete ? 'Role deleted successfully!' : 'Role updated successfully!');
  };

  const handleEdit = (role: StaffRole) => {
    setRoleToEdit(role);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            Staff Roles
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 justify-center sm:justify-start"
          >
            <span className="material-symbols-outlined">add</span>
            <span>New Role</span>
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
              placeholder="Search roles by name, description, or permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Roles Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Error loading roles. Please try refreshing the page.
            </p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
              verified_user
            </span>
            <p className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              No roles found
            </p>
            <p className="text-subtle-light dark:text-subtle-dark mb-6">
              {searchQuery ? 'Try adjusting your search query' : 'Create your first role to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Create Role
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEdit(role)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-2">
                      {role.name}
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark line-clamp-2">
                      {role.description}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(role);
                    }}
                    className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
                    title="Edit Role"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                    Permissions:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark rounded border border-border-light dark:border-border-dark"
                      >
                        {permission}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs text-subtle-light dark:text-subtle-dark">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
                  <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                    {role.staffCount} staff member{role.staffCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-subtle-light dark:text-subtle-dark">
                    Created: {new Date(role.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Role Modal */}
        {isAddModalOpen && (
          <AddStaffRoleModal
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleAddSuccess}
          />
        )}

        {/* Edit Role Modal */}
        {roleToEdit && (
          <EditStaffRoleModal
            role={roleToEdit}
            onClose={() => setRoleToEdit(null)}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </AppShell>
  );
};

export default StaffRoles;

