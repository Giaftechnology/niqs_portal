import React, { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminSubmissions: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState(AdminStore.listLogs());
  const [view, setView] = useState<{open:boolean;title:string;body?:React.ReactNode}>({open:false,title:''});
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});

  const filtered = useMemo(() => {
    return items.filter(i => `${i.studentEmail} ${i.text}`.toLowerCase().includes(q.toLowerCase()));
  }, [items, q]);

  const openView = (id:string) => {
    const s = items.find(x=>x.id===id); if(!s) return;
    setView({ open:true, title:`Submission by ${s.studentEmail}`, body: (
      <div className="text-sm text-gray-700 space-y-2">
        <div><span className="text-gray-500">Week:</span> {s.week} • <span className="text-gray-500">Day:</span> {s.day}</div>
        <div className="whitespace-pre-wrap">{s.text}</div>
        <div className="text-xs text-gray-500">Status: {s.status} • {new Date(s.createdAt).toLocaleString()}</div>
      </div>
    )});
  };

  const setStatus = (id:string, status:'approved'|'rejected') => {
    const s = items.find(x=>x.id===id); if(!s) return;
    AdminStore.updateLog({ ...s, status });
    setItems(AdminStore.listLogs());
  };

  const removeItem = (id:string) => {
    const s = items.find(x=>x.id===id); if(!s) return;
    setConfirm({ open:true, title:'Delete Submission?', message:'This action cannot be undone.', onConfirm:()=>{ AdminStore.deleteLog(id); setItems(AdminStore.listLogs()); setConfirm({open:false,title:''}); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>📤</span><span>Submissions</span></div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by email or text" className="px-3 py-2 border rounded-md text-sm w-72"/>
      </div>
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Student</th>
              <th className="p-3">Week/Day</th>
              <th className="p-3">Excerpt</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s=> (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.studentEmail}</td>
                <td className="p-3">W{s.week} / {s.day}</td>
                <td className="p-3">{s.text.length>60? s.text.slice(0,60)+'…' : s.text}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${s.status==='approved'?'bg-green-100 text-green-700': s.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>openView(s.id)} className="px-2 py-1 text-xs border rounded">View</button>
                  <button onClick={()=>setStatus(s.id,'approved')} className="px-2 py-1 text-xs border rounded text-green-700 border-green-300">Approve</button>
                  <button onClick={()=>setStatus(s.id,'rejected')} className="px-2 py-1 text-xs border rounded text-red-700 border-red-300">Reject</button>
                  <button onClick={()=>removeItem(s.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={view.open} title={view.title} onClose={()=>setView({open:false,title:''})}>{view.body}</Modal>
      <Modal open={confirm.open} title={confirm.title} onClose={()=>setConfirm({open:false,title:''})} onConfirm={confirm.onConfirm} confirmText="Delete">{confirm.message}</Modal>
    </div>
  );
};

export default AdminSubmissions;
