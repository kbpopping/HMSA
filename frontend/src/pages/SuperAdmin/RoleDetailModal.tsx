import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SuperAPI, Hospital } from '../../api/endpoints';
import { Role } from './Roles';
import { User } from './Users';

interface RoleDetailModalProps {
  role: Role;
  users: User[];
  hospitals: Hospital[];
  onClose: () => void;
  onEdit: () => void;
}

/**
 * Helper function to check if a role requires hospital assignment
 * All roles except "Super Admin" require a hospital
 */
const requiresHospital = (roleName: string): boolean => {
  return roleName !== 'Super Admin';
};

/**
 * RoleDetailModal - Shows comprehensive role information
 * 
 * PRODUCTION: Replace with real API calls
 */
const RoleDetailModal = ({ role, users, hospitals, onClose, onEdit }: RoleDetailModalProps) => {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToEditRole, setUserToEditRole] = useState<User | null>(null);
  const [editRoleFormData, setEditRoleFormData] = useState({
    role: '',
    hospital_id: '',
  });

  // Fetch all roles for role selection
  const { data: allRoles = [] } = useQuery<Role[]>({
    queryKey: ['super', 'roles'],
    queryFn: () => SuperAPI.listRoles(),
  });

  // Get users with this role - direct match
  const roleUsers = users.filter(u => u.role === role.name);

  // Get hospitals using this role
  const hospitalsUsingRole = Array.from(new Set(
    roleUsers
      .filter(u => u.hospital_id)
      .map(u => {
        const hospital = hospitals.find(h => h.id === u.hospital_id);
        return hospital?.name || u.hospital;
      })
      .filter(Boolean)
  ));

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => SuperAPI.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
      toast.success('Role deleted successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete role');
    },
  });

  const handleDelete = () => {
    if (roleUsers.length > 0) {
      toast.error('Cannot delete role with active users. Please reassign users first.');
      return;
    }
    deleteMutation.mutate(role.id);
  };

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: (payload: any) => SuperAPI.updateUser(userToEditRole!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
      toast.success('User role updated successfully!');
      setUserToEditRole(null);
      setEditRoleFormData({ role: '', hospital_id: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  const handleEditUserRole = (user: User) => {
    setUserToEditRole(user);
    setEditRoleFormData({
      role: user.role,
      hospital_id: user.hospital_id || '',
    });
  };

  const handleUpdateUserRole = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editRoleFormData.role) {
      toast.error('Please select a role');
      return;
    }

    // Validate hospital selection for roles that require it
    if (requiresHospital(editRoleFormData.role) && !editRoleFormData.hospital_id) {
      toast.error(`Please select a hospital for ${editRoleFormData.role} role`);
      return;
    }

    updateUserRoleMutation.mutate({
      name: userToEditRole!.name,
      email: userToEditRole!.email,
      role: editRoleFormData.role,
      hospital_id: requiresHospital(editRoleFormData.role) ? editRoleFormData.hospital_id : null,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark min-h-screen w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
            Role Details: {role.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
            <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Role Name</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{role.name}</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Description</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{role.description}</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Created At</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">
                  {new Date(role.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
            <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-card-light dark:bg-card-dark rounded-lg">
                <p className="text-3xl font-bold text-primary">{roleUsers.length}</p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">Active Users</p>
              </div>
              <div className="text-center p-4 bg-card-light dark:bg-card-dark rounded-lg">
                <p className="text-3xl font-bold text-primary">{hospitalsUsingRole.length}</p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">Hospitals Using This Role</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
            <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Permissions
            </h4>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark rounded-lg border border-border-light dark:border-border-dark"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>

          {/* Hospitals Using This Role */}
          {hospitalsUsingRole.length > 0 && (
            <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
              <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
                Hospitals Using This Role
              </h4>
              <div className="space-y-2">
                {hospitalsUsingRole.map((hospitalName, index) => (
                  <div
                    key={index}
                    className="p-3 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark"
                  >
                    <p className="font-medium text-foreground-light dark:text-foreground-dark">{hospitalName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Users List */}
          {roleUsers.length > 0 && (
            <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
              <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
                Active Users ({roleUsers.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {roleUsers.slice(0, 10).map((user) => (
                  <div
                    key={user.id}
                    className="p-3 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground-light dark:text-foreground-dark">{user.name}</p>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">{user.email}</p>
                      {user.hospital && (
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">{user.hospital}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditUserRole(user)}
                      className="text-primary hover:text-primary/80 transition-colors p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20"
                      title="Change User Role"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                ))}
                {roleUsers.length > 10 && (
                  <p className="text-sm text-subtle-light dark:text-subtle-dark text-center pt-2">
                    ... and {roleUsers.length - 10} more users
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-border-light dark:border-border-dark">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={roleUsers.length > 0 || deleteMutation.isPending}
              className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">delete</span>
              Delete Role
            </button>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark px-5 py-2.5 rounded-lg font-bold hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-soft"
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Role
              </button>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft w-full max-w-md p-8">
                <h4 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
                  Delete Role?
                </h4>
                <p className="text-foreground-light dark:text-foreground-dark mb-6">
                  Are you sure you want to delete the role <strong>{role.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark px-5 py-2.5 rounded-lg font-bold hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-soft disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Role Modal */}
          {userToEditRole && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft w-full max-w-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
                    Change Role for {userToEditRole.name}
                  </h4>
                  <button
                    onClick={() => {
                      setUserToEditRole(null);
                      setEditRoleFormData({ role: '', hospital_id: '' });
                    }}
                    className="p-2 rounded-full hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleUpdateUserRole} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark">
                      Current Role
                    </label>
                    <p className="text-foreground-light dark:text-foreground-dark bg-background-light dark:bg-background-dark p-3 rounded-lg">
                      {userToEditRole.role}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="newRole"
                      className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
                    >
                      New Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="newRole"
                      value={editRoleFormData.role}
                      onChange={(e) => {
                        setEditRoleFormData(prev => ({
                          ...prev,
                          role: e.target.value,
                          hospital_id: !requiresHospital(e.target.value) ? '' : prev.hospital_id,
                        }));
                      }}
                      required
                      className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
                    >
                      <option value="">Select New Role</option>
                      {allRoles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editRoleFormData.role && requiresHospital(editRoleFormData.role) && (
                    <div>
                      <label
                        htmlFor="userHospitalForRole"
                        className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
                      >
                        Hospital <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="userHospitalForRole"
                        value={editRoleFormData.hospital_id}
                        onChange={(e) => setEditRoleFormData(prev => ({ ...prev, hospital_id: e.target.value }))}
                        required={requiresHospital(editRoleFormData.role)}
                        className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
                      >
                        <option value="">Select Hospital</option>
                        {hospitals.map((hospital) => (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setUserToEditRole(null);
                        setEditRoleFormData({ role: '', hospital_id: '' });
                      }}
                      className="bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark px-5 py-2.5 rounded-lg font-bold hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateUserRoleMutation.isPending}
                      className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50"
                    >
                      {updateUserRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleDetailModal;

