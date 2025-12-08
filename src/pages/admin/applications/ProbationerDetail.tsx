import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface ProbationerDetailApp {
  id: string;
  user_id?: number;
  surname?: string;
  other_names?: string;
  title?: string;
  postal_address?: string;
  residential_address?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  membership_grade?: string | null;
  membership_no?: string | null;
  passport_photo?: string | null;
  completion_step?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string } | null;
  o_level_results?: Array<any>;
  qualifications?: Array<any>;
  referees?: Array<any>;
  seminars?: Array<any>;
}

const ApplicationsProbationerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ProbationerDetailApp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOne = async () => {
      setLoading(true); setError(null);
      try {
        const res = await apiFetch<any>('/api/probationer/applications');
        const raw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];
        const obj = (raw as any[]).find(x => String(x.id) === String(id));
        if (!obj) throw new Error('Application not found');
        setItem({
          id: String(obj.id),
          user_id: obj.user_id,
          surname: obj.surname,
          other_names: obj.other_names,
          title: obj.title,
          postal_address: obj.postal_address,
          residential_address: obj.residential_address,
          email: obj.email,
          phone: obj.phone,
          date_of_birth: obj.date_of_birth,
          nationality: obj.nationality,
          membership_grade: obj.membership_grade,
          membership_no: obj.membership_no,
          passport_photo: obj.passport_photo,
          completion_step: obj.completion_step,
          status: obj.status,
          created_at: obj.created_at,
          updated_at: obj.updated_at,
          user: obj.user || null,
          o_level_results: Array.isArray(obj.o_level_results) ? obj.o_level_results : [],
          qualifications: Array.isArray(obj.qualifications) ? obj.qualifications : [],
          referees: Array.isArray(obj.referees) ? obj.referees : [],
          seminars: Array.isArray(obj.seminars) ? obj.seminars : [],
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

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
        <div>
          <div className="text-lg font-semibold">Probationer Application Detail</div>
          {item && (
            <div className="text-xs text-gray-500 mt-1">ID: {item.id}</div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded-md">Back</button>
          <Link to="/admin/applications/probationals" className="px-3 py-2 border rounded-md">All Applications</Link>
        </div>
      </div>
      {loading && (<div className="p-3 border rounded-md bg-gray-50 text-gray-700 text-sm">Loading…</div>)}
      {error && (<div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>)}
      {item && !loading && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">Applicant</div>
              </div>
              <div><span className="text-gray-500">Name:</span> {[item.title, item.surname, item.other_names].filter(Boolean).join(' ') || '-'}</div>
              <div><span className="text-gray-500">Email:</span> {item.email || '-'}</div>
              <div><span className="text-gray-500">Phone:</span> {item.phone || '-'}</div>
              <div><span className="text-gray-500">DOB:</span> {item.date_of_birth || '-'}</div>
              <div><span className="text-gray-500">Nationality:</span> {item.nationality || '-'}</div>
              <div><span className="text-gray-500">Postal Address:</span> {item.postal_address || '-'}</div>
              <div><span className="text-gray-500">Residential Address:</span> {item.residential_address || '-'}</div>
              <div><span className="text-gray-500">Status:</span> {item.status || '-'}</div>
              <div><span className="text-gray-500">Step:</span> {displayStep}</div>
            </div>
            <div className="bg-white border rounded-xl p-3 space-y-1">
              <div className="font-medium">Meta</div>
              <div><span className="text-gray-500">Created:</span> {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</div>
              <div><span className="text-gray-500">Updated:</span> {item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border rounded-xl p-3">
              <div className="font-medium mb-2">O-Level Results</div>
              <div className="space-y-1 text-xs">
                {item.o_level_results && item.o_level_results.length ? item.o_level_results.map((r:any) => (
                  <div key={r.id} className="border rounded p-2">
                    <div><span className="text-gray-500">Exam Type:</span> {String(r.exam_type || '').toUpperCase()}</div>
                    <div><span className="text-gray-500">Exam Year:</span> {r.exam_year}</div>
                    <div><span className="text-gray-500">Exam Number:</span> {r.exam_number}</div>
                    <div><span className="text-gray-500">Subjects:</span> {Array.isArray(r.subjects) ? r.subjects.join(', ') : '-'}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
            <div className="bg-white border rounded-xl p-3">
              <div className="font-medium mb-2">Qualifications</div>
              <div className="space-y-1 text-xs">
                {item.qualifications && item.qualifications.length ? item.qualifications.map((q:any) => (
                  <div key={q.id} className="border rounded p-2">
                    <div><span className="text-gray-500">Institution:</span> {q.institution}</div>
                    <div><span className="text-gray-500">Qualification:</span> {q.qualification}</div>
                    <div><span className="text-gray-500">Year:</span> {q.year}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border rounded-xl p-3">
              <div className="font-medium mb-2">Referees</div>
              <div className="space-y-1 text-xs">
                {item.referees && item.referees.length ? item.referees.map((r:any) => (
                  <div key={r.id} className="border rounded p-2">
                    <div><span className="text-gray-500">User ID:</span> {r.user_id}</div>
                    <div><span className="text-gray-500">Relationship:</span> {r.relationship}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
            <div className="bg-white border rounded-xl p-3">
              <div className="font-medium mb-2">Seminars</div>
              <div className="space-y-1 text-xs">
                {item.seminars && item.seminars.length ? item.seminars.map((s:any) => (
                  <div key={s.id} className="border rounded p-2">
                    <div><span className="text-gray-500">Title:</span> {s.title}</div>
                    <div><span className="text-gray-500">Date:</span> {s.date}</div>
                    <div><span className="text-gray-500">Location:</span> {s.location}</div>
                  </div>
                )) : <div>-</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsProbationerDetail;
