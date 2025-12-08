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
  const [item, setItem] = useState<ProbationerMeApp | null>(null);
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
        const obj = Array.isArray(raw) && raw.length ? raw[0] : null;
        if (obj && typeof obj === 'object') {
          setItem({
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
          });
        } else {
          setItem(null);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayStep = (() => {
    if (!item) return '-';
    const s = String(item.status || '').toLowerCase();
    if (s === 'acknowledged' || s === 'approved') return 8;
    if (typeof item.completion_step === 'number') return item.completion_step;
    return '-';
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">My Probationer Application</div>
        <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded-md text-sm">Back</button>
      </div>
      {loading && (<div className="p-3 border rounded-md bg-gray-50 text-gray-700 text-sm">Loading…</div>)}
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      {!loading && !item && !error && (
        <div className="p-3 border rounded-md bg-white text-sm">
          <div className="font-medium mb-1">No application found</div>
          <div className="text-gray-600 mb-2">You have not started a probationer application yet.</div>
          <Link to="/admin/applications/probationals/new" className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm inline-block">Start New Application</Link>
        </div>
      )}
      {item && !loading && (
        <div className="bg-white border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">Application Overview</div>
            <div className="text-xs text-gray-500">ID: {item.id}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div><span className="text-gray-500">Name:</span> {[item.title, item.surname, item.other_names].filter(Boolean).join(' ') || '-'}</div>
              <div><span className="text-gray-500">Email:</span> {item.email || '-'}</div>
              <div><span className="text-gray-500">Phone:</span> {item.phone || '-'}</div>
              <div><span className="text-gray-500">DOB:</span> {item.date_of_birth || '-'}</div>
              <div><span className="text-gray-500">Nationality:</span> {item.nationality || '-'}</div>
            </div>
            <div className="space-y-1">
              <div><span className="text-gray-500">Postal Address:</span> {item.postal_address || '-'}</div>
              <div><span className="text-gray-500">Residential Address:</span> {item.residential_address || '-'}</div>
              <div><span className="text-gray-500">Status:</span> {item.status || '-'}</div>
              <div><span className="text-gray-500">Step:</span> {displayStep}</div>
              <div><span className="text-gray-500">Created:</span> {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</div>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/applications/probationals/${item.id}`)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplication;
