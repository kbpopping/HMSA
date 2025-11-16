import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../store/auth';
import { AuthAPI } from '../../api/endpoints';
import { validatePassword, passwordsMatch, getStrengthColor, getStrengthLabel } from '../../utils/passwordValidation';
import clsx from 'clsx';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { needsPasswordChange, markPasswordChanged, user } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation state
  const validation = validatePassword(newPassword);
  const passwordsMatchValid = passwordsMatch(newPassword, confirmPassword);
  
  // Redirect if password change not needed
  useEffect(() => {
    if (!needsPasswordChange && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [needsPasswordChange, user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!validation.valid) {
      toast.error('Please fix password validation errors');
      return;
    }
    
    if (!passwordsMatchValid) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await AuthAPI.changePassword(oldPassword, newPassword);
      
      // Mark password as changed
      markPasswordChanged();
      
      toast.success('Password changed successfully!');
      
      // Redirect to onboarding
      setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 500);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-2xl">
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">
                lock_reset
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
              Change Your Password
            </h1>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              For security reasons, you must change your password before continuing
            </p>
          </div>
          
          {/* Info Box */}
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary flex-shrink-0">
                info
              </span>
              <div className="text-sm text-foreground-light dark:text-foreground-dark">
                <p className="font-semibold mb-1">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-subtle-light dark:text-subtle-dark">
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2"
              >
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                  lock
                </span>
                <input
                  id="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full h-12 pl-10 pr-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {showOldPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2"
              >
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                  lock_open
                </span>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className={clsx(
                    "w-full h-12 pl-10 pr-12 rounded-lg border bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary",
                    newPassword && !validation.valid ? "border-red-500" : "border-border-light dark:border-border-dark"
                  )}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {showNewPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-subtle-light dark:text-subtle-dark">
                      Password Strength:
                    </span>
                    <span className={clsx("text-xs font-semibold", getStrengthColor(validation.strength))}>
                      {getStrengthLabel(validation.strength)}
                    </span>
                  </div>
                  <div className="h-2 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all",
                        validation.strength === 'weak' && "w-1/3 bg-red-500",
                        validation.strength === 'medium' && "w-2/3 bg-yellow-500",
                        validation.strength === 'strong' && "w-full bg-green-500"
                      )}
                    />
                  </div>
                </div>
              )}
              
              {/* Validation Errors */}
              {newPassword && validation.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validation.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2"
              >
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                  lock_open
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={clsx(
                    "w-full h-12 pl-10 pr-12 rounded-lg border bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary",
                    confirmPassword && !passwordsMatchValid ? "border-red-500" : "border-border-light dark:border-border-dark"
                  )}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {passwordsMatchValid ? (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !validation.valid || !passwordsMatchValid}
              className="w-full h-12 bg-primary text-white rounded-lg font-semibold shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Changing Password...</span>
                </>
              ) : (
                <>
                  <span>Change Password</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
          
          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                warning
              </span>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                You cannot skip this step. For your security, you must change your password before accessing the portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

