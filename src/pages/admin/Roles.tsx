import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listRoles());
  const [sort, setSort] = useState<'name'|'date'>('name');
  const [modal, setModal] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});

  const filtered = useMemo(() => {
    const list = [...items].filter(i => i.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort === 'date') list.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [items, q, sort]);

  const [inputModal, setInputModal] = useState<{ open: boolean; title: string; initial?: string; placeholder?: string; onSave?: (v: string) => void }>({ open: false, title: '' });

  const addRole = () => {
    setInputModal({
      open: true,
      title: 'Add Role',
      placeholder: 'Enter role name',
      onSave: (v: string) => { if (!v.trim()) return; AdminStore.createRole(v.trim()); setItems(AdminStore.listRoles()); setInputModal({ open: false, title: '' }); },
    });
  };

  const editRole = (id: string) => {
    const curr = items.find(x=>x.id===id);
    if (!curr) return;
    setInputModal({
      open: true,
      title: 'Edit Role',
      initial: curr.name,
      placeholder: 'Role name',
      onSave: (v: string) => { if (!v.trim()) return; AdminStore.updateRole({ ...curr, name: v.trim() }); setItems(AdminStore.listRoles()); setInputModal({ open: false, title: '' }); },
    });
  };

  const confirmDelete = (id: string) => {
    const m = items.find(x=>x.id===id);
    setModal({
      open: true,
      title: 'Are you sure?',
      message: `This will permanently delete ${m?.name}.`,
      onConfirm: () => { AdminStore.deleteRole(id); setItems(AdminStore.listRoles()); setModal({open:false,title:''}); }
    });
  };

  return (
    <div className="space-y-4">
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
                <td className="p-3">{m.createdAt}</td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>navigate(`/admin/roles/${m.id}`)} className="px-2 py-1 text-xs border rounded">👁️</button>
                  <button onClick={()=>editRole(m.id)} className="px-2 py-1 text-xs border rounded">✏️</button>
                  <button onClick={()=>confirmDelete(m.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">🗑️</button>
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
          onClose={() => setInputModal({ open: false, title: '' })}
          onSave={inputModal.onSave}
        />
      )}
    </div>
  );
};

export default RolesPage;

const NameInputModal = ({ title, initial = '', placeholder, onSave, onClose }: { title: string; initial?: string; placeholder?: string; onSave?: (v: string)=>void; onClose: ()=>void }) => {
  const [val, setVal] = useState(initial);
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={() => onSave && onSave(val)} confirmText="Save">
      <input autoFocus value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border rounded-md text-sm" />
    </Modal>
  );
};
