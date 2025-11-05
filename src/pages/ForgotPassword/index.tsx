import React, { FormEvent, useState } from 'react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mock: trigger password reset flow (backend would send reset email)
    setSent(true);
    alert(`If an account exists for ${email}, a reset link has been sent.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-16 rounded-2xl shadow-md w-full max-w-xl">
        <h1 className="text-3xl font-semibold text-center mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Enter your email and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {sent ? 'Resend Instructions' : 'Send Reset Instructions'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
