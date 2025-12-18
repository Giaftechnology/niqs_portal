import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      setError('All fields are required.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<any>('/api/auth/control', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
        },
      });

      const msg =
        (typeof res?.message === 'string' && res.message) ||
        'Registration successful. You can now log in.';

      setSuccess(msg);
      // after short delay, send user to admin login page
      setTimeout(() => {
        navigate('/admin/login');
      }, 1200);
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-900">
      <div className="hidden lg:flex flex-1 items-center justify-center p-10">
        <div className="max-w-md text-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/40">
              <span className="text-lg font-bold text-indigo-300">REG</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-400">NIQS PORTAL</div>
              <div className="text-base font-semibold text-slate-100">Create Account</div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Register for NIQS portal</h1>
            <p className="text-sm text-slate-300">
              Fill in your basic details to create an account. After registration, you can sign in and continue
              with your application or logbook.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-10 lg:px-8">
        <div className="w-full max-w-lg">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-100 px-8 py-10 sm:px-10 sm:py-12">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-slate-900">NIQS PORTAL</h2>
              <p className="mt-1 text-xs text-slate-500">Create a new account to access the portal.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
                  {success}
                </div>
              )}
              <button
                disabled={loading}
                aria-busy={loading}
                type="submit"
                className="w-full py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Registering…' : 'Register'}
              </button>
            </form>
            <div className="text-xs text-slate-500 mt-3 text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="text-indigo-600 hover:underline"
              >
                Back to Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
