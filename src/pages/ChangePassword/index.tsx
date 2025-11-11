import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequireAuth, useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const ChangePasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modal, setModal] = useState<{ open: boolean; title: string; message?: string; onConfirm?: () => void }>({ open: false, title: '' });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setModal({ open: true, title: 'Weak Password', message: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setModal({ open: true, title: 'Mismatch', message: 'Passwords do not match.' });
      return;
    }
    // Mock password change. Real implementation will call backend API.
    setModal({ open: true, title: 'Password Updated', message: `Password updated for ${user?.email}.`, onConfirm: () => navigate(-1) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-16 rounded-2xl shadow-md w-full max-w-xl">
        <h1 className="text-3xl font-semibold text-center mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Change Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">Enter your current and new password.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="current" className="block text-sm font-medium text-gray-800 mb-2">Current Password</label>
            <input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="new" className="block text-sm font-medium text-gray-800 mb-2">New Password</label>
            <input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-800 mb-2">Confirm New Password</label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Update Password
          </button>
        </form>
        <Modal
          open={modal.open}
          title={modal.title}
          onClose={() => setModal({ open: false, title: '' })}
          onConfirm={modal.onConfirm}
        >
          {modal.message}
        </Modal>
      </div>
    </div>
  );
};

const ChangePassword: React.FC = () => (
  <RequireAuth>
    <ChangePasswordForm />
  </RequireAuth>
);

export default ChangePassword;

