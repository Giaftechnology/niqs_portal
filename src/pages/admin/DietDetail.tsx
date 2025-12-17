import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import StatusPill from '../../components/StatusPill';
import { apiFetch } from '../../utils/api';
import { AdminStore } from '../../utils/adminStore';

const AdminDietDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dietData, setDietData] = useState<any | null>(null);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [info, setInfo] = useState<{open:boolean; title:string; message?:string}>({open:false, title:''});
  const [assignQ, setAssignQ] = useState('');
  const [supPick, setSupPick] = useState<{open:boolean; studentEmail?:string}>({open:false});
  const [supQ, setSupQ] = useState('');
  const [confirm, setConfirm] = useState<{open:boolean; title:string; message?:string; onConfirm?:()=>void}>({open:false,title:''});
  const [accQ, setAccQ] = useState('');
  const [accSort, setAccSort] = useState<'name'|'email'>('name');
  const [logbookQ, setLogbookQ] = useState('');
  const [logbookStatus, setLogbookStatus] = useState<'all'|'in_progress'|'submitted'|'graded'|'failed'|'repeating'>('all');
  const [version, setVersion] = useState(0);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!id) return;
      setDietLoading(true); setDietError(null);
      try {
        const res = await apiFetch<any>(`/api/logbook-diets/${id}`);
        const d = res?.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : res;
        if (!ignore) setDietData(d || null);
      } catch (e: any) {
        if (!ignore) setDietError(e?.message || 'Failed to load diet');
      } finally {
        if (!ignore) setDietLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id, version]);

  const autoAssignLogbooks = async () => {
    if (!diet?.id) return;
    const first = assessorRows[0];
    if (!first || !first.id) {
      setInfo({ open:true, title:'Auto-Assign Logbooks', message:'No assessor is assigned to this diet yet.' });
      return;
    }
    try {
      setAutoAssignLoading(true);
      const res = await apiFetch<any>('/api/assessors/auto-assign-logbooks', {
        method: 'POST',
        body: { assessor_id: first.id, diet_id: diet.id },
      });
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'Logbooks auto-assigned to assessor.';
      setInfo({ open:true, title:'Auto-Assign Logbooks', message: msg });
      setVersion(v=>v+1);
    } catch (e: any) {
      setInfo({ open:true, title:'Auto-Assign Logbooks', message: e?.message || 'Failed to auto-assign logbooks.' });
    } finally {
      setAutoAssignLoading(false);
    }
  };

  const diet = useMemo(() => dietData, [dietData, version]);

  const logbooks: any[] = useMemo(
    () => (Array.isArray((diet as any)?.logbooks) ? (diet as any).logbooks : []),
    [diet],
  );
  const applications: any[] = useMemo(
    () => (Array.isArray((diet as any)?.applications) ? (diet as any).applications : []),
    [diet],
  );
  const [assessorRows, setAssessorRows] = useState<any[]>([]);

  const applicationByUserId = useMemo(() => {
    const map: Record<string, any> = {};
    applications.forEach((a) => { if (a && a.user_id) map[String(a.user_id)] = a; });
    return map;
  }, [applications]);

  const assessorNameById = useMemo(() => {
    const map: Record<string, string> = {};
    assessorRows.forEach((a) => {
      const fullName = `${a.member?.title || ''} ${a.member?.surname || ''} ${a.member?.firstname || ''}`.trim();
      if (!fullName) return;
      if (a.id) map[String(a.id)] = fullName;
      if (a.member?.id) map[String(a.member.id)] = fullName;
    });
    return map;
  }, [assessorRows]);

  const [supervisorNameById, setSupervisorNameById] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const totalLogbooks = logbooks.length;
    const totalApplications = applications.length;
    const passed = logbooks.filter((l) => String(l.status).toLowerCase() === 'graded' || String(l.status).toLowerCase() === 'passed').length;
    const failed = logbooks.filter((l) => String(l.status).toLowerCase() === 'failed' || String(l.status).toLowerCase() === 'rejected').length;
    const repeating = logbooks.filter((l) => String(l.status).toLowerCase() === 'repeating').length;
    return { totalLogbooks, totalApplications, passed, failed, repeating };
  }, [logbooks, applications]);

  useEffect(() => {
    const raw = Array.isArray((diet as any)?.assessors) ? (diet as any).assessors : [];
    if (!raw.length) {
      setAssessorRows([]);
      return;
    }
    let ignore = false;
    const loadAssessors = async () => {
      try {
        const ids = Array.from(
          new Set(
            raw
              .map((a: any) => (a && (a.assessor_id || a.id) ? String(a.assessor_id || a.id) : ''))
              .filter(Boolean),
          ),
        ) as string[];
        const fetched = await Promise.all(
          ids.map(async (assessorId) => {
            try {
              const res = await apiFetch<any>(`/api/assessors/${encodeURIComponent(String(assessorId))}`);
              return res?.data || res || null;
            } catch {
              return null;
            }
          }),
        );
        const byId: Record<string, any> = {};
        fetched.forEach((r) => {
          if (r && r.id) byId[String(r.id)] = r;
        });
        const merged = raw.map((a: any) => {
          const key = String(a.assessor_id || a.id || '');
          const full = key ? byId[key] : undefined;
          return full ? { ...full } : a;
        });
        if (!ignore) setAssessorRows(merged);
      } catch {
        if (!ignore) setAssessorRows(raw);
      }
    };
    void loadAssessors();
    return () => {
      ignore = true;
    };
  }, [diet]);

  useEffect(() => {
    const ids = Array.from(
      new Set(
        logbooks
          .map((lb: any) => (lb && lb.supervisor_id ? String(lb.supervisor_id) : ''))
          .filter(Boolean),
      ),
    ) as string[];
    if (!ids.length) {
      setSupervisorNameById({});
      return;
    }
    let ignore = false;
    const loadSupervisors = async () => {
      try {
        const fetched = await Promise.all(
          ids.map(async (memberId) => {
            try {
              const res = await apiFetch<any>(`/api/members/${encodeURIComponent(String(memberId))}`);
              const data = res?.data || res || null;
              return { id: memberId, data };
            } catch {
              return { id: memberId, data: null };
            }
          }),
        );
        if (ignore) return;
        const map: Record<string, string> = {};
        fetched.forEach((item) => {
          const d = item.data;
          if (!d) return;
          const fullName = `${d.title || ''} ${d.surname || ''} ${d.firstname || ''}`.trim();
          if (fullName) map[item.id] = fullName;
        });
        setSupervisorNameById(map);
      } catch {
        if (!ignore) setSupervisorNameById({});
      }
    };
    void loadSupervisors();
    return () => {
      ignore = true;
    };
  }, [logbooks]);

  if (dietLoading) return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
        <span>Diet Details</span>
      </div>
      <div className="text-sm text-gray-600">Loading diet…</div>
    </div>
  );

  if (!diet) return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
        <span>Diet Details</span>
      </div>
      <div className="text-sm text-red-600">Diet not found{dietError ? `: ${dietError}` : '.'}</div>
    </div>
  );

  const isActive = Boolean((diet as any)?.is_active) || String((diet as any)?.status || '').toLowerCase() === 'active';

  const closeDiet = () => {
    setConfirm({
      open: true,
      title: 'Close Diet?',
      message: `This will run the close operation for active diets. Continue?`,
      onConfirm: async () => {
        try {
          const res = await apiFetch<any>('/api/logbook-diets/active-close/run', { method: 'GET' });
          const msg =
            (typeof res?.message === 'string' && res.message) ||
            (typeof res?.data?.message === 'string' && res.data.message) ||
            'Diet closed.';
          setInfo({ open: true, title: 'Diet Closed', message: msg });
          setVersion((v) => v + 1);
        } catch (e: any) {
          setInfo({ open: true, title: 'Error', message: e?.message || 'Failed to close diet.' });
        } finally {
          setConfirm({ open: false, title: '' });
        }
      },
    });
  };

  const openDiet = async () => {
    if (!id) return;
    try {
      await apiFetch(`/api/logbook-diets/${encodeURIComponent(String(id))}/reopen`, { method: 'POST' });
      setVersion((v) => v + 1);
    } catch (e: any) {
      setInfo({ open: true, title: 'Error', message: e?.message || 'Failed to reopen diet.' });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
          <div>
            <div className="text-2xl font-semibold">{diet.title}</div>
            <div className="text-sm text-gray-500">{diet.start_date} – {diet.end_date}</div>
          </div>
        </div>
        <div className="space-x-2 flex items-center">
          {isActive ? (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Active</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">Inactive</span>
          )}
          {isActive && (
            <button onClick={closeDiet} className="px-3 py-1.5 text-sm border rounded-md border-red-300 text-red-700">Close Diet</button>
          )}
          {!isActive && (
            <button onClick={openDiet} className="px-3 py-1.5 text-sm border rounded-md border-green-300 text-green-700">Reopen Diet</button>
          )}
          <button onClick={()=>setAssignOpen(true)} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md">Start Assessment / Assign Accessor</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <Stat title="Accessors" value={assessorRows.length} />
        <Stat title="Logbooks" value={stats.totalLogbooks} />
        <Stat title="Applications" value={stats.totalApplications} />
        <Stat title="Passed" value={stats.passed} />
        <Stat title="Failed" value={stats.failed} />
        <Stat title="Repeating" value={stats.repeating} />
      </div>

      <section className="border rounded-xl bg-white">
        <div className="p-3 text-sm font-medium border-b flex items-center justify-between">
          <span>Assessors for this Diet</span>
          <div className="flex items-center gap-2">
            <input value={accQ} onChange={e=>setAccQ(e.target.value)} placeholder="Search" className="px-2 py-1 border rounded text-xs" />
            <select value={accSort} onChange={e=>setAccSort(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
              <option value="name">Sort: Name</option>
              <option value="email">Sort: Email</option>
            </select>
            <button
              onClick={autoAssignLogbooks}
              className="px-2 py-1 border rounded text-xs disabled:opacity-60 flex items-center gap-1"
              disabled={autoAssignLoading}
            >
              {autoAssignLoading && (
                <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{autoAssignLoading ? 'Assigning…' : 'Auto-Assign Logbooks'}</span>
            </button>
          </div>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Membership No</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Max Workload</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {assessorRows
                .filter((a) => `${a.member?.membership_no || ''} ${a.member?.surname || ''} ${a.member?.firstname || ''} ${a.member?.email || ''}`.toLowerCase().includes(accQ.toLowerCase()))
                .sort((a, b) => {
                  const aName = `${a.member?.surname || ''} ${a.member?.firstname || ''}`.trim();
                  const bName = `${b.member?.surname || ''} ${b.member?.firstname || ''}`.trim();
                  return accSort === 'name' ? aName.localeCompare(bName) : String(a.member?.email || '').localeCompare(String(b.member?.email || ''));
                })
                .map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{a.member?.membership_no || '-'}</td>
                    <td className="p-2">{`${a.member?.title || ''} ${a.member?.surname || ''} ${a.member?.firstname || ''}`.trim() || '-'}</td>
                    <td className="p-2">{a.member?.email || '-'}</td>
                    <td className="p-2">{a.max_workload ?? '-'}</td>
                    <td className="p-2">
                      <button
                        className="px-2 py-1 text-xs border rounded"
                        onClick={() => navigate(`/admin/logbook/assessors/${encodeURIComponent(String(a.id))}/logbooks`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              {assessorRows.length === 0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={5}>No assessors assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border rounded-xl bg-white">
        <div className="p-3 text-sm font-medium border-b flex items-center justify-between">
          <span>Logbooks</span>
          <div className="flex items-center gap-2">
            <input value={logbookQ} onChange={e=>setLogbookQ(e.target.value)} placeholder="Search" className="px-2 py-1 border rounded text-xs" />
            <select value={logbookStatus} onChange={e=>setLogbookStatus(e.target.value as any)} className="px-2 py-1 border rounded text-xs">
              <option value="all">All</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="failed">Failed</option>
              <option value="repeating">Repeating</option>
            </select>
          </div>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Student</th>
                <th className="p-2">Stage</th>
                <th className="p-2">Status</th>
                <th className="p-2">Supervisor</th>
                <th className="p-2">Assessor</th>
              </tr>
            </thead>
            <tbody>
              {logbooks
                .filter(lb => {
                  const app = applicationByUserId[String(lb.user_id)] || {};
                  const label = `${app.surname || ''} ${app.other_names || ''} ${app.email || ''} ${lb.status || ''}`.toLowerCase();
                  return label.includes(logbookQ.toLowerCase());
                })
                .filter(lb => logbookStatus === 'all' ? true : String(lb.status).toLowerCase() === logbookStatus)
                .map((lb) => {
                  const app = applicationByUserId[String(lb.user_id)] || {};
                  const studentName = `${app.title || ''} ${app.surname || ''} ${app.other_names || ''}`.trim() || app.email || lb.user_id;
                  return (
                    <tr key={lb.id} className="border-t">
                      <td className="p-2">
                        <div className="text-sm text-gray-800">{studentName}</div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                      </td>
                      <td className="p-2">Stage {lb.stage ?? '-'}</td>
                      <td className="p-2">
                        <StatusPill status={String(lb.status || 'in_progress') as any} />
                      </td>
                      <td className="p-2">{lb.supervisor_id ? (supervisorNameById[String(lb.supervisor_id)] || '-') : '-'}</td>
                      <td className="p-2">{lb.assessor_id ? (assessorNameById[String(lb.assessor_id)] || '-') : '-'}</td>
                    </tr>
                  );
                })}
              {logbooks.length === 0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={5}>No logbooks yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border rounded-xl bg-white">
        <div className="p-3 text-sm font-medium border-b flex items-center justify-between">
          <span>Applications in this Diet</span>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Applicant</th>
                <th className="p-2">Email</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{`${a.title || ''} ${a.surname || ''} ${a.other_names || ''}`.trim()}</td>
                  <td className="p-2">{a.email}</td>
                  <td className="p-2">
                    <StatusPill status={String(a.status || 'pending') as any} />
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={3}>No applications for this diet.</td></tr>
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
        onAssigned={(msg)=>{
          setInfo({ open:true, title:'Accessor Assigned', message: msg || 'Accessor assigned to this diet.' });
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
    </div>
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
  const [pendingAccessor, setPendingAccessor] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const commitAssign = async (assessorId: string) => {
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
      setConfirmOpen(false);
      setPendingAccessor(null);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to assign assessor');
    } finally {
      setAssigningId(null);
    }
  };

  const requestAssign = (accessor: any) => {
    setPendingAccessor(accessor);
    setConfirmOpen(true);
  };

  return (
    <>
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
                          onClick={()=>requestAssign(a)}
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

      <Modal
        open={confirmOpen && !!pendingAccessor}
        title="Confirm Accessor Assignment"
        onClose={()=>{ setConfirmOpen(false); setPendingAccessor(null); }}
        onConfirm={()=> pendingAccessor && commitAssign(pendingAccessor.assessor_id || pendingAccessor.id)}
        confirmText="Proceed"
      >
        {pendingAccessor && (
          <div className="text-sm space-y-2">
            <p>Assign accessor:</p>
            <div className="border rounded-md p-2 text-xs space-y-1">
              <div><span className="font-semibold">Membership:</span> {pendingAccessor.member?.membership_no || '-'}</div>
              <div><span className="font-semibold">Name:</span> {`${pendingAccessor.member?.title || ''} ${pendingAccessor.member?.surname || ''} ${pendingAccessor.member?.firstname || ''}`.trim() || '-'}</div>
              <div><span className="font-semibold">Email:</span> {pendingAccessor.member?.email || '-'}</div>
            </div>
            <p>This accessor will be assigned to the current diet.</p>
          </div>
        )}
      </Modal>
    </>
  );
};

const AssignSupervisorModal = ({ open, studentEmail, q, setQ, onClose }: { open: boolean; studentEmail?: string; q: string; setQ: (v:string)=>void; onClose: ()=>void }) => {
  const [pendingSup, setPendingSup] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!open || !studentEmail) return null;
  const suUsers = AdminStore.listSupervisorUsers();
  const filtered = suUsers.filter(s=> `${s.name} ${s.email}`.toLowerCase().includes(q.toLowerCase()));

  const commitAssign = (supId: string) => {
    const list = AdminStore.listSupervisors();
    const existing = list.find(p=>p.id===supId) || { id: supId, students: [] };
    const set = new Set(existing.students);
    set.add(studentEmail);
    AdminStore.upsertSupervisor({ id: supId, students: Array.from(set) });
    setConfirmOpen(false);
    setPendingSup(null);
    onClose();
  };

  const requestAssign = (sup: any) => {
    setPendingSup(sup);
    setConfirmOpen(true);
  };

  return (
    <>
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
                    <td className="p-2">
                      <button onClick={()=>requestAssign(s)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">
                        Assign
                      </button>
                    </td>
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

      <Modal
        open={confirmOpen && !!pendingSup}
        title="Confirm Supervisor Assignment"
        onClose={()=>{ setConfirmOpen(false); setPendingSup(null); }}
        onConfirm={()=> pendingSup && commitAssign(pendingSup.id)}
        confirmText="Confirm"
      >
        {pendingSup && (
          <div className="text-sm space-y-2">
            <p>Assign <span className="font-semibold">{pendingSup.name}</span> ({pendingSup.email})</p>
            <p>as supervisor for <span className="font-semibold">{studentEmail}</span>?</p>
          </div>
        )}
      </Modal>
    </>
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
