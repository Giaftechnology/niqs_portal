import React, { useMemo, useState } from 'react';
import { AdminStore } from '../../utils/adminStore';
import { AdminUser, AdminUserRole } from '../../types/admin';

const empty: Omit<AdminUser, 'id'> = { email: '', name: '', role: 'student', active: true };

const UsersPage: React.FC = () => {
  const [items, setItems] = useState<AdminUser[]>(AdminStore.listUsers());
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState<Omit<AdminUser, 'id'>>(empty);

  const filtered = useMemo(
    () => items.filter((u) => [u.email, u.name, u.role].join(' ').toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const create = () => {
    const u = AdminStore.createUser(draft);
    setItems(AdminStore.listUsers());
    setDraft(empty);
    setEditing(null);
  };

  const update = () => {
    if (!editing) return;
    AdminStore.updateUser({ ...editing, ...draft } as AdminUser);
    setItems(AdminStore.listUsers());
    setEditing(null);
    setDraft(empty);
  };

  const remove = (id: string) => {
    AdminStore.deleteUser(id);
    setItems(AdminStore.listUsers());
  };

  const startEdit = (u: AdminUser) => {
    setEditing(u);
    setDraft({ email: u.email, name: u.name, role: u.role, active: u.active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500">Manage all users in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="px-3 py-2 border border-gray-200 rounded-md text-sm" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className="px-3 py-2 border border-gray-200 rounded-md text-sm" />
          <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" className="px-3 py-2 border border-gray-200 rounded-md text-sm" />
          <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as AdminUserRole })} className="px-3 py-2 border border-gray-200 rounded-md text-sm">
            <option value="student">Student</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Active</label>
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          {editing ? (
            <button onClick={update} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Update User</button>
          ) : (
            <button onClick={create} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Create User</button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">{u.active ? 'Yes' : 'No'}</td>
                <td className="p-3 flex gap-2 justify-end">
                  <button onClick={() => startEdit(u)} className="px-3 py-1.5 border rounded-md">Edit</button>
                  <button onClick={() => remove(u.id)} className="px-3 py-1.5 border rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
