import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SuperAPI } from '../../api/endpoints';

interface CreateHospitalModalProps {
  onClose: () => void;
  onSuccess: (hospitalName?: string) => void;
}

const CreateHospitalModal = ({ onClose, onSuccess }: CreateHospitalModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    timezone: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      country?: string | null;
      timezone?: string;
      adminEmail: string;
      adminPassword: string;
    }) => SuperAPI.createHospital(payload),
    onSuccess: (_, variables) => {
      // PRODUCTION: Backend will handle user creation
      // MOCK MODE: Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'users'] });
      onSuccess(variables.name);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create hospital');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.adminEmail || !formData.adminPassword) {
      toast.error('Please fill all required fields');
      return;
    }

    createMutation.mutate({
      name: formData.name,
      country: formData.country || null,
      timezone: formData.timezone || undefined,
      adminEmail: formData.adminEmail,
      adminPassword: formData.adminPassword,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
            Create New Hospital
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
              htmlFor="hospitalName"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Hospital Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="hospitalName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
              >
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
              >
                <option value="">Select Country</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
              >
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
              >
                <option value="">Select Timezone</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/Toronto">America/Toronto</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Africa/Lagos">Africa/Lagos</option>
              </select>
            </div>
          </div>

          <hr className="border-border-light dark:border-border-dark my-6" />

          <p className="font-bold text-lg text-foreground-light dark:text-foreground-dark">
            Initial Admin User
          </p>

          <div>
            <label
              htmlFor="adminEmail"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Admin Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="adminEmail"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
            />
          </div>

          <div>
            <label
              htmlFor="tempPassword"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="tempPassword"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full py-2 px-4 pr-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
                placeholder="Enter temporary password"
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
              {createMutation.isPending ? 'Creating...' : 'Create Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHospitalModal;

