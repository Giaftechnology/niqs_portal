import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface LogbookRow {
  id: string;
  logbook_diet_id?: string;
  status?: string;
  stage?: number | string;
  user_id?: string;
  student_name?: string;
  student_email?: string;
}

const AssessorDietLogbooks: React.FC = () => {
  const navigate = useNavigate();
  const { dietId } = useParams();
  const [logbooks, setLogbooks] = useState<LogbookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [dietTitle, setDietTitle] = useState<string>('');
  const [dietRange, setDietRange] = useState<string>('');
  const [sortBy, setSortBy] = useState<'student' | 'email' | 'stage' | 'status'>('student');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const load = async () => {
      if (!dietId) return;
      setLoading(true);
      setError(null);
      try {
        // Load logbooks for this assessor and diet using the token-based endpoint
        const res = await apiFetch<any>(
          `/api/logbook-diets/assessor/my-diets/${encodeURIComponent(String(dietId))}/logbooks`,
        );
        const data = res?.data || res || [];
        const arr: any[] = Array.isArray(data) ? data : Array.isArray((data as any)?.logbooks) ? (data as any).logbooks : [];
        const mapped: LogbookRow[] = arr.map((lb: any) => ({
          id: String(lb.id),
          logbook_diet_id: lb.logbook_diet_id ? String(lb.logbook_diet_id) : undefined,
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
        setLogbooks(mapped);

        // Load diet details for header context
        try {
          const dietRes = await apiFetch<any>(`/api/logbook-diets/${encodeURIComponent(String(dietId))}`);
          const payload = dietRes?.data ? (Array.isArray(dietRes.data) ? dietRes.data[0] : dietRes.data) : dietRes;
          const diet = payload?.diet ? payload.diet : payload;
          if (diet) {
            setDietTitle(diet.title || '');
            if (diet.start_date || diet.end_date) {
              setDietRange(`${diet.start_date || ''} – ${diet.end_date || ''}`.trim());
            }
          }
        } catch {
          // ignore diet header errors
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load logbooks for this diet');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [dietId]);

  const filteredLogbooks = useMemo(() => {
    let base = [...logbooks];
    const term = q.trim().toLowerCase();
    if (term) {
      base = base.filter((lb) => {
        const name = lb.student_name || '';
        const email = lb.student_email || '';
        const status = lb.status || '';
        return `${name} ${email} ${status}`.toLowerCase().includes(term);
      });
    }

    base.sort((a, b) => {
      if (sortBy === 'student') {
        const an = (a.student_name || '').toLowerCase();
        const bn = (b.student_name || '').toLowerCase();
        return an.localeCompare(bn);
      }
      if (sortBy === 'email') {
        const ae = (a.student_email || '').toLowerCase();
        const be = (b.student_email || '').toLowerCase();
        return ae.localeCompare(be);
      }
      if (sortBy === 'stage') {
        const as = Number(a.stage ?? 0);
        const bs = Number(b.stage ?? 0);
        return as - bs;
      }
      if (sortBy === 'status') {
        const as = String(a.status || '').toLowerCase();
        const bs = String(b.status || '').toLowerCase();
        return as.localeCompare(bs);
      }
      return 0;
    });

    if (sortDir === 'desc') {
      base.reverse();
    }

    return base;
  }, [logbooks, q, sortBy, sortDir]);

  const totals = useMemo(() => {
    const assigned = logbooks.length;
    const accessed = logbooks.filter((lb) => String(lb.status || '').toLowerCase() === 'graded').length;
    const pending = Math.max(0, assigned - accessed);
    return { assigned, accessed, pending };
  }, [logbooks]);

  const handleSort = (field: 'student' | 'email' | 'stage' | 'status') => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="relative space-y-4">
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading assessor logbooks…</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Assessor Assignments</h1>
          <p className="text-xs text-gray-500">Overview of logbooks assigned to assessors and their assessment progress.</p>
          {dietTitle && (
            <p className="mt-1 text-xs text-gray-600">
              Diet: <span className="font-medium">{dietTitle}</span>
              {dietRange && <span className="ml-1">({dietRange})</span>}
            </p>
          )}
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
        <div className="p-3 text-xs text-gray-500">
          {dietId && filteredLogbooks.length === 0 && !loading && 'No logbooks for this diet yet.'}
        </div>
        <div className="p-3 pt-0 overflow-x-auto">
          {loading ? (
            <div className="text-sm text-gray-600">Loading logbooks…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:underline"
                      onClick={() => handleSort('student')}
                    >
                      Student
                      <span className="text-[10px] text-gray-400">
                        {sortBy === 'student' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                  <th className="p-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:underline"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      <span className="text-[10px] text-gray-400">
                        {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                  <th className="p-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:underline"
                      onClick={() => handleSort('stage')}
                    >
                      Stage
                      <span className="text-[10px] text-gray-400">
                        {sortBy === 'stage' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                  <th className="p-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:underline"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <span className="text-[10px] text-gray-400">
                        {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogbooks.map((lb) => (
                  <tr key={lb.id} className="border-t">
                    <td className="p-2">{lb.student_name || '-'}</td>
                    <td className="p-2">{lb.student_email || '-'}</td>
                    <td className="p-2">{lb.stage ?? '-'}</td>
                    <td className="p-2">
                      {(() => {
                        const sRaw = lb.status || 'in_progress';
                        const s = String(sRaw).toLowerCase();
                        let cls = 'bg-gray-100 text-gray-700';
                        if (s === 'graded' || s === 'passed') cls = 'bg-emerald-50 text-emerald-700';
                        if (s === 'failed' || s === 'rejected') cls = 'bg-red-50 text-red-700';
                        if (s === 'in_progress' || s === 'submitted') cls = 'bg-amber-50 text-amber-700';
                        return (
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
                            {sRaw}
                          </span>
                        );
                      })()}
                    </td>
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
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessorDietLogbooks;
