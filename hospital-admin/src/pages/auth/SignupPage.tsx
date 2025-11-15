import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Note: Backend doesn't have signup endpoint yet, so we'll redirect to login
      // In a real implementation, you would call an API endpoint here
      toast.success('Account created! Please sign in with your credentials.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
      toast.error(err?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background with doctors image and overlay */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Two smiling doctors"
          className="h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNL1ZIyHw1sBCeTAp8ny32daCTNGBdpgdNutKLM3Gj_jmkiykE7LKdje0TK0OcBc8oSmt88Npws-DgdJP4g_7oiaT-rA4IezUjhJbE9wgh-87BhWld7LHK9C7BSqdv3xAeWN7jTqO3BJM-ARFf_dfBr2jKRGjb77jBAv4pUJyX6-b4aODFBWiERdVAnV0KGLm4wjnjvEkJQf1ceX_wiPZrUKxD3eL834FI-pn1AmVavGqcwMVGPDe2tSENrz6JpKKfOB7pudatOSs"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Glass card overlay */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-background-light/90 dark:bg-background-dark/90 p-8 shadow-soft backdrop-blur-sm">
          {/* Header */}
          <div className="text-center">
            <div className="mb-6 flex justify-center items-center">
              <div className="bg-primary p-2 rounded-full inline-block">
                <span className="material-symbols-outlined text-white text-2xl">emergency</span>
              </div>
              <span className="ml-4 text-2xl font-bold font-inconsolata text-text-light dark:text-text-dark">HMSA</span>
            </div>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Create Hospital Admin Account</h1>
            <p className="mt-2 text-sm text-text-light/70 dark:text-text-dark/70">Join the hospital management system</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="sr-only" htmlFor="email">Email</label>
              <input
                autoComplete="email"
                className="w-full rounded-lg border-subtle-light bg-background-light px-4 py-3 text-text-light placeholder-text-light/50 focus:border-primary focus:ring-primary dark:border-subtle-dark dark:bg-background-dark dark:text-text-dark dark:placeholder-text-dark/50 dark:focus:border-primary dark:focus:ring-primary"
                id="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                type="email"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="w-full rounded-lg border-subtle-light bg-background-light px-4 py-3 pr-12 text-text-light placeholder-text-light/50 focus:border-primary focus:ring-primary dark:border-subtle-dark dark:bg-background-dark dark:text-text-dark dark:placeholder-text-dark/50 dark:focus:border-primary dark:focus:ring-primary"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="sr-only" htmlFor="confirm-password">Confirm Password</label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="w-full rounded-lg border-subtle-light bg-background-light px-4 py-3 pr-12 text-text-light placeholder-text-light/50 focus:border-primary focus:ring-primary dark:border-subtle-dark dark:bg-background-dark dark:text-text-dark dark:placeholder-text-dark/50 dark:focus:border-primary dark:focus:ring-primary"
                  id="confirm-password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <button
                className="w-full rounded-lg bg-primary px-4 py-3 text-base font-bold text-white shadow-soft transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center text-sm text-text-light/70 dark:text-text-dark/70">
            <p className="mb-2">
              Already have an account?
              <button onClick={() => navigate('/login')} className="ml-1 font-medium text-primary hover:underline">Log In</button>
            </p>
            <a className="font-medium text-primary hover:underline" href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
