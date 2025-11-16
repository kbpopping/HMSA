import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../store/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status, user, needsPasswordChange, onboardingComplete, checkFirstLogin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && user) {
      // Check first login status and redirect accordingly
      if (needsPasswordChange) {
        navigate('/change-password', { replace: true });
      } else if (!onboardingComplete) {
        navigate('/onboarding', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [status, user, needsPasswordChange, onboardingComplete, navigate, location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const loggedInUser = await login(email, password);
      
      // Check first login status
      await checkFirstLogin();
      
      toast.success(`Welcome, ${loggedInUser.name}!`);
      
      // Redirect based on first login status
      // The useEffect will handle the actual navigation
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
      
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg p-8 backdrop-blur-sm">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">
                local_hospital
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2 font-inconsolata">
              HMSA Clinician Portal
            </h1>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Sign in to your account
            </p>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2"
              >
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground-light dark:text-foreground-dark">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white rounded-lg font-semibold shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="mt-6 text-center text-sm text-subtle-light dark:text-subtle-dark">
            <p>Need help? Contact your hospital administrator</p>
          </div>
        </div>
        
        {/* Version Info */}
        <div className="mt-4 text-center text-xs text-subtle-light dark:text-subtle-dark">
          <p>HMSA Clinician Portal v1.0</p>
        </div>
      </div>
    </div>
  );
}

