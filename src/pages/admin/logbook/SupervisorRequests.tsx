import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, API_BASE } from '../../../utils/api';

interface SupervisorRequest {
  id: string;
  logbook_id?: string;
  student_name?: string;
  student_email?: string;
  student_avatar_url?: string;
  message?: string;
  status?: string;
  created_at?: string;
}

const normalizeRequests = (raw: any): SupervisorRequest[] => {
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.data?.data)
        ? raw.data.data
        : [];
  const toAbsoluteUrl = (p?: string | null): string => {
    const v = String(p || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const base = API_BASE || '';
    if (!base) return v;
    if (v.startsWith('/')) return `${base}${v}`;
    return `${base}/${v}`;
  };

  return arr.map((x: any) => ({
    id: String(x.id ?? x.uuid ?? x.request_id ?? ''),
    logbook_id: x.logbook_id ?? x.logbook?.id,
    student_name: x.student_name ?? x.member?.name ?? x.student?.name ?? x.user?.name,
    student_email: x.student_email ?? x.member?.email ?? x.student?.email ?? x.user?.email,
    student_avatar_url: toAbsoluteUrl(x.member?.pro_pic ?? x.student?.pro_pic ?? x.user?.pro_pic),
    message: x.message,
    status: x.status,
    created_at: x.created_at ?? x.createdAt,
  })).filter((x: SupervisorRequest) => x.id);
};

const SupervisorRequests: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SupervisorRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyMap, setBusyMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/logbook/supervisor-request');
      setItems(normalizeRequests(res));
    } catch (e: any) {
      setError(e?.message || 'Failed to load supervisor requests');
    } finally {
      setLoading(false);
    }
  };
  const loadCounts = async () => {
    try {
      const [pRes, aRes, rRes] = await Promise.all([
        apiFetch<any>('/api/logbook/supervisor-request/pending'),
        apiFetch<any>('/api/logbook/supervisor-request/accepted'),
        apiFetch<any>('/api/logbook/supervisor-request/rejected'),
      ]);
      setPendingCount(normalizeRequests(pRes).length);
      setAcceptedCount(normalizeRequests(aRes).length);
      setRejectedCount(normalizeRequests(rRes).length);
    } catch {
      // ignore count errors; they are only for dashboard display
    }
  };

  useEffect(() => {
    void load();
    void loadCounts();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((x) => (x.status || '').toLowerCase() === filter);
  }, [items, filter]);

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    setBusyMap((m) => ({ ...m, [id]: true }));
    try {
      await apiFetch(`/api/logbook/supervisor-request/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: { status },
      });
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      // update dashboard counts optimistically
      setPendingCount((c) => (status === 'accepted' || status === 'rejected' ? Math.max(0, c - 1) : c));
      if (status === 'accepted') setAcceptedCount((c) => c + 1);
      if (status === 'rejected') setRejectedCount((c) => c + 1);
      try {
        const ev = new CustomEvent('global-alert', {
          detail: {
            title: 'Success',
            message: status === 'accepted' ? 'Request accepted.' : 'Request rejected.',
          },
        });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } catch (e: any) {
      const msg = e?.message || 'Failed to update request';
      setError(msg);
      try {
        const ev = new CustomEvent('global-alert', {
          detail: { title: 'Error', message: msg },
        });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
    } finally {
      setBusyMap((m) => ({ ...m, [id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Supervisor Requests</h1>
            <p className="text-xs text-gray-500">Dashboard of logbook supervision requests sent to you.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-2 py-1 border rounded-md text-xs bg-white"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`text-left rounded-xl border p-4 bg-white hover:bg-amber-50 transition-colors ${
              filter === 'pending' ? 'border-amber-400' : 'border-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Pending Requests</div>
            <div className="text-2xl font-semibold text-amber-600">{pendingCount}</div>
          </button>
          <button
            type="button"
            onClick={() => setFilter('accepted')}
            className={`text-left rounded-xl border p-4 bg-white hover:bg-emerald-50 transition-colors ${
              filter === 'accepted' ? 'border-emerald-400' : 'border-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Accepted</div>
            <div className="text-2xl font-semibold text-emerald-600">{acceptedCount}</div>
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`text-left rounded-xl border p-4 bg-white hover:bg-red-50 transition-colors ${
              filter === 'rejected' ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Rejected</div>
            <div className="text-2xl font-semibold text-red-600">{rejectedCount}</div>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Requested</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="px-3 py-3" colSpan={6}>Loading…</td></tr>
              )}
              {!loading && filtered.map((r) => {
                const status = (r.status || 'pending').toLowerCase();
                const busy = !!busyMap[r.id];
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="px-3 py-2">
                      <span className="text-sm text-gray-800">{r.student_name || '-'}</span>
                    </td>
                    <td className="px-3 py-2">{r.student_email || '-'}</td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="text-xs text-gray-700 whitespace-pre-wrap">{r.message || '-'}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {status === 'accepted' && 'Accepted'}
                        {status === 'rejected' && 'Rejected'}
                        {status === 'pending' && 'Pending'}
                        {!['accepted', 'rejected', 'pending'].includes(status) && (r.status || 'Pending')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        {status === 'accepted' && r.logbook_id && (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/logbook/supervised/${encodeURIComponent(r.logbook_id || '')}`)}
                            className="px-2 py-1 text-xs rounded-md bg-indigo-500 text-white hover:bg-indigo-600"
                          >
                            View
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy || status === 'accepted'}
                          onClick={() => updateStatus(r.id, 'accepted')}
                          className="px-2 py-1 text-xs rounded-md bg-emerald-500 text-white disabled:opacity-60 flex items-center gap-1"
                        >
                          {busy && (
                            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          disabled={busy || status === 'rejected'}
                          onClick={() => updateStatus(r.id, 'rejected')}
                          className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 border border-red-200 disabled:opacity-60 flex items-center gap-1"
                        >
                          {busy && (
                            <span className="inline-block w-3 h-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                          )}
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td className="px-3 py-3 text-sm text-gray-500" colSpan={6}>No supervisor requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupervisorRequests;
