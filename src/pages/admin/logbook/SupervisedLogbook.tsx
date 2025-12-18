import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, TrendingUp } from 'lucide-react';
import { apiFetch } from '../../../utils/api';
import WeekDropdown from '../../../components/WeekDropdown';
import { Day, DAYS, WEEKS } from '../../../utils/logbook';

interface Entry {
  id: string;
  day: number;
  entry_date?: string;
  activity?: string;
  hours?: number | string;
  status?: string;
}

interface WeekEntriesResponse {
  logbook_id: string;
  week: number;
  entries: Entry[];
  total_entries?: number;
  is_complete?: boolean;
}

const NUMBER_TO_DAY: Record<number, Day> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
};

const SupervisedLogbook: React.FC = () => {
  const navigate = useNavigate();
  const { logbookId = '' } = useParams();
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entriesByDay, setEntriesByDay] = useState<Record<Day, Entry | null>>({
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
  });
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentMembership, setStudentMembership] = useState<string>('');
  const [levelLabel, setLevelLabel] = useState<string>('Level 1');
  const [totalWeeks, setTotalWeeks] = useState<number>(52);
  const [weeksWithEntries, setWeeksWithEntries] = useState<Record<number, boolean>>({});

  const weeks = useMemo(() => WEEKS.slice(0, totalWeeks), [totalWeeks]);

  const loadWeek = async (week: number) => {
    if (!logbookId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<WeekEntriesResponse | any>(
        `/api/logbook/${encodeURIComponent(logbookId)}/entries/week/${week}`,
      );
      const payload: WeekEntriesResponse = (res && (res as any).entries)
        ? res as WeekEntriesResponse
        : (res && (res as any).data && (res as any).data.entries)
          ? (res as any).data as WeekEntriesResponse
          : res as WeekEntriesResponse;

      const map: Record<Day, Entry | null> = {
        Monday: null,
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null,
      };
      (payload.entries || []).forEach((e) => {
        const d = NUMBER_TO_DAY[e.day];
        if (d) map[d] = e;
      });
      setEntriesByDay(map);

      // track how many weeks exist if backend exposes size
      const sizeFromPayload = Number((payload as any).size || (payload as any).logbook?.size || 0);
      if (sizeFromPayload > 0 && sizeFromPayload <= 52) {
        setTotalWeeks(sizeFromPayload);
      }

      // remember which weeks have entries
      setWeeksWithEntries((prev) => ({
        ...prev,
        [week]: (payload.entries || []).length > 0,
      }));

      // try to extract basic student info and level if present on response
      const anyEntry = (payload.entries || [])[0] as any;
      if (anyEntry && anyEntry.member) {
        const m = anyEntry.member;
        setStudentName(m.name || `${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim() || m.email || '');
        setStudentEmail(m.email || '');
        setStudentMembership(m.membership_no || m.membership_id || m.member_id || '');
      }
      if ((payload as any).logbook && (payload as any).logbook.stage) {
        setLevelLabel(`Level ${(payload as any).logbook.stage}`);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load entries for this week');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!logbookId) return;
    void loadWeek(selectedWeek);
  }, [logbookId, selectedWeek]);

  const approveEntry = async (entry: Entry) => {
    if (!entry?.id) return;
    setApprovingId(entry.id);
    try {
      await apiFetch(`/api/logbook/entries/approve/${encodeURIComponent(entry.id)}`, {
        method: 'POST',
      });
      setEntriesByDay((prev) => {
        const next = { ...prev };
        (Object.keys(next) as Day[]).forEach((d) => {
          if (next[d]?.id === entry.id) {
            next[d] = { ...(next[d] as Entry), status: 'approved' };
          }
        });
        return next;
      });
    } catch (e: any) {
      // optional: surface error
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100 p-4 sm:p-6">
      <div className="flex gap-6">
        {/* Left sidebar: current level, student info, weeks */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} color="#6366f1" />
              <h3 className="text-sm font-semibold text-gray-800">Current Level</h3>
            </div>
            <h2 className="text-4xl font-bold text-indigo-500 mt-2">{levelLabel}</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Student Details</h3>
            <div className="text-sm font-medium text-gray-900 truncate mb-1">{studentName || 'Student'}</div>
            {(studentMembership || studentEmail) && (
              <div className="text-xs text-gray-600 break-all">
                {studentMembership && <span className="mr-2">{studentMembership}</span>}
                {studentEmail}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-800 mb-3">Weeks</h3>
            <div className="grid grid-cols-6 gap-2">
              {weeks.map((w) => {
                const filled = !!weeksWithEntries[w];
                const isSelected = selectedWeek === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeek(w)}
                    className={`w-full py-1 text-xs rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-purple-800 text-white border-purple-800'
                        : filled
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            ← Back to Supervisor Requests
          </button>
        </div>

        {/* Right: weekly entries */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Week Selection</h2>
            <WeekDropdown value={selectedWeek} onChange={setSelectedWeek} weeks={weeks} size="md" />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {loading && (
              <div className="text-sm text-gray-500">Loading entries…</div>
            )}
            {error && !loading && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && (
              <div className="space-y-4">
                {DAYS.map((day) => {
                  const e = entriesByDay[day];
                  const status = (e?.status || 'pending').toLowerCase();
                  const isApproved = status === 'approved';
                  const isPending = status === 'pending';
                  return (
                    <div key={day} className="p-3 rounded-lg bg-gray-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-gray-600">{day}</label>
                        {e && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] rounded-full border ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isPending
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {isApproved && 'Approved'}
                            {isPending && 'Pending'}
                            {!isApproved && !isPending && (e.status || 'Status')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {e?.entry_date && new Date(e.entry_date).toLocaleString()} • {e?.hours ? `${e.hours} hrs` : ''}
                      </div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap min-h-[64px]">
                        {e?.activity || '— No entry for this day —'}
                      </div>
                      {e && isPending && (
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void approveEntry(e)}
                            disabled={approvingId === e.id}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs hover:bg-emerald-600 disabled:opacity-60 flex items-center gap-2"
                          >
                            {approvingId === e.id && (
                              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Approve</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisedLogbook;
