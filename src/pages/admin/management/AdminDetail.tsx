import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface Department { id: number; name: string; }
interface AdminUserRec {
  id: string;
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

const AdminDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<AdminUserRec | null>(null);
  const [deps, setDeps] = useState<Department[]>([]);
  const [assignDeptId, setAssignDeptId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [depsLoading, setDepsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ firstname: string; othername: string; lastname: string; department_id: number | ''; designation_id: number | '' }>({ firstname: '', othername: '', lastname: '', department_id: '' as any, designation_id: '' as any });

  const isActive = (() => {
    const raw = item?.status;
    if (raw === undefined || raw === null || String(raw) === '') return false;
    if (typeof raw !== 'string') return !!raw;
    const s = raw.toLowerCase();
    return s === 'active' || s === '1' || s === 'true' || s === 'enabled';
  })();

  const load = async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/admins');
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
      const arr = Array.isArray(raw) ? raw : [];
      const x = arr.find((r: any) => String(r.id ?? r.uuid ?? r.user_id) === String(id));
      if (!x) throw new Error('Admin not found');
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
      const normalized: AdminUserRec = {
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
      setItem(normalized);
      setEditForm({
        firstname: normalized.firstname,
        othername: normalized.othername || '',
        lastname: normalized.lastname,
        department_id: (normalized.department_id || '') as any,
        designation_id: (normalized.designation_id || '') as any,
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    const loadDeps = async () => {
      setDepsLoading(true);
      try {
        const res = await apiFetch<any>('/api/departments');
        const raw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];
        const normalized: Department[] = raw.map((x: any) => ({
          id: Number(x.id ?? x.department_id ?? x.ID ?? 0),
          name: x.name ?? x.department_name ?? x.title ?? '',
        }));
        setDeps(normalized);
      } catch {
        // ignore
      } finally {
        setDepsLoading(false);
      }
    };
    loadDeps();
  }, []);

  const onChangeDept = async () => {
    if (!item || !assignDeptId) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admins/${item.id}/assign-department`, { method: 'POST', body: { department_id: assignDeptId } });
      const dep = deps.find(d => d.id === assignDeptId) || null;
      setItem(prev => prev ? { ...prev, department_id: assignDeptId, department: dep } : prev);
      setAssignDeptId('');
      setActionError(null);
      setSuccessMsg('Department changed successfully.');
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Department changed successfully.' } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } catch (e: any) {
      const msg = e?.message || 'Failed to change department';
      setActionError(msg);
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Error', message: msg } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } finally {
      setBusy(false);
    }
  };

  const onToggleActive = async () => {
    if (!item) return;
    setBusy(true);
    const currentlyActive = isActive;
    try {
      const path = currentlyActive ? `/api/admins/${item.id}/deactivate` : `/api/admins/${item.id}/activate`;
      await apiFetch(path, { method: 'POST' });
      setItem(prev => prev ? { ...prev, status: currentlyActive ? 'inactive' : 'active' } : prev);
      setActionError(null);
      setSuccessMsg(currentlyActive ? 'Admin deactivated.' : 'Admin activated.');
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: currentlyActive ? 'Admin deactivated.' : 'Admin activated.' } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } catch (e: any) {
      const msg = e?.message || 'Failed to toggle status';
      setActionError(msg);
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Error', message: msg } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!item) return;
    if (!window.confirm(`Delete admin ${item.firstname} ${item.lastname}?`)) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admins/${item.id}`, { method: 'DELETE' });
      navigate('/admin/management/admins');
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const fullName = item ? [item.firstname, item.othername, item.lastname].filter(Boolean).join(' ') : '';

  const onOpenEdit = () => {
    if (!item) return;
    setEditForm({
      firstname: item.firstname,
      othername: item.othername || '',
      lastname: item.lastname,
      department_id: (item.department_id || '') as any,
      designation_id: (item.designation_id || '') as any,
    });
    setEditError(null);
    setShowEdit(true);
  };

  const onSubmitEdit = async () => {
    if (!item) return;
    if (!editForm.firstname.trim() || !editForm.lastname.trim()) {
      setEditError('First and last name are required');
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    try {
      const payload: any = {
        firstname: editForm.firstname,
        othername: editForm.othername || undefined,
        lastname: editForm.lastname,
        department_id: editForm.department_id || undefined,
        designation_id: editForm.designation_id || undefined,
      };
      await apiFetch(`/api/admins/${item.id}`, { method: 'PUT', body: payload });
      setShowEdit(false);
      await load();
      setSuccessMsg('Admin updated successfully.');
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Admin updated successfully.' } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } catch (e: any) {
      const msg = e?.message || 'Update failed';
      setEditError(msg);
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Error', message: msg } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold">Admin Detail</div>
          {item && (
            <div className="text-xs text-gray-500 mt-1">ID: {item.id}</div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {item && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {isActive ? 'Active' : 'Deactivated'}
            </span>
          )}
          <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded-md">Back</button>
        </div>
      </div>
      {loading && (<div className="p-3 border rounded-md bg-gray-50 text-gray-700 text-sm">Loading…</div>)}
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      {successMsg && !loading && (
        <div className="p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{successMsg}</div>
      )}
      {actionError && !loading && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{actionError}</div>
      )}
      {item && !loading && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border rounded-xl p-3 space-y-1">
              <div className="font-medium mb-1">Profile</div>
              <div><span className="text-gray-500">Name:</span> {fullName || '-'}</div>
              <div><span className="text-gray-500">Email:</span> {item.user?.email || '-'}</div>
            </div>
            <div className="bg-white border rounded-xl p-3 space-y-1">
              <div className="font-medium mb-1">Role</div>
              <div><span className="text-gray-500">Department:</span> {item.department?.name || '-'}</div>
              <div><span className="text-gray-500">Designation:</span> {item.designation?.name || '-'}</div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-3 space-y-3">
            <div className="font-medium">Actions</div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <select
                  value={assignDeptId}
                  onChange={(e)=>setAssignDeptId(e.target.value ? Number(e.target.value) : '' as any)}
                  className="px-3 py-2 border rounded-md text-sm"
                  disabled={depsLoading || busy}
                >
                  <option value="">{depsLoading ? 'Loading departments…' : 'Select department'}</option>
                  {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={onChangeDept}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-60"
                  disabled={busy || !assignDeptId}
                >
                  Change Department
                </button>
              </div>
              <button
                type="button"
                onClick={onToggleActive}
                className={`px-3 py-2 rounded-md text-sm ${isActive ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'} disabled:opacity-60`}
                disabled={busy}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={onOpenEdit}
                className="px-3 py-2 border rounded-md text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-2 rounded-md text-sm bg-red-50 text-red-700 border border-red-200 disabled:opacity-60"
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Edit Admin</div>
              <button
                type="button"
                onClick={() => { if (!editSubmitting) { setShowEdit(false); setEditError(null); } }}
                className="text-xs px-2 py-1 border rounded-md"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">First name</label>
                <input
                  value={editForm.firstname}
                  onChange={(e)=>setEditForm({...editForm, firstname: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={editSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Other name</label>
                <input
                  value={editForm.othername}
                  onChange={(e)=>setEditForm({...editForm, othername: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={editSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Last name</label>
                <input
                  value={editForm.lastname}
                  onChange={(e)=>setEditForm({...editForm, lastname: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={editSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Department</label>
                <select
                  value={editForm.department_id}
                  onChange={(e)=>setEditForm({...editForm, department_id: (e.target.value ? Number(e.target.value) : '') as any})}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={editSubmitting || depsLoading}
                >
                  <option value="">{depsLoading ? 'Loading…' : 'Select department'}</option>
                  {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Designation</label>
                <input
                  value={item?.designation?.name || ''}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
              {editError && (
                <div className="text-sm text-red-600">{editError}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => { if (!editSubmitting) { setShowEdit(false); setEditError(null); } }}
                className="px-3 py-2 border rounded-md text-sm"
                disabled={editSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmitEdit}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-60"
                disabled={editSubmitting}
              >
                {editSubmitting ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDetail;
