import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';
import { AdminUser } from '../../types/admin';

const StaffDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>(AdminStore.listUsers());
  const user = useMemo(() => users.find(u=>u.id===id), [users, id]);
  const logs = useMemo(() => user ? AdminStore.listLogs().filter(l => l.studentEmail === user.email) : [], [user]);

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

      <section className="bg-white border rounded-xl">
        <div className="p-3 flex items-center justify-between border-b">
          <div className="text-sm font-medium">Recent Logs</div>
          <Link to={`/admin/logs?email=${encodeURIComponent(user.email)}`} className="px-3 py-1.5 border rounded-md text-xs">Open All Logs</Link>
        </div>
        <div className="p-3">
          {logs.length === 0 ? (
            <div className="text-xs text-gray-500">No logs for this staff.</div>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-auto">
              {logs.slice(0,12).map(l => (
                <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="truncate">W{l.week} {l.day}: {l.text.slice(0,60)}{l.text.length>60?'…':''}</div>
                  <span className={`px-2 py-0.5 rounded text-[11px] ${l.status==='approved'?'bg-green-100 text-green-700': l.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
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
