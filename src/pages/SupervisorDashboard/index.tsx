import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye, Check, X } from 'lucide-react';

type TabType = 'supervision' | 'approval' | 'supervise' | 'rejected';

const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('supervision');
  const [supervisionStatus, setSupervisionStatus] = useState<string | null>(null);
  const [supervisorQueue, setSupervisorQueue] = useState<Array<{ week: number; day: string; text: string; status: string }>>([]);
  const studentEmail = localStorage.getItem('student_request_email') || '';
  const statusKey = (email: string) => `student_supervision_status_${email}`;
  const entriesKey = (email: string, week: number) => `student_entries_${email}_week_${week}`;

  const handleLogout = (): void => {
    navigate('/login');
  };

  const handleViewLogbook = (): void => {
    navigate('/new-student-entry');
  };

  const handleApprove = (): void => {
    if (!studentEmail) return;
    localStorage.setItem(statusKey(studentEmail), 'approved');
    navigate('/app/student-logbook');
  };

  const handleReject = (): void => {
    if (!studentEmail) return;
    localStorage.setItem(statusKey(studentEmail), 'rejected');
    navigate('/app/student-logbook');
  };

  // Load data for tabs
  useEffect(() => {
    const stat = studentEmail ? localStorage.getItem(statusKey(studentEmail)) : null;
    setSupervisionStatus(stat);
    // Build approval queue from submitted entries (all weeks)
    const queue: Array<{ week: number; day: string; text: string; status: string }> = [];
    for (let w = 1; w <= 52; w++) {
      const raw = studentEmail ? localStorage.getItem(entriesKey(studentEmail, w)) : null;
      if (!raw) continue;
      try {
        const items = JSON.parse(raw) as Array<{ day: string; text: string; status: string }>;
        items.forEach((it) => {
          if (it.status === 'submitted') queue.push({ week: w, ...it });
        });
      } catch {}
    }
    setSupervisorQueue(queue);
  }, [activeTab, studentEmail]);

  const approveEntry = (week: number, day: string) => {
    if (!studentEmail) return;
    const raw = localStorage.getItem(entriesKey(studentEmail, week));
    if (!raw) return;
    try {
      const items = JSON.parse(raw) as Array<{ day: string; text: string; status: string }>;
      const next = items.map((it) => (it.day === day ? { ...it, status: 'approved' } : it));
      localStorage.setItem(entriesKey(studentEmail, week), JSON.stringify(next));
      setSupervisorQueue((q) => q.filter((i) => !(i.week === week && i.day === day)));
    } catch {}
  };

  const rejectEntry = (week: number, day: string) => {
    if (!studentEmail) return;
    const raw = localStorage.getItem(entriesKey(studentEmail, week));
    if (!raw) return;
    try {
      const items = JSON.parse(raw) as Array<{ day: string; text: string; status: string }>;
      const next = items.map((it) => (it.day === day ? { ...it, status: 'rejected' } : it));
      localStorage.setItem(entriesKey(studentEmail, week), JSON.stringify(next));
      setSupervisorQueue((q) => q.filter((i) => !(i.week === week && i.day === day)));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white px-8 py-8 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-indigo-500 mb-1">Supervisor Dashboard</h1>
          <p className="text-sm text-gray-500">Review and supervise student logbooks</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-8 pb-8">
        <div className="flex gap-3 mb-8 border-b-2 border-gray-200">
          {(['supervision','approval','supervise','rejected'] as TabType[]).map((tab) => (
            <button
              key={tab}
              className={`px-5 py-3 text-sm font-medium transition-all ${
                activeTab === tab
                  ? tab === 'supervise'
                    ? 'rounded-lg border-2 text-gray-800 bg-white border-indigo-500 -mb-0.5'
                    : 'border-b-3 -mb-0.5 text-gray-800 border-b-indigo-500'
                  : 'text-gray-500 border-b-transparent hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'supervision' && 'Supervision Requests'}
              {tab === 'approval' && 'Approval Requests'}
              {tab === 'supervise' && 'Supervise Entries'}
              {tab === 'rejected' && 'Rejected Requests'}
            </button>
          ))}
        </div>

        {activeTab === 'supervision' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">New Student</h3>
              <p className="text-sm text-gray-500">Level 1 · Requested {new Date().toLocaleDateString()}</p>
            </div>
            {supervisionStatus === 'pending' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleApprove}
                  className="w-full py-3 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Approve
                </button>
                <button 
                  onClick={handleReject}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No pending supervision requests.</div>
            )}
          </div>
        )}

        {activeTab === 'approval' && (
          <div className="space-y-3">
            {supervisorQueue.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-500">No daily entries awaiting approval.</div>
            )}
            {supervisorQueue.map((item) => (
              <div key={`${item.week}-${item.day}`} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-800">Week {item.week} · {item.day}</div>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{item.text || '—'}</p>
                <div className="flex gap-3">
                  <button onClick={() => approveEntry(item.week, item.day)} className="px-4 py-2 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600 flex items-center gap-2">
                    <Check size={16} /> Approve
                  </button>
                  <button onClick={() => rejectEntry(item.week, item.day)} className="px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2">
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'supervise' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">New Student</h3>
              <p className="text-sm text-gray-500">Level 1</p>
            </div>
            <button 
              onClick={handleViewLogbook}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
            >
              <Eye size={18} />
              View Logbook
            </button>
          </div>
        )}

        {activeTab === 'rejected' && (
          <div className="space-y-3">
            {supervisionStatus !== 'rejected' ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-500">No rejected supervision requests.</div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-semibold text-gray-800 mb-1">New Student</div>
                <div className="text-xs text-gray-500 mb-3">Level 1 · Rejected</div>
                <div className="text-xs text-gray-500">You can ask the student to re-apply or pick another supervisor.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
