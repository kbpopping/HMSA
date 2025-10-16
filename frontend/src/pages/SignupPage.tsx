import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirm) {
      setError('Please fill all fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    // For now, no API call. Navigate to login after brief delay.
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 600);
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <div className="relative min-h-screen w-full">
        <div className="absolute inset-0 z-0">
          <img
            alt="Two smiling doctors"
            className="h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNL1ZIyHw1sBCeTAp8ny32daCTNGBdpgdNutKLM3Gj_jmkiykE7LKdje0TK0OcBc8oSmt88Npws-DgdJP4g_7oiaT-rA4IezUjhJbE9wgh-87BhWld7LHK9C7BSqdv3xAeWN7jTqO3BJM-ARFf_dfBr2jKRGjb77jBAv4pUJyX6-b4aODFBWiERdVAnV0KGLm4wjnjvEkJQf1ceX_wiPZrUKxD3eL834FI-pn1AmVavGqcwMVGPDe2tSENrz6JpKKfOB7pudatOSs"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6 rounded-xl bg-white/90 p-8 shadow-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-6 flex justify-center items-center">
                <div className="bg-[#607AFB] p-2 rounded-full inline-block">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
                <span className="ml-4 text-2xl font-bold text-gray-900">HMSA</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Create Super Admin Account</h1>
              <p className="mt-2 text-sm text-gray-600">Join the hospital management system</p>
            </div>

            {error && (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#607AFB] focus:ring-[#607AFB]"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#607AFB] focus:ring-[#607AFB]"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="confirm">Confirm Password</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#607AFB] focus:ring-[#607AFB]"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-[#607AFB] px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-[#4f68f2] focus:outline-none focus:ring-2 focus:ring-[#607AFB]"
                >
                  {isLoading ? 'Creating…' : 'Sign Up'}
                </button>
              </div>
            </form>

            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                Already have an account?{' '}
                <Link className="font-medium text-[#607AFB] hover:underline" to="/login">Log In</Link>
              </p>
              <a className="font-medium text-[#607AFB] hover:underline" href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;


