import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';

const days: Array<'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'> = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const entriesKey = (email: string, week: number) => `student_entries_${email}_week_${week}`;

const SuperviseStudentLog: React.FC = () => {
  const navigate = useNavigate();
  const { email = '' } = useParams();
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [approvedByDay, setApprovedByDay] = useState<Record<string, string>>({});
  const weeks = useMemo(() => Array.from({ length: 52 }, (_, i) => i + 1), []);
  const student = useMemo(() => AdminStore.listUsers().find(u => u.email === email), [email]);

  // Seed demo approved entries if none exist
  useEffect(() => {
    if (!email) return;
    let foundApproved = false;
    for (let w = 1; w <= 52; w++) {
      const raw = localStorage.getItem(entriesKey(email, w));
      if (!raw) continue;
      try {
        const items = JSON.parse(raw) as Array<{ status:string }>;
        if (items.some(i => i.status === 'approved')) { foundApproved = true; break; }
      } catch {}
    }
    if (!foundApproved) {
      const seedKey = `demo_seeded_${email}`;
      if (!localStorage.getItem(seedKey)) {
        const items = days.map(d => ({ day: d, text: `Demo ${d} entry for ${email}`, status: 'approved' }));
        localStorage.setItem(entriesKey(email, 1), JSON.stringify(items));
        localStorage.setItem(seedKey, '1');
      }
    }
    // choose first approved week
    let firstApprovedWeek = 1;
    for (let w = 1; w <= 52; w++) {
      const raw = localStorage.getItem(entriesKey(email, w));
      if (!raw) continue;
      try {
        const items = JSON.parse(raw) as Array<{ status:string }>;
        if (items.some(i => i.status === 'approved')) { firstApprovedWeek = w; break; }
      } catch {}
    }
    setSelectedWeek(firstApprovedWeek);
  }, [email]);

  useEffect(() => {
    if (!email) return;
    const raw = localStorage.getItem(entriesKey(email, selectedWeek));
    const next: Record<string, string> = { Monday:'', Tuesday:'', Wednesday:'', Thursday:'', Friday:'' };
    if (raw) {
      try {
        const items = JSON.parse(raw) as Array<{ day:string; text:string; status:string }>;
        items.filter(i=>i.status==='approved').forEach(i => { next[i.day] = i.text; });
      } catch {}
    }
    setApprovedByDay(next);
  }, [email, selectedWeek]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
          <h1 className="text-xl font-semibold text-gray-800">Supervised Logbook – {student?.name || email}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">Student</div>
          <div className="px-2 py-1 border rounded text-xs bg-gray-50">{email}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-xs text-gray-600">Week</label>
          <select value={selectedWeek} onChange={e=>setSelectedWeek(Number(e.target.value))} className="px-2 py-1 border rounded text-sm">
            {weeks.map(w => (<option key={w} value={w}>Week {w}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {days.map(d => (
            <div key={d} className="border rounded p-3 text-sm">
              <div className="text-xs text-gray-500 mb-1">{d}</div>
              <div className="whitespace-pre-wrap min-h-[64px]">{approvedByDay[d] || '— (No approved entry)'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperviseStudentLog;
