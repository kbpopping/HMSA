import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HospitalAPI, StaffRole } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Modal from '../../components/modals/Modal';

interface EditStaffRoleModalProps {
  role: StaffRole;
  onClose: () => void;
  onSuccess: (isDelete?: boolean) => void;
}

// Available permissions for hospital staff
const AVAILABLE_PERMISSIONS = [
  'Patient Management',
  'Appointments',
  'Medical Records',
  'Basic Reports',
  'Administrative Tasks',
  'Patient Check-in',
  'View Appointments',
  'Templates',
  'Messaging',
  'Settings',
];

/**
 * EditStaffRoleModal - Modal for editing or deleting staff roles
 */
const EditStaffRoleModal = ({ role, onClose, onSuccess }: EditStaffRoleModalProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';
  
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description,
    permissions: role.permissions,
  });

  useEffect(() => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
  }, [role]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => HospitalAPI.updateStaffRole(hospitalId, role.id, payload),
    onSuccess: () => {
      onSuccess(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => HospitalAPI.deleteStaffRole(hospitalId, role.id),
    onSuccess: () => {
      onSuccess(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete role');
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

    updateMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: formData.permissions,
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate();
    }
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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Role"
      size="lg"
    >
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
            className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            placeholder="e.g., Nurse, Security, Receptionist"
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
            className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark resize-none"
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

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Role'}
          </button>
          <div className="flex gap-4">
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
              {updateMutation.isPending ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditStaffRoleModal;

