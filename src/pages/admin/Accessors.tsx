import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminAccessors: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listAccessors());
  const [modal, setModal] = useState<{ open: boolean; title: string; message?: string; onConfirm?: () => void }>({ open: false, title: '' });
  const [view, setView] = useState<{ open: boolean; title: string; body?: React.ReactNode }>({ open: false, title: '' });
  const [input, setInput] = useState<{ open: boolean; title: string; name?: string; email?: string; onSave?: (v: {name: string; email: string}) => void }>({ open: false, title: '' });

  const filtered = useMemo(() => items.filter(i => `${i.name} ${i.email}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  const addItem = () => setInput({ open: true, title: 'Add Accessor', onSave: ({name, email}) => { if(!name.trim()||!email.trim()) return; AdminStore.createAccessor({ name: name.trim(), email: email.trim() }); setItems(AdminStore.listAccessors()); setInput({ open:false, title:'' }); } });
  const editItem = (id: string) => {
    const curr = items.find(x=>x.id===id); if(!curr) return;
    setInput({ open:true, title:'Edit Accessor', name: curr.name, email: curr.email, onSave: ({name, email}) => { AdminStore.updateAccessor({ ...curr, name: name.trim(), email: email.trim() }); setItems(AdminStore.listAccessors()); setInput({ open:false, title:'' }); } });
  };
  const viewItem = (id: string) => {
    const curr = items.find(x=>x.id===id); if(!curr) return;
    setView({ open:true, title:'Accessor Details', body: (
      <div className="text-sm text-gray-700 space-y-1">
        <div>Name: {curr.name}</div>
        <div>Email: {curr.email}</div>
        <div>Status: {curr.active ? 'Active' : 'Disabled'}</div>
        <div>Created: {new Date(curr.createdAt).toLocaleString()}</div>
      </div>
    )});
  };
  const disableItem = (id: string) => {
    const curr = items.find(x=>x.id===id); if(!curr) return;
    AdminStore.updateAccessor({ ...curr, active: !curr.active });
    setItems(AdminStore.listAccessors());
  };
  const deleteItem = (id: string) => {
    const curr = items.find(x=>x.id===id); if(!curr) return;
    setModal({ open: true, title: 'Delete Accessor?', message: `This will permanently delete ${curr.name}.`, onConfirm: () => { AdminStore.deleteAccessor(id); setItems(AdminStore.listAccessors()); setModal({ open:false, title:'' }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <span aria-hidden>🧑‍⚖️</span>
        <span>Accessors</span>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Accessors" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add New</button>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.name}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{a.active ? 'Active' : 'Disabled'}</span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>viewItem(a.id)} className="px-2 py-1 text-xs border rounded">👁️</button>
                  <button onClick={()=>editItem(a.id)} className="px-2 py-1 text-xs border rounded">✏️</button>
                  <button onClick={()=>disableItem(a.id)} className="px-2 py-1 text-xs border rounded">{a.active ? 'Disable' : 'Enable'}</button>
                  <button onClick={()=>deleteItem(a.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal.open} title={modal.title} onClose={()=>setModal({open:false,title:''})} onConfirm={modal.onConfirm} confirmText="Delete">{modal.message}</Modal>
      <Modal open={view.open} title={view.title} onClose={()=>setView({open:false,title:''})}>{view.body}</Modal>
      {input.open && (
        <AccessorInputModal title={input.title} name={input.name} email={input.email} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />
      )}
    </div>
  );
};

export default AdminAccessors;

const AccessorInputModal = ({ title, name: initName = '', email: initEmail = '', onSave, onClose }: { title: string; name?: string; email?: string; onSave?: (v: {name:string; email:string})=>void; onClose: ()=>void }) => {
  const [name, setName] = useState(initName);
  const [email, setEmail] = useState(initEmail);
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={() => onSave && onSave({ name, email })} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Full Name</div>
          <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Enter full name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Email</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
      </div>
    </Modal>
  );
};
