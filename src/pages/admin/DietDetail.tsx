import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';

const AdminDietDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);
  const [info, setInfo] = useState<{open:boolean; title:string; message?:string}>({open:false, title:''});
  const [assignQ, setAssignQ] = useState('');
  const [supPick, setSupPick] = useState<{open:boolean; studentEmail?:string}>({open:false});
  const [supQ, setSupQ] = useState('');
  const [confirm, setConfirm] = useState<{open:boolean; title:string; message?:string; onConfirm?:()=>void}>({open:false,title:''});
  const [accQ, setAccQ] = useState('');
  const [accSort, setAccSort] = useState<'name'|'email'>('name');
  const [subQ, setSubQ] = useState('');
  const [subStatus, setSubStatus] = useState<'all'|'submitted'|'approved'|'rejected'|'pending'>('all');
  const [addByMemberOpen, setAddByMemberOpen] = useState(false);
  const [memberLookup, setMemberLookup] = useState<{ id: string; result?: any; error?: string }>({ id: '' });
  const [accView, setAccView] = useState<{ open:boolean; name?:string; email?:string; metrics?: {assigned:number; accessed:number; pending:number; failed:number; passed:number; repeating:number} }>({ open:false });
  const [version, setVersion] = useState(0);

  const diet = useMemo(() => AdminStore.listDiets().find(d=>d.id===id), [id, version]);
  const accessors = useMemo(() => diet ? AdminStore.listAccessors().filter(a=>diet.accessorIds.includes(a.id)) : [], [diet, version]);
  const logs = AdminStore.listLogs();

  const computeMetricsForAccessor = (accessorId: string, dietId: string) => {
    const dietLogs = logs.filter(l => l.dietId === dietId);
    const pending = dietLogs.filter(l=>l.status==='pending').length;
    const passed = dietLogs.filter(l=>l.status==='approved').length;
    const failed = dietLogs.filter(l=>l.status==='rejected').length;
    const accessed = dietLogs.filter(l=>l.status!=='pending').length;
    const assigned = dietLogs.length;
    const repeating = 0;
    return { assigned, accessed, pending, failed, passed, repeating };
  };

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

  const closeDiet = () => setConfirm({ open:true, title:'Close Diet?', message:`Are you sure you want to close ${diet.sessionName} - ${diet.diet}?`, onConfirm:()=>{ AdminStore.setDietStatus(diet.id,'closed'); setConfirm({open:false,title:''}); setVersion(v=>v+1); }});
  const openDiet = () => { AdminStore.setDietStatus(diet.id,'open'); setVersion(v=>v+1); };

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
        <div className="space-x-2 flex items-center">
          {accessors.length>0 && (<span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Started</span>)}
          {diet.status === 'open' && (
            <button onClick={closeDiet} className="px-3 py-1.5 text-sm border rounded-md border-red-300 text-red-700">Close Diet</button>
          )}
          {diet.status === 'closed' && (
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
        <div className="p-3 text-sm font-medium border-b flex items-center justify-between">
          <span>Assigned Accessors</span>
          <div className="flex items-center gap-2">
            <input value={accQ} onChange={e=>setAccQ(e.target.value)} placeholder="Search" className="px-2 py-1 border rounded text-xs" />
            <select value={accSort} onChange={e=>setAccSort(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
              <option value="name">Sort: Name</option>
              <option value="email">Sort: Email</option>
            </select>
            <button onClick={()=>{ setAddByMemberOpen(true); setMemberLookup({ id:'' }); }} className="px-2 py-1 border rounded text-xs">Add by Membership ID</button>
          </div>
        </div>
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
              {accessors
                 .filter(a => `${a.name} ${a.email}`.toLowerCase().includes(accQ.toLowerCase()))
                 .sort((a,b)=> accSort==='name'? a.name.localeCompare(b.name) : a.email.localeCompare(b.email))
                 .map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.name}</td>
                  <td className="p-2">{a.email}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={()=>{ setAccView({ open:true, name:a.name, email:a.email, metrics: computeMetricsForAccessor(a.id, diet.id) }); }} className="px-2 py-1 text-xs border rounded">View</button>
                    <button onClick={()=>{ AdminStore.unassignAccessorFromDiet(diet.id, a.id); setVersion(v=>v+1); }} className="px-2 py-1 text-xs border rounded">Unassign</button>
                  </td>
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
        <div className="p-3 text-sm font-medium border-b flex items-center justify-between">
          <span>Submissions</span>
          <div className="flex items-center gap-2">
            <input value={subQ} onChange={e=>setSubQ(e.target.value)} placeholder="Search" className="px-2 py-1 border rounded text-xs" />
            <select value={subStatus} onChange={e=>setSubStatus(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
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
              {logs
                .filter(s => [`${s.studentEmail}`, s.day, String(s.week), s.status].join(' ').toLowerCase().includes(subQ.toLowerCase()))
                .filter(s => subStatus==='all' ? true : s.status===subStatus)
                .map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.studentEmail}</td>
                  <td className="p-2">W{s.week} / {s.day}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${s.status==='submitted' ? 'bg-green-100 text-green-700' : s.status==='approved' ? 'bg-blue-100 text-blue-700' : s.status==='rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                  </td>
                  <td className="p-2 space-x-2">
                    <button onClick={()=>{ AdminStore.updateLog({ ...s, status: 'pending' as any }); }} className="px-2 py-1 text-xs border rounded">Recall Submission</button>
                    <button onClick={()=>setSupPick({open:true, studentEmail: s.studentEmail})} className="px-2 py-1 text-xs border rounded">Assign Supervisor</button>
                    <Link to={`/admin/logbook/diet-management/${diet.id}/submissions/${s.id}`} className="px-2 py-1 text-xs border rounded inline-block">View</Link>
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

      <AssignAccessorModal
        open={assignOpen}
        dietId={diet.id}
        onClose={()=>{ setAssignOpen(false); setAssignQ(''); }}
        q={assignQ}
        setQ={setAssignQ}
        onAssigned={()=>{
          if (diet.status === 'pending') {
            setInfo({ open:true, title:'Assessment Started', message:'Assessment has started for this diet.' });
          }
          setVersion(v=>v+1);
        }}
      />
      <AssignSupervisorModal open={supPick.open} studentEmail={supPick.studentEmail} q={supQ} setQ={setSupQ} onClose={()=>{ setSupPick({open:false}); setSupQ(''); }} />
      <Modal open={confirm.open} title={confirm.title} onClose={()=>setConfirm({open:false,title:''})} onConfirm={confirm.onConfirm} confirmText="Yes, Close">
        {confirm.message}
      </Modal>
      <Modal open={info.open} title={info.title} onClose={()=>setInfo({open:false,title:''})}>
        {info.message}
      </Modal>
      {addByMemberOpen && (
        <Modal open={true} title="Add Accessor by Membership ID" onClose={()=>setAddByMemberOpen(false)} onConfirm={() => {
          const members = JSON.parse(localStorage.getItem('membership_members') || '[]') as Array<any>;
          const found = members.find(m => m.membershipNo === memberLookup.id.trim());
          if (!found) { setMemberLookup(prev=>({ ...prev, error: 'Invalid membership ID' })); return; }
          // Create accessor if not exists and assign to this diet
          const all = AdminStore.listAccessors();
          let target = all.find(a => a.email === found.email);
          if (!target) {
            target = AdminStore.createAccessor({ name: found.name, email: found.email, active: true } as any);
          }
          AdminStore.assignAccessorToDiet(diet.id, target.id);
          setAddByMemberOpen(false);
          setVersion(v=>v+1);
        }} confirmText="Add">
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Membership ID</div>
              <input value={memberLookup.id} onChange={e=>setMemberLookup({ id: e.target.value, error: undefined })} placeholder="NIQS-YYYY-####" className="w-full px-3 py-2 border rounded-md text-sm" />
              {memberLookup.error && <div className="text-xs text-red-600 mt-1">{memberLookup.error}</div>}
            </div>
            <LookupPreview membershipId={memberLookup.id} />
          </div>
        </Modal>
      )}
      {accView.open && (
        <Modal open={true} title={`Accessor Metrics`} onClose={()=>setAccView({open:false})}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Info label="Name" value={accView.name} />
              <Info label="Email" value={accView.email} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Stat title="Assigned" value={accView.metrics?.assigned || 0} />
              <Stat title="Accessed" value={accView.metrics?.accessed || 0} />
              <Stat title="Pending" value={accView.metrics?.pending || 0} />
              <Stat title="Failed" value={accView.metrics?.failed || 0} />
              <Stat title="Passed" value={accView.metrics?.passed || 0} />
              <Stat title="Repeating" value={accView.metrics?.repeating || 0} />
            </div>
          </div>
        </Modal>
      )}
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

const Info = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-medium text-gray-800 truncate">{value}</div>
  </div>
);

const LookupPreview = ({ membershipId }: { membershipId: string }) => {
  const members = useMemo(() => JSON.parse(localStorage.getItem('membership_members') || '[]') as Array<any>, []);
  const found = members.find(m => m.membershipNo === membershipId.trim());
  if (!membershipId) return null;
  if (!found) return <div className="text-xs text-gray-500">No member found.</div>;
  return (
    <div className="border rounded-md p-2 text-sm">
      <div className="text-xs text-gray-500 mb-1">Lookup Result</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Info label="Name" value={found.name} />
        <Info label="Email" value={found.email} />
      </div>
    </div>
  );
};

export default AdminDietDetail;
