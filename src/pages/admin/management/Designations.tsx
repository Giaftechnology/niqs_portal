import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import Modal from '../../../components/Modal';

interface Designation {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

const Designations: React.FC = () => {
  const [items, setItems] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(x => x.name?.toLowerCase().includes(s));
  }, [items, q]);

  const fetchList = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/designations');
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.designations)
              ? res.designations
              : Array.isArray(res?.items)
                ? res.items
                : [];
      const normalized: Designation[] = raw.map((x: any) => ({
        id: Number(x.id ?? x.designation_id ?? x.ID ?? 0),
        name: x.name ?? x.title ?? x.designation_name ?? x.designation ?? '',
        created_at: x.created_at,
        updated_at: x.updated_at,
      }));
      setItems(normalized);
    } catch (e: any) {
      setError(e.message || 'Failed to load designations');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const resetForm = () => { setEditing(null); setName(''); };

  const doSubmit = async () => {
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      let res: any;
      if (editing) {
        res = await apiFetch(`/api/designations/${editing.id}`, { method: 'PUT', body: { name, title: name, designation_name: name, designation: name, label: name } });
      } else {
        res = await apiFetch('/api/designations', { method: 'POST', body: { name, title: name, designation_name: name, designation: name, label: name } });
      }
      const ok = Boolean(
        (res && (res.id || res.designation_id || res.success === true || res.status === true)) ||
        (res?.data && (res.data.id || res.data.designation_id)) ||
        (res?.data?.data && (res.data.data.id || res.data.data.designation_id)) ||
        (typeof res?.message === 'string' && /(created|success)/i.test(res.message))
      );
      if (!ok) {
        const msg = res?.message || res?.error || 'Designation not created';
        throw new Error(String(msg));
      }
      await fetchList();
      setShowForm(false);
      resetForm();
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: editing ? 'Designation updated successfully.' : 'Designation created successfully.' } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
      setSuccessMsg(editing ? 'Designation updated successfully.' : 'Designation created successfully.');
      setQ('');
    } catch (e: any) {
      const msg = e?.message || 'Request failed';
      setFormError(msg);
      try {
        const ev = new CustomEvent('global-alert', { detail: { title: 'Error', message: msg } });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (d: Designation) => {
    setEditing(d);
    setName(d.name || '');
    setShowForm(true);
  };

  const onDelete = async (d: Designation) => {
    if (!window.confirm(`Delete designation "${d.name}"?`)) return;
    try {
      await apiFetch(`/api/designations/${d.id}`, { method: 'DELETE' });
      await fetchList();
    } catch (e: any) { alert(e.message || 'Delete failed'); }
  };

  return (
    <div className="relative p-4 sm:p-6">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading designations…</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Designations</h1>
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
        title={editing ? 'Edit Designation' : 'Add Designation'}
        onClose={() => { setShowForm(false); resetForm(); setFormError(null); }}
        onConfirm={() => { if (!submitting) void doSubmit(); }}
        confirmText={submitting ? (editing ? 'Updating…' : 'Creating…') : (editing ? 'Update' : 'Create')}
        closeText={submitting ? 'Close' : 'Cancel'}
        panelClassName="max-w-xl w-[90vw]"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md" disabled={submitting} />
          </div>
          {formError && <div className="text-sm text-red-600">{formError}</div>}
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
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="px-3 py-3" colSpan={3}>Loading…</td></tr>
              )}
              {error && !loading && (
                <tr><td className="px-3 py-3 text-red-600" colSpan={3}>{error}</td></tr>
              )}
              {!loading && !error && filtered.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="px-3 py-2">{d.id}</td>
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>navigate(`/admin/management/designations/${d.id}`)} className="px-2 py-1 border rounded-md text-xs">View</button>
                      <button onClick={()=>onEdit(d)} className="px-2 py-1 border rounded-md">Edit</button>
                      <button onClick={()=>onDelete(d)} className="px-2 py-1 border rounded-md text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filtered.length === 0 && (
                <tr><td className="px-3 py-3" colSpan={3}>No designations</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Designations;
