import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminStore } from '../../utils/adminStore';
import { entriesKey, STUDENT_REQUEST_EMAIL_KEY, supervisionStatusKey, supervisorEmailKey } from '../../utils/logbook';
import StudentListItem from '../../components/StudentListItem';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type TabType = 'supervision' | 'approval' | 'supervise' | 'rejected';

const SupervisorLogbook: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const selectedStudentKey = useMemo(() => (user?.email ? `supervisor_selected_student_${user.email}` : '__noop__'), [user?.email]);
  const activeTabKey = useMemo(() => (user?.email ? `supervisor_logbook_active_tab_${user.email}` : '__noop__'), [user?.email]);
  const [studentEmail, setStudentEmail] = useLocalStorage<string>(selectedStudentKey, '');
  const [activeTab, setActiveTab] = useLocalStorage<TabType>(activeTabKey, 'supervise' as TabType);
  const [supervisionStatus, setSupervisionStatus] = useState<string | null>(null);
  const [supervisorQueue, setSupervisorQueue] = useState<Array<{ week: number; day: string; text: string; status: string }>>([]);


  const myStudents = useMemo(() => {
    const supEmail = user?.email || '';
    if (!supEmail) return [] as Array<{ email:string; name:string }>;
    const students = AdminStore.listUsers().filter(u=>u.role==='student');
    return students
      .filter(s => (localStorage.getItem(supervisorEmailKey(s.email)) || '') === supEmail)
      .map(s => ({ email: s.email, name: s.name }));
  }, [user]);

  const demoStudents = useMemo(() => ([
    { email: 'student1@niqs.org', name: 'Student One' },
    { email: 'student2@niqs.org', name: 'Student Two' },
    { email: 'student3@niqs.org', name: 'Student Three' },
  ]), []);

  const selectStudent = (email: string) => {
    if (!email) return;
    setStudentEmail(email);
    setSupervisionStatus(localStorage.getItem(supervisionStatusKey(email)));
  };

  useEffect(() => {
    const emailFromRequest = localStorage.getItem(STUDENT_REQUEST_EMAIL_KEY) || '';
    const initial = (myStudents[0]?.email) || emailFromRequest;
    if (initial) selectStudent(initial);
  }, [myStudents]);

  // removed inline approved-by-day view; dedicated per-student page handles week/day display

  // Build approval queue (submitted entries across all weeks)
  useEffect(() => {
    if (!studentEmail) return;
    const queue: Array<{ week: number; day: string; text: string; status: string }> = [];
    for (let w = 1; w <= 52; w++) {
      const raw = localStorage.getItem(entriesKey(studentEmail, w));
      if (!raw) continue;
      try {
        const items = JSON.parse(raw) as Array<{ day: string; text: string; status: string }>;
        items.forEach((it) => { if (it.status === 'submitted') queue.push({ week: w, ...it }); });
      } catch {}
    }
    setSupervisorQueue(queue);
    setSupervisionStatus(localStorage.getItem(supervisionStatusKey(studentEmail)));
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Supervised Logbook</h1>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">Student</div>
          <div className="px-2 py-1 border rounded text-xs bg-gray-50">{studentEmail || '—'}</div>
        </div>
      </div>

      <div className="flex gap-3 mb-2 border-b-2 border-gray-200">
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
                onClick={()=>{ if(!studentEmail) return; localStorage.setItem(supervisionStatusKey(studentEmail), 'approved'); setSupervisionStatus('approved'); }}
                className="w-full py-3 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} /> Approve
              </button>
              <button 
                onClick={()=>{ if(!studentEmail) return; localStorage.setItem(supervisionStatusKey(studentEmail), 'rejected'); setSupervisionStatus('rejected'); }}
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
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-600 mb-2">Students Assigned</div>
            <div className="space-y-2">
              {myStudents.map(s => (
                <StudentListItem key={s.email} name={s.name || s.email} email={s.email} onView={()=>navigate(`/app/supervised-logbook/${encodeURIComponent(s.email)}`)} />
              ))}
              {myStudents.length===0 && (
                <>
                  <div className="text-xs text-gray-500">No students assigned yet.</div>
                  <div className="text-xs text-gray-600 mt-3">Demo Students</div>
                  {demoStudents.map(s => (
                    <StudentListItem key={s.email} name={s.name} email={s.email} onView={()=>navigate(`/app/supervised-logbook/${encodeURIComponent(s.email)}`)} />
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500">Click "View Logbook" on a student to open their weekly and daily logs.</div>
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
  );
};

export default SupervisorLogbook;
