import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const ModulesPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listModules());
  const [sort, setSort] = useState<'name'|'date'>('name');
  const [modal, setModal] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});

  const filtered = useMemo(() => {
    const list = [...items].filter(i => i.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort === 'date') list.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [items, q, sort]);

  const [inputModal, setInputModal] = useState<{ open: boolean; title: string; initial?: string; placeholder?: string; onSave?: (v: string) => void }>({ open: false, title: '' });

  const addModule = () => {
    setInputModal({
      open: true,
      title: 'Add Module',
      placeholder: 'Enter module name',
      onSave: (v: string) => { if (!v.trim()) return; AdminStore.createModule(v.trim()); setItems(AdminStore.listModules()); setInputModal({ open: false, title: '' }); },
    });
  };

  const editModule = (id: string) => {
    const curr = items.find(x=>x.id===id);
    if (!curr) return;
    setInputModal({
      open: true,
      title: 'Edit Module',
      initial: curr.name,
      placeholder: 'Module name',
      onSave: (v: string) => { if (!v.trim()) return; AdminStore.updateModule({ ...curr, name: v.trim() }); setItems(AdminStore.listModules()); setInputModal({ open: false, title: '' }); },
    });
  };

  const confirmDelete = (id: string) => {
    const m = items.find(x=>x.id===id);
    setModal({
      open: true,
      title: 'Are you sure?',
      message: `This action will permanently delete ${m?.name}.`,
      onConfirm: () => { AdminStore.deleteModule(id); setItems(AdminStore.listModules()); setModal({open:false,title:''}); }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <span aria-hidden>🧩</span>
        <span>Modules</span>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Modules" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <button onClick={addModule} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Module</button>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name <button onClick={()=>setSort('name')} className="ml-1 text-xs border px-2 py-0.5 rounded">🔤 Sort</button></th>
              <th className="p-3">Created At <button onClick={()=>setSort('date')} className="ml-1 text-xs border px-2 py-0.5 rounded">📅 Sort</button></th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m)=> (
              <tr key={m.id} className="border-t">
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.createdAt}</td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>editModule(m.id)} className="px-2 py-1 text-xs border rounded">✏️</button>
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

export default ModulesPage;

const NameInputModal = ({ title, initial = '', placeholder, onSave, onClose }: { title: string; initial?: string; placeholder?: string; onSave?: (v: string)=>void; onClose: ()=>void }) => {
  const [val, setVal] = useState(initial);
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={() => onSave && onSave(val)} confirmText="Save">
      <input autoFocus value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border rounded-md text-sm" />
    </Modal>
  );
};
