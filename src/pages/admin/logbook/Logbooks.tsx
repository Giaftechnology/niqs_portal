import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../utils/api';

interface LogbookItem {
  id: string;
  probationer_name?: string;
  probationer_email?: string;
  stage?: number;
  status?: string;
  supervisor?: { id: number; name: string; email: string } | null;
  created_at?: string;
}

const AdminLogbooks: React.FC = () => {
  const [items, setItems] = useState<LogbookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(x => [x.probationer_name, x.probationer_email, x.supervisor?.name, x.supervisor?.email].filter(Boolean).some(v => String(v).toLowerCase().includes(s)));
  }, [items, q]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>('/api/logbook');
        const raw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];
        setItems(raw.map((x: any) => ({
          id: String(x.id),
          probationer_name: x.user?.name,
          probationer_email: x.user?.email,
          stage: x.stage,
          status: x.status,
          supervisor: x.supervisor || null,
          created_at: x.created_at,
        })));
      } catch (e: any) {
        setError(e?.message || 'Failed to load logbooks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="relative space-y-4">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading logbooks…</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Logbooks</div>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="px-3 py-2 border rounded-md text-sm w-64" />
      </div>
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Probationer</th>
              <th className="p-3">Email</th>
              <th className="p-3">Stage</th>
              <th className="p-3">Status</th>
              <th className="p-3">Supervisor</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td className="p-3" colSpan={6}>Loading…</td></tr>)}
            {!loading && filtered.map(x => (
              <tr key={x.id} className="border-t">
                <td className="p-3">{x.probationer_name || '-'}</td>
                <td className="p-3">{x.probationer_email || '-'}</td>
                <td className="p-3">{x.stage ?? '-'}</td>
                <td className="p-3">{x.status || '-'}</td>
                <td className="p-3">{x.supervisor?.name || '-'}</td>
                <td className="p-3">{x.created_at ? new Date(x.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (<tr><td className="p-3" colSpan={6}>No logbooks</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogbooks;
