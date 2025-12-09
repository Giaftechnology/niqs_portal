import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface ProbationerMeAppDetail {
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

const MyApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ProbationerMeAppDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
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
        const arr = Array.isArray(raw) ? raw : [];
        const found = arr.find((obj: any) => String(obj.id) === String(id));
        if (!found) {
          throw new Error('Application not found');
        }
        setItem({
          id: String(found.id),
          surname: found.surname,
          other_names: found.other_names,
          title: found.title,
          email: found.email,
          phone: found.phone,
          date_of_birth: found.date_of_birth,
          nationality: found.nationality,
          postal_address: found.postal_address,
          residential_address: found.residential_address,
          status: found.status,
          completion_step: found.completion_step,
          created_at: found.created_at,
          updated_at: found.updated_at,
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const displayStep = (() => {
    if (!item) return '-';
    const s = String(item.status || '').toLowerCase();
    if (s === 'acknowledged' || s === 'approved') return 8;
    if (typeof item.completion_step === 'number') return item.completion_step;
    return '-';
  })();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold">My Application Detail</div>
          {item && (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>ID: {item.id}</span>
              <span className="hidden md:inline">•</span>
              <span>Step: {displayStep}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
          {item && (
            <span
              className={(() => {
                const s = String(item.status || '').toLowerCase();
                if (s === 'approved') return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200';
                if (s === 'acknowledged') return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200';
                if (s === 'pending') return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200';
                if (s === 'rejected') return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200';
                return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200';
              })()}
            >
              {item.status || '-'}
            </span>
          )}
          <div className="flex items-center gap-2 text-sm">
            <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded-md">Back</button>
            <Link to="/admin/applications/my" className="px-3 py-2 border rounded-md">My Applications</Link>
          </div>
        </div>
      </div>
      {loading && (<div className="p-3 border rounded-md bg-gray-50 text-gray-700 text-sm">Loading…</div>)}
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      {item && !loading && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border rounded-xl p-3 space-y-1">
              <div className="font-medium mb-1">Applicant</div>
              <div><span className="text-gray-500">Name:</span> {[item.title, item.surname, item.other_names].filter(Boolean).join(' ') || '-'}</div>
              <div><span className="text-gray-500">Email:</span> {item.email || '-'}</div>
              <div><span className="text-gray-500">Phone:</span> {item.phone || '-'} </div>
              <div><span className="text-gray-500">DOB:</span> {item.date_of_birth || '-'}</div>
              <div><span className="text-gray-500">Nationality:</span> {item.nationality || '-'}</div>
            </div>
            <div className="bg-white border rounded-xl p-3 space-y-1">
              <div className="font-medium mb-1">Addresses & Meta</div>
              <div><span className="text-gray-500">Postal Address:</span> {item.postal_address || '-'}</div>
              <div><span className="text-gray-500">Residential Address:</span> {item.residential_address || '-'}</div>
              <div><span className="text-gray-500">Status:</span> {item.status || '-'}</div>
              <div><span className="text-gray-500">Step:</span> {displayStep}</div>
              <div><span className="text-gray-500">Created:</span> {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</div>
              <div><span className="text-gray-500">Updated:</span> {item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationDetail;
