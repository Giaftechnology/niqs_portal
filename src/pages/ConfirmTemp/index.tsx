import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequireAuth, useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const ConfirmTempForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, verifyTempPassword, resendTempPassword } = useAuth();
  const [temp, setTemp] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; title: string; message?: string; onConfirm?: () => void }>({ open: false, title: '' });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyTempPassword(temp);
    setLoading(false);
    if (ok) {
      setModal({ open: true, title: 'Confirmed', message: 'Temporary password confirmed. You can now continue.', onConfirm: () => navigate('/onboarding') });
    } else {
      setModal({ open: true, title: 'Invalid Password', message: 'Invalid temporary password. Please check your email and try again.' });
    }
  };

  const handleResend = async () => {
    const next = await resendTempPassword();
    if (next) setModal({ open: true, title: 'Temporary Password Resent', message: `A new temporary password has been sent to ${user?.email}.\n\nTemporary password: ${next}` });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-16 rounded-2xl shadow-md w-full max-w-xl">
        <h1 className="text-3xl font-semibold text-center mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Confirm Temporary Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-2">Enter the password sent to {user?.email} to continue.</p>
        {user?.tempPassword && (
          <p className="text-xs text-gray-400 text-center mb-6">Dev hint: current temp password is <span className="font-mono">{user.tempPassword}</span></p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="temp" className="block text-sm font-medium text-gray-800 mb-2">Temporary Password</label>
            <input
              id="temp"
              type="password"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Confirm'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button onClick={handleResend} className="text-indigo-600 hover:underline" type="button">
            Resend temporary password
          </button>
        </div>
      </div>
      <Modal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ open: false, title: '' })}
        onConfirm={modal.onConfirm}
      >
        {modal.message}
      </Modal>
    </div>
  );
};

const ConfirmTemp: React.FC = () => (
  <RequireAuth>
    <ConfirmTempForm />
  </RequireAuth>
);

export default ConfirmTemp;
