import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const VendorsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listVendors());
  const [sort, setSort] = useState<'name'|'date'>('name');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [input, setInput] = useState<InputState>({ open:false, title:'' });

  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.name} ${i.email} ${i.phone}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort==='date') list.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [items, q, sort]);

  const addItem = () => setInput({ open:true, title:'Add New Vendor', onSave: (v)=>{ AdminStore.createVendor(v); setItems(AdminStore.listVendors()); setInput({open:false,title:''}); }});
  const editItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setInput({ open:true, title:'Edit Vendor', initial: curr, onSave: (v)=>{ AdminStore.updateVendor({ ...curr, ...v }); setItems(AdminStore.listVendors()); setInput({open:false,title:''}); } }); };
  const deleteItem = (id:string) => { const curr = items.find(x=>x.id===id); if(!curr) return; setConfirm({ open:true, title:'Delete Vendor?', message:`Delete ${curr.name}?`, onConfirm:()=>{ AdminStore.deleteVendor(id); setItems(AdminStore.listVendors()); setConfirm({open:false,title:''}); } }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>🏷️</span><span>Vendors</span></div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Vendors" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('name')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('date')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ New Vendor</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.email}</td>
                <td className="p-3">{v.phone}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{v.status}</span></td>
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
      {input.open && (<VendorInputModal title={input.title} initial={input.initial} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
    </div>
  );
};

export default VendorsPage;

type VendorForm = { name: string; email: string; phone: string; address: string; status: string };

type InputState = { open: boolean; title: string; initial?: { id:string; name:string; email:string; phone:string; address:string; status:string; createdAt:string }; onSave?: (v: VendorForm)=>void };

const VendorInputModal = ({ title, initial, onSave, onClose }: { title: string; initial?: any; onSave?: (v: VendorForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<VendorForm>({ name: initial?.name||'', email: initial?.email||'', phone: initial?.phone||'', address: initial?.address||'', status: initial?.status||'Pending' });
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Vendor Name</div>
          <input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Vendor Name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Contact Email</div>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Contact Email" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Contact Phone</div>
          <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Contact Phone" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Address</div>
          <textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Address" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Status</div>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm">
            <option>Pending</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};
