import React, { useMemo, useState } from 'react';
import { AdminStore } from '../../utils/adminStore';
import Modal from '../../components/Modal';

const SupervisorAssignments: React.FC = () => {
  const supervisors = AdminStore.listUsers().filter(u=>u.role==='supervisor');
  const students = AdminStore.listUsers().filter(u=>u.role==='student');
  const supsProfiles = AdminStore.listSupervisors();

  const [supId, setSupId] = useState<string>(supervisors[0]?.id || '');
  const [studentEmail, setStudentEmail] = useState<string>(students[0]?.email || '');
  const [notice, setNotice] = useState<{open:boolean;title:string;message?:string}>({open:false,title:''});

  const currentStudents = useMemo(()=>{
    const sp = supsProfiles.find(s=>s.id===supId);
    return sp?.students || [];
  }, [supsProfiles, supId]);

  const assign = () => {
    if (!supId || !studentEmail) return;
    const existing = AdminStore.listSupervisors();
    const idx = existing.findIndex(s=>s.id===supId);
    if (idx >= 0) {
      const list = new Set(existing[idx].students);
      list.add(studentEmail);
      AdminStore.upsertSupervisor({ id: supId, students: Array.from(list) });
    } else {
      AdminStore.upsertSupervisor({ id: supId, students: [studentEmail] });
    }
    setNotice({open:true,title:'Assigned',message:`${studentEmail} assigned to supervisor.`});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold"><span aria-hidden>🧑‍🏫</span><span>Supervisor Assignments</span></div>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Supervisor</div>
            <select value={supId} onChange={e=>setSupId(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
              {supervisors.map(s=> (<option key={s.id} value={s.id}>{s.name} ({s.email})</option>))}
            </select>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Student</div>
            <select value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
              {students.map(s=> (<option key={s.id} value={s.email}>{s.name} ({s.email})</option>))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={assign} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm w-full">Assign</button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <div className="text-sm font-medium text-gray-800 mb-2">Current Students</div>
        {currentStudents.length === 0 ? (
          <div className="text-sm text-gray-500">No students assigned to selected supervisor.</div>
        ) : (
          <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
            {currentStudents.map(em=> (<li key={em}>{em}</li>))}
          </ul>
        )}
      </div>

      <Modal open={notice.open} title={notice.title} onClose={()=>setNotice({open:false,title:''})}>{notice.message}</Modal>
    </div>
  );
};

export default SupervisorAssignments;
