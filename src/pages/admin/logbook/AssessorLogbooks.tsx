import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusPill from '../../../components/StatusPill';
import { apiFetch } from '../../../utils/api';

const AssessorLogbooks: React.FC = () => {
  const { assessorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!assessorId) return;
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>(`/api/assessors/${encodeURIComponent(String(assessorId))}/logbooks`);
        const data = res?.data || res || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load assessor logbooks');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [assessorId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <button onClick={()=>navigate(-1)} className="px-2 py-1 border rounded">← Back</button>
        <span>Assessor Logbooks</span>
      </div>
      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}
      {loading ? (
        <div className="text-sm text-gray-600">Loading logbooks…</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Student</th>
                <th className="p-2">Stage</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lb: any) => (
                <tr key={lb.id} className="border-t">
                  <td className="p-2">{lb.student_name || lb.student_email || lb.user_id || '-'}</td>
                  <td className="p-2">Stage {lb.stage ?? '-'}</td>
                  <td className="p-2"><StatusPill status={String(lb.status || 'in_progress') as any} /></td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td className="p-2 text-xs text-gray-500" colSpan={3}>No logbooks found for this assessor.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssessorLogbooks;
