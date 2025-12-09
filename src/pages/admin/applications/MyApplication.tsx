import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface ProbationerMeApp {
  id: string;
  surname?: string;
  other_names?: string;
  title?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  postal_address?: string;
  residential_address?: string;
  status?: string;
  completion_step?: number;
  created_at?: string;
  updated_at?: string;
}

const MyApplication: React.FC = () => {
  const [items, setItems] = useState<ProbationerMeApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>('/api/probationer');
        const raw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];
        const mapped: ProbationerMeApp[] = (Array.isArray(raw) ? raw : []).map((obj: any) => ({
          id: String(obj.id),
          surname: obj.surname,
          other_names: obj.other_names,
          title: obj.title,
          email: obj.email,
          phone: obj.phone,
          date_of_birth: obj.date_of_birth,
          nationality: obj.nationality,
          postal_address: obj.postal_address,
          residential_address: obj.residential_address,
          status: obj.status,
          completion_step: obj.completion_step,
          created_at: obj.created_at,
          updated_at: obj.updated_at,
        }));
        setItems(mapped);
      } catch (e: any) {
        setError(e?.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayStep = (app?: ProbationerMeApp | null) => {
    if (!app) return '-';
    const s = String(app.status || '').toLowerCase();
    if (s === 'acknowledged' || s === 'approved') return 8;
    if (typeof app.completion_step === 'number') return app.completion_step;
    return '-';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">My Probationer Application</div>
        <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded-md text-sm">Back</button>
      </div>
      {loading && (<div className="p-3 border rounded-md bg-gray-50 text-gray-700 text-sm">Loading…</div>)}
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      {!loading && !items.length && !error && (
        <div className="p-3 border rounded-md bg-white text-sm">
          <div className="font-medium mb-1">No application found</div>
          <div className="text-gray-600 mb-2">You have not started a probationer application yet.</div>
          <Link to="/admin/applications/probationals/new" className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm inline-block">Start New Application</Link>
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="bg-white border rounded-xl p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">My Applications</div>
            <div className="text-xs text-gray-500">Total: {items.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Step</th>
                  <th className="text-left px-3 py-2">Created</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(app => (
                  <tr key={app.id} className="border-t">
                    <td className="px-3 py-2">{[app.title, app.surname, app.other_names].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-3 py-2">{app.email || '-'}</td>
                    <td className="px-3 py-2">{app.status || '-'}</td>
                    <td className="px-3 py-2">{displayStep(app)}</td>
                    <td className="px-3 py-2">{app.created_at ? new Date(app.created_at).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/applications/my/${app.id}`)}
                        className="px-2 py-1 border rounded-md text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplication;
