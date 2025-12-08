import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api';

interface LogbookMe {
  id: string;
  stage?: number;
  status?: string;
  supervisor?: { id: number; name: string; email: string; membership_no?: string } | null;
  created_at?: string;
  updated_at?: string;
}

const MyLogbook: React.FC = () => {
  const [item, setItem] = useState<LogbookMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supQ, setSupQ] = useState('');
  const [supLoading, setSupLoading] = useState(false);
  const [supError, setSupError] = useState<string | null>(null);
  const [supResults, setSupResults] = useState<any[]>([]);
  const [supSelected, setSupSelected] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>('/api/logbook/me');
        const raw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];
        const obj = Array.isArray(raw) && raw.length ? raw[0] : null;
        if (obj && typeof obj === 'object') {
          setItem({
            id: String(obj.id),
            stage: obj.stage,
            status: obj.status,
            supervisor: obj.supervisor || null,
            created_at: obj.created_at,
            updated_at: obj.updated_at,
          });
        } else {
          setItem(null);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load logbook');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const searchSupervisor = async () => {
    const term = supQ.trim();
    if (!term) { setSupResults([]); setSupError(null); return; }
    const suffix = term.toUpperCase().startsWith('M-') ? term.toUpperCase().slice(2) : term.replace(/^M-/i, '');
    if (suffix.length < 3) return;
    setSupLoading(true); setSupError(null);
    try {
      const res = await apiFetch<any>(`/api/members/search/M-${encodeURIComponent(suffix)}`);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSupResults(list.slice(0, 10));
    } catch (e: any) {
      setSupError(e?.message || 'Search failed');
      setSupResults([]);
    } finally {
      setSupLoading(false);
    }
  };

  const requestSupervisor = async (member: any) => {
    // TODO: wire to backend endpoint that creates a supervisor request for this logbook
    // Example: await apiFetch('/api/logbook/request-supervisor', { method: 'POST', body: { logbook_id: item?.id, member_id: member.id } });
    setSupSelected(member);
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">My Logbook</div>
      {loading && (<div className="p-3 border rounded-md bg-gray-50 text-gray-700 text-sm">Loading…</div>)}
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      {!loading && !item && !error && (
        <div className="p-3 border rounded-md bg-white text-sm">
          <div className="font-medium mb-1">No logbook assigned</div>
          <div className="text-gray-600">You do not currently have an active logbook.</div>
        </div>
      )}
      {item && !loading && (
        <div className="bg-white border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">Current Logbook</div>
            <div className="text-xs text-gray-500">ID: {item.id}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div><span className="text-gray-500">Stage:</span> {item.stage ?? '-'}</div>
              <div><span className="text-gray-500">Status:</span> {item.status || '-'}</div>
              <div><span className="text-gray-500">Created:</span> {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-gray-700">Supervisor</div>
              <div><span className="text-gray-500">Name:</span> {item.supervisor?.name || '-'}</div>
              <div><span className="text-gray-500">Email:</span> {item.supervisor?.email || '-'}</div>
              <div><span className="text-gray-500">Membership No:</span> {item.supervisor?.membership_no || '-'}</div>
            </div>
          </div>
          {/* Supervisor request (search by membership ID) */}
          {!item.supervisor && (
            <div className="mt-4 border-t pt-3 space-y-2">
              <div className="font-medium text-gray-700">Request Supervisor</div>
              <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                <input
                  value={supQ}
                  onChange={e=>setSupQ(e.target.value)}
                  onBlur={()=>{ /* optional debounce */ }}
                  placeholder="Enter membership no (e.g. M-1234)"
                  className="px-3 py-2 border rounded-md text-sm w-full md:w-64"
                />
                <button
                  type="button"
                  onClick={searchSupervisor}
                  disabled={supLoading || !supQ.trim()}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  {supLoading ? 'Searching…' : 'Search'}
                </button>
              </div>
              {supError && <div className="text-xs text-red-600">{supError}</div>}
              {supSelected && (
                <div className="text-xs bg-green-50 border border-green-200 rounded-md p-2">
                  Requested supervisor: {supSelected.title} {supSelected.surname} {supSelected.firstname} ({supSelected.membership_no})
                </div>
              )}
              {!!supResults.length && !supSelected && (
                <div className="max-h-48 overflow-y-auto border rounded-md text-xs">
                  {supResults.map(m => (
                    <div key={m.id} className="flex items-center justify-between gap-2 border-b last:border-b-0 px-2 py-1">
                      <div>
                        <div className="font-medium">{m.title} {m.surname} {m.firstname}</div>
                        <div className="text-gray-600">{m.membership_no} • {m.email}</div>
                      </div>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                        onClick={()=>requestSupervisor(m)}
                      >
                        Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLogbook;
