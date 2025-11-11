import React, { useMemo, useState } from 'react';
import Modal from '../../../components/Modal';

const KEY = 'membership_members';
const getAll = () => JSON.parse(localStorage.getItem(KEY) || '[]') as Array<{ id:string; email:string; name:string; phone?:string; department?:string; membershipNo?:string }>;
const saveAll = (list: any[]) => localStorage.setItem(KEY, JSON.stringify(list));

const Members: React.FC = () => {
  const [items, setItems] = useState(getAll());
  const [q, setQ] = useState('');
  const [view, setView] = useState<{open:boolean; title:string; body?:React.ReactNode}>({open:false, title:''});
  const [emailModal, setEmailModal] = useState<{open:boolean; to?:string}>({open:false});
  const [emailBody, setEmailBody] = useState('');

  const filtered = useMemo(()=> items.filter(i => `${i.name} ${i.email}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  const openView = (m: any) => setView({ open:true, title:'Member Details', body: (
    <div className="text-sm space-y-2">
      <div><span className="text-xs text-gray-500">Full Name</span><div className="font-medium">{m.name}</div></div>
      <div><span className="text-xs text-gray-500">Email</span><div>{m.email}</div></div>
      {m.membershipNo && <div><span className="text-xs text-gray-500">Membership No.</span><div>{m.membershipNo}</div></div>}
      {m.phone && <div><span className="text-xs text-gray-500">Phone</span><div>{m.phone}</div></div>}
      {m.department && <div><span className="text-xs text-gray-500">Department</span><div>{m.department}</div></div>}
    </div>
  )});

  const sendEmail = (to: string) => {
    setEmailModal({ open: true, to });
    setEmailBody('');
  };

  const confirmSend = () => {
    // Mock: in real app we'd call backend
    setEmailModal({ open:false });
    setEmailBody('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-800">Members</div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded-md text-sm"/>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Membership No.</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-t">
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">{m.membershipNo || '-'}</td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>openView(m)} className="px-2 py-1 text-xs border rounded">View</button>
                  <button onClick={()=>sendEmail(m.email)} className="px-2 py-1 text-xs border rounded">Send Email</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={view.open} title={view.title} onClose={()=>setView({open:false,title:''})}>{view.body}</Modal>
      <Modal open={emailModal.open} title={`Email ${emailModal.to}`} onClose={()=>setEmailModal({open:false})} onConfirm={confirmSend} confirmText="Send">
        <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} placeholder="Type message" className="w-full h-28 px-3 py-2 border rounded-md text-sm" />
      </Modal>
    </div>
  );
};

export default Members;
