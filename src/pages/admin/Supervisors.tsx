import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const SupervisorsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listSupervisorUsers());
  const [sort, setSort] = useState<'name'|'email'>('name');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });

  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.name} ${i.email}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort==='email') list.sort((a,b)=>a.email.localeCompare(b.email));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Add Supervisor', onSave: (v)=>{ AdminStore.createSupervisor(v); setItems(AdminStore.listSupervisorUsers()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Supervisor', initial: curr, onSave: (v)=>{ AdminStore.updateSupervisor({ ...curr, ...v }); setItems(AdminStore.listSupervisorUsers()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Supervisor?', message:`Delete ${curr.name}?`, onConfirm:()=>{ AdminStore.deleteSupervisor(id); setItems(AdminStore.listSupervisorUsers()); setConfirm({open:false,title:''}); } }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>🧑‍🏫</span><span>Supervisors</span></div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Supervisors" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('name')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('email')} className="px-3 py-2 border rounded-md text-sm">✉️ Sort</button>
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ New Supervisor</button>
        </div>
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
            {filtered.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.email}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${v.active?'bg-green-100 text-green-700':'bg-gray-200 text-gray-600'}`}>{v.active?'Active':'Inactive'}</span></td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>editItem(v.id)} className="px-2 py-1 text-xs border rounded">✏️</button>
                  <button onClick={()=>deleteItem(v.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={confirm.open} title={confirm.title} onClose={()=>setConfirm({open:false,title:''})} onConfirm={confirm.onConfirm} confirmText="Delete">{confirm.message}</Modal>
      {input.open && (<SupervisorInputModal title={input.title} initial={input.initial} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
    </div>
  );
};

export default SupervisorsPage;

type SupervisorForm = { name: string; email: string; active: boolean };
type InputState = { open: boolean; title: string; initial?: any; onSave?: (v: SupervisorForm)=>void };

const SupervisorInputModal = ({ title, initial, onSave, onClose }: { title: string; initial?: any; onSave?: (v: SupervisorForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<SupervisorForm>({ name: initial?.name||'', email: initial?.email||'', active: initial?.active ?? true });
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Full Name</div>
          <input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Email</div>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Active
        </label>
      </div>
    </Modal>
  );
};
