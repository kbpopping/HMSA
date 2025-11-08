import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SuperAPI, Hospital } from '../../api/endpoints';

interface EditHospitalModalProps {
  hospital: Hospital;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * EditHospitalModal - Modal for editing hospital information
 * 
 * PRODUCTION: Replace with real update endpoint
 * - Currently uses mock API
 * - Add validation for hospital name uniqueness
 * - Add permission checks
 */
const EditHospitalModal = ({ hospital, onClose, onSuccess }: EditHospitalModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: hospital.name,
    country: hospital.country || '',
    timezone: hospital.timezone,
  });

  // PRODUCTION: Replace with real update mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; country?: string | null; timezone?: string }) =>
      SuperAPI.updateHospital(hospital.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super', 'hospitals'] });
      toast.success('Hospital updated successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update hospital');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Hospital name is required');
      return;
    }

    updateMutation.mutate({
      name: formData.name.trim(),
      country: formData.country || null,
      timezone: formData.timezone,
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
            Edit Hospital
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
              htmlFor="editHospitalName"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Hospital Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="editHospitalName"
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
                htmlFor="editCountry"
                className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
              >
                Country
              </label>
              <select
                id="editCountry"
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
                htmlFor="editTimezone"
                className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
              >
                Timezone
              </label>
              <select
                id="editTimezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full py-2 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-foreground-light dark:text-foreground-dark"
              >
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
              {updateMutation.isPending ? 'Updating...' : 'Update Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHospitalModal;

