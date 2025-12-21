import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import { apiFetch } from '../../utils/api';

const ReassignAccessorModal = ({ open, logbookId, q, setQ, onClose, onReassigned }: { open: boolean; logbookId?: string; q: string; setQ: (v:string)=>void; onClose: ()=>void; onReassigned: (msg?: string)=>void }) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!open || !logbookId) return;
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>('/api/assessors');
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setList(arr);
      } catch (e: any) {
        setError(e?.message || 'Failed to load assessors');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [open, logbookId]);

  if (!open || !logbookId) return null;

  const filtered = list.filter((a) => {
    const name = `${a.member?.surname || ''} ${a.member?.firstname || ''}`;
    const email = a.member?.email || '';
    const membership = a.member?.membership_no || '';
    return `${name} ${email} ${membership}`.toLowerCase().includes(q.toLowerCase());
  });

  const reassign = async (assessorId: string) => {
    if (!logbookId) return;
    setAssigningId(assessorId);
    try {
      const res = await apiFetch<any>(`/api/logbook/${encodeURIComponent(String(logbookId))}/reassign`, {
        method: 'POST',
        body: { assessor_id: assessorId },
      });
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'Accessor reassigned.';
      setError(null);
      onReassigned(msg);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to reassign assessor');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <Modal open={true} title="Reassign Accessor" onClose={onClose} panelClassName="max-w-2xl w-[90vw] max-h-[80vh]" bodyClassName="overflow-y-auto max-h-[60vh] pr-1">
      <div className="space-y-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search assessors" className="w-full px-3 py-2 border rounded-md text-sm" />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="max-h-60 overflow-auto border rounded-md">
          {loading ? (
            <div className="p-3 text-xs text-gray-500">Loading assessors…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Membership No</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const accessorId = a.assessor_id || a.id;
                  return (
                    <tr key={accessorId} className="border-t">
                      <td className="p-2">{a.member?.membership_no || '-'}</td>
                      <td className="p-2">{`${a.member?.title || ''} ${a.member?.surname || ''} ${a.member?.firstname || ''}`.trim() || '-'}</td>
                      <td className="p-2">{a.member?.email || '-'}</td>
                      <td className="p-2">
                        <button
                          onClick={()=>void reassign(accessorId)}
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded disabled:opacity-60"
                          disabled={Boolean(assigningId)}
                        >
                          {assigningId === accessorId ? 'Reassigning…' : 'Reassign'}
                        </button>
                      </td>
                    </tr>
                  );})}
                {filtered.length === 0 && !loading && (
                  <tr><td className="p-2 text-xs text-gray-500" colSpan={4}>No assessors match your search.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReassignAccessorModal;
