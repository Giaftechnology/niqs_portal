import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminDietManagement: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listDiets());
  const [sort, setSort] = useState<'name'|'date'>('date');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });

  const years = useMemo(() => { const now = new Date().getFullYear(); return Array.from({length: 60}, (_,i)=>String(now-i)); }, []);
  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.sessionName} ${i.diet} ${i.year}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='name') list.sort((a,b)=>a.sessionName.localeCompare(b.sessionName));
    if (sort==='date') list.sort((a,b)=>a.startDate.localeCompare(b.startDate));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Create Diet', onSave: (v)=>{ AdminStore.createDiet(v); setItems(AdminStore.listDiets()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Diet', initial: curr, onSave: (v)=>{ AdminStore.updateDiet({ ...curr, ...v }); setItems(AdminStore.listDiets()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Diet?', message:`Delete ${curr.sessionName} - ${curr.diet}?`, onConfirm:()=>{ AdminStore.deleteDiet(id); setItems(AdminStore.listDiets()); setConfirm({open:false,title:''}); } }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <span aria-hidden>🍽️</span>
        <span>Diet Management</span>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Diets" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('name')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('date')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Create Diet</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Session</th>
              <th className="p-3">Diet</th>
              <th className="p-3">Year</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.sessionName}</td>
                <td className="p-3">{v.diet}</td>
                <td className="p-3">{v.year}</td>
                <td className="p-3">{v.startDate}</td>
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
      {input.open && (<DietInputModal title={input.title} initial={input.initial} years={years} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
    </div>
  );
};

export default AdminDietManagement;

type DietForm = { sessionName: string; diet: string; year: number; startDate: string };
type InputState = { open: boolean; title: string; initial?: { id:string; sessionName:string; diet:string; year:number; startDate:string }; onSave?: (v: DietForm)=>void };

const DietInputModal = ({ title, initial, years, onSave, onClose }: { title: string; initial?: any; years: string[]; onSave?: (v: DietForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<DietForm>({ sessionName: initial?.sessionName||'', diet: initial?.diet||'', year: initial?.year||new Date().getFullYear(), startDate: initial?.startDate||new Date().toISOString().slice(0,10) });
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Session Name</div>
          <input autoFocus value={form.sessionName} onChange={e=>setForm({...form,sessionName:e.target.value})} placeholder="Session Name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Diet</div>
          <input value={form.diet} onChange={e=>setForm({...form,diet:e.target.value})} placeholder="Diet" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Year</div>
          <select value={String(form.year)} onChange={e=>setForm({...form,year:Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md text-sm">
            {years.map(y=> (<option key={y}>{y}</option>))}
          </select>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Start Date</div>
          <input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
      </div>
    </Modal>
  );
};
