import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const RequisitionsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listRequisitions());
  const [sort, setSort] = useState<'name'|'date'>('date');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });

  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.title} ${i.department} ${i.priority}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='name') list.sort((a,b)=>a.title.localeCompare(b.title));
    if (sort==='date') list.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Create Purchase Requisition', onSave: (v)=>{ AdminStore.createRequisition(v); setItems(AdminStore.listRequisitions()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Requisition', initial: curr, onSave: (v)=>{ AdminStore.updateRequisition({ ...curr, ...v }); setItems(AdminStore.listRequisitions()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Requisition?', message:`Delete ${curr.title}?`, onConfirm:()=>{ AdminStore.deleteRequisition(id); setItems(AdminStore.listRequisitions()); setConfirm({open:false,title:''}); } }); };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>🧾</span><span>Purchase Requisitions</span></div>
        <div className="text-sm text-gray-500">Manage and track procurement requests</div>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Requisitions" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('name')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('date')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ New Requisition</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-600">
            <div className="mb-3">No requisitions found</div>
            <button onClick={addItem} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Create First Requisition</button>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Department</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.title}</td>
                <td className="p-3">{v.department}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${v.priority==='High'?'bg-red-100 text-red-700': v.priority==='Medium'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{v.priority}</span></td>
                <td className="p-3">₦{v.amount.toLocaleString()}</td>
                <td className="p-3">{v.status}</td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>editItem(v.id)} className="px-2 py-1 text-xs border rounded">✏️</button>
                  <button onClick={()=>deleteItem(v.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      <Modal open={confirm.open} title={confirm.title} onClose={()=>setConfirm({open:false,title:''})} onConfirm={confirm.onConfirm} confirmText="Delete">{confirm.message}</Modal>
      {input.open && (<RequisitionInputModal title={input.title} initial={input.initial} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
    </div>
  );
};

export default RequisitionsPage;

type ReqForm = { title: string; description: string; department: string; priority: 'Low'|'Medium'|'High'; amount: number; status: 'Draft'|'Pending'|'Approved' };

type InputState = { open: boolean; title: string; initial?: { id:string; title:string; description:string; department:string; priority:'Low'|'Medium'|'High'; amount:number; createdAt:string }; onSave?: (v: ReqForm)=>void };

const RequisitionInputModal = ({ title, initial, onSave, onClose }: { title: string; initial?: any; onSave?: (v: ReqForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<ReqForm>({ title: initial?.title||'', description: initial?.description||'', department: initial?.department||'', priority: initial?.priority||'Medium', amount: initial?.amount||0, status: initial?.status||'Draft' });
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Title</div>
          <input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Description</div>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Department</div>
          <input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Department" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Priority</div>
          <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as ReqForm['priority']})} className="w-full px-3 py-2 border rounded-md text-sm">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Total Amount</div>
          <input type="number" value={form.amount} onChange={e=>setForm({...form,amount: Number(e.target.value)})} placeholder="Total Amount" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Status</div>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value as ReqForm['status']})} className="w-full px-3 py-2 border rounded-md text-sm">
            <option>Draft</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};
