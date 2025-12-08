import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api';

const ApplicationsDashboard: React.FC = () => {
  const [stats, setStats] = useState<{ total?: number; pending?: number; acknowledged?: number; approved?: number; rejected?: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/probationer/applications/stats');
      const data = res?.data && typeof res.data === 'object' ? res.data : res;
      setStats({
        total: Number(data?.total ?? 0),
        pending: Number(data?.pending ?? 0),
        acknowledged: Number(data?.acknowledged ?? 0),
        approved: Number(data?.approved ?? 0),
        rejected: Number(data?.rejected ?? 0),
      });
    } catch (e: any) { setError(e?.message || 'Failed to load stats'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">Applications Dashboard</div>
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat title="Total" value={loading ? '…' : String(stats.total ?? 0)} />
        <Stat title="Pending" value={loading ? '…' : String(stats.pending ?? 0)} />
        <Stat title="Acknowledged" value={loading ? '…' : String(stats.acknowledged ?? 0)} />
        <Stat title="Approved" value={loading ? '…' : String(stats.approved ?? 0)} />
        <Stat title="Rejected" value={loading ? '…' : String(stats.rejected ?? 0)} />
      </div>
      <div>
        <button onClick={fetchStats} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
      </div>
    </div>
  );
};

const Stat = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white border rounded-lg p-4">
    <div className="text-[11px] text-gray-500">{title}</div>
    <div className="text-lg font-semibold text-gray-800">{value}</div>
  </div>
);

export default ApplicationsDashboard;
