import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';
import { AdminUser, AdminUserRole, StaffProfile, AdminActivity } from '../../types/admin';
import Modal from '../../components/Modal';
import { emitAlert } from '../../utils/alerts';

const StaffDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>(AdminStore.listUsers());
  const user = useMemo(() => users.find(u=>u.id===id), [users, id]);
  const activities = useMemo(() => user ? AdminStore.listActivities().filter(a => a.userEmail === user.email).sort((a,b)=>b.createdAt-a.createdAt) : [], [user]);
  const demoActivities = useMemo(() => {
    if (!user) return [] as AdminActivity[];
    const now = Date.now();
    return [
      { id: 'a1', userEmail: user.email, message: 'Signed up to the portal', createdAt: now - 86400000 * 5 },
      { id: 'a2', userEmail: user.email, message: 'Signed in to the portal', createdAt: now - 3600000 * 6 },
      { id: 'a3', userEmail: user.email, message: 'Approved a student logbook entry', createdAt: now - 3600000 * 4 },
      { id: 'a4', userEmail: user.email, message: 'Updated profile details', createdAt: now - 3600000 * 2 },
    ] as AdminActivity[];
  }, [user]);
  const renderActivities = useMemo(() => (activities && activities.length > 0 ? activities.slice(0,12) : demoActivities.slice(0,12)), [activities, demoActivities]);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [roleModal, setRoleModal] = useState<{ open: boolean; role: AdminUserRole }>({ open: false, role: '-' });

  useEffect(() => {
    if (!user) return;
    const p = AdminStore.listStaffProfiles().find(sp => sp.emailAddress.toLowerCase() === user.email.toLowerCase());
    setProfile(p || null);
  }, [user]);

  if (!user) return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
        <span>Staff Details</span>
      </div>
      <div className="text-sm text-red-600">Staff not found.</div>
    </div>
  );

  const toggleSuspend = () => {
    AdminStore.updateUser({ ...user, active: !user.active });
    setUsers(AdminStore.listUsers());
    emitAlert(user.active ? 'Staff suspended' : 'Staff unsuspended', 'Status Updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="space-x-2">
          <Link to={`/admin/logs?email=${encodeURIComponent(user.email)}`} className="px-3 py-1.5 border rounded-md text-sm">View Logs</Link>
          <button onClick={()=>setRoleModal({ open:true, role: user.role })} className="px-3 py-1.5 border rounded-md text-sm">Assign Role</button>
          <button onClick={toggleSuspend} className={`px-3 py-1.5 border rounded-md text-sm ${user.active?'border-red-300 text-red-700':'border-green-300 text-green-700'}`}>{user.active?'Suspend':'Unsuspend'}</button>
        </div>
      </div>

      <section className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <Info label="Full Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Role" value={user.role} />
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <div className={`inline-flex px-2 py-0.5 rounded text-xs ${user.active?'bg-green-100 text-green-700':'bg-gray-200 text-gray-600'}`}>{user.active?'Active':'Suspended'}</div>
          </div>
        </div>
      </section>

      {/* Recent Actions (audits) removed per request */}

      <section className="bg-white border rounded-xl p-4">
        <div className="text-sm font-medium mb-3">Staff Profile</div>
        {!profile ? (
          <div className="text-xs text-gray-500">No staff profile submitted.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <Info label="First Name" value={profile.firstName} />
            <Info label="Last Name" value={profile.lastName} />
            <Info label="Middle Name" value={profile.middleName || '—'} />
            <Info label="Gender" value={profile.gender || '—'} />
            <Info label="Date of Birth" value={profile.dateOfBirth || '—'} />
            <Info label="Marital Status" value={profile.maritalStatus || '—'} />
            <Info label="Nationality" value={profile.nationality || '—'} />
            <Info label="State of Origin" value={profile.stateOfOrigin || '—'} />
            <Info label="LGA" value={profile.lga || '—'} />
            <Info label="Phone Number" value={profile.phoneNumber || '—'} />
            <Info label="Email Address" value={profile.emailAddress} />
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="text-xs text-gray-500">Contact Address</div>
              <div className="font-medium text-gray-800">{profile.contactAddress || '—'}</div>
            </div>
            <Info label="Employee ID" value={profile.employeeId || '—'} />
            <Info label="Department" value={profile.department || '—'} />
            <Info label="Job Title" value={profile.jobTitle || '—'} />
            <Info label="Employment Type" value={profile.employmentType || '—'} />
            <Info label="Date Hired" value={profile.dateHired || '—'} />
            <Info label="Confirmation Date" value={profile.confirmationDate || '—'} />
            <Info label="Employment Status" value={profile.employmentStatus || '—'} />
            <Info label="Supervisor / Line Manager" value={profile.supervisor || '—'} />
            <Info label="Work Location" value={profile.workLocation || '—'} />
            <Info label="Basic Salary" value={profile.basicSalary || '—'} />
            <Info label="Bank Name" value={profile.bankName || '—'} />
            <Info label="Account Number" value={profile.accountNumber || '—'} />
            <Info label="Pension PIN" value={profile.pensionPin || '—'} />
            <Info label="Tax ID (TIN)" value={profile.taxId || '—'} />
            <Info label="NHF Number" value={profile.nhfNumber || '—'} />
            <Info label="Payment Method" value={profile.paymentMethod || '—'} />
            <div>
              <div className="text-xs text-gray-500">Photo</div>
              {profile.photoBase64 ? (
                <img src={profile.photoBase64} alt="Photo" className="w-24 h-24 rounded object-cover" />
              ) : (
                <div className="text-xs text-gray-500">—</div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white border rounded-xl">
        <div className="p-3 flex items-center justify-between border-b">
          <div className="text-sm font-medium">Recent Activity</div>
        </div>
        <div className="p-3">
          <ul className="space-y-2 max-h-60 overflow-auto">
            {renderActivities.map(a => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="truncate">{a.message}</div>
                <span className="text-[11px] text-gray-500">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Modal
      open={roleModal.open}
      title="Assign Role"
      onClose={()=>setRoleModal({ open:false, role: '-' })}
      onConfirm={()=>{ if (!user) return; AdminStore.updateUser({ ...user, role: roleModal.role }); setUsers(AdminStore.listUsers()); AdminStore.addActivity({ userEmail: user.email, message: `${user.name || user.email} assigned role ${roleModal.role}` }); emitAlert('Role assigned successfully', 'Assign Role'); setRoleModal({ open:false, role:'-' }); }}
      confirmText="Save"
    >
      <div className="space-y-2 text-sm">
        <div className="text-xs text-gray-600">Select a role for this staff</div>
        <select value={roleModal.role} onChange={(e)=>setRoleModal(r=>({ ...r, role: e.target.value as AdminUserRole }))} className="w-full px-3 py-2 border rounded-md">
          <option value="-">-</option>
          <option value="admin">admin</option>
          <option value="supervisor">supervisor</option>
          <option value="student">student</option>
        </select>
      </div>
      </Modal>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-medium text-gray-800 truncate">{value}</div>
  </div>
);

export default StaffDetail;
