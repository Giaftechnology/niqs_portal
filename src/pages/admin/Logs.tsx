import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';
import { AdminLogEntry } from '../../types/admin';

const LogsPage: React.FC = () => {
  const [items, setItems] = useState<AdminLogEntry[]>(AdminStore.listLogs());
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all'|'submitted'|'approved'|'rejected'>('all');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    if (email) setQ(email);
  }, [location.search]);

  const filtered = useMemo(() => {
    return items.filter((e) => {
      const matchQ = [e.studentEmail, e.day, String(e.week), e.status].join(' ').toLowerCase().includes(q.toLowerCase());
      const matchStatus = status === 'all' ? true : e.status === status;
      return matchQ && matchStatus;
    });
  }, [items, q, status]);

  const updateStatus = (id: string, s: 'approved'|'rejected') => {
    const next = items.map((x) => (x.id === id ? { ...x, status: s } : x));
    setItems(next);
    AdminStore.saveLogs(next);
  };

  const remove = (id: string) => {
    AdminStore.deleteLog(id);
    setItems(AdminStore.listLogs());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Logs</h1>
          <p className="text-sm text-gray-500">Moderate student daily entries</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search logs" className="px-3 py-2 border border-gray-200 rounded-md text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 border border-gray-200 rounded-md text-sm">
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      {new URLSearchParams(location.search).get('email') && (
        <div className="text-xs text-gray-500">Filtered by email: <span className="font-medium">{new URLSearchParams(location.search).get('email')}</span></div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-3">Student</th>
              <th className="p-3">Week</th>
              <th className="p-3">Day</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.studentEmail}</td>
                <td className="p-3">{e.week}</td>
                <td className="p-3">{e.day}</td>
                <td className="p-3 capitalize">{e.status}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => updateStatus(e.id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-white rounded-md">Approve</button>
                  <button onClick={() => updateStatus(e.id, 'rejected')} className="px-3 py-1.5 border rounded-md">Reject</button>
                  <button onClick={() => remove(e.id)} className="px-3 py-1.5 border rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsPage;
