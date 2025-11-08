import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SuperAPI } from '../../api/endpoints';
import PasswordField from '../../components/forms/PasswordField';
import { Role } from './Roles';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Helper function to check if a role requires hospital assignment
 * All roles except "Super Admin" require a hospital
 */
const requiresHospital = (roleName: string): boolean => {
  return roleName !== 'Super Admin';
};

/**
 * AddUserModal - Modal for creating new users
 * 
 * PRODUCTION: Replace with real API endpoint
 */
const AddUserModal = ({ onClose, onSuccess }: AddUserModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Hospital Admin' as string,
    password: '',
    hospital_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);

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

  const createMutation = useMutation({
    mutationFn: (payload: any) => SuperAPI.createUser(payload),
    onSuccess: () => {
      // PRODUCTION: Backend will handle hospital admin count update
      // MOCK MODE: Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'roles'] }); // Refresh role counts
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate hospital selection for roles that require it
    if (requiresHospital(formData.role) && !formData.hospital_id) {
      toast.error(`Please select a hospital for ${formData.role} role`);
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      password: formData.password,
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
            Add New User
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
              htmlFor="userName"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="userName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            />
          </div>

          <div>
            <label
              htmlFor="userEmail"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="userEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            />
          </div>

          <div>
            <label
              htmlFor="userRole"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="userRole"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="userPassword"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="userPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full py-2 px-4 pr-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {formData.role && requiresHospital(formData.role) && (
            <div>
              <label
                htmlFor="userHospital"
                className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
              >
                Hospital <span className="text-red-500">*</span>
              </label>
              <select
                id="userHospital"
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
              disabled={createMutation.isPending}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

