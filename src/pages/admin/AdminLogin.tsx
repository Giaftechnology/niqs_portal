import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signInAsAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signInAsAdmin) return;
    setError(null);
    setLoading(true);
    try {
      await signInAsAdmin(email, password);
      navigate('/admin');
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : '') || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-16 rounded-2xl shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-semibold text-center mb-6">Admin Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={loading} aria-busy={loading} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Signing In…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
