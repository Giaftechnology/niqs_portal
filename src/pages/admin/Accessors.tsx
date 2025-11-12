import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminAccessors: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listAccessors());
  const [modal, setModal] = useState<{ open: boolean; title: string; message?: string; onConfirm?: () => void }>({ open: false, title: '' });
  const [view, setView] = useState<{ open: boolean; title: string; body?: React.ReactNode }>({ open: false, title: '' });
  const [addOpen, setAddOpen] = useState(false);
  const [lookup, setLookup] = useState<{ id: string; result?: any; error?: string }>({ id: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState<{ id?: string; name: string; email: string }>({ name: '', email: '' });

  const diets = AdminStore.listDiets();
  const logs = AdminStore.listLogs();
  const [dietFilter, setDietFilter] = useState<string>('all');
  const assignedCount = (accessorId: string) => diets.filter(d=>d.accessorIds.includes(accessorId)).length;
  const metrics = (accessorId: string) => {
    const assignedDietIds = diets.filter(d=>d.accessorIds.includes(accessorId)).map(d=>d.id);
    const scopeDietIds = dietFilter==='all' ? assignedDietIds : assignedDietIds.filter(id=>id===dietFilter);
    const relevant = logs.filter(l => l.dietId && scopeDietIds.includes(l.dietId));
    const pending = relevant.filter(l=>l.status==='pending').length;
    const passed = relevant.filter(l=>l.status==='approved').length;
    const failed = relevant.filter(l=>l.status==='rejected').length;
    const accessed = relevant.filter(l=>l.status!=='pending').length;
    const repeating = 0;
    return { accessed, pending, failed, passed, repeating };
  };
  const filtered = useMemo(() => items.filter(i => `${i.name} ${i.email}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  const openAdd = () => { setAddOpen(true); setLookup({ id: '' }); };
  const doLookup = () => {
    const members = JSON.parse(localStorage.getItem('membership_members') || '[]') as Array<any>;
    const found = members.find(m => m.membershipNo === lookup.id.trim());
    if (!found) { setLookup(prev=>({ ...prev, result: undefined, error: 'Invalid membership ID' })); return; }
    setLookup(prev=>({ ...prev, result: found, error: undefined }));
  };
  const confirmAddAccessor = () => {
    if (!lookup.result) return;
    AdminStore.createAccessor({ name: lookup.result.name, email: lookup.result.email });
    setItems(AdminStore.listAccessors());
    setAddOpen(false);
  };
  const editItem = (id: string) => {
    const curr = items.find(x=>x.id===id); if(!curr) return;
    setEditState({ id: curr.id, name: curr.name, email: curr.email });
    setEditOpen(true);
  };
  const saveEdit = () => {
    const curr = items.find(x=>x.id===editState.id); if(!curr) { setEditOpen(false); return; }
    AdminStore.updateAccessor({ ...curr, name: editState.name.trim(), email: editState.email.trim() });
    setItems(AdminStore.listAccessors());
    setEditOpen(false);
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Accessors" className="px-3 py-2 border rounded-md text-sm w-72"/>
          <select value={dietFilter} onChange={e=>setDietFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
            <option value="all">All Diets</option>
            {diets.map(d => (<option key={d.id} value={d.id}>{d.sessionName} - {d.diet}</option>))}
          </select>
        </div>
        <button onClick={openAdd} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add by Membership ID</button>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Assigned</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.name}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3">{assignedCount(a.id)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{a.active ? 'Active' : 'Disabled'}</span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>viewItem(a.id)} className="px-2 py-1 text-xs border rounded bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">👁️</button>
                  <button onClick={()=>editItem(a.id)} className="px-2 py-1 text-xs border rounded bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">✏️</button>
                  <button onClick={()=>disableItem(a.id)} className={`px-2 py-1 text-xs border rounded ${a.active ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>{a.active ? 'Disable' : 'Enable'}</button>
                  <button onClick={()=>deleteItem(a.id)} className="px-2 py-1 text-xs border rounded bg-red-50 text-red-700 border-red-200 hover:bg-red-100">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal.open} title={modal.title} onClose={()=>setModal({open:false,title:''})} onConfirm={modal.onConfirm} confirmText="Delete">{modal.message}</Modal>
      <Modal open={view.open} title={view.title} onClose={()=>setView({open:false,title:''})}>{view.body}</Modal>
      <AddAccessorByMemberModal open={addOpen} lookup={lookup} setLookup={setLookup} onLookup={doLookup} onConfirm={confirmAddAccessor} onClose={()=>setAddOpen(false)} />
      <Modal open={editOpen} title="Edit Accessor" onClose={()=>setEditOpen(false)} onConfirm={saveEdit} confirmText="Save">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Full Name</div>
            <input value={editState.name} onChange={e=>setEditState({ ...editState, name: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Email</div>
            <input value={editState.email} onChange={e=>setEditState({ ...editState, email: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAccessors;

const AddAccessorByMemberModal = ({ open, lookup, setLookup, onLookup, onConfirm, onClose }: { open: boolean; lookup: { id: string; result?: any; error?: string }; setLookup: (v:any)=>void; onLookup: ()=>void; onConfirm: ()=>void; onClose: ()=>void }) => {
  if (!open) return null;
  return (
    <Modal open={true} title="Add Accessor by Membership ID" onClose={onClose} onConfirm={lookup.result ? onConfirm : undefined} confirmText="Add as Accessor">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Membership ID</div>
          <div className="flex gap-2">
            <input autoFocus value={lookup.id} onChange={e=>setLookup({ ...lookup, id: e.target.value })} placeholder="e.g. NIQS-2025-1234" className="w-full px-3 py-2 border rounded-md text-sm" />
            <button onClick={onLookup} className="px-3 py-2 text-sm border rounded-md">Lookup</button>
          </div>
          {lookup.error && <div className="text-xs text-red-600 mt-1">{lookup.error}</div>}
        </div>
        {lookup.result && (
          <div className="border-t pt-3 text-sm text-gray-700 space-y-1">
            <div><span className="text-gray-500">Name:</span> {lookup.result.name}</div>
            <div><span className="text-gray-500">Email:</span> {lookup.result.email}</div>
            {lookup.result.membershipNo && <div><span className="text-gray-500">Membership No.:</span> {lookup.result.membershipNo}</div>}
          </div>
        )}
      </div>
    </Modal>
  );
};
