import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';
import { emitAlert } from '../../utils/alerts';
import { AdminUser, AdminUserRole } from '../../types/admin';
import Modal from '../../components/Modal';

const empty: Omit<AdminUser, 'id'> = { email: '', name: '', role: 'student', active: true };

const UsersPage: React.FC = () => {
  const [items, setItems] = useState<AdminUser[]>(AdminStore.listUsers());
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState<Omit<AdminUser, 'id'>>(empty);
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  const filtered = useMemo(
    () => items.filter((u) => [u.email, u.name, u.role].join(' ').toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const create = () => {
    const u = AdminStore.createUser(draft);
    setItems(AdminStore.listUsers());
    setDraft(empty);
    setEditing(null);
    setFormOpen(false);
  };

  const update = () => {
    if (!editing) return;
    AdminStore.updateUser({ ...editing, ...draft } as AdminUser);
    setItems(AdminStore.listUsers());
    const name = (draft.name || editing.name || draft.email || editing.email);
    AdminStore.addActivity({ userEmail: editing.email, message: `${name} profile updated` });
    setEditing(null);
    setDraft(empty);
    setFormOpen(false);
    emitAlert('Staff updated successfully', 'Update Staff');
  };

  const remove = (id: string) => {
    const target = items.find(i=>i.id===id);
    AdminStore.deleteUser(id);
    setItems(AdminStore.listUsers());
    if (target) {
      const name = target.name || target.email;
      AdminStore.addActivity({ userEmail: target.email, message: `${name} account deleted` });
    }
    emitAlert('Staff deleted successfully', 'Delete Staff');
  };

  const toggleSuspend = (u: AdminUser) => {
    AdminStore.updateUser({ ...u, active: !u.active });
    setItems(AdminStore.listUsers());
    const name = u.name || u.email;
    AdminStore.addActivity({ userEmail: u.email, message: `${name} ${u.active ? 'suspended' : 're-activated'}` });
    emitAlert(u.active ? 'Staff suspended' : 'Staff unsuspended', 'Status Updated');
  };

  const openView = (u: AdminUser) => {
    navigate(`/admin/users/${u.id}`);
  };

  const startEdit = (u: AdminUser) => {
    setEditing(u);
    setDraft({ email: u.email, name: u.name, role: u.role, active: u.active });
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Staffs</h1>
          <p className="text-sm text-gray-500">Manage all staffs in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="px-3 py-2 border border-gray-200 rounded-md text-sm" />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={()=>{ navigate('/admin/users/add'); }} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Staff</button>
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
                  <button
                    onClick={() => openView(u)}
                    className="px-3 py-1.5 border rounded-md text-sm bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    View
                  </button>
                  <button
                    onClick={() => startEdit(u)}
                    className="px-3 py-1.5 border rounded-md text-sm bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleSuspend(u)}
                    className={`px-3 py-1.5 border rounded-md text-sm ${u.active ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                  >
                    {u.active ? 'Suspend' : 'Unsuspend'}
                  </button>
                  <button
                    onClick={() => remove(u.id)}
                    className="px-3 py-1.5 border rounded-md text-sm bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {formOpen && (
        <StaffFormModal
          title={editing ? 'Edit Staff' : 'Add Staff'}
          draft={draft}
          setDraft={setDraft}
          onClose={()=>{ setFormOpen(false); setEditing(null); setDraft(empty); }}
          onSave={editing ? update : create}
        />
      )}
    </div>
  );
};

export default UsersPage;

type StaffFormProps = { title: string; draft: Omit<AdminUser,'id'>; setDraft: (d: Omit<AdminUser,'id'>)=>void; onClose: ()=>void; onSave: ()=>void };
const StaffFormModal = ({ title, draft, setDraft, onClose, onSave }: StaffFormProps) => (
  <Modal open={true} title={title} onClose={onClose} onConfirm={onSave} confirmText="Save" panelClassName="max-w-lg w-[90vw]">
    <div className="space-y-3">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-1">Full name</div>
        <input value={draft.name} onChange={(e)=>setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className="w-full px-3 py-2 border rounded-md text-sm" />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-1">Email</div>
        <input value={draft.email} onChange={(e)=>setDraft({ ...draft, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border rounded-md text-sm" />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-1">Role</div>
        <select value={draft.role} onChange={(e)=>setDraft({ ...draft, role: e.target.value as AdminUserRole })} className="w-full px-3 py-2 border rounded-md text-sm">
          <option value="student">Student</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input type="checkbox" checked={draft.active} onChange={(e)=>setDraft({ ...draft, active: e.target.checked })} />
        Active
      </label>
    </div>
  </Modal>
);
