import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../store/auth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, status, user } = useAuth();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Auth disabled in dev mode - redirect logic removed
  // This useEffect would redirect if user is logged in, but we're bypassing auth

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      const loggedInUser = await login(data.email, data.password);
      toast.success('Login successful!');
      
      // Navigate based on role
      if (loggedInUser.role === 'super_admin') {
        navigate('/super/dashboard', { replace: true });
      } else if (loggedInUser.role === 'hospital_admin') {
        navigate('/hospital/dashboard', { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const onError = (validationErrors: any) => {
    // Show first validation error
    const firstError = Object.values(validationErrors)[0] as any;
    if (firstError?.message) {
      setError(firstError.message);
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
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <span className="ml-4 text-2xl font-bold font-inconsolata text-text-light dark:text-text-dark">HMSA</span>
            </div>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Welcome Back</h1>
            <p className="mt-2 text-sm text-text-light/70 dark:text-text-dark/70">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
            {(error || Object.keys(errors).length > 0) && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error || (errors.email?.message as string) || (errors.password?.message as string)}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="Email Address"
                className="w-full rounded-lg border-subtle-light bg-background-light px-4 py-3 text-text-light placeholder-text-light/50 focus:border-primary focus:ring-primary dark:border-subtle-dark dark:bg-background-dark dark:text-text-dark dark:placeholder-text-dark/50 dark:focus:border-primary dark:focus:ring-primary"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
              <input
                {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                  className="w-full rounded-lg border-subtle-light bg-background-light px-4 py-3 pr-12 text-text-light placeholder-text-light/50 focus:border-primary focus:ring-primary dark:border-subtle-dark dark:bg-background-dark dark:text-text-dark dark:placeholder-text-dark/50 dark:focus:border-primary dark:focus:ring-primary"
                autoComplete="current-password"
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-lg bg-primary px-4 py-3 text-base font-bold text-white shadow-soft transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center text-sm text-text-light/70 dark:text-text-dark/70">
            <p className="mb-2">
              Don't have an account?
              <button onClick={() => navigate('/signup')} className="ml-1 font-medium text-primary hover:underline">Sign Up</button>
            </p>
            <a href="#" className="font-medium text-primary hover:underline">Forgot Password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
