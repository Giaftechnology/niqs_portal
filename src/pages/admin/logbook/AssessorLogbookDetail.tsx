import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { apiFetch } from '../../../utils/api';
import WeekDropdown from '../../../components/WeekDropdown';
import Modal from '../../../components/Modal';
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

const AssessorLogbookDetail: React.FC = () => {
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
  const [studentName, setStudentName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentMembership, setStudentMembership] = useState<string>('');
  const [levelLabel, setLevelLabel] = useState<string>('Level 1');
  const [totalWeeks, setTotalWeeks] = useState<number>(52);
  const [weeksWithEntries, setWeeksWithEntries] = useState<Record<number, boolean>>({});
  const [logbookStatus, setLogbookStatus] = useState<string | null>(null);

  // assessment state
  const [details, setDetails] = useState<number | ''>('');
  const [practicality, setPracticality] = useState<number | ''>('');
  const [correctness, setCorrectness] = useState<number | ''>('');
  const [creativity, setCreativity] = useState<number | ''>('');
  const [presentation, setPresentation] = useState<number | ''>('');
  const [comment, setComment] = useState<string>('');
  const [result, setResult] = useState<'pass' | 'fail' | ''>('');
  const [assessing, setAssessing] = useState(false);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isAlreadyGraded = useMemo(() => {
    const s = String(logbookStatus || '').trim().toLowerCase();
    // Treat these statuses as "already graded"
    return s === 'graded' || s === 'passed' || s === 'assessed' || s === 'completed';
  }, [logbookStatus]);

  const weeks = useMemo(() => WEEKS.slice(0, totalWeeks), [totalWeeks]);

  const loadWeek = useCallback(async (week: number) => {
    if (!logbookId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<WeekEntriesResponse | any>(
        `/api/logbook/${encodeURIComponent(logbookId)}/entries/week/${week}`,
      );
      const payload: WeekEntriesResponse = (res && (res as any).entries)
        ? (res as WeekEntriesResponse)
        : (res && (res as any).data && (res as any).data.entries)
          ? ((res as any).data as WeekEntriesResponse)
          : (res as WeekEntriesResponse);

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

      const sizeFromPayload = Number((payload as any).size || (payload as any).logbook?.size || 0);
      if (sizeFromPayload > 0 && sizeFromPayload <= 52) {
        setTotalWeeks(sizeFromPayload);
      }

      setWeeksWithEntries((prev) => ({
        ...prev,
        [week]: (payload.entries || []).length > 0,
      }));

      const anyEntry = (payload.entries || [])[0] as any;
      if (anyEntry && anyEntry.member) {
        const m = anyEntry.member;
        setStudentName(m.name || `${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim() || m.email || '');
        setStudentEmail(m.email || '');
        setStudentMembership(m.membership_no || m.membership_id || m.member_id || '');
      }
      if ((payload as any).logbook) {
        const lb = (payload as any).logbook;
        if (lb.stage) {
          setLevelLabel(`Level ${lb.stage}`);
        }
        if (lb.status) {
          setLogbookStatus(String(lb.status));
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load entries for this week');
    } finally {
      setLoading(false);
    }
  }, [logbookId]);

  useEffect(() => {
    if (!logbookId) return;
    void loadWeek(selectedWeek);
  }, [logbookId, selectedWeek, loadWeek]);

  // On initial load, fetch the logbook object directly so we know its overall status
  useEffect(() => {
    if (!logbookId) return;
    let ignore = false;
    const loadStatus = async () => {
      try {
        const res = await apiFetch<any>(`/api/logbook/${encodeURIComponent(logbookId)}`);
        // Normalise a few common API response shapes
        const root = res?.data ?? res;
        const data = (root && (root.data ?? root)) || root;
        const status =
          (data && (data.status || data.logbook_status)) ||
          (data && (data.logbook?.status || data.logbook?.logbook_status)) ||
          null;
        if (!ignore && status) {
          setLogbookStatus(String(status));
        }
      } catch {
        // ignore status errors; grading UI will still function, just without pre-detected status
      }
    };
    void loadStatus();
    return () => {
      ignore = true;
    };
  }, [logbookId]);

  const validateAssessment = (): string | null => {
    const nums = [details, practicality, correctness, creativity, presentation];
    if (nums.some((v) => v === '' || Number.isNaN(Number(v)))) {
      return 'All score fields are required.';
    }
    if (!result) return 'Please select Pass or Fail for the result.';
    return null;
  };

  const submitAssessment = async () => {
    if (!logbookId || assessing) return;
    const err = validateAssessment();
    if (err) {
      setAssessError(err);
      return;
    }
    setAssessing(true);
    setAssessError(null);
    try {
      const res = await apiFetch<any>(`/api/logbook/${encodeURIComponent(logbookId)}/assess`, {
        method: 'POST',
        body: {
          details: Number(details),
          practicality: Number(practicality),
          correctness: Number(correctness),
          creativity: Number(creativity),
          presentation: Number(presentation),
          comment: comment || undefined,
          result,
        },
      });
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'Logbook graded successfully.';
      const nextStatus =
        (res && typeof (res as any).status === 'string' && (res as any).status) ||
        (res && (res as any).data && typeof (res as any).data.status === 'string' && (res as any).data.status) ||
        'graded';
      setLogbookStatus(nextStatus);
      try {
        const ev = new CustomEvent('global-alert', {
          detail: { title: 'Logbook Assessed', message: msg },
        });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
      setConfirmOpen(false);
    } catch (e: any) {
      setAssessError(e?.message || 'Failed to assess logbook');
    } finally {
      setAssessing(false);
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
             Back
          </button>
        </div>

        {/* Right: weekly entries + assessment */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Week Selection</h2>
            <WeekDropdown value={selectedWeek} onChange={setSelectedWeek} weeks={weeks} size="md" />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {loading && (
              <div className="text-sm text-gray-500">Loading entries5</div>
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
                        {e?.entry_date && new Date(e.entry_date).toLocaleString()}  b7 {e?.hours ? `${e.hours} hrs` : ''}
                      </div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap min-h-[64px]">
                        {e?.activity || ' No entry for this day '}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assessment section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Grade Logbook</h2>
            </div>
            {isAlreadyGraded ? (
              <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
                This logbook has already been graded. You can review the entries and existing grade, but further changes
                are disabled.
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Details</label>
                <input
                  type="number"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                  value={details}
                  onChange={(e) => setDetails(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Practicality</label>
                <input
                  type="number"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                  value={practicality}
                  onChange={(e) => setPracticality(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Correctness</label>
                <input
                  type="number"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                  value={correctness}
                  onChange={(e) => setCorrectness(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Creativity</label>
                <input
                  type="number"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                  value={creativity}
                  onChange={(e) => setCreativity(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Presentation</label>
                <input
                  type="number"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                  value={presentation}
                  onChange={(e) => setPresentation(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Result</label>
                <select
                  className="w-full px-3 py-1.5 border rounded-md text-sm bg-white"
                  value={result}
                  onChange={(e) => setResult(e.target.value as 'pass' | 'fail' | '')}
                >
                  <option value="">Select result</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter any overall remarks here"
              />
            </div>
            {assessError && <div className="text-xs text-red-600">{assessError}</div>}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={assessing}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm disabled:opacity-60"
              >
                {assessing ? 'Grading…' : 'Grade Logbook'}
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        title="Confirm Logbook Grading"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void submitAssessment()}
        confirmText={assessing ? 'Grading…' : 'Yes, Grade Logbook'}
      >
        <div className="text-sm text-gray-700">
          Are you sure you want to grade this logbook? This action will mark it as assessed.
        </div>
      </Modal>
    </div>
  );
};

export default AssessorLogbookDetail;
