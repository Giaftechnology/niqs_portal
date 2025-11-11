import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminDietDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignQ, setAssignQ] = useState('');
  const [supPick, setSupPick] = useState<{open:boolean; studentEmail?:string}>({open:false});
  const [supQ, setSupQ] = useState('');

  const diet = useMemo(() => AdminStore.listDiets().find(d=>d.id===id), [id]);
  const accessors = useMemo(() => diet ? AdminStore.listAccessors().filter(a=>diet.accessorIds.includes(a.id)) : [], [diet]);
  const logs = AdminStore.listLogs();

  if (!diet) return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
        <span>Diet Details</span>
      </div>
      <div className="text-sm text-red-600">Diet not found.</div>
    </div>
  );

  const stats = {
    accessors: accessors.length,
    submitted: logs.filter(l=>l.status==='submitted').length,
    approved: logs.filter(l=>l.status==='approved').length,
    rejected: logs.filter(l=>l.status==='rejected').length,
  };

  const closeDiet = () => AdminStore.setDietStatus(diet.id,'closed');
  const openDiet = () => AdminStore.setDietStatus(diet.id,'open');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
          <div>
            <div className="text-2xl font-semibold">{diet.sessionName} - {diet.diet}</div>
            <div className="text-sm text-gray-500">Year {diet.year} • Starts {diet.startDate}</div>
          </div>
        </div>
        <div className="space-x-2">
          {diet.status==='open' ? (
            <button onClick={closeDiet} className="px-3 py-1.5 text-sm border rounded-md border-red-300 text-red-700">Close Diet</button>
          ) : (
            <button onClick={openDiet} className="px-3 py-1.5 text-sm border rounded-md border-green-300 text-green-700">Reopen Diet</button>
          )}
          <button onClick={()=>setAssignOpen(true)} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md">Start Assessment / Assign Accessor</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat title="Accessors" value={stats.accessors} />
        <Stat title="Submitted" value={stats.submitted} />
        <Stat title="Approved" value={stats.approved} />
        <Stat title="Rejected" value={stats.rejected} />
      </div>

      <section className="border rounded-xl bg-white">
        <div className="p-3 text-sm font-medium border-b">Assigned Accessors</div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accessors.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.name}</td>
                  <td className="p-2">{a.email}</td>
                  <td className="p-2"><button onClick={()=>{ AdminStore.unassignAccessorFromDiet(diet.id, a.id); }} className="px-2 py-1 text-xs border rounded">Unassign</button></td>
                </tr>
              ))}
              {accessors.length===0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={3}>No accessors assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border rounded-xl bg-white">
        <div className="p-3 text-sm font-medium border-b">Submissions</div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Student</th>
                <th className="p-2">Week/Day</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.studentEmail}</td>
                  <td className="p-2">W{s.week} / {s.day}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${s.status==='submitted' ? 'bg-green-100 text-green-700' : s.status==='approved' ? 'bg-blue-100 text-blue-700' : s.status==='rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                  </td>
                  <td className="p-2 space-x-2">
                    <button onClick={()=>{ AdminStore.updateLog({ ...s, status: 'pending' as any }); }} className="px-2 py-1 text-xs border rounded">Recall Submission</button>
                    <button onClick={()=>setSupPick({open:true, studentEmail: s.studentEmail})} className="px-2 py-1 text-xs border rounded">Assign Supervisor</button>
                  </td>
                </tr>
              ))}
              {logs.length===0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={4}>No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AssignAccessorModal open={assignOpen} dietId={diet.id} onClose={()=>{ setAssignOpen(false); setAssignQ(''); }} q={assignQ} setQ={setAssignQ} onAssigned={()=>{ /* no-op, page re-reads list on actions */ }} />
      <AssignSupervisorModal open={supPick.open} studentEmail={supPick.studentEmail} q={supQ} setQ={setSupQ} onClose={()=>{ setSupPick({open:false}); setSupQ(''); }} />
    </div>
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
  const accessors = AdminStore.listAccessors();
  const filtered = accessors.filter(a => `${a.name} ${a.email}`.toLowerCase().includes(q.toLowerCase()));
  const assign = (aid: string) => { AdminStore.assignAccessorToDiet(dietId, aid); onAssigned(); onClose(); };
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

export default AdminDietDetail;
