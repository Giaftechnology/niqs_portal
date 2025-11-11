import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const PurchaseOrdersPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listPOs());
  const [sort, setSort] = useState<'number'|'date'>('date');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });

  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.number} ${i.vendor} ${i.status}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='number') list.sort((a,b)=>a.number.localeCompare(b.number));
    if (sort==='date') list.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Create Purchase Order', onSave: (v)=>{ AdminStore.createPO(v); setItems(AdminStore.listPOs()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Purchase Order', initial: curr, onSave: (v)=>{ AdminStore.updatePO({ ...curr, ...v }); setItems(AdminStore.listPOs()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Purchase Order?', message:`Delete ${curr.number}?`, onConfirm:()=>{ AdminStore.deletePO(id); setItems(AdminStore.listPOs()); setConfirm({open:false,title:''}); } }); };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>🧾</span><span>Purchase Orders</span></div>
        <div className="text-sm text-gray-500">Manage purchase orders raised from requisitions</div>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Purchase Orders" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('number')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('date')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ New PO</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-600">
            <div className="mb-3">No purchase orders found</div>
            <button onClick={addItem} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Create First PO</button>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">PO Number</th>
              <th className="p-3">Vendor</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.number}</td>
                <td className="p-3">{v.vendor}</td>
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
      {input.open && (<POInputModal title={input.title} initial={input.initial} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
    </div>
  );
};

export default PurchaseOrdersPage;

type POForm = { number: string; vendor: string; amount: number; status: 'Draft'|'Sent'|'Received'|'Closed' };

type InputState = { open: boolean; title: string; initial?: { id:string; number:string; vendor:string; amount:number; status:'Draft'|'Sent'|'Received'|'Closed'; createdAt:string }; onSave?: (v: POForm)=>void };

const POInputModal = ({ title, initial, onSave, onClose }: { title: string; initial?: any; onSave?: (v: POForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<POForm>({ number: initial?.number||'', vendor: initial?.vendor||'', amount: initial?.amount||0, status: initial?.status||'Draft' });
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">PO Number</div>
          <input autoFocus value={form.number} onChange={e=>setForm({...form,number:e.target.value})} placeholder="PO-0001" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Vendor</div>
          <input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})} placeholder="Vendor" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Amount</div>
          <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:Number(e.target.value)})} placeholder="Amount" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Status</div>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value as POForm['status']})} className="w-full px-3 py-2 border rounded-md text-sm">
            <option>Draft</option>
            <option>Sent</option>
            <option>Received</option>
            <option>Closed</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};
