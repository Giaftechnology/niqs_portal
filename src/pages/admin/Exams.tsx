import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminExams: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listExams());
  const [sort, setSort] = useState<'name'|'date'>('name');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });

  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.name} ${i.type} ${i.diet}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort==='date') list.sort((a,b)=>a.startDate.localeCompare(b.startDate));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Create Exam', onSave: (v)=>{ AdminStore.createExam(v); setItems(AdminStore.listExams()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Exam', initial: curr, onSave: (v)=>{ AdminStore.updateExam({ ...curr, ...v }); setItems(AdminStore.listExams()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Exam?', message:`Delete ${curr.name}?`, onConfirm:()=>{ AdminStore.deleteExam(id); setItems(AdminStore.listExams()); setConfirm({open:false,title:''}); } }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>📝</span><span>Exams</span></div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Exams" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('name')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('date')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Create Exam</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Diet</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Mode</th>
              <th className="p-3">CPD</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.type}</td>
                <td className="p-3">{v.diet}</td>
                <td className="p-3">₦{v.cost.toLocaleString()}</td>
                <td className="p-3">{v.mode}</td>
                <td className="p-3">{v.cpd}</td>
                <td className="p-3">{v.startDate}</td>
                <td className="p-3">{v.endDate}</td>
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
      {input.open && (<ExamInputModal title={input.title} initial={input.initial} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
    </div>
  );
};

export default AdminExams;

type ExamForm = { type: string; name: string; diet: string; cost: number; mode: string; cpd: number; startDate: string; endDate: string };
type InputState = { open: boolean; title: string; initial?: any; onSave?: (v: ExamForm)=>void };

const ExamInputModal = ({ title, initial, onSave, onClose }: { title: string; initial?: any; onSave?: (v: ExamForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<ExamForm>({
    type: initial?.type||'Foundation',
    name: initial?.name||'',
    diet: initial?.diet||'',
    cost: initial?.cost||0,
    mode: initial?.mode||'Online',
    cpd: initial?.cpd||0,
    startDate: initial?.startDate||new Date().toISOString().slice(0,10),
    endDate: initial?.endDate||new Date().toISOString().slice(0,10),
  });
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Exam Type</div>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm">
            <option>Foundation</option>
            <option>Intermediate</option>
            <option>Professional</option>
          </select>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Exam Name</div>
          <input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Exam Name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Diet</div>
          <input value={form.diet} onChange={e=>setForm({...form,diet:e.target.value})} placeholder="Diet" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Cost</div>
          <input type="number" value={form.cost} onChange={e=>setForm({...form,cost:Number(e.target.value)})} placeholder="Cost" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Mode</div>
          <select value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm">
            <option>Online</option>
            <option>Physical</option>
            <option>Hybrid</option>
          </select>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">CPD</div>
          <input type="number" value={form.cpd} onChange={e=>setForm({...form,cpd:Number(e.target.value)})} placeholder="CPD" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Start Date</div>
          <input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">End Date</div>
          <input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
      </div>
    </Modal>
  );
};
