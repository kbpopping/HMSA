import { useState } from 'react';
import { Hospital } from '../../api/endpoints';
import PasswordField from '../../components/forms/PasswordField';

interface DeleteHospitalModalProps {
  hospital: Hospital;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * DeleteHospitalModal - Confirmation modal for deleting a hospital
 * 
 * PRODUCTION: Replace mock password validation with real admin password verification
 * - Call API endpoint to verify admin password
 * - Only allow deletion if password is correct
 * - Add audit logging for deletion actions
 */
const DeleteHospitalModal = ({ hospital, onClose, onConfirm }: DeleteHospitalModalProps) => {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!password.trim()) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    setIsDeleting(true);
    setError('');

    // PRODUCTION: Replace with real password verification
    // Example: await verifyAdminPassword(password);
    // MOCK MODE: Accept any non-empty password
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsDeleting(false);
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
            Delete Hospital
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
              <div>
                <p className="font-bold text-red-800 dark:text-red-300 mb-1">Warning: This action cannot be undone</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  You are about to delete <strong>{hospital.name}</strong>. All associated data including patients, 
                  clinicians, appointments, and records will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="deletePassword"
              className="block text-sm font-bold mb-2 text-foreground-light dark:text-foreground-dark"
            >
              Enter Admin Password to Confirm <span className="text-red-500">*</span>
            </label>
            <PasswordField
              id="deletePassword"
              name="deletePassword"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
            <p className="mt-2 text-xs text-subtle-light dark:text-subtle-dark">
              PRODUCTION: This will verify your actual admin password. MOCK MODE: Enter any value to confirm.
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark px-5 py-2.5 rounded-lg font-bold hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || !password.trim()}
              className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-colors shadow-soft disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Deleting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">delete</span>
                  Delete Hospital
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteHospitalModal;

