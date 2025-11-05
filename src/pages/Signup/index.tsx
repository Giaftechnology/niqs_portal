import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('probational');

  const generatePassword = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tempPassword = generatePassword(12);
    await signUp(email, tempPassword, role);
    // Mock "send password to email" and show for development convenience
    alert(`A temporary password has been sent to ${email}.\n\nTemporary password: ${tempPassword}\n\nYou can change it later in your profile settings.`);
    navigate('/confirm-temp');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-16 rounded-2xl shadow-md w-full max-w-xl">
        <h1 className="text-3xl font-semibold text-center mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          NIQS Portal
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-800 mb-2">Register as</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('probational')}
                className={`px-4 py-3 rounded-lg border text-sm ${role === 'probational' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-800'}`}
              >
                Probational
              </button>
              <button
                type="button"
                onClick={() => setRole('graduate')}
                className={`px-4 py-3 rounded-lg border text-sm ${role === 'graduate' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-800'}`}
              >
                Graduate
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <span className="text-indigo-500 font-medium cursor-pointer hover:underline" onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
