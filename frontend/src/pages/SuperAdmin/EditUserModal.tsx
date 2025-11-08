import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SuperAPI } from '../../api/endpoints';
import { User } from './Users';
import { Role } from './Roles';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (userData?: { name: string; email: string; role: string; previousRole?: string; isDelete?: boolean }) => void;
}

/**
 * Helper function to check if a role requires hospital assignment
 * All roles except "Super Admin" require a hospital
 */
const requiresHospital = (roleName: string): boolean => {
  return roleName !== 'Super Admin';
};

/**
 * EditUserModal - Modal for editing user information
 * 
 * PRODUCTION: Replace with real API endpoint
 */
const EditUserModal = ({ user, onClose, onSuccess }: EditUserModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    hospital_id: user.hospital_id || '',
  });

  // Fetch hospitals for dropdown
  const { data: hospitals = [] } = useQuery({
    queryKey: ['super', 'hospitals'],
    queryFn: () => SuperAPI.listHospitals(),
  });

  // Fetch roles from Roles page
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['super', 'roles'],
    queryFn: () => SuperAPI.listRoles(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => SuperAPI.updateUser(user.id, payload),
    onSuccess: (_, variables) => {
      // PRODUCTION: Backend will handle hospital admin count update
      // MOCK MODE: Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'roles'] }); // Refresh role counts
      toast.success('User updated successfully!');
      
      const roleChanged = user.role !== variables.role;
      onSuccess({
        name: variables.name || user.name,
        email: variables.email || user.email,
        role: variables.role || user.role,
        previousRole: roleChanged ? user.role : undefined,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate hospital selection for roles that require it
    if (requiresHospital(formData.role) && !formData.hospital_id) {
      toast.error(`Please select a hospital for ${formData.role} role`);
      return;
    }

    updateMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      hospital_id: requiresHospital(formData.role) ? formData.hospital_id : null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      // Clear hospital_id when role changes to one that doesn't require it
      if (name === 'role' && !requiresHospital(value)) {
        newData.hospital_id = '';
      }
      return newData;
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft w-full max-w-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
            Edit User
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="editUserName"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="editUserName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            />
          </div>

          <div>
            <label
              htmlFor="editUserEmail"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="editUserEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            />
          </div>

          <div>
            <label
              htmlFor="editUserRole"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="editUserRole"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {formData.role && requiresHospital(formData.role) && (
            <div>
              <label
                htmlFor="editUserHospital"
                className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
              >
                Hospital <span className="text-red-500">*</span>
              </label>
              <select
                id="editUserHospital"
                name="hospital_id"
                value={formData.hospital_id}
                onChange={handleChange}
                required={requiresHospital(formData.role)}
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
              onClick={onClose}
              className="bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark px-5 py-2.5 rounded-lg font-bold hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

