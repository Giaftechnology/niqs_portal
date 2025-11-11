import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminDietManagement: React.FC = () => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const [items, setItems] = useState(AdminStore.listDiets());
  const [sort, setSort] = useState<'name'|'date'>('date');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });
  const [details, setDetails] = useState<{open:boolean; title:string; body?:React.ReactNode}>({open:false, title:''});
  const [assign, setAssign] = useState<{open:boolean; dietId?:string}>({open:false});
  const [assignQ, setAssignQ] = useState('');
  const [supPick, setSupPick] = useState<{open:boolean; studentEmail?:string}>({open:false});
  const [supQ, setSupQ] = useState('');

  const years = useMemo(() => { const now = new Date().getFullYear(); return Array.from({length: 60}, (_,i)=>String(now-i)); }, []);
  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.sessionName} ${i.diet} ${i.year}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='name') list.sort((a,b)=>a.sessionName.localeCompare(b.sessionName));
    if (sort==='date') list.sort((a,b)=>a.startDate.localeCompare(b.startDate));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Create Diet', onSave: (v)=>{ AdminStore.createDiet(v); setItems(AdminStore.listDiets()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Diet', initial: curr, onSave: (v)=>{ AdminStore.updateDiet({ ...curr, ...v } as any); setItems(AdminStore.listDiets()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Diet?', message:`Delete ${curr.sessionName} - ${curr.diet}?`, onConfirm:()=>{ AdminStore.deleteDiet(id); setItems(AdminStore.listDiets()); setConfirm({open:false,title:''}); } }); };

  const closeDiet = (id:string) => {
    const curr = items.find(x=>x.id===id); if(!curr) return;
    setConfirm({ open:true, title:'Close Diet?', message:`Are you sure you want to close ${curr.sessionName} - ${curr.diet}?`, onConfirm:()=>{ AdminStore.setDietStatus(id,'closed'); setItems(AdminStore.listDiets()); setConfirm({open:false,title:''}); }});
  };
  const openDiet = (id:string) => { AdminStore.setDietStatus(id,'open'); setItems(AdminStore.listDiets()); };

  const openDetails = (id:string) => {
    navigate(`/admin/logbook/diet-management/${id}`);
  };

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
              <th className="p-3">Status</th>
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
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${v.status==='open'?'bg-green-100 text-green-700':'bg-gray-200 text-gray-600'}`}>{v.status}</span></td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>openDetails(v.id)} className="px-2 py-1 text-xs border rounded">View</button>
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
      {/* details now shown on dedicated page */}
      <AssignAccessorModal open={assign.open} dietId={assign.dietId} onClose={()=>{ setAssign({open:false}); setAssignQ(''); }} q={assignQ} setQ={setAssignQ} onAssigned={()=>{ setItems(AdminStore.listDiets()); setDetails(d=>({ ...d })); }} />
      <AssignSupervisorModal open={supPick.open} studentEmail={supPick.studentEmail} q={supQ} setQ={setSupQ} onClose={()=>{ setSupPick({open:false}); setSupQ(''); }} />
    </div>
  );
};

const AssignSupervisorModal = ({ open, studentEmail, q, setQ, onClose }: { open: boolean; studentEmail?: string; q: string; setQ: (v:string)=>void; onClose: ()=>void }) => {
  if (!open || !studentEmail) return null;
  const suUsers = AdminStore.listSupervisorUsers();
  const filtered = suUsers.filter(s=> `${s.name} ${s.email}`.toLowerCase().includes(q.toLowerCase()));
  const assign = (supId: string) => {
    const list = AdminStore.listSupervisors();
    const existing = list.find(p=>p.id===supId) || { id: supId, students: [] };
    const set = new Set(existing.students);
    set.add(studentEmail);
    AdminStore.upsertSupervisor({ id: supId, students: Array.from(set) });
    onClose();
  };
  return (
    <Modal open={true} title={`Assign Supervisor for ${studentEmail}`} onClose={onClose} panelClassName="max-w-2xl w-[90vw] max-h-[80vh]" bodyClassName="overflow-y-auto max-h-[60vh] pr-1">
      <div className="space-y-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search supervisors" className="w-full px-3 py-2 border rounded-md text-sm" />
        <div className="max-h-60 overflow-auto border rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.email}</td>
                  <td className="p-2"><button onClick={()=>assign(s.id)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Assign</button></td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={3}>No supervisors match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
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

const Stat = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3">
    <div className="text-[11px] text-gray-500">{title}</div>
    <div className="text-lg font-semibold text-gray-800">{value}</div>
  </div>
);

const AssignAccessorModal = ({ open, dietId, q, setQ, onClose, onAssigned }: { open: boolean; dietId?: string; q: string; setQ: (v:string)=>void; onClose: ()=>void; onAssigned: ()=>void }) => {
  if (!open || !dietId) return null;
  const diet = AdminStore.listDiets().find(d=>d.id===dietId);
  const accessors = AdminStore.listAccessors();
  const filtered = accessors.filter(a => `${a.name} ${a.email}`.toLowerCase().includes(q.toLowerCase()));
  const assign = (aid: string) => { AdminStore.assignAccessorToDiet(dietId, aid); onAssigned(); };
  return (
    <Modal open={true} title="Assign Accessor" onClose={onClose} panelClassName="max-w-2xl w-[90vw] max-h-[80vh]" bodyClassName="overflow-y-auto max-h-[60vh] pr-1">
      <div className="space-y-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search accessors" className="w-full px-3 py-2 border rounded-md text-sm" />
        <div className="max-h-60 overflow-auto border rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.name}</td>
                  <td className="p-2">{a.email}</td>
                  <td className="p-2"><button onClick={()=>assign(a.id)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Assign</button></td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={3}>No accessors match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
