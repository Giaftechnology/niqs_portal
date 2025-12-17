import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { apiFetch } from '../../utils/api';

const AdminAccessors: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [view, setView] = useState<{ open: boolean; title: string; body?: React.ReactNode }>(
    { open: false, title: '' },
  );

  const [addOpen, setAddOpen] = useState(false);
  const [lookup, setLookup] = useState<LookupState>({ q: '', results: [] });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    member: any | null;
    submitting?: boolean;
    message?: string;
    error?: string;
  }>({ open: false, member: null });
  const [info, setInfo] = useState<{ open: boolean; title: string; message?: string }>(
    { open: false, title: '' },
  );

  const loadAccessors = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiFetch<any>('/api/assessors');
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setItems(list);
    } catch (e: any) {
      setError(e?.message || 'Failed to load accessors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccessors();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const m = i.member || {};
      const name = `${m.surname || ''} ${m.firstname || ''}`;
      const email = m.email || '';
      const membership = m.membership_no || '';
      return `${name} ${email} ${membership}`.toLowerCase().includes(q.toLowerCase());
    });
  }, [items, q]);

  const openAdd = () => {
    setAddOpen(true);
    setLookup({ q: '', results: [] });
  };

  const searchMembers = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLookup({ q: query, results: [], error: undefined });
      return;
    }
    setLookupLoading(true);
    setLookup((prev) => ({ ...prev, q: query, error: undefined }));
    try {
      const suffix = trimmed.toUpperCase().startsWith('M-')
        ? trimmed.toUpperCase().slice(2)
        : trimmed.replace(/^M-/i, '');
      const res = await apiFetch<any>(`/api/members/search/M-${encodeURIComponent(suffix || trimmed)}`);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setLookup((prev) => ({
        ...prev,
        results: list,
        error: list.length ? undefined : 'No members found for this ID',
      }));
    } catch (e: any) {
      setLookup((prev) => ({ ...prev, results: [], error: e?.message || 'Search failed' }));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSelectMember = (member: any) => {
    if (!member || !member.id) return;
    setAddOpen(false);
    setConfirm({ open: true, member, submitting: false, message: undefined, error: undefined });
  };

  const confirmCreateAccessor = async () => {
    if (!confirm.member || !confirm.member.id) return;
    setConfirm((prev) => ({ ...prev, submitting: true, message: undefined, error: undefined }));
    try {
      const res = await apiFetch<any>('/api/assessors', {
        method: 'POST',
        body: { member_id: confirm.member.id, max_workload: 100 },
      });
      await loadAccessors();
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'Accessor created successfully.';
      setSuccess(msg);
      setConfirm((prev) => ({ ...prev, submitting: false, open: false }));
      setInfo({ open: true, title: 'Accessor Created', message: msg });
    } catch (e: any) {
      const errMsg = e?.message || 'Failed to add accessor';
      setConfirm((prev) => ({ ...prev, submitting: false, error: errMsg }));
    }
  };

  const viewItem = (id: string) => {
    const curr = items.find((x) => String(x.id) === String(id));
    if (!curr) return;
    const m = curr.member || {};
    setView({
      open: true,
      title: 'Accessor Details',
      body: (
        <div className="text-sm text-gray-700 space-y-1">
          <div>Name: {`${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim() || '-'}</div>
          <div>Email: {m.email || '-'}</div>
          <div>Membership No.: {m.membership_no || '-'}</div>
          <div>Status: {(curr.is_active ?? m.is_active) ? 'Active' : 'Disabled'}</div>
          {curr.max_workload != null && <div>Max Workload: {curr.max_workload}</div>}
        </div>
      ),
    });
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading accessors…</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <span aria-hidden>🧑‍⚖️</span>
        <span>Accessors</span>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Accessors"
            className="px-3 py-2 border rounded-md text-sm w-72"
          />
        </div>
        <button
          onClick={openAdd}
          className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
        >
          + Add by Membership ID
        </button>
      </div>

      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white border rounded-xl">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading accessors…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Membership No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const m = a.member || {};
                const name = `${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim() || '-';
                const email = m.email || '-';
                const active = (a.is_active ?? m.is_active) ? true : false;
                return (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">{m.membership_no || '-'}</td>
                    <td className="p-3">{name}</td>
                    <td className="p-3">{email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => viewItem(a.id)}
                        className="px-2 py-1 text-xs border rounded bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td className="p-3 text-xs text-gray-500" colSpan={5}>
                    No accessors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={view.open}
        title={view.title}
        onClose={() => setView({ open: false, title: '' })}
      >
        {view.body}
      </Modal>

      <Modal
        open={confirm.open}
        title="Confirm New Accessor"
        onClose={() => setConfirm({ open: false, member: null })}
      >
        {confirm.member && (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <div className="font-medium">Member</div>
              <div>
                {`${confirm.member.title || ''} ${confirm.member.surname || ''} ${confirm.member.firstname || ''}`.trim() ||
                  confirm.member.name ||
                  confirm.member.email}
              </div>
              <div className="text-xs text-gray-500">
                Membership No: {confirm.member.membership_no || confirm.member.membership_id || confirm.member.member_id || '-'}
              </div>
              {confirm.member.email && (
                <div className="text-xs text-gray-500">{confirm.member.email}</div>
              )}
            </div>

            {confirm.error && (
              <div className="text-xs text-red-600">{confirm.error}</div>
            )}
            {confirm.message && (
              <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                {confirm.message}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirm({ open: false, member: null })}
                className="px-3 py-1.5 text-xs border rounded-md bg-white hover:bg-gray-50"
                disabled={confirm.submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmCreateAccessor()}
                className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white disabled:opacity-60 flex items-center gap-2"
                disabled={confirm.submitting}
              >
                {confirm.submitting && (
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Confirm Add</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={info.open}
        title={info.title}
        onClose={() => setInfo({ open: false, title: '' })}
      >
        {info.message}
      </Modal>

      <AddAccessorByMemberModal
        open={addOpen}
        lookup={lookup}
        setLookup={setLookup}
        onSearch={searchMembers}
        onSelectMember={handleSelectMember}
        onClose={() => setAddOpen(false)}
        loading={lookupLoading}
      />
      </div>
    </div>
  );
};

export default AdminAccessors;

export type LookupState = { q: string; results: any[]; error?: string };

const AddAccessorByMemberModal: React.FC<{
  open: boolean;
  lookup: LookupState;
  setLookup: (v: LookupState) => void;
  onSearch: (q: string) => void;
  onSelectMember: (m: any) => void;
  onClose: () => void;
  loading?: boolean;
}> = ({ open, lookup, setLookup, onSearch, onSelectMember, onClose, loading }) => {
  if (!open) return null;

  return (
    <Modal
      open={true}
      title="Add Accessor by Membership ID"
      onClose={onClose}
      confirmText={undefined}
      panelClassName="max-w-5xl w-[95vw]"
      bodyClassName="!text-inherit"
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Membership ID</div>
          <input
            autoFocus
            value={lookup.q}
            onChange={(e) => {
              const val = e.target.value;
              setLookup({ ...lookup, q: val });
              void onSearch(val);
            }}
            placeholder="e.g. M-2025-1234"
            className="w-full px-3 py-2 border rounded-md text-sm"
            disabled={loading}
          />
          {lookup.error && (
            <div className="text-xs text-red-600 mt-1">{lookup.error}</div>
          )}
        </div>

        <div className="border-t pt-3 text-sm text-gray-700">
          {loading && (
            <div className="text-xs text-gray-500 mb-2">Searching members…</div>
          )}

          {!loading && lookup.results.length === 0 && lookup.q.trim() && !lookup.error && (
            <div className="text-xs text-gray-500">No members found.</div>
          )}

          {lookup.results.length > 0 && (
            <div className="max-h-60 overflow-auto border rounded-md">
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
                  {lookup.results.map((m: any) => (
                    <tr key={m.id} className="border-t">
                      <td className="p-2">{m.membership_no || m.membershipNo || '-'}</td>
                      <td className="p-2">
                        {`${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim() || m.name}
                      </td>
                      <td className="p-2">{m.email}</td>
                      <td className="p-2">
                        <button
                          onClick={() => onSelectMember(m)}
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded disabled:opacity-60"
                          disabled={loading}
                        >
                          Add as Accessor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
