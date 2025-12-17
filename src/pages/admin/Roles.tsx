import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { apiFetch } from '../../utils/api';

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Array<{ id: string | number; name: string; created_at?: string | null }>>([]);
  const [sort, setSort] = useState<'name'|'date'>('name');
  const [modal, setModal] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRoles = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/access/roles');
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const normalized = data.map((r: any) => ({
        id: r.id,
        name: String(r.name || ''),
        created_at: r.created_at ?? null,
      }));
      setItems(normalized);
    } catch (e: any) {
      setError(e?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRoles(); }, []);

  const filtered = useMemo(() => {
    const list = [...items].filter(i => i.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort === 'date') list.sort((a,b)=>String(a.created_at || '').localeCompare(String(b.created_at || '')));
    return list;
  }, [items, q, sort]);

  const [inputModal, setInputModal] = useState<{ open: boolean; title: string; initial?: string; placeholder?: string; onSave?: (v: string) => void }>({ open: false, title: '' });

  const addRole = () => {
    setInputModal({
      open: true,
      title: 'Add Role',
      placeholder: 'Enter role name',
      onSave: async (v: string) => {
        const name = v.trim();
        if (!name) return;
        try {
          setCreating(true);
          const res = await apiFetch<any>('/api/access/roles', {
            method: 'POST',
            body: { name },
          });
          const msg =
            (typeof res?.message === 'string' && res.message) ||
            (typeof res?.data?.message === 'string' && res.data.message) ||
            'Role created.';
          await loadRoles();
          setSuccessMsg(msg);
          setInputModal({ open: false, title: '' });
        } catch (e: any) {
          setSuccessMsg(null);
          setModal({ open:true, title:'Error', message: e?.message || 'Failed to create role.' });
        } finally {
          setCreating(false);
        }
      },
    });
  };

  return (
    <div className="relative space-y-4">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading roles…</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <span aria-hidden>🛡️</span>
        <span>Roles</span>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Roles" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('name')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('date')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={addRole} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Role</button>
        </div>
      </div>
      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{successMsg}</div>
      )}
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Role Name</th>
              <th className="p-3">Created At</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m)=> (
              <tr key={m.id} className="border-t">
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.created_at || '-'}</td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>navigate(`/admin/roles/${m.id}`)} className="px-2 py-1 text-xs border rounded">👁️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal.open} title={modal.title} onClose={()=>setModal({open:false,title:''})} onConfirm={modal.onConfirm} confirmText="Delete">
        {modal.message}
      </Modal>
      {inputModal.open && (
        <NameInputModal
          title={inputModal.title}
          initial={inputModal.initial}
          placeholder={inputModal.placeholder}
          onClose={() => { if (!creating) setInputModal({ open: false, title: '' }); }}
          onSave={inputModal.onSave}
          saving={creating}
        />
      )}
    </div>
  );
};

export default RolesPage;

const NameInputModal = ({ title, initial = '', placeholder, onSave, onClose, saving }: { title: string; initial?: string; placeholder?: string; onSave?: (v: string)=>void; onClose: ()=>void; saving?: boolean }) => {
  const [val, setVal] = useState(initial);
  const handleConfirm = () => {
    if (saving) return;
    if (onSave) onSave(val);
  };
  return (
    <Modal
      open={true}
      title={title}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText={saving ? 'Saving…' : 'Save'}
    >
      <input
        autoFocus
        value={val}
        onChange={e=>setVal(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-md text-sm"
        disabled={saving}
      />
    </Modal>
  );
};
