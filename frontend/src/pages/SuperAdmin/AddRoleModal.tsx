import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SuperAPI } from '../../api/endpoints';

interface AddRoleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Available permissions list
const AVAILABLE_PERMISSIONS = [
  'All Permissions',
  'Hospital Management',
  'User Management',
  'Patient Management',
  'Appointments',
  'Medical Records',
  'Reports',
  'Patient Check-in',
  'Basic Reports',
  'Personal Health Information',
  'View Appointments',
  'Administrative Tasks',
  'Templates',
  'Messaging',
  'Settings',
];

/**
 * AddRoleModal - Modal for creating new roles
 * 
 * PRODUCTION: Replace with real API endpoint
 */
const AddRoleModal = ({ onClose, onSuccess }: AddRoleModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => SuperAPI.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'users'] }); // Refresh user role options
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create role');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: formData.permissions,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft w-full max-w-2xl p-8 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
            Add New Role
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
              htmlFor="roleName"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="roleName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
              placeholder="e.g., Support Staff, Patient"
            />
          </div>

          <div>
            <label
              htmlFor="roleDescription"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="roleDescription"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark resize-none"
              placeholder="Describe the role's responsibilities and access level"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-3 text-foreground-light dark:text-foreground-dark">
              Permissions <span className="text-red-500">*</span>
            </label>
            <div className="max-h-64 overflow-y-auto border border-border-light dark:border-border-dark rounded-lg p-4 bg-background-light dark:bg-background-dark">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-card-light dark:hover:bg-card-dark transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="w-4 h-4 text-primary border-border-light dark:border-border-dark rounded focus:ring-primary"
                    />
                    <span className="text-sm text-foreground-light dark:text-foreground-dark">
                      {permission}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {formData.permissions.length > 0 && (
              <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
                {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

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
              {createMutation.isPending ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;

