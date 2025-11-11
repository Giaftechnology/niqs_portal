import React, { useMemo, useState } from 'react';
import Modal from '../../../components/Modal';

const KEY = 'membership_students';
const getAll = () => JSON.parse(localStorage.getItem(KEY) || '[]') as Array<{ id:string; email:string; name:string; phone?:string; department?:string }>;

const MembershipStudents: React.FC = () => {
  const [items, setItems] = useState(getAll());
  const [q, setQ] = useState('');
  const [view, setView] = useState<{open:boolean; title:string; body?:React.ReactNode}>({open:false, title:''});

  const filtered = useMemo(()=> items.filter(i => `${i.name} ${i.email}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  const openView = (it: any) => setView({ open:true, title:'Student Details', body: (
    <div className="text-sm space-y-2">
      <div><span className="text-xs text-gray-500">Full Name</span><div className="font-medium">{it.name}</div></div>
      <div><span className="text-xs text-gray-500">Email</span><div>{it.email}</div></div>
      {it.phone && <div><span className="text-xs text-gray-500">Phone</span><div>{it.phone}</div></div>}
      {it.department && <div><span className="text-xs text-gray-500">Department</span><div>{it.department}</div></div>}
    </div>
  ) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-800">Students</div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded-md text-sm"/>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(it => (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.name}</td>
                <td className="p-3">{it.email}</td>
                <td className="p-3"><button onClick={()=>openView(it)} className="px-2 py-1 text-xs border rounded">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={view.open} title={view.title} onClose={()=>setView({open:false,title:''})}>{view.body}</Modal>
    </div>
  );
};

export default MembershipStudents;
