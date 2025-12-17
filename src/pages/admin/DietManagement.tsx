import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { apiFetch } from '../../utils/api';
import { AdminStore } from '../../utils/adminStore';

const AdminDietManagement: React.FC = () => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const [items, setItems] = useState<Array<{ id: string; title: string; start_date: string; end_date: string; notes?: string; status?: string; is_active?: boolean | number; approved_by?: string | null; approved_at?: string | null; created_at?: string; updated_at?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'title'|'start'>('start');
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message?:string;onConfirm?:()=>void}>({open:false,title:''});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [rowAction, setRowAction] = useState<Record<string, 'view'|'approve'|'reject'|'activate'|'delete'>>({});
  // keep placeholders used below to preserve layout and comments
  const [input, setInput] = useState<InputState>({ open:false, title:'' });
  const [details, setDetails] = useState<{open:boolean; title:string; body?:React.ReactNode}>({open:false, title:''});
  const [assign, setAssign] = useState<{open:boolean; dietId?:string}>({open:false});
  const [assignQ, setAssignQ] = useState('');
  const [supPick, setSupPick] = useState<{open:boolean; studentEmail?:string}>({open:false});
  const [supQ, setSupQ] = useState('');

  // Create Diet modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ title: string; start_date: string; end_date: string; notes: string }>({ title: '', start_date: '', end_date: '', notes: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Extend Diet modal state
  const [extendState, setExtendState] = useState<{ open: boolean; id?: string; new_end_date: string }>({ open: false, id: undefined, new_end_date: '' });
  const [extSubmitting, setExtSubmitting] = useState(false);
  const [extError, setExtError] = useState<string | null>(null);

  const years = useMemo(() => { const now = new Date().getFullYear(); return Array.from({length: 60}, (_,i)=>String(now-i)); }, []);
  const filtered = useMemo(() => {
    const list = [...items].filter(i => `${i.title} ${i.start_date} ${i.end_date} ${i.status}`.toLowerCase().includes(q.toLowerCase()));
    if (sort==='title') list.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
    if (sort==='start') list.sort((a,b)=> (a.start_date||'').localeCompare(b.start_date||''));
    return list;
  }, [items, q, sort]);

  const fetchList = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/logbook-diets');
      const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      const normalized = raw.map((x: any) => ({
        id: String(x.id),
        title: x.title,
        start_date: x.start_date,
        end_date: x.end_date,
        notes: x.notes,
        status: x.status,
        is_active: typeof x.is_active === 'boolean' ? x.is_active : (x.is_active ? true : false),
        approved_by: x.approved_by ?? null,
        approved_at: x.approved_at ?? null,
        created_at: x.created_at,
        updated_at: x.updated_at,
      }));
      setItems(normalized);
    } catch (e: any) {
      setError(e.message || 'Failed to load diets');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const openCreate = () => { setCreateForm({ title: '', start_date: '', end_date: '', notes: '' }); setFormError(null); setCreateOpen(true); };
  const submitCreate = async () => {
    if (!createForm.title.trim() || !createForm.start_date || !createForm.end_date) { setFormError('Title, start and end date are required'); return; }
    setCreating(true); setFormError(null);
    try {
      const res = await apiFetch<any>('/api/logbook-diets', { method: 'POST', body: { ...createForm } });
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'Diet created.';
      setCreateOpen(false);
      await fetchList();
      try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: msg } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
      setSuccessMsg(msg);
    } catch (e: any) { setFormError(e?.message || 'Request failed'); }
    finally { setCreating(false); }
  };

  const approveDiet = async (id: string) => {
    setRowBusy(m=>({ ...m, [id]: true })); setRowAction(m=>({ ...m, [id]: 'approve' }));
    try { await apiFetch(`/api/logbook-diets/${id}/approve`, { method: 'POST' }); await fetchList(); try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Diet approved.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {} }
    catch (e: any) { alert(e?.message || 'Approve failed'); }
    finally { setRowBusy(m=>({ ...m, [id]: false })); setRowAction(m=>{ const n={...m}; delete n[id]; return n; }); }
  };
  const rejectDiet = async (id: string) => {
    setRowBusy(m=>({ ...m, [id]: true })); setRowAction(m=>({ ...m, [id]: 'reject' }));
    try { await apiFetch(`/api/logbook-diets/${id}/reject`, { method: 'POST' }); await fetchList(); try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Diet rejected.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {} }
    catch (e: any) { alert(e?.message || 'Reject failed'); }
    finally { setRowBusy(m=>({ ...m, [id]: false })); setRowAction(m=>{ const n={...m}; delete n[id]; return n; }); }
  };
  const activateDiet = async (id: string) => {
    setRowBusy(m=>({ ...m, [id]: true })); setRowAction(m=>({ ...m, [id]: 'activate' }));
    try { await apiFetch(`/api/logbook-diets/${id}/activate`, { method: 'POST' }); await fetchList(); try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Diet activated.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {} }
    catch (e: any) { alert(e?.message || 'Activate failed'); }
    finally { setRowBusy(m=>({ ...m, [id]: false })); setRowAction(m=>{ const n={...m}; delete n[id]; return n; }); }
  };
  const openExtend = (id: string) => { setExtendState({ open: true, id, new_end_date: '' }); setExtError(null); };
  const submitExtend = async () => {
    if (!extendState.id || !extendState.new_end_date) { setExtError('New end date is required'); return; }
    setExtSubmitting(true); setExtError(null);
    try { await apiFetch(`/api/logbook-diets/${extendState.id}/extend`, { method: 'POST', body: { new_end_date: extendState.new_end_date } }); setExtendState({ open: false, id: undefined, new_end_date: '' }); await fetchList(); try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'End date extended.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {} } catch (e: any) { setExtError(e?.message || 'Extend failed'); }
    finally { setExtSubmitting(false); }
  };
  const deleteDiet = (id: string) => {
    const curr = items.find(x=>x.id===id); if(!curr) return;
    setConfirm({ open:true, title:'Delete Diet?', message:`Delete ${curr.title}?`, onConfirm: async ()=>{
      setRowBusy(m=>({ ...m, [id]: true })); setRowAction(m=>({ ...m, [id]: 'delete' }));
      try { await apiFetch(`/api/logbook-diets/${id}`, { method: 'DELETE' }); await fetchList(); } catch (e: any) { alert(e?.message || 'Delete failed'); }
      finally { setRowBusy(m=>({ ...m, [id]: false })); setRowAction(m=>{ const n={...m}; delete n[id]; return n; }); }
      setConfirm({open:false,title:''});
    } });
  };
  const closeActiveDiets = async () => {
    try { await apiFetch('/api/logbook-diets/active-close/run', { method: 'GET' }); await fetchList(); try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Active diets closed.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {} } catch (e: any) { alert(e?.message || 'Close active diets failed'); }
  };

  const openDetails = (id:string) => {
    navigate(`/admin/logbook/diet-management/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <span aria-hidden>🍽️</span>
        <span>Diet Management</span>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Diets" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <div className="space-x-2">
          <button onClick={()=>setSort('title')} className="px-3 py-2 border rounded-md text-sm">🔤 Sort</button>
          <button onClick={()=>setSort('start')} className="px-3 py-2 border rounded-md text-sm">📅 Sort</button>
          <button onClick={closeActiveDiets} className="px-3 py-2 border rounded-md text-sm">Close Active Diets</button>
          <button onClick={openCreate} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Create Diet</button>
        </div>
      </div>
      {successMsg && (
        <div className="p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{successMsg}</div>
      )}
      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}
      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">End Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const isActive = (v.is_active === true) || (v.is_active as any) === 1 || String(v.status).toLowerCase() === 'active';
              const isPending = String(v.status).toLowerCase() === 'pending';
              const isApproved = String(v.status).toLowerCase() === 'approved';
              return (
                <tr key={v.id} className="border-t">
                  <td className="p-3">{v.title}</td>
                  <td className="p-3">{v.start_date}</td>
                  <td className="p-3">{v.end_date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${isActive ? 'bg-green-100 text-green-700' : isPending ? 'bg-amber-100 text-amber-700' : isApproved ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{v.status || '-'}</span>
                  </td>
                  <td className="p-3">{isActive ? 'Yes' : 'No'}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button onClick={()=>{ setRowBusy(m=>({ ...m, [v.id]: true })); setRowAction(m=>({ ...m, [v.id]: 'view' })); openDetails(v.id); }} className="px-2 py-1 text-xs border rounded" disabled={rowBusy[v.id]}>{rowBusy[v.id] && rowAction[v.id]==='view' ? 'Opening…' : 'View'}</button>
                      {isPending && (
                        <>
                          <button onClick={()=>approveDiet(v.id)} className="px-2 py-1 text-xs rounded bg-green-600 text-white" disabled={rowBusy[v.id]}>{rowBusy[v.id] && rowAction[v.id]==='approve' ? 'Approving…' : 'Approve'}</button>
                          <button onClick={()=>rejectDiet(v.id)} className="px-2 py-1 text-xs rounded bg-amber-500 text-white" disabled={rowBusy[v.id]}>{rowBusy[v.id] && rowAction[v.id]==='reject' ? 'Rejecting…' : 'Reject'}</button>
                          <button onClick={()=>deleteDiet(v.id)} className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200" disabled={rowBusy[v.id]}>{rowBusy[v.id] && rowAction[v.id]==='delete' ? 'Deleting…' : 'Delete'}</button>
                        </>
                      )}
                      {isApproved && (
                        <button onClick={()=>activateDiet(v.id)} className="px-2 py-1 text-xs rounded bg-indigo-600 text-white" disabled={rowBusy[v.id]}>{rowBusy[v.id] && rowAction[v.id]==='activate' ? 'Activating…' : 'Activate'}</button>
                      )}
                      {isActive && (
                        <button onClick={()=>openExtend(v.id)} className="px-2 py-1 text-xs rounded border">Extend</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal open={confirm.open} title={confirm.title} onClose={()=>setConfirm({open:false,title:''})} onConfirm={confirm.onConfirm} confirmText="Delete">{confirm.message}</Modal>
      {input.open && (<DietInputModal title={input.title} initial={input.initial} years={years} onClose={()=>setInput({open:false,title:''})} onSave={input.onSave} />)}
      <Modal
        open={createOpen}
        title="Create Diet"
        onClose={()=>{ setCreateOpen(false); setFormError(null); }}
        onConfirm={()=>{ if (!creating) void submitCreate(); }}
        confirmText={creating ? 'Creating…' : 'Create'}
        closeText={creating ? 'Close' : 'Cancel'}
        panelClassName="max-w-3xl w-[90vw]"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Title</div>
            <input value={createForm.title} onChange={e=>setCreateForm({...createForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" disabled={creating} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Start Date</div>
            <input type="date" value={createForm.start_date} onChange={e=>setCreateForm({...createForm, start_date: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" disabled={creating} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">End Date</div>
            <input type="date" value={createForm.end_date} onChange={e=>setCreateForm({...createForm, end_date: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" disabled={creating} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Notes</div>
            <textarea value={createForm.notes} onChange={e=>setCreateForm({...createForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" disabled={creating} />
          </div>
          {formError && <div className="text-sm text-red-600">{formError}</div>}
        </div>
      </Modal>

      <Modal
        open={extendState.open}
        title="Extend Diet End Date"
        onClose={()=>{ setExtendState({ open:false, id: undefined, new_end_date: '' }); setExtError(null); }}
        onConfirm={()=>{ if (!extSubmitting) void submitExtend(); }}
        confirmText={extSubmitting ? 'Extending…' : 'Extend'}
        closeText={extSubmitting ? 'Close' : 'Cancel'}
        panelClassName="max-w-md"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">New End Date</div>
            <input type="date" value={extendState.new_end_date} onChange={e=>setExtendState(s=>({...s, new_end_date: e.target.value}))} className="w-full px-3 py-2 border rounded-md text-sm" disabled={extSubmitting} />
          </div>
          {extError && <div className="text-sm text-red-600">{extError}</div>}
        </div>
      </Modal>
      {/* details now shown on dedicated page */}
      <AssignAccessorModal
        open={assign.open}
        dietId={assign.dietId}
        onClose={()=>{ setAssign({open:false}); setAssignQ(''); }}
        q={assignQ}
        setQ={setAssignQ}
        onAssigned={(msg)=>{
          fetchList();
          setSuccessMsg(msg || 'Accessor assignment updated.');
        }}
      />
      <AssignSupervisorModal open={supPick.open} studentEmail={supPick.studentEmail} q={supQ} setQ={setSupQ} onClose={()=>{ setSupPick({open:false}); setSupQ(''); }} />
    </div>
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

export default AdminDietManagement;

type DietForm = { sessionName: string; diet: string; year: number; startDate: string };
type InputState = { open: boolean; title: string; initial?: { id:string; sessionName:string; diet:string; year:number; startDate:string }; onSave?: (v: DietForm)=>void };

const DietInputModal = ({ title, initial, years, onSave, onClose }: { title: string; initial?: any; years: string[]; onSave?: (v: DietForm)=>void; onClose: ()=>void }) => {
  const [form, setForm] = useState<DietForm>({ sessionName: initial?.sessionName||'', diet: initial?.diet||'', year: initial?.year||new Date().getFullYear(), startDate: initial?.startDate||new Date().toISOString().slice(0,10) });
  return (
    <Modal open={true} title={title} onClose={onClose} onConfirm={()=>onSave && onSave(form)} confirmText="Save">
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Session Name</div>
          <input autoFocus value={form.sessionName} onChange={e=>setForm({...form,sessionName:e.target.value})} placeholder="Session Name" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Diet</div>
          <input value={form.diet} onChange={e=>setForm({...form,diet:e.target.value})} placeholder="Diet" className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Year</div>
          <select value={String(form.year)} onChange={e=>setForm({...form,year:Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md text-sm">
            {years.map(y=> (<option key={y}>{y}</option>))}
          </select>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Start Date</div>
          <input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
      </div>
    </Modal>
  );
};

const Stat = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3">
    <div className="text-[11px] text-gray-500">{title}</div>
    <div className="text-lg font-semibold text-gray-800">{value}</div>
  </div>
);

const AssignAccessorModal = ({ open, dietId, q, setQ, onClose, onAssigned }: { open: boolean; dietId?: string; q: string; setQ: (v:string)=>void; onClose: ()=>void; onAssigned: (msg?: string)=>void }) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!open || !dietId) return;
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>('/api/assessors');
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setList(arr);
      } catch (e: any) {
        setError(e?.message || 'Failed to load assessors');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [open, dietId]);

  if (!open || !dietId) return null;

  const filtered = list.filter((a) => {
    const name = `${a.member?.surname || ''} ${a.member?.firstname || ''}`;
    const email = a.member?.email || '';
    const membership = a.member?.membership_no || '';
    return `${name} ${email} ${membership}`.toLowerCase().includes(q.toLowerCase());
  });

  const assign = async (assessorId: string) => {
    if (!dietId) return;
    setAssigningId(assessorId);
    try {
      const res = await apiFetch<any>('/api/assessors/assign-to-diet', {
        method: 'POST',
        body: { assessor_id: assessorId, diet_id: dietId },
      });
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'Accessor assignment updated.';
      setError(null);
      onAssigned(msg);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to assign assessor');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <Modal open={true} title="Assign Accessor" onClose={onClose} panelClassName="max-w-2xl w-[90vw] max-h-[80vh]" bodyClassName="overflow-y-auto max-h-[60vh] pr-1">
      <div className="space-y-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search assessors" className="w-full px-3 py-2 border rounded-md text-sm" />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="max-h-60 overflow-auto border rounded-md">
          {loading ? (
            <div className="p-3 text-xs text-gray-500">Loading assessors…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Membership No</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const accessorId = a.assessor_id || a.id;
                  return (
                  <tr key={accessorId} className="border-t">
                    <td className="p-2">{a.member?.membership_no || '-'}</td>
                    <td className="p-2">{`${a.member?.title || ''} ${a.member?.surname || ''} ${a.member?.firstname || ''}`.trim() || '-'}</td>
                    <td className="p-2">{a.member?.email || '-'}</td>
                    <td className="p-2">
                      <button
                        onClick={()=>void assign(accessorId)}
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded disabled:opacity-60"
                        disabled={Boolean(assigningId)}
                      >
                        {assigningId === accessorId ? 'Assigning…' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                );})}
                {filtered.length === 0 && !loading && (
                  <tr><td className="p-2 text-xs text-gray-500" colSpan={4}>No assessors match your search.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
};
