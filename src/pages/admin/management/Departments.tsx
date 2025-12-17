import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import Modal from '../../../components/Modal';

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

const Departments: React.FC = () => {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<{ name: string; code: string; description: string }>({ name: '', code: '', description: '' });
  const [q, setQ] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(x => [x.name, x.code, x.description].filter(Boolean).some(v => String(v).toLowerCase().includes(s)));
  }, [items, q]);

  const fetchList = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/departments');
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.departments)
              ? res.departments
              : Array.isArray(res?.items)
                ? res.items
                : [];
      const normalized: Department[] = raw.map((x: any) => ({
        id: Number(x.id ?? x.department_id ?? x.ID ?? 0),
        name: x.name ?? x.department_name ?? x.title ?? '',
        code: x.code ?? x.department_code ?? x.short_code ?? '',
        description: x.description ?? x.desc ?? '',
        is_active: x.is_active ?? x.active,
        created_at: x.created_at,
        updated_at: x.updated_at,
      }));
      setItems(normalized);
    } catch (e: any) {
      setError(e.message || 'Failed to load departments');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const resetForm = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); };

  const doSubmit = async () => {
    if (!form.name || !form.code) {
      setFormError('Name and code are required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      let res: any;
      if (editing) {
        res = await apiFetch(`/api/departments/${editing.id}`, { method: 'PUT', body: { name: form.name, code: form.code, description: form.description, department_name: form.name, department_code: form.code } });
      } else {
        res = await apiFetch('/api/departments', { method: 'POST', body: { ...form, department_name: form.name, department_code: form.code } });
      }
      const ok = Boolean(
        (res && (res.id || res.department_id || res.success === true || res.status === true)) ||
        (res?.data && (res.data.id || res.data.department_id)) ||
        (res?.data?.data && (res.data.data.id || res.data.data.department_id)) ||
        (typeof res?.message === 'string' && /(created|success)/i.test(res.message))
      );
      if (!ok) {
        const msg = res?.message || res?.error || 'Department not created';
        throw new Error(String(msg));
      }
      await fetchList();
      setShowForm(false);
      resetForm();
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: editing ? 'Department updated successfully.' : 'Department created successfully.' } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
      setSuccessMsg(editing ? 'Department updated successfully.' : 'Department created successfully.');
      setQ('');
    } catch (e: any) {
      setFormError(e?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSubmit();
  };

  const onEdit = (d: Department) => {
    setEditing(d);
    setForm({ name: d.name || '', code: d.code || '', description: d.description || '' });
    setShowForm(true);
  };

  const onDelete = async (d: Department) => {
    if (!window.confirm(`Delete department "${d.name}"?`)) return;
    try {
      await apiFetch(`/api/departments/${d.id}`, { method: 'DELETE' });
      await fetchList();
    } catch (e: any) { alert(e.message || 'Delete failed'); }
  };

  return (
    <div className="relative p-4 sm:p-6">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading departments…</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Departments</h1>
        <button onClick={()=>{ setSuccessMsg(null); resetForm(); setShowForm(s=>!s); }} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">{showForm ? 'Close' : 'Add New'}</button>
      </div>

      {successMsg && (
        <div className="mb-3 p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{successMsg}</div>
      )}
      {error && (
        <div className="mb-3 p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}

      <Modal
        open={showForm}
        title={editing ? 'Edit Department' : 'Add Department'}
        onClose={() => { setShowForm(false); resetForm(); }}
        onConfirm={() => { if (!submitting) void doSubmit(); }}
        confirmText={submitting ? (editing ? 'Updating…' : 'Creating…') : (editing ? 'Update' : 'Create')}
        closeText={submitting ? 'Close' : 'Cancel'}
        panelClassName="max-w-3xl w-[95vw]"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border rounded-md" disabled={submitting} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Code</label>
            <input value={form.code} onChange={(e)=>setForm({...form, code: e.target.value})} required className="w-full px-3 py-2 border rounded-md" disabled={submitting} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" rows={3} disabled={submitting} />
          </div>
          {formError && (
            <div className="md:col-span-3 text-sm text-red-600">{formError}</div>
          )}
        </div>
      </Modal>

      <div className="mb-3">
        <input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} className="px-3 py-2 border rounded-md w-full md:w-80" />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Code</th>
                <th className="text-left px-3 py-2">Description</th>
                <th className="text-left px-3 py-2">Active</th>
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
              {!loading && !error && filtered.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="px-3 py-2">{d.id}</td>
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2">{d.code}</td>
                  <td className="px-3 py-2 max-w-[32rem] truncate" title={d.description}>{d.description}</td>
                  <td className="px-3 py-2">{(d.is_active === 1 || d.is_active === true) ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>onEdit(d)} className="px-2 py-1 border rounded-md">Edit</button>
                      <button onClick={()=>onDelete(d)} className="px-2 py-1 border rounded-md text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filtered.length === 0 && (
                <tr><td className="px-3 py-3" colSpan={6}>No departments</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Departments;
