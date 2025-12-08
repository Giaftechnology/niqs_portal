import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/Modal';
import { apiFetch } from '../../../utils/api';

interface ExecAssignment { id: number; member_id: string; executive_set_id: number; position: string; created_at?: string; updated_at?: string; executive_office_id?: number; }
interface ExecSet { id: number; name: string; start_date: string; end_date: string; created_at?: string; updated_at?: string; executives?: ExecAssignment[]; }
interface ExecOffice { id: number; name: string; slug?: string; description?: string; role_id?: number; rank?: number; created_at?: string; updated_at?: string; }

const Executives: React.FC = () => {
  const [sets, setSets] = useState<ExecSet[]>([]);
  const [offices, setOffices] = useState<ExecOffice[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [errorSets, setErrorSets] = useState<string | null>(null);
  const [errorOffices, setErrorOffices] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [qSet, setQSet] = useState('');
  const [qOffice, setQOffice] = useState('');

  const [showSetModal, setShowSetModal] = useState(false);
  const [editingSet, setEditingSet] = useState<ExecSet | null>(null);
  const [setForm, setSetForm] = useState<{ name: string; start_date: string; end_date: string }>({ name: '', start_date: '', end_date: '' });
  const [setSubmitting, setSetSubmitting] = useState(false);
  const [setFormError, setSetFormError] = useState<string | null>(null);

  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<ExecOffice | null>(null);
  const [officeForm, setOfficeForm] = useState<{ name: string; description: string; rank: string }>({ name: '', description: '', rank: '' });
  const [officeSubmitting, setOfficeSubmitting] = useState(false);
  const [officeFormError, setOfficeFormError] = useState<string | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState<{ member_id: string; office_id: number | ''; executive_set_id: number | ''; position: string }>({ member_id: '', office_id: '' as any, executive_set_id: '' as any, position: '' });
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignFormError, setAssignFormError] = useState<string | null>(null);

  const filteredSets = useMemo(() => {
    const s = qSet.trim().toLowerCase();
    if (!s) return sets;
    return sets.filter(x => [x.name, x.start_date, x.end_date].filter(Boolean).some(v => String(v).toLowerCase().includes(s)));
  }, [sets, qSet]);
  const filteredOffices = useMemo(() => {
    const s = qOffice.trim().toLowerCase();
    if (!s) return offices;
    return offices.filter(x => [x.name, x.description, x.rank].filter(Boolean).some(v => String(v).toLowerCase().includes(s)));
  }, [offices, qOffice]);

  const fetchSets = async () => {
    setLoadingSets(true); setErrorSets(null);
    try {
      const res = await apiFetch<any>('/api/executive-sets');
      const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      const normalized: ExecSet[] = raw.map((x: any) => ({
        id: Number(x.id),
        name: x.name,
        start_date: x.start_date,
        end_date: x.end_date,
        created_at: x.created_at,
        updated_at: x.updated_at,
        executives: Array.isArray(x.executives) ? x.executives.map((e: any) => ({
          id: Number(e.id), member_id: String(e.member_id), executive_set_id: Number(e.executive_set_id), position: String(e.position || ''), created_at: e.created_at, updated_at: e.updated_at,
        })) : [],
      }));
      setSets(normalized);
    } catch (e: any) {
      setErrorSets(e.message || 'Failed to load executive sets');
    } finally { setLoadingSets(false); }
  };

  const fetchOffices = async () => {
    setLoadingOffices(true); setErrorOffices(null);
    try {
      const res = await apiFetch<any>('/api/executive-offices');
      const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      const normalized: ExecOffice[] = raw.map((x: any) => ({
        id: Number(x.id), name: x.name, slug: x.slug, description: x.description, role_id: x.role_id ? Number(x.role_id) : undefined, rank: x.rank ? Number(x.rank) : undefined,
        created_at: x.created_at, updated_at: x.updated_at,
      }));
      setOffices(normalized);
    } catch (e: any) {
      setErrorOffices(e.message || 'Failed to load executive offices');
    } finally { setLoadingOffices(false); }
  };

  useEffect(() => { fetchSets(); fetchOffices(); }, []);

  const openCreateSet = () => { setEditingSet(null); setSetForm({ name: '', start_date: '', end_date: '' }); setSetFormError(null); setShowSetModal(true); };
  const openEditOffice = (o: ExecOffice) => { setEditingOffice(o); setOfficeForm({ name: o.name || '', description: o.description || '', rank: String(o.rank ?? '') }); setOfficeFormError(null); setShowOfficeModal(true); };
  const openCreateOffice = () => { setEditingOffice(null); setOfficeForm({ name: '', description: '', rank: '' }); setOfficeFormError(null); setShowOfficeModal(true); };
  const openAssign = (setId?: number) => { setAssignForm({ member_id: '', office_id: '' as any, executive_set_id: (setId ?? '') as any, position: '' }); setAssignFormError(null); setShowAssignModal(true); };

  const submitSet = async () => {
    if (!setForm.name.trim() || !setForm.start_date || !setForm.end_date) { setSetFormError('All fields are required'); return; }
    setSetFormError(null); setSetSubmitting(true);
    try {
      const res = await apiFetch<any>('/api/executive-sets', { method: 'POST', body: { name: setForm.name, start_date: setForm.start_date, end_date: setForm.end_date } });
      const ok = Boolean(res?.data?.id || res?.id || res?.status === 'success');
      if (!ok) throw new Error(res?.message || 'Could not create executive set');
      await fetchSets();
      setShowSetModal(false);
      try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Executive set created successfully.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
      setSuccessMsg('Executive set created successfully.');
    } catch (e: any) { setSetFormError(e?.message || 'Request failed'); }
    finally { setSetSubmitting(false); }
  };

  const submitOffice = async () => {
    if (!officeForm.name.trim()) { setOfficeFormError('Name is required'); return; }
    const rankNum = officeForm.rank ? Number(officeForm.rank) : undefined;
    setOfficeFormError(null); setOfficeSubmitting(true);
    try {
      let res: any;
      if (editingOffice) {
        res = await apiFetch(`/api/executive-offices/${editingOffice.id}`, { method: 'PUT', body: { name: officeForm.name, description: officeForm.description || undefined, rank: rankNum } });
      } else {
        res = await apiFetch('/api/executive-offices', { method: 'POST', body: { name: officeForm.name, description: officeForm.description || undefined, rank: rankNum } });
      }
      const ok = Boolean(res?.data?.id || res?.id || res?.status === 'success');
      if (!ok) throw new Error(res?.message || 'Could not save office');
      await fetchOffices();
      setShowOfficeModal(false);
      try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: editingOffice ? 'Office updated.' : 'Office created.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
      setSuccessMsg(editingOffice ? 'Office updated.' : 'Office created.');
    } catch (e: any) { setOfficeFormError(e?.message || 'Request failed'); }
    finally { setOfficeSubmitting(false); }
  };

  const deleteOffice = async (o: ExecOffice) => {
    if (!window.confirm(`Delete office "${o.name}"?`)) return;
    try { await apiFetch(`/api/executive-offices/${o.id}`, { method: 'DELETE' }); await fetchOffices(); } catch (e: any) { alert(e?.message || 'Delete failed'); }
  };

  const submitAssign = async () => {
    if (!assignForm.member_id.trim() || !assignForm.office_id || !assignForm.executive_set_id || !assignForm.position.trim()) { setAssignFormError('All fields are required'); return; }
    setAssignFormError(null); setAssignSubmitting(true);
    try {
      const res = await apiFetch('/api/executive-offices/assign-member', { method: 'POST', body: { member_id: assignForm.member_id, office_id: assignForm.office_id, executive_set_id: assignForm.executive_set_id, position: assignForm.position } });
      const ok = Boolean(res?.data?.id || res?.id || res?.status === 'success');
      if (!ok) throw new Error(res?.message || 'Could not assign member');
      await fetchSets();
      setShowAssignModal(false);
      try { const ev = new CustomEvent('global-alert', { detail: { title: 'Success', message: 'Member assigned successfully.' } }); window.dispatchEvent(ev); document.dispatchEvent(ev); } catch {}
      setSuccessMsg('Member assigned successfully.');
    } catch (e: any) { setAssignFormError(e?.message || 'Request failed'); }
    finally { setAssignSubmitting(false); }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Executive Management</h1>
        <div className="flex gap-2">
          <button onClick={openCreateSet} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">New Executive Set</button>
          <button onClick={openCreateOffice} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">New Office</button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-3 p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{successMsg}</div>
      )}
      {(errorSets || errorOffices) && (
        <div className="mb-3 p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{errorSets || errorOffices}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="font-medium">Executive Sets</div>
              <div className="flex items-center gap-2">
                <input placeholder="Search" value={qSet} onChange={(e)=>setQSet(e.target.value)} className="px-3 py-2 border rounded-md w-48" />
                <button onClick={fetchSets} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Dates</th>
                  <th className="text-left px-3 py-2">Executives</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingSets && <tr><td className="px-3 py-3" colSpan={4}>Loading…</td></tr>}
                {!loadingSets && filteredSets.map(s => (
                  <tr key={s.id} className="border-t align-top">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.start_date} → {s.end_date}</td>
                    <td className="px-3 py-2">
                      {s.executives && s.executives.length > 0 ? (
                        <div className="space-y-1">
                          {s.executives.map(e => (
                            <div key={e.id} className="text-xs text-gray-700 border rounded px-2 py-1">{e.position} • {e.member_id}</div>
                          ))}
                        </div>
                      ) : <span className="text-gray-500">None</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={()=>openAssign(s.id)} className="px-2 py-1 rounded-md bg-indigo-600 text-white">Assign Member</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingSets && filteredSets.length === 0 && (
                  <tr><td className="px-3 py-3" colSpan={4}>No executive sets</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="font-medium">Executive Offices</div>
              <div className="flex items-center gap-2">
                <input placeholder="Search" value={qOffice} onChange={(e)=>setQOffice(e.target.value)} className="px-3 py-2 border rounded-md w-48" />
                <button onClick={fetchOffices} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Rank</th>
                  <th className="text-left px-3 py-2">Description</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingOffices && <tr><td className="px-3 py-3" colSpan={4}>Loading…</td></tr>}
                {!loadingOffices && filteredOffices.map(o => (
                  <tr key={o.id} className="border-t">
                    <td className="px-3 py-2">{o.name}</td>
                    <td className="px-3 py-2">{o.rank ?? '-'}</td>
                    <td className="px-3 py-2">{o.description || '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={()=>openEditOffice(o)} className="px-2 py-1 border rounded-md text-blue-600 border-blue-200 hover:bg-blue-50">Edit</button>
                        <button onClick={()=>deleteOffice(o)} className="px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingOffices && filteredOffices.length === 0 && (
                  <tr><td className="px-3 py-3" colSpan={4}>No executive offices</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={showSetModal}
        title={editingSet ? 'Edit Executive Set' : 'New Executive Set'}
        onClose={() => { setShowSetModal(false); setSetFormError(null); }}
        onConfirm={() => { if (!setSubmitting) void submitSet(); }}
        confirmText={setSubmitting ? (editingSet ? 'Saving…' : 'Creating…') : (editingSet ? 'Save' : 'Create')}
        closeText={setSubmitting ? 'Close' : 'Cancel'}
        panelClassName="max-w-xl"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input value={setForm.name} onChange={(e)=>setSetForm({...setForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={setSubmitting} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start date</label>
            <input type="date" value={setForm.start_date} onChange={(e)=>setSetForm({...setForm, start_date: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={setSubmitting} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End date</label>
            <input type="date" value={setForm.end_date} onChange={(e)=>setSetForm({...setForm, end_date: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={setSubmitting} />
          </div>
          {setFormError && <div className="md:col-span-2 text-sm text-red-600">{setFormError}</div>}
        </div>
      </Modal>

      <Modal
        open={showOfficeModal}
        title={editingOffice ? 'Edit Executive Office' : 'New Executive Office'}
        onClose={() => { setShowOfficeModal(false); setOfficeFormError(null); }}
        onConfirm={() => { if (!officeSubmitting) void submitOffice(); }}
        confirmText={officeSubmitting ? (editingOffice ? 'Saving…' : 'Creating…') : (editingOffice ? 'Save' : 'Create')}
        closeText={officeSubmitting ? 'Close' : 'Cancel'}
        panelClassName="max-w-xl"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input value={officeForm.name} onChange={(e)=>setOfficeForm({...officeForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={officeSubmitting} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Description</label>
            <textarea value={officeForm.description} onChange={(e)=>setOfficeForm({...officeForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={officeSubmitting} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Rank</label>
            <input type="number" value={officeForm.rank} onChange={(e)=>setOfficeForm({...officeForm, rank: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={officeSubmitting} />
          </div>
          {officeFormError && <div className="text-sm text-red-600">{officeFormError}</div>}
        </div>
      </Modal>

      <Modal
        open={showAssignModal}
        title="Assign Member to Office"
        onClose={() => { setShowAssignModal(false); setAssignFormError(null); }}
        onConfirm={() => { if (!assignSubmitting) void submitAssign(); }}
        confirmText={assignSubmitting ? 'Assigning…' : 'Assign'}
        closeText={assignSubmitting ? 'Close' : 'Cancel'}
        panelClassName="max-w-xl"
        bodyClassName="!text-inherit"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Member ID</label>
            <input value={assignForm.member_id} onChange={(e)=>setAssignForm({...assignForm, member_id: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={assignSubmitting} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Executive Set</label>
            <select value={assignForm.executive_set_id} onChange={(e)=>setAssignForm({...assignForm, executive_set_id: (e.target.value ? Number(e.target.value) : '') as any})} className="w-full px-3 py-2 border rounded-md" disabled={assignSubmitting}>
              <option value="">Select set</option>
              {sets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Office</label>
            <select value={assignForm.office_id} onChange={(e)=>setAssignForm({...assignForm, office_id: (e.target.value ? Number(e.target.value) : '') as any})} className="w-full px-3 py-2 border rounded-md" disabled={assignSubmitting}>
              <option value="">Select office</option>
              {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Position</label>
            <input value={assignForm.position} onChange={(e)=>setAssignForm({...assignForm, position: e.target.value})} className="w-full px-3 py-2 border rounded-md" disabled={assignSubmitting} />
          </div>
          {assignFormError && <div className="md:col-span-2 text-sm text-red-600">{assignFormError}</div>}
        </div>
      </Modal>
    </div>
  );
};

export default Executives;
