import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const signedIn = await signIn(email, password);
    const next = signedIn.onboardingComplete ? '/app' : '/profile';
    navigate(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-16 rounded-2xl shadow-md w-full max-w-xl">
        <h1 className="text-3xl font-semibold text-center mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          NIQS Portal
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">Sign in to your account</p>
        
        <form onSubmit={handleSignIn}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all hover:-translate-y-0.5 hover:shadow-lg mt-2"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-indigo-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <span className="text-indigo-500 font-medium cursor-pointer hover:underline" onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
