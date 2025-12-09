import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import WeekDropdown from '../../../components/WeekDropdown';
import Modal from '../../../components/Modal';
import { Day, DAYS, entriesKey, supervisionStatusKey, supervisorNameKey, WEEKS } from '../../../utils/logbook';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

interface LogbookMe {
  id: string;
  stage?: number;
  status?: string;
  supervisor?: { id: number; name: string; email: string; membership_no?: string } | null;
  created_at?: string;
  updated_at?: string;
}

type SupervisionStatus = 'none' | 'pending' | 'rejected' | 'approved';

const MyLogbook: React.FC = () => {
  const { user } = useAuth();
  const [logbook, setLogbook] = useState<LogbookMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // supervision + week state, reusing student keys but keyed by current user email
  const statusKey = useMemo(
    () => (user?.email ? supervisionStatusKey(user.email) : '__noop__'),
    [user?.email],
  );
  const supervisorNameKeyMemo = useMemo(
    () => (user?.email ? supervisorNameKey(user.email) : '__noop__'),
    [user?.email],
  );
  const selectedWeekKey = useMemo(
    () => (user?.email ? `admin_selected_week_${user.email}` : '__noop__'),
    [user?.email],
  );

  const [status, setStatus] = useLocalStorage<SupervisionStatus>(statusKey, 'none');
  const [selectedWeek, setSelectedWeek] = useLocalStorage<number>(selectedWeekKey, 1);
  const [supervisorName, setSupervisorName] = useLocalStorage<string>(supervisorNameKeyMemo, '');

  // daily entries and progress (client-side like student dashboard)
  const [dailyText, setDailyText] = useState<Record<Day, string>>({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
  });
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [weeksCompleted, setWeeksCompleted] = useState<number>(0);

  // supervisor search & request
  const [supQuery, setSupQuery] = useState('');
  const [supResults, setSupResults] = useState<any[]>([]);
  const [supLoading, setSupLoading] = useState(false);
  const [supError, setSupError] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const [modal, setModal] = useState<{ open: boolean; title: string; message?: string }>(
    { open: false, title: '' },
  );

  const weeks = useMemo(() => WEEKS, []);

  // load current logbook from backend
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
          const lb: LogbookMe = {
            id: String(obj.id),
            stage: obj.stage,
            status: obj.status,
            supervisor: obj.supervisor || null,
            created_at: obj.created_at,
            updated_at: obj.updated_at,
          };
          setLogbook(lb);
          if (lb.supervisor && !supervisorName) {
            setSupervisorName(lb.supervisor.name || lb.supervisor.email);
            setStatus('approved');
          }
        } else {
          setLogbook(null);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load logbook');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supervisorName, setSupervisorName, setStatus]);

  // whenever week/status changes, sync daily entries & progress from localStorage
  useEffect(() => {
    if (!user) return;
    const key = entriesKey(user.email, selectedWeek);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Array<{ day: Day; text: string; status: string }>;
        const next: Record<Day, string> = { Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '' };
        parsed.forEach((e) => { next[e.day] = e.text; });
        setDailyText(next);
      } catch {
        setDailyText({ Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '' });
      }
    } else {
      setDailyText({ Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '' });
    }

    // compute progress over all weeks
    let entries = 0;
    let completed = 0;
    for (let w = 1; w <= 52; w++) {
      const r = user ? localStorage.getItem(entriesKey(user.email, w)) : null;
      if (!r) continue;
      try {
        const p = JSON.parse(r) as Array<{ status: string }>;
        entries += p.length;
        const allApproved = p.length >= 5 && p.every((x) => x.status === 'approved');
        if (allApproved) completed += 1;
      } catch {}
    }
    setTotalEntries(entries);
    setWeeksCompleted(completed);
  }, [selectedWeek, status, user]);

  const handleSaveDay = (day: Day) => {
    if (!user) return;
    const key = entriesKey(user.email, selectedWeek);
    const raw = localStorage.getItem(key);
    let items: Array<{ day: Day; text: string; status: string }> = [];
    if (raw) {
      try { items = JSON.parse(raw); } catch {}
    }
    const idx = items.findIndex((i) => i.day === day);
    const entry = { day, text: dailyText[day] || '', status: 'submitted' };
    if (idx >= 0) items[idx] = entry; else items.push(entry);
    localStorage.setItem(key, JSON.stringify(items));
    setModal({
      open: true,
      title: 'Entry Saved',
      message: `${day} saved for Week ${selectedWeek}. Submitted for supervisor approval.`,
    });
  };

  // live supervisor search using members search API
  const handleSupQueryChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSupQuery(term);
    setSupError(null);
    setSupResults([]);
    if (!term.trim()) return;
    const suffix = term.toUpperCase().startsWith('M-')
      ? term.toUpperCase().slice(2)
      : term.replace(/^M-/i, '');
    if (suffix.length < 3 && term.trim().length < 3) return;
    setSupLoading(true);
    try {
      const res = await apiFetch<any>(`/api/members/search/M-${encodeURIComponent(suffix || term)}`);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSupResults(list.slice(0, 15));
    } catch (err: any) {
      setSupError(err?.message || 'Search failed');
    } finally {
      setSupLoading(false);
    }
  };

  const requestSupervisor = async (member: any) => {
    if (!logbook) return;
    setRequestingId(String(member.id));
    setSupError(null);
    try {
      await apiFetch('/api/logbook/request-supervisor', {
        method: 'POST',
        body: { logbook_id: logbook.id, member_id: member.id },
      });
      setSupervisorName(
        member.name ||
        `${member.title || ''} ${member.surname || ''} ${member.firstname || ''}`.trim() ||
        member.email,
      );
      setStatus('pending');
      setSupResults([]);
      setSupQuery('');
      setModal({
        open: true,
        title: 'Request Sent',
        message: `Supervision request sent to ${member.name || member.email}.`,
      });
    } catch (err: any) {
      setSupError(err?.message || 'Failed to send request');
    } finally {
      setRequestingId(null);
    }
  };

  const levelLabel = logbook?.stage ? `Level ${logbook.stage}` : 'Level 1';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100 p-4 sm:p-6">
      <div className="flex gap-6">
        {/* Left sidebar */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} color="#6366f1" />
              <h3 className="text-sm font-semibold text-gray-800">Current Level</h3>
            </div>
            <h2 className="text-4xl font-bold text-indigo-500 mt-2">{levelLabel}</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} color="#1f2937" />
              <h3 className="text-sm font-semibold text-gray-800">Progress</h3>
            </div>
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
              <span className="text-sm text-gray-500">Weeks Completed</span>
              <span className="text-sm font-semibold text-gray-800">{weeksCompleted} / 52</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-1">
              <span className="text-xs text-gray-500">Total Entries</span>
              <span className="text-2xl font-bold text-gray-800">{totalEntries}</span>
            </div>
          </div>

          {status !== 'none' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Supervision Status</h3>
              {status === 'pending' && (
                <p className="text-sm text-gray-600">Waiting for {supervisorName || 'your supervisor'} to approve.</p>
              )}
              {status === 'rejected' && (
                <p className="text-sm text-red-600">Your supervision request was rejected. Request another supervisor.</p>
              )}
              {status === 'approved' && (
                <span className="inline-flex items-center px-3 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Approved by {supervisorName || 'Supervisor'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="flex-1 space-y-6">
          {loading && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">Loading logbook…</div>
          )}
          {error && !loading && (
            <div className="bg-white border border-red-200 rounded-xl p-6 text-sm text-red-700">{error}</div>
          )}
          {!loading && !logbook && !error && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">My Logbook</h2>
              <p className="text-sm text-gray-500">You do not currently have an active logbook.</p>
            </div>
          )}

          {logbook && status === 'none' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logbook Access</h2>
                <p className="text-sm text-gray-500 mb-4">You need an approved supervisor before you can start filling your logbook.</p>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-gray-600">Search Supervisor (membership ID or name)</div>
                <input
                  type="text"
                  value={supQuery}
                  onChange={handleSupQueryChange}
                  className="w-full px-3 py-2 border-2 border-indigo-500 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-600"
                  placeholder="Search by membership ID or name..."
                />
                {supError && <div className="text-xs text-red-600">{supError}</div>}
                {supLoading && <div className="text-xs text-gray-500">Searching…</div>}
                {!!supResults.length && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto divide-y">
                      {supResults.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                          <div>
                            <div className="font-medium">
                              {m.name || `${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(m.membership_no || m.membership_id || m.member_id) && (
                                <span className="mr-1">{m.membership_no || m.membership_id || m.member_id}</span>
                              )}
                              {m.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => requestSupervisor(m)}
                            disabled={requestingId === String(m.id)}
                            className="px-3 py-1.5 bg-indigo-500 text-white rounded-md text-xs hover:bg-indigo-600 disabled:opacity-60"
                          >
                            {requestingId === String(m.id) ? 'Requesting…' : 'Request'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {logbook && status === 'pending' && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logbook Access</h2>
              <p className="text-sm text-gray-500">Waiting for {supervisorName || 'your supervisor'} to accept your request.</p>
            </div>
          )}

          {logbook && status === 'rejected' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logbook Access</h2>
              <p className="text-sm text-red-600">Your supervision request was rejected.</p>
              <p className="text-sm text-gray-500">Search and request a different supervisor below.</p>
              <div className="space-y-3">
                <div className="text-xs text-gray-600">Search Supervisor</div>
                <input
                  type="text"
                  value={supQuery}
                  onChange={handleSupQueryChange}
                  className="w-full px-3 py-2 border-2 border-indigo-500 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-600"
                  placeholder="Search by membership ID or name..."
                />
                {supError && <div className="text-xs text-red-600">{supError}</div>}
                {supLoading && <div className="text-xs text-gray-500">Searching…</div>}
                {!!supResults.length && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto divide-y">
                      {supResults.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                          <div>
                            <div className="font-medium">
                              {m.name || `${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(m.membership_no || m.membership_id || m.member_id) && (
                                <span className="mr-1">{m.membership_no || m.membership_id || m.member_id}</span>
                              )}
                              {m.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => requestSupervisor(m)}
                            disabled={requestingId === String(m.id)}
                            className="px-3 py-1.5 bg-indigo-500 text-white rounded-md text-xs hover:bg-indigo-600 disabled:opacity-60"
                          >
                            {requestingId === String(m.id) ? 'Requesting…' : 'Request'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {logbook && status === 'approved' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Select Week</h2>
                <WeekDropdown value={selectedWeek} onChange={setSelectedWeek} weeks={weeks} size="md" />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Week {selectedWeek} - Daily Entries</h2>
                <div className="space-y-4">
                  {DAYS.map((day) => (
                    <div key={day} className="p-3 rounded-lg bg-gray-50">
                      <label className="block text-xs font-medium text-gray-600 mb-2">{day}</label>
                      <textarea
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white"
                        rows={3}
                        placeholder={`Type your ${day} log...`}
                        value={dailyText[day]}
                        onChange={(e) => setDailyText((prev) => ({ ...prev, [day]: e.target.value }))}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleSaveDay(day)}
                          className="px-3 py-1.5 bg-indigo-500 text-white rounded-md text-xs hover:bg-indigo-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Modal
            open={modal.open}
            title={modal.title}
            onClose={() => setModal({ open: false, title: '' })}
          >
            {modal.message}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default MyLogbook;
