import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminEvents: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listEvents());
  const [sort, setSort] = useState<'name'|'date'>('date');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });

  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.name} ${i.title} ${i.tagline}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort==='date') list.sort((a,b)=>a.date.localeCompare(b.date));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Create Event', onSave: (v)=>{ AdminStore.createEvent(v); setItems(AdminStore.listEvents()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Event', initial: curr, onSave: (v)=>{ AdminStore.updateEvent({ ...curr, ...v }); setItems(AdminStore.listEvents()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Event?', message:`Delete ${curr.name}?`, onConfirm:()=>{ AdminStore.deleteEvent(id); setItems(AdminStore.listEvents()); setConfirm({open:false,title:''}); } }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>📅</span><span>Events</span></div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Events" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('name')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('date')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Create Event</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Title</th>
              <th className="p-3">Tagline</th>
              <th className="p-3">Date</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Banner</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.title}</td>
                <td className="p-3">{v.tagline}</td>
                <td className="p-3">{v.date}</td>
                <td className="p-3">₦{v.cost.toLocaleString()}</td>
                <td className="p-3">{v.banner ? (<img src={v.banner} alt="banner" className="h-8 rounded" />) : '-'}</td>
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
      {input.open && (<EventInputModal title={input.title} initial={input.initial} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
    </div>
  );
};

export default AdminEvents;

type EventForm = { name: string; title: string; tagline: string; date: string; cost: number; banner: string };
type InputState = { open: boolean; title: string; initial?: any; onSave?: (v: EventForm)=>void };

const EventInputModal = ({ title, initial, onSave, onClose }: { title: string; initial?: any; onSave?: (v: EventForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<EventForm>({
    name: initial?.name||'',
    title: initial?.title||'',
    tagline: initial?.tagline||'',
    date: initial?.date||new Date().toISOString().slice(0,10),
    cost: initial?.cost||0,
    banner: initial?.banner||''
  });

  const onFile = async (file: File) => {
    const toDataUrl = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });
    const data = await toDataUrl(file);
    setForm(prev => ({ ...prev, banner: data }));
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) await onFile(file);
  };
  const prevent: React.DragEventHandler<HTMLDivElement> = (e) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Event Name</div>
          <input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Event Name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Title</div>
          <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Tagline</div>
          <input value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})} placeholder="Tagline" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Date</div>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Cost</div>
          <input type="number" value={form.cost} onChange={e=>setForm({...form,cost:Number(e.target.value)})} placeholder="Cost" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Banner</div>
          <div
            onDragOver={prevent}
            onDragEnter={prevent}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-md p-4 text-xs text-gray-600 hover:border-indigo-300"
          >
            <div className="flex items-center justify-between">
              <span>Drag & drop an image here, or</span>
              <label className="text-indigo-600 underline cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e:any)=> e.target.files && onFile(e.target.files[0])} />
                browse
              </label>
            </div>
            {form.banner && <img src={form.banner} alt="banner" className="mt-3 h-16 rounded border" />}
          </div>
        </div>
      </div>
    </Modal>
  );
};
