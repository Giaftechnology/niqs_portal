import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import Modal from '../../../components/Modal';

interface Department { id: number; name: string; }
interface Designation { id: number; name: string; }
interface AdminUserRec {
  id: string; // uuid
  user_id: number;
  department_id: number | null;
  designation_id: number | null;
  firstname: string;
  othername?: string | null;
  lastname: string;
  status?: 'active' | 'inactive' | string;
  user?: { id: number; name: string; email: string };
  department?: { id: number; name: string } | null;
  designation?: { id: number; name: string } | null;
}

const Admins: React.FC = () => {
  const [items, setItems] = useState<AdminUserRec[]>([]);
  const [deps, setDeps] = useState<Department[]>([]);
  const [desigs, setDesigs] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUserRec | null>(null);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<{ email: string; department_id: number | ''; designation_id: number | ''; firstname: string; othername: string; lastname: string; whois: string }>({ email: '', department_id: '', designation_id: '', firstname: '', othername: '', lastname: '', whois: 'admin' });
  const [assignDept, setAssignDept] = useState<{ id: string | null; department_id: number | '' }>({ id: null, department_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [depsLoading, setDepsLoading] = useState(false);
  const [desigsLoading, setDesigsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(x => [x.firstname, x.othername, x.lastname, x.user?.email, x.department?.name, x.designation?.name].filter(Boolean).some(v => String(v).toLowerCase().includes(s)));
  }, [items, q]);

  const fetchDeps = async () => {
    setDepsLoading(true);
    try {
      const res = await apiFetch<any>('/api/departments');
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data?.departments)
              ? res.data.departments
              : Array.isArray(res?.data?.data?.departments)
                ? res.data.data.departments
            : Array.isArray(res?.departments)
              ? res.departments
              : Array.isArray(res?.items)
                ? res.items
                : [];
      const normalized: Department[] = raw.map((x: any) => ({
        id: Number(x.id ?? x.department_id ?? x.ID ?? 0),
        name: x.name ?? x.department_name ?? x.title ?? '',
      }));
      setDeps(normalized);
    } catch {}
    finally { setDepsLoading(false); }
  };
  const fetchDesigs = async () => {
    setDesigsLoading(true);
    try {
      const res = await apiFetch<any>('/api/designations');
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data?.designations)
              ? res.data.designations
              : Array.isArray(res?.data?.data?.designations)
                ? res.data.data.designations
            : Array.isArray(res?.designations)
              ? res.designations
              : Array.isArray(res?.items)
                ? res.items
                : [];
      const normalized: Designation[] = raw.map((x: any) => ({
        id: Number(x.id ?? x.designation_id ?? x.ID ?? 0),
        name: x.name ?? x.title ?? x.designation_name ?? x.designation ?? '',
      }));
      setDesigs(normalized);
    } catch {}
    finally { setDesigsLoading(false); }
  };

  const fetchList = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/admins');
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.admins?.data)
              ? res.admins.data
              : Array.isArray(res?.data?.admins)
                ? res.data.admins
                : Array.isArray(res?.data?.admins?.data)
                  ? res.data.admins.data
                  : Array.isArray(res?.users)
                    ? res.users
                    : Array.isArray(res?.admin_users)
                      ? res.admin_users
                      : Array.isArray(res?.data?.users)
                        ? res.data.users
                        : Array.isArray(res?.data?.admin_users)
                          ? res.data.admin_users
                          : Array.isArray(res?.data?.data?.users)
                            ? res.data.data.users
                            : Array.isArray(res?.data?.data?.admin_users)
                              ? res.data.data.admin_users
          : Array.isArray(res?.admins)
            ? res.admins
            : Array.isArray(res?.items)
              ? res.items
              : [];
      const normalized: (Partial<AdminUserRec> & { id: string })[] = raw.map((x: any) => {
        const dept = x.department || (x.department_name ? { id: x.department_id ?? null, name: x.department_name } : null);
        const desig = x.designation || (x.designation_name ? { id: x.designation_id ?? null, name: x.designation_name } : null);
        const user = x.user || (x.email ? { id: x.user_id ?? x.id, name: [x.firstname ?? x.first_name, x.othername ?? x.middle_name, x.lastname ?? x.last_name].filter(Boolean).join(' '), email: x.email } : undefined);
        const rawStatus = (x.status ?? x.is_active ?? x.active ?? x.enabled ?? x.state);
        let status: string | undefined;
        if (rawStatus !== undefined && rawStatus !== null && String(rawStatus) !== '') {
          if (typeof rawStatus !== 'string') {
            status = rawStatus ? 'active' : 'inactive';
          } else {
            const s = rawStatus.toLowerCase();
            status = (s === '1' || s === 'true' || s === 'active' || s === 'enabled') ? 'active' : 'inactive';
          }
        }
        return {
          id: String(x.id ?? x.uuid ?? x.user_id),
          user_id: Number(x.user_id ?? x.id ?? 0),
          department_id: x.department_id ?? dept?.id ?? null,
          designation_id: x.designation_id ?? desig?.id ?? null,
          firstname: x.firstname ?? x.first_name ?? '',
          othername: x.othername ?? x.middle_name ?? '',
          lastname: x.lastname ?? x.last_name ?? '',
          status,
          user,
          department: dept ? { id: Number(dept.id ?? 0), name: dept.name } : null,
          designation: desig ? { id: Number(desig.id ?? 0), name: desig.name } : null,
        };
      });
      setItems(prev => {
        const merged = normalized.map(n => {
          const old = prev.find(p => p.id === n.id);
          return {
            id: n.id,
            user_id: n.user_id ?? old?.user_id ?? 0,
            department_id: (n.department_id ?? old?.department_id ?? null) as any,
            designation_id: (n.designation_id ?? old?.designation_id ?? null) as any,
            firstname: n.firstname ?? old?.firstname ?? '',
            othername: n.othername ?? old?.othername ?? '',
            lastname: n.lastname ?? old?.lastname ?? '',
            status: n.status ?? old?.status,
            user: n.user ?? old?.user,
            department: (n.department ?? old?.department) as any,
            designation: (n.designation ?? old?.designation) as any,
          } as AdminUserRec;
        });
        const newIds = new Set(merged.map(x => x.id));
        const leftovers = prev.filter(p => !newIds.has(p.id));
        return [...merged, ...leftovers];
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load admins');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); fetchDeps(); fetchDesigs(); }, []);
  useEffect(() => { if (showForm) { fetchDeps(); fetchDesigs(); } }, [showForm]);

  const resetForm = () => {
    setEditing(null);
    setForm({ email: '', department_id: '', designation_id: '', firstname: '', othername: '', lastname: '', whois: 'admin' });
  };

  const doSubmit = async () => {
    if (!editing && !form.email.trim()) { setFormError('Email is required'); return; }
    if (!form.firstname.trim() || !form.lastname.trim()) { setFormError('First and last name are required'); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      if (editing) {
        const payload: any = {
          firstname: form.firstname,
          othername: form.othername || undefined,
          lastname: form.lastname,
          department_id: form.department_id || undefined,
          designation_id: form.designation_id || undefined,
        };
        await apiFetch(`/api/admins/${editing.id}`, { method: 'PUT', body: payload });
      } else {
        const payload: any = {
          email: form.email,
          department_id: form.department_id || undefined,
          designation_id: form.designation_id || undefined,
          firstname: form.firstname,
          othername: form.othername || undefined,
          lastname: form.lastname,
          whois: 'admin',
        };
        await apiFetch('/api/admins', { method: 'POST', body: payload });
      }
      await fetchList();
      setShowForm(false);
      resetForm();
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: editing ? 'Admin updated successfully.' : 'Admin created successfully.' } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
      setSuccessMsg(editing ? 'Admin updated successfully.' : 'Admin created successfully.');
    } catch (e: any) {
      const msg = e?.message || 'Request failed';
      setFormError(msg);
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Error', message: msg } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } finally { setSubmitting(false); }
  };

  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); await doSubmit(); };

  const onEdit = (a: AdminUserRec) => {
    setEditing(a);
    setForm({
      email: a.user?.email || '',
      department_id: (a.department_id || '') as any,
      designation_id: (a.designation_id || '') as any,
      firstname: a.firstname || '',
      othername: a.othername || '',
      lastname: a.lastname || '',
      whois: 'admin',
    });
    setShowForm(true);
  };

  const onDelete = async (a: AdminUserRec) => {
    if (!window.confirm(`Delete admin ${a.firstname} ${a.lastname}?`)) return;
    setRowBusy((m) => ({ ...m, [a.id]: true }));
    try { await apiFetch(`/api/admins/${a.id}`, { method: 'DELETE' }); await fetchList(); } catch (e: any) { alert(e.message || 'Delete failed'); }
    finally { setRowBusy((m) => ({ ...m, [a.id]: false })); }
  };

  const toggleActive = async (a: AdminUserRec) => {
    setRowBusy((m) => ({ ...m, [a.id]: true }));
    const s = (a.status ?? '').toString().toLowerCase();
    const currentlyActive = s === 'active' || s === '1' || s === 'true';
    // optimistic update
    setItems(prev => prev.map(it => it.id === a.id ? { ...it, status: currentlyActive ? 'inactive' : 'active' } : it));
    try {
      const path = currentlyActive ? `/api/admins/${a.id}/deactivate` : `/api/admins/${a.id}/activate`;
      await apiFetch(path, { method: 'POST' });
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: currentlyActive ? 'Admin deactivated.' : 'Admin activated.' } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } catch (e: any) {
      // revert on failure
      setItems(prev => prev.map(it => it.id === a.id ? { ...it, status: currentlyActive ? 'active' : 'inactive' } : it));
      alert(e.message || 'Failed to toggle status');
    } finally { setRowBusy((m) => ({ ...m, [a.id]: false })); }
  };

  const onAssignDept = async () => {
    if (!assignDept.id || !assignDept.department_id) return;
    setRowBusy((m) => ({ ...m, [assignDept.id!]: true }));
    try {
      await apiFetch(`/api/admins/${assignDept.id}/assign-department`, { method: 'POST', body: { department_id: assignDept.department_id } });
      setAssignDept({ id: null, department_id: '' as any });
      await fetchList();
    } catch (e: any) { alert(e.message || 'Assign failed'); }
    finally { setRowBusy((m) => ({ ...m, [assignDept.id!]: false })); }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Admins</h1>
        <button onClick={()=>{ resetForm(); setShowForm(s=>!s); }} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">{showForm ? 'Close' : 'Add New'}</button>
      </div>

      {successMsg && (
        <div className="mb-3 p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{successMsg}</div>
      )}
      {error && (
        <div className="mb-3 p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}

      <Modal
        open={showForm}
        title={editing ? 'Edit Admin' : 'Add Admin'}
        onClose={() => { setShowForm(false); resetForm(); setFormError(null); }}
        onConfirm={() => { if (!submitting) void doSubmit(); }}
        confirmText={submitting ? (editing ? 'Updating…' : 'Creating…') : (editing ? 'Update' : 'Create')}
        closeText={submitting ? 'Close' : 'Cancel'}
        panelClassName="max-w-2xl"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {!editing && (
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required className="w-full px-3 py-2 border rounded-md" disabled={submitting} />
            </div>
          )}
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">First name</label>
            <input value={form.firstname} onChange={(e)=>setForm({...form, firstname: e.target.value})} required className="w-full px-3 py-2 border rounded-md" disabled={submitting} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Other name</label>
            <input value={form.othername} onChange={(e)=>setForm({...form, othername: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={submitting} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Last name</label>
            <input value={form.lastname} onChange={(e)=>setForm({...form, lastname: e.target.value})} required className="w-full px-3 py-2 border rounded-md" disabled={submitting} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Department</label>
            <select value={form.department_id} onFocus={()=>{ if (!deps.length) fetchDeps(); }} onChange={(e)=>setForm({...form, department_id: (e.target.value ? Number(e.target.value) : '') as any})} className="w-full px-3 py-2 border rounded-md" disabled={submitting}>
              <option value="">{depsLoading ? 'Loading…' : 'Select'}</option>
              {!depsLoading && deps.length === 0 && (<option value="" disabled>No departments</option>)}
              {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Designation</label>
            <select value={form.designation_id} onFocus={()=>{ if (!desigs.length) fetchDesigs(); }} onChange={(e)=>setForm({...form, designation_id: (e.target.value ? Number(e.target.value) : '') as any})} className="w-full px-3 py-2 border rounded-md" disabled={submitting}>
              <option value="">{desigsLoading ? 'Loading…' : 'Select'}</option>
              {!desigsLoading && desigs.length === 0 && (<option value="" disabled>No designations</option>)}
              {desigs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {formError && <div className="md:col-span-3 text-sm text-red-600">{formError}</div>}
        </div>
      </Modal>

      <div className="mb-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} className="px-3 py-2 border rounded-md w-full md:w-80" />
        {assignDept.id && (
          <div className="flex items-center gap-2">
            <select value={assignDept.department_id} onChange={(e)=>setAssignDept({ ...assignDept, department_id: (e.target.value ? Number(e.target.value) : '') as any })} className="px-3 py-2 border rounded-md">
              <option value="">Select department</option>
              {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button onClick={onAssignDept} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm" disabled={rowBusy[assignDept.id!] || submitting}>Assign</button>
            <button onClick={()=>setAssignDept({ id: null, department_id: '' as any })} className="px-3 py-2 border rounded-md text-sm" disabled={rowBusy[assignDept.id!] || submitting}>Cancel</button>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Department</th>
                <th className="text-left px-3 py-2">Designation</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="px-3 py-3" colSpan={6}>Loading…</td></tr>
              )}
              {error && !loading && (
                <tr><td className="px-3 py-3 text-red-600" colSpan={6}>{error}</td></tr>
              )}
              {!loading && !error && filtered.map(a => {
                const fullName = [a.firstname, a.othername, a.lastname].filter(Boolean).join(' ');
                const isActive = ((a.status || '').toString().toLowerCase() === 'active') || (a as any).status === 1 || (a as any).status === true || (a as any).status === '1';
                return (
                  <tr key={a.id} className="border-t">
                    <td className="px-3 py-2">{fullName}</td>
                    <td className="px-3 py-2">{a.user?.email}</td>
                    <td className="px-3 py-2">{a.department?.name || '-'}</td>
                    <td className="px-3 py-2">{a.designation?.name || '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={()=>onEdit(a)} className="px-2 py-1 border rounded-md text-blue-600 border-blue-200 hover:bg-blue-50" disabled={rowBusy[a.id]}>Edit</button>
                        <button onClick={()=>navigate(`/admin/management/admins/${a.id}`)} className="px-2 py-1 border rounded-md text-indigo-600 border-indigo-200 hover:bg-indigo-50" disabled={rowBusy[a.id]}>View</button>
                        <button onClick={()=>toggleActive(a)} className={`px-2 py-1 rounded-md ${isActive ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'}`} disabled={rowBusy[a.id]}>{isActive ? 'Deactivate' : 'Activate'}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && filtered.length === 0 && (
                <tr><td className="px-3 py-3" colSpan={6}>No admins</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admins;
