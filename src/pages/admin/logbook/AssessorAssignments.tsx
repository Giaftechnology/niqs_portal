import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

const ASSESSOR_ID = '019b1c4f-9367-739d-bf77-7f69ebd80cf8';

interface LogbookRow {
  id: string;
  status?: string;
  stage?: number | string;
  user_id?: string;
  student_name?: string;
  student_email?: string;
}

const AssessorAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LogbookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>(`/api/assessors/${encodeURIComponent(ASSESSOR_ID)}/logbooks`);
        const data = res?.data || res || [];
        const arr: any[] = Array.isArray(data) ? data : [];
        const mapped: LogbookRow[] = arr.map((lb: any) => ({
          id: String(lb.id),
          status: lb.status,
          stage: lb.stage,
          user_id: lb.user_id,
          student_name:
            lb.student_name ||
            (lb.application
              ? `${lb.application.title || ''} ${lb.application.surname || ''} ${lb.application.other_names || ''}`.trim()
              : ''),
          student_email: lb.student_email || lb.application?.email || '',
        }));
        setItems(mapped);
      } catch (e: any) {
        setError(e?.message || 'Failed to load assessor logbooks');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((lb) => {
      const name = lb.student_name || '';
      const email = lb.student_email || '';
      const status = lb.status || '';
      return `${name} ${email} ${status}`.toLowerCase().includes(term);
    });
  }, [items, q]);

  const totals = useMemo(() => {
    const assigned = items.length;
    const accessed = items.filter((lb) => String(lb.status || '').toLowerCase() === 'graded').length;
    const pending = Math.max(0, assigned - accessed);
    return { assigned, accessed, pending };
  }, [items]);

  return (
    <div className="relative space-y-4">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading assessor assignments…</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Assessor Assignments</h1>
          <p className="text-xs text-gray-500">Overview of logbooks assigned to assessors and their assessment progress.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50"
        >
           Back
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">Assigned Logbooks</div>
          <div className="text-lg font-semibold text-gray-800">{totals.assigned}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">Accessed / Graded</div>
          <div className="text-lg font-semibold text-gray-800">{totals.accessed}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-[11px] text-gray-500">Pending</div>
          <div className="text-lg font-semibold text-gray-800">{totals.pending}</div>
        </div>
      </div>

      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}

      <div className="bg-white border rounded-xl">
        <div className="p-3 flex items-center justify-between text-sm border-b">
          <span className="font-medium">Logbooks Assigned to This Assessor</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by student name, email or status"
            className="px-2 py-1 border rounded text-xs w-64"
          />
        </div>
        <div className="p-3 overflow-x-auto">
          {loading ? (
            <div className="text-sm text-gray-600">Loading logbooks…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Student</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Stage</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lb) => (
                  <tr key={lb.id} className="border-t">
                    <td className="p-2">{lb.student_name || '-'}</td>
                    <td className="p-2">{lb.student_email || '-'}</td>
                    <td className="p-2">{lb.stage ?? '-'}</td>
                    <td className="p-2">{lb.status || 'in_progress'}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/logbook/assessor-view/${encodeURIComponent(String(lb.id))}`)}
                        className="px-2 py-1 text-xs border rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td className="p-2 text-xs text-gray-500" colSpan={5}>No logbooks found for this assessor.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessorAssignments;
