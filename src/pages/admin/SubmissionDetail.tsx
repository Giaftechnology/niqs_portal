import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import { AdminStore } from '../../utils/adminStore';
import { AdminLogEntry } from '../../types/admin';

const days: Array<'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'> = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

const SubmissionDetail: React.FC = () => {
  const { id: dietId, sid } = useParams();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<{open:boolean; title:string; message?:string; onConfirm?:()=>void}>({open:false,title:''});

  const diet = useMemo(() => AdminStore.listDiets().find(d=>d.id===dietId), [dietId]);
  const submission = useMemo(() => (AdminStore.listLogs().find(l => l.id === sid) as AdminLogEntry|undefined), [sid]);
  const accessors = useMemo(() => diet ? AdminStore.listAccessors().filter(a=>diet.accessorIds.includes(a.id)) : [], [diet]);
  const studentLogs = useMemo(() => submission ? AdminStore.listLogs().filter(l => l.studentEmail === submission.studentEmail && (!dietId || l.dietId === dietId)) : [], [submission, dietId]);
  const approvedLogs = useMemo(() => studentLogs.filter(l=>l.status==='approved'), [studentLogs]);
  const approvedWeeks = useMemo(() => Array.from(new Set(approvedLogs.map(l=>l.week))).sort((a,b)=>a-b), [approvedLogs]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [approvedByDay, setApprovedByDay] = useState<Record<string, string>>({});

  useEffect(() => {
    if (approvedWeeks.length > 0) setSelectedWeek(approvedWeeks[0]);
  }, [approvedWeeks.join(',')]);

  useEffect(() => {
    const next: Record<string, string> = { Monday:'', Tuesday:'', Wednesday:'', Thursday:'', Friday:'' };
    approvedLogs.filter(l=>l.week===selectedWeek).forEach(l => { next[l.day] = l.text; });
    setApprovedByDay(next);
  }, [approvedLogs, selectedWeek]);

  const updateStatus = (s: 'approved'|'rejected'|'pending') => {
    if (!submission) return;
    const title = s==='pending' ? 'Recall submission?' : s==='approved' ? 'Approve submission?' : 'Reject submission?';
    setConfirm({ open:true, title, message: undefined, onConfirm: () => {
      AdminStore.updateLog({ ...submission, status: s } as any);
      setConfirm({open:false,title:''});
      navigate(-1);
    }});
  };

  if (!diet || !submission) return (
    <div className="space-y-4">
      <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
      <div className="text-sm text-red-600">Submission or Diet not found.</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
          <div>
            <div className="text-2xl font-semibold">Submission Detail</div>
            <div className="text-sm text-gray-500">{diet.sessionName} - {diet.diet} • {submission.studentEmail} • W{submission.week} / {submission.day}</div>
          </div>
        </div>
        <div className="space-x-2">
          <button onClick={()=>updateStatus('pending')} className="px-3 py-1.5 border rounded-md text-sm">Recall</button>
          <button onClick={()=>updateStatus('approved')} className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm">Approve</button>
          <button onClick={()=>updateStatus('rejected')} className="px-3 py-1.5 border rounded-md text-sm">Reject</button>
        </div>
      </div>

      <section className="bg-white border rounded-xl">
        <div className="p-3 text-sm font-medium border-b">Entry</div>
        <div className="p-4 space-y-2">
          <div className="text-xs text-gray-500">Status</div>
          <div>
            <span className={`px-2 py-0.5 rounded text-xs ${submission.status==='submitted' ? 'bg-green-100 text-green-700' : submission.status==='approved' ? 'bg-blue-100 text-blue-700' : submission.status==='rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{submission.status}</span>
          </div>
          <div className="text-xs text-gray-500">Text</div>
          <div className="whitespace-pre-wrap text-sm">{submission.text}</div>
        </div>
      </section>

      <section className="bg-white border rounded-xl">
        <div className="p-3 text-sm font-medium border-b flex items-center gap-3">
          <span>Approved Logbook (by week)</span>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-gray-600">Week</label>
            <select value={selectedWeek} onChange={e=>setSelectedWeek(Number(e.target.value))} className="px-2 py-1 border rounded text-xs">
              {approvedWeeks.length===0 ? <option value={1}>Week 1</option> : approvedWeeks.map(w => (<option key={w} value={w}>Week {w}</option>))}
            </select>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {days.map(d => (
            <div key={d} className="border rounded p-3">
              <div className="text-xs text-gray-500 mb-1">{d}</div>
              <div className="whitespace-pre-wrap min-h-[64px]">{approvedByDay[d] || '— (No approved entry)'}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border rounded-xl">
        <div className="p-3 text-sm font-medium border-b">Assigned Accessors for this Diet</div>
        <div className="p-3">
          {accessors.length === 0 ? (
            <div className="text-xs text-gray-500">No accessors assigned yet.</div>
          ) : (
            <ul className="text-sm list-disc pl-5">
              {accessors.map(a => (<li key={a.id}>{a.name} ({a.email})</li>))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-white border rounded-xl">
        <div className="p-3 text-sm font-medium border-b">Other Logs by {submission.studentEmail} (this diet)</div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Week/Day</th>
                <th className="p-2">Status</th>
                <th className="p-2">Excerpt</th>
              </tr>
            </thead>
            <tbody>
              {studentLogs.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">W{l.week} / {l.day}</td>
                  <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${l.status==='submitted' ? 'bg-green-100 text-green-700' : l.status==='approved' ? 'bg-blue-100 text-blue-700' : l.status==='rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span></td>
                  <td className="p-2">{l.text.slice(0,100)}{l.text.length>100?'…':''}</td>
                </tr>
              ))}
              {studentLogs.length===0 && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={3}>No other logs.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={confirm.open} title={confirm.title} onClose={()=>setConfirm({open:false,title:''})} onConfirm={confirm.onConfirm} confirmText="Yes">
        {confirm.message}
      </Modal>
    </div>
  );
};

export default SubmissionDetail;
