import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface DietRow {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

interface LogbookRow {
  id: string;
  logbook_diet_id?: string;
  status?: string;
  stage?: number | string;
  user_id?: string;
  student_name?: string;
  student_email?: string;
}

const AssessorAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [diets, setDiets] = useState<DietRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load diets assigned to this assessor
  useEffect(() => {
    const loadDiets = async () => {
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>('/api/logbook-diets/assessor/my-diets');
        const payload = res?.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : res;
        const arr: any[] = Array.isArray(payload?.diets)
          ? payload.diets
          : Array.isArray(res?.diets)
            ? res.diets
            : Array.isArray(payload)
              ? payload
              : [];
        const mapped: DietRow[] = arr.map((d: any) => ({
          id: String(d.id),
          title: d.title,
          start_date: d.start_date,
          end_date: d.end_date,
          status: d.status,
        }));
        setDiets(mapped);
      } catch (e: any) {
        setError(e?.message || 'Failed to load diets for this assessor');
      } finally {
        setLoading(false);
      }
    };
    void loadDiets();
  }, []);

  const dietStats = useMemo(() => {
    const total = diets.length;
    const closed = diets.filter((d) => String(d.status || '').toLowerCase() === 'closed').length;
    const active = diets.filter((d) => {
      const s = String(d.status || '').toLowerCase();
      return s === 'active' || s === 'assessment_ongoing';
    }).length;
    return { total, closed, active };
  }, [diets]);

  return (
    <div className="relative space-y-4">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading assessor diets</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Assessor Diets</h1>
          <p className="text-xs text-gray-500">Diets currently assigned to this assessor.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">Assigned Diets</div>
          <div className="text-lg font-semibold text-gray-800">{dietStats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">Closed Diets</div>
          <div className="text-lg font-semibold text-gray-800">{dietStats.closed}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">Active Diets</div>
          <div className="text-lg font-semibold text-gray-800">{dietStats.active}</div>
        </div>
      </div>

      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}

      {/* Diet list */}
      <div className="bg-white border rounded-xl">
        <div className="p-3 text-sm font-medium border-b flex items-center justify-between">
          <span>Diets Assigned to This Assessor</span>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Title</th>
                <th className="p-2">Start Date</th>
                <th className="p-2">End Date</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {diets.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{d.title}</td>
                  <td className="p-2">{d.start_date}</td>
                  <td className="p-2">{d.end_date}</td>
                  <td className="p-2">
                    {(() => {
                      const sRaw = d.status || '-';
                      const s = String(sRaw).toLowerCase();
                      let cls = 'bg-gray-100 text-gray-700';
                      if (s === 'active' || s === 'assessment_ongoing') cls = 'bg-emerald-50 text-emerald-700';
                      if (s === 'closed') cls = 'bg-red-50 text-red-700';
                      if (s === 'pending' || s === 'approved') cls = 'bg-amber-50 text-amber-700';
                      return (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
                          {sRaw || '-'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/logbook/assessor-assignments/${encodeURIComponent(String(d.id))}`)}
                      className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      View Logbooks
                    </button>
                  </td>
                </tr>
              ))}
              {diets.length === 0 && !loading && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={5}>No diets found for this assessor.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessorAssignments;
