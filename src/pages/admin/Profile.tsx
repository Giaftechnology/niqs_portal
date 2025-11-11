import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminProfile: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [department, setDepartment] = useState(user?.profile?.department || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    await completeOnboarding({ fullName, phone, department });
    setSaving(false);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500">Update your account information</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Email</div>
          <input value={user?.email || ''} disabled className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 text-gray-600" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Full Name</div>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Phone</div>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Department</div>
          <input value={department} onChange={e=>setDepartment(e.target.value)} placeholder="Department" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-xs text-green-700">Saved</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
