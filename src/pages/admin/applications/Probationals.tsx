import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface ProbationerApp {
  id: string;
  user_id?: number;
  surname?: string;
  other_names?: string;
  title?: string;
  postal_address?: string;
  residential_address?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  membership_grade?: string | null;
  membership_no?: string | null;
  passport_photo?: string | null;
  completion_step?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string } | null;
  o_level_results?: Array<any>;
  qualifications?: Array<any>;
  referees?: Array<any>;
  seminars?: Array<any>;
}

const ApplicationsProbationals: React.FC = () => {
  const [items, setItems] = useState<ProbationerApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all'|'pending'|'acknowledged'|'approved'|'rejected'>('all');
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [rowAction, setRowAction] = useState<Record<string, 'view'|'approve'|'reject'>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = items;
    if (filter !== 'all') list = list.filter(x => String(x.status || '').toLowerCase() === filter);
    if (!s) return list;
    return list.filter(x => [x.surname, x.other_names, x.email, x.user?.name, x.user?.email].filter(Boolean).some(v => String(v).toLowerCase().includes(s)));
  }, [items, q, filter]);

  const parseList = (res: any): ProbationerApp[] => {
    const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
    return raw.map((x: any) => ({
      id: String(x.id),
      user_id: x.user_id,
      surname: x.surname,
      other_names: x.other_names,
      title: x.title,
      postal_address: x.postal_address,
      residential_address: x.residential_address,
      email: x.email,
      phone: x.phone,
      date_of_birth: x.date_of_birth,
      nationality: x.nationality,
      membership_grade: x.membership_grade,
      membership_no: x.membership_no,
      passport_photo: x.passport_photo,
      completion_step: x.completion_step,
      status: x.status,
      created_at: x.created_at,
      updated_at: x.updated_at,
      user: x.user || null,
      o_level_results: Array.isArray(x.o_level_results) ? x.o_level_results : [],
      qualifications: Array.isArray(x.qualifications) ? x.qualifications : [],
      referees: Array.isArray(x.referees) ? x.referees : [],
      seminars: Array.isArray(x.seminars) ? x.seminars : [],
    }));
  };

  const fetchList = async () => {
    setLoading(true); setError(null);
    try {
      let url = '/api/probationer/applications';
      if (filter === 'pending') url = '/api/probationer/applications/pending';
      if (filter === 'acknowledged') url = '/api/probationer/applications/acknowledged';
      if (filter === 'approved') url = '/api/probationer/applications/approved';
      if (filter === 'rejected') url = '/api/probationer/applications/rejected';
      const res = await apiFetch<any>(url);
      setItems(parseList(res));
    } catch (e: any) { setError(e?.message || 'Failed to load applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, [filter]);

  const approve = async (id: string) => {
    setRowBusy(m=>({ ...m, [id]: true })); setRowAction(m=>({ ...m, [id]: 'approve' }));
    try {
      await apiFetch(`/api/probationer/${id}/approve`, { method: 'POST' });
      await fetchList();
      try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Application approved.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
    } catch (e: any) { alert(e?.message || 'Approve failed'); }
    finally { setRowBusy(m=>({ ...m, [id]: false })); setRowAction(m=>{ const n={...m}; delete n[id]; return n; }); }
  };

  const reject = async (id: string) => {
    setRowBusy(m=>({ ...m, [id]: true })); setRowAction(m=>({ ...m, [id]: 'reject' }));
    try {
      await apiFetch(`/api/probationer/${id}/reject`, { method: 'POST' });
      await fetchList();
      try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Application rejected.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
    } catch (e: any) { alert(e?.message || 'Reject failed'); }
    finally { setRowBusy(m=>({ ...m, [id]: false })); setRowAction(m=>{ const n={...m}; delete n[id]; return n; }); }
  };

  const toggleExpand = (id: string) => setExpanded(m => ({ ...m, [id]: !m[id] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Probationer Applications</div>
        <div className="flex items-center gap-2">
          <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="px-3 py-2 border rounded-md text-sm w-64" />
          <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="px-3 py-2 border rounded-md text-sm">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={fetchList} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
          <Link to="/admin/applications/probationals/new" className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">New Application</Link>
        </div>
      </div>
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Applicant</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Step</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td className="p-3" colSpan={6}>Loading…</td></tr>)}
            {!loading && filtered.map(a => {
              const full = [a.title, a.surname, a.other_names].filter(Boolean).join(' ');
              const sStatus = String(a.status||'').toLowerCase();
              const canModerate = sStatus==='acknowledged';
              const rawStep = typeof a.completion_step === 'number' ? a.completion_step : 0;
              const safeStep = Math.max(0, Math.min(8, rawStep));
              const nextStep = Math.max(1, Math.min(8, safeStep + 1));
              const canContinue = (sStatus==='pending' || sStatus==='');
              return (
                <React.Fragment key={a.id}>
                  <tr className="border-t align-top">
                    <td className="p-3">{full || a.user?.name || '-'}</td>
                    <td className="p-3">{a.email || a.user?.email || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${String(a.status||'').toLowerCase()==='approved' ? 'bg-green-100 text-green-700' : String(a.status||'').toLowerCase()==='acknowledged' ? 'bg-blue-100 text-blue-700' : String(a.status||'').toLowerCase()==='pending' ? 'bg-amber-100 text-amber-700' : String(a.status||'').toLowerCase()==='rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{a.status || '-'}</span>
                    </td>
                    <td className="p-3">{a.completion_step ?? '-'}</td>
                    <td className="p-3">{a.created_at ? new Date(a.created_at).toLocaleString() : '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button onClick={()=>navigate(`/admin/applications/probationals/${a.id}`)} className="px-2 py-1 text-xs border rounded">View</button>
                        {canContinue && (
                          <Link to={`/admin/applications/probationals/new?id=${a.id}${typeof a.completion_step==='number' ? `&goto=${nextStep}` : ''}`} className="px-2 py-1 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Continue{typeof a.completion_step==='number' ? ` (Step ${nextStep})` : ''}</Link>
                        )}
                        {canModerate && (
                          <>
                            <button onClick={()=>approve(a.id)} disabled={rowBusy[a.id]} className="px-2 py-1 text-xs rounded bg-green-600 text-white">{rowBusy[a.id] && rowAction[a.id]==='approve' ? 'Approving…' : 'Approve'}</button>
                            <button onClick={()=>reject(a.id)} disabled={rowBusy[a.id]} className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200">{rowBusy[a.id] && rowAction[a.id]==='reject' ? 'Rejecting…' : 'Reject'}</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded[a.id] && (
                    <tr className="bg-gray-50">
                      <td className="p-3" colSpan={6}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <div className="text-gray-500">User</div>
                            <div className="font-medium">{a.user?.name || '-'}</div>
                            <div className="">{a.user?.email || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">O-Level Results</div>
                            <div className="space-y-1">
                              {a.o_level_results && a.o_level_results.length>0 ? a.o_level_results.map((r:any)=> (
                                <div key={r.id} className="border rounded p-2">{r.exam_type?.toUpperCase()} • {r.exam_year} • {r.exam_number}</div>
                              )) : <div>-</div>}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Qualifications</div>
                            <div className="space-y-1">
                              {a.qualifications && a.qualifications.length>0 ? a.qualifications.map((q:any)=> (
                                <div key={q.id} className="border rounded p-2">{q.qualification} • {q.institution} • {q.year}</div>
                              )) : <div>-</div>}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Referees</div>
                            <div className="space-y-1">
                              {a.referees && a.referees.length>0 ? a.referees.map((r:any)=> (
                                <div key={r.id} className="border rounded p-2">User #{r.user_id} • {r.relationship}</div>
                              )) : <div>-</div>}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Seminars</div>
                            <div className="space-y-1">
                              {a.seminars && a.seminars.length>0 ? a.seminars.map((s:any)=> (
                                <div key={s.id} className="border rounded p-2">{s.title} • {s.date} • {s.location}</div>
                              )) : <div>-</div>}
                            </div>
                          </div>
                        </div>
                        {canContinue && (
                          <div className="mt-3 flex justify-end">
                            <Link to={`/admin/applications/probationals/new?id=${a.id}${typeof a.completion_step==='number' ? `&goto=${nextStep}` : ''}`} className="px-2 py-1 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Continue{typeof a.completion_step==='number' ? ` (Step ${nextStep})` : ''}</Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {!loading && filtered.length===0 && (<tr><td className="p-3" colSpan={6}>No applications</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsProbationals;
