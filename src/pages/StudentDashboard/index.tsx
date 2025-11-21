import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogOut, TrendingUp } from 'lucide-react';
import Modal from '../../components/Modal';
import WeekDropdown from '../../components/WeekDropdown';
import { Day, DAYS, entriesKey, WEEKS, supervisionStatusKey, supervisorNameKey } from '../../utils/logbook';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type SupervisionStatus = 'none' | 'pending' | 'rejected' | 'approved';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const statusKey = useMemo(() => (user?.email ? supervisionStatusKey(user.email) : '__noop__'), [user?.email]);
  const supervisorNameKeyMemo = useMemo(() => (user?.email ? supervisorNameKey(user.email) : '__noop__'), [user?.email]);
  const selectedWeekKey = useMemo(() => (user?.email ? `student_selected_week_${user.email}` : '__noop__'), [user?.email]);
  const [status, setStatus] = useLocalStorage<SupervisionStatus>(statusKey, 'none');
  const [selectedWeek, setSelectedWeek] = useLocalStorage<number>(selectedWeekKey, 1);
  const [supervisorName] = useLocalStorage<string>(supervisorNameKeyMemo, '');
  const [dailyText, setDailyText] = useState<Record<Day, string>>({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
  });
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [weeksCompleted, setWeeksCompleted] = useState<number>(0);
  const [modal, setModal] = useState<{ open: boolean; title: string; message?: string }>({ open: false, title: '' });

  // status persisted via useLocalStorage

  const handleSignOut = (): void => {
    navigate('/login');
  };

  const handleSelectSupervisor = (): void => {
    navigate('/app/supervisor-selection');
  };

  const weeks = useMemo(() => WEEKS, []);

  useEffect(() => {
    // load existing entries for selected week
    if (!user) return;
    const raw = localStorage.getItem(entriesKey(user.email, selectedWeek));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Array<{ day: Day; text: string; status: string }>;
        const next: Record<Day, string> = { Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '' };
        parsed.forEach((e) => (next[e.day] = e.text));
        setDailyText(next);
      } catch {}
    } else {
      setDailyText({ Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '' });
    }
    // update counters
    let entries = 0;
    let completed = 0;
    for (let w = 1; w <= 52; w++) {
      const r = user ? localStorage.getItem(entriesKey(user.email, w)) : null;
      if (r) {
        try {
          const p = JSON.parse(r) as Array<{ status: string }>;
          entries += p.length;
          const allApproved = p.length >= 5 && p.every((x) => x.status === 'approved');
          if (allApproved) completed += 1;
        } catch {}
      }
    }
    setTotalEntries(entries);
    setWeeksCompleted(completed);
  }, [selectedWeek, status, user]);

  const handleSaveDay = (day: Day) => {
    if (!user) return;
    const k = entriesKey(user.email, selectedWeek);
    const raw = localStorage.getItem(k);
    let items: Array<{ day: Day; text: string; status: string }>= [];
    if (raw) {
      try { items = JSON.parse(raw); } catch {}
    }
    const idx = items.findIndex((i) => i.day === day);
    const entry = { day, text: dailyText[day] || '', status: 'submitted' };
    if (idx >= 0) items[idx] = entry; else items.push(entry);
    localStorage.setItem(k, JSON.stringify(items));
    setModal({ open: true, title: 'Entry Saved', message: `${day} saved for Week ${selectedWeek}. Submitted for supervisor approval.` });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white px-8 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <BookOpen size={24} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Logbook System</h1>
            <p className="text-xs text-gray-500">z</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <div className="flex gap-6 p-8 max-w-7xl mx-auto">
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} color="#6366f1" />
              <h3 className="text-sm font-semibold text-gray-800">Current Level</h3>
            </div>
            <h2 className="text-4xl font-bold text-indigo-500 mt-2">Level 1</h2>
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
                <p className="text-sm text-gray-600">Waiting for {supervisorName ?? 'your supervisor'} to approve.</p>
              )}
              {status === 'rejected' && (
                <>
                  <p className="text-sm text-red-600 mb-4">Your supervision request was rejected.</p>
                  <button 
                    onClick={handleSelectSupervisor}
                    className="w-full py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Select Different Supervisor
                  </button>
                </>
              )}
              {status === 'approved' && (
                <span className="inline-flex items-center px-3 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Approved by {supervisorName || 'Supervisor'}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          {status === 'none' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logbook Access</h2>
              <p className="text-sm text-gray-500 mb-6">You need an approved supervisor before you can start filling your logbook.</p>
              <button
                onClick={handleSelectSupervisor}
                className="px-5 py-2.5 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
              >
                Select Supervisor
              </button>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logbook Access</h2>
              <p className="text-sm text-gray-500">Waiting for {supervisorName ?? 'your supervisor'} to accept your request.</p>
            </div>
          )}

          {status === 'rejected' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logbook Access</h2>
              <p className="text-sm text-red-600 mb-6">Your supervision request was rejected.</p>
              <button
                onClick={handleSelectSupervisor}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Select Different Supervisor
              </button>
            </div>
          )}

          {status === 'approved' && (
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
                        <button onClick={() => handleSaveDay(day)} className="px-3 py-1.5 bg-indigo-500 text-white rounded-md text-xs hover:bg-indigo-600">Save</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal open={modal.open} title={modal.title} onClose={() => setModal({ open: false, title: '' })}>
          {modal.message}
        </Modal>
      </div>
    </div>
  );
};

export default StudentDashboard;
