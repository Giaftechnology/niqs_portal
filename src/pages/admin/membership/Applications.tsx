import React, { useMemo, useState } from 'react';
import Modal from '../../../components/Modal';

// Storage keys
const APP_KEY = 'membership_applications';
const MEMBERS_KEY = 'membership_members';

export type Application = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  membershipNo?: string;
};

const getApps = (): Application[] => JSON.parse(localStorage.getItem(APP_KEY) || '[]');
const saveApps = (list: Application[]) => localStorage.setItem(APP_KEY, JSON.stringify(list));
const getMembers = () => JSON.parse(localStorage.getItem(MEMBERS_KEY) || '[]') as Array<any>;
const saveMembers = (list: any[]) => localStorage.setItem(MEMBERS_KEY, JSON.stringify(list));

const genMembershipNo = () => {
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `NIQS-${year}-${seq}`;
};

const Applications: React.FC = () => {
  const [items, setItems] = useState<Application[]>(getApps());
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [view, setView] = useState<{open:boolean;title:string;body?:React.ReactNode}>({open:false,title:''});

  const filtered = useMemo(()=> items.filter(i => `${i.name} ${i.email}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  const updateStatus = (id:string, status: 'accepted'|'rejected') => {
    const list = getApps();
    const idx = list.findIndex(a=>a.id===id);
    if (idx<0) return;
    list[idx].status = status;
    saveApps(list);
    setItems(list);
  };

  const issueNumber = (id:string) => {
    const list = getApps();
    const idx = list.findIndex(a=>a.id===id);
    if (idx<0) return;
    const no = genMembershipNo();
    list[idx].membershipNo = no;
    saveApps(list);
    // also add to members list
    const members = getMembers();
    const app = list[idx];
    members.push({ id: app.id, email: app.email, name: app.name, phone: app.phone, department: app.department, membershipNo: no });
    saveMembers(members);
    setItems(list);
  };

  const openView = (a: Application) => setView({ open:true, title:'Application Details', body: (
    <div className="text-sm space-y-2">
      <div><span className="text-xs text-gray-500">Full Name</span><div className="font-medium">{a.name}</div></div>
      <div><span className="text-xs text-gray-500">Email</span><div>{a.email}</div></div>
      {a.phone && <div><span className="text-xs text-gray-500">Phone</span><div>{a.phone}</div></div>}
      {a.department && <div><span className="text-xs text-gray-500">Department</span><div>{a.department}</div></div>}
      <div><span className="text-xs text-gray-500">Status</span><div className="capitalize">{a.status || 'pending'}</div></div>
      {a.status === 'accepted' && (
        <div><span className="text-xs text-gray-500">Membership No.</span><div>{a.membershipNo || 'Not issued'}</div></div>
      )}
      <div className="pt-2 flex gap-2">
        {(!a.status || a.status === 'pending') && (
          <>
            <button onClick={()=>updateStatus(a.id,'accepted')} className="px-2 py-1 text-xs border rounded text-green-700 border-green-300">Accept</button>
            <button onClick={()=>updateStatus(a.id,'rejected')} className="px-2 py-1 text-xs border rounded text-red-700 border-red-300">Reject</button>
          </>
        )}
        {a.status === 'accepted' && !a.membershipNo && (
          <button onClick={()=>issueNumber(a.id)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Issue Membership Number</button>
        )}
      </div>
    </div>
  )});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-800">Applications</div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded-md text-sm"/>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.name}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3 capitalize">{a.status || 'pending'}</td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>openView(a)} className="px-2 py-1 text-xs border rounded">View</button>
                  {(!a.status || a.status==='pending') && (
                    <>
                      <button onClick={()=>updateStatus(a.id,'accepted')} className="px-2 py-1 text-xs border rounded text-green-700 border-green-300">Accept</button>
                      <button onClick={()=>updateStatus(a.id,'rejected')} className="px-2 py-1 text-xs border rounded text-red-700 border-red-300">Reject</button>
                    </>
                  )}
                  {a.status==='accepted' && !a.membershipNo && (
                    <button onClick={()=>issueNumber(a.id)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Issue No.</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={view.open} title={view.title} onClose={()=>setView({open:false,title:''})}>{view.body}</Modal>
    </div>
  );
};

export default Applications;
