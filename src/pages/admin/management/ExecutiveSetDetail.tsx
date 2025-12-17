import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface ExecAssignment {
  id: number;
  member_id: string;
  executive_set_id: number;
  position: string;
  created_at?: string;
  updated_at?: string;
  executive_office_id?: number;
}

interface ExecSet {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  executives?: ExecAssignment[];
}

interface ExecOffice {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  role_id?: number;
  rank?: number;
  created_at?: string;
  updated_at?: string;
}

const ExecutiveSetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [setItem, setSetItem] = useState<ExecSet | null>(null);
  const [offices, setOffices] = useState<ExecOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState<{ member_id: string; office_id: number | ''; position: string }>({
    member_id: '',
    office_id: '' as any,
    position: '',
  });

  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [memberSearchError, setMemberSearchError] = useState<string | null>(null);

  const assignments = useMemo<ExecAssignment[]>(() => {
    return Array.isArray(setItem?.executives) ? (setItem!.executives as ExecAssignment[]) : [];
  }, [setItem]);

  const [memberLookup, setMemberLookup] = useState<Record<string, { name?: string; membership_no?: string }>>({});

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [setsRes, officesRes] = await Promise.all([
        apiFetch<any>('/api/executive-sets'),
        apiFetch<any>('/api/executive-offices'),
      ]);

      const rawSets = Array.isArray(setsRes)
        ? setsRes
        : Array.isArray(setsRes?.data)
          ? setsRes.data
          : Array.isArray(setsRes?.data?.data)
            ? setsRes.data.data
            : [];

      const normalizedSets: ExecSet[] = (Array.isArray(rawSets) ? rawSets : []).map((x: any) => ({
        id: Number(x.id),
        name: x.name,
        start_date: x.start_date,
        end_date: x.end_date,
        created_at: x.created_at,
        updated_at: x.updated_at,
        executives: Array.isArray(x.executives)
          ? x.executives.map((e: any) => ({
              id: Number(e.id),
              member_id: String(e.member_id),
              executive_set_id: Number(e.executive_set_id),
              position: String(e.position || ''),
              created_at: e.created_at,
              updated_at: e.updated_at,
              executive_office_id: e.executive_office_id
                ? Number(e.executive_office_id)
                : e.office_id
                  ? Number(e.office_id)
                  : undefined,
            }))
          : [],
      }));

      const foundSet = normalizedSets.find((s) => String(s.id) === String(id));
      if (!foundSet) throw new Error('Executive set not found');
      setSetItem(foundSet);

      const rawOffices = Array.isArray(officesRes)
        ? officesRes
        : Array.isArray(officesRes?.data)
          ? officesRes.data
          : Array.isArray(officesRes?.data?.data)
            ? officesRes.data.data
            : [];
      const normalizedOffices: ExecOffice[] = (Array.isArray(rawOffices) ? rawOffices : []).map((x: any) => ({
        id: Number(x.id),
        name: x.name,
        slug: x.slug,
        description: x.description,
        role_id: x.role_id ? Number(x.role_id) : undefined,
        rank: x.rank ? Number(x.rank) : undefined,
        created_at: x.created_at,
        updated_at: x.updated_at,
      }));
      setOffices(normalizedOffices);
    } catch (e: any) {
      setError(e?.message || 'Failed to load executive set');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const loadMembers = async () => {
      const ids = Array.from(new Set(assignments.map((a) => a.member_id).filter(Boolean)));
      const missing = ids.filter((mid) => !memberLookup[mid]);
      if (!missing.length) return;
      const updates: Record<string, { name?: string; membership_no?: string }> = {};
      await Promise.all(
        missing.map(async (mid) => {
          try {
            const res = await apiFetch<any>(`/api/members/${encodeURIComponent(mid)}`);
            const data = res?.data || res;
            if (data && typeof data === 'object') {
              const name = data.name || data.full_name || [data.title, data.surname, data.other_names].filter(Boolean).join(' ');
              const membership_no = data.membership_no || data.membership_id || data.member_id;
              updates[mid] = { name, membership_no };
            }
          } catch {
            // ignore failures; we'll just fall back to UUID
          }
        })
      );
      if (Object.keys(updates).length) {
        setMemberLookup((prev) => ({ ...prev, ...updates }));
      }
    };
    if (assignments.length) {
      void loadMembers();
    }
  }, [assignments, memberLookup]);

  const searchMembers = async (q: string) => {
    const term = q.trim();
    if (term.length < 3) {
      setMemberSearchResults([]);
      setMemberSearchError(null);
      return;
    }
    setMemberSearchLoading(true);
    setMemberSearchError(null);
    try {
      const res = await apiFetch<any>(`/api/members/search/M-${encodeURIComponent(term)}`);
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
      setMemberSearchResults(Array.isArray(raw) ? raw : []);
    } catch (e: any) {
      setMemberSearchError(e?.message || 'Search failed');
      setMemberSearchResults([]);
    } finally {
      setMemberSearchLoading(false);
    }
  };

  const submitAssign = async () => {
    if (!setItem) return;
    if (!assignForm.member_id.trim() || !assignForm.office_id || !assignForm.position.trim()) {
      setAssignError('All fields are required');
      return;
    }
    setAssignError(null);
    setAssignSuccess(null);
    setAssignSubmitting(true);
    try {
      const body = {
        member_id: assignForm.member_id,
        office_id: assignForm.office_id,
        executive_set_id: setItem.id,
        position: assignForm.position,
      };
      const res = await apiFetch<any>('/api/executive-offices/assign-member', { method: 'POST', body });
      const ok = Boolean(res?.data?.id || res?.id || res?.status === 'success');
      if (!ok) throw new Error(res?.message || 'Could not assign member');
      setAssignForm({ member_id: '', office_id: '' as any, position: '' });
      setMemberSearchQuery('');
      setMemberSearchResults([]);
      try {
        const ev = new CustomEvent('global-alert', {
          detail: { title: 'Success', message: 'Member assigned successfully.' },
        });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch {}
      setAssignSuccess('Member assigned successfully.');
      await loadData();
    } catch (e: any) {
      setAssignError(e?.message || 'Request failed');
    } finally {
      setAssignSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold">Executive Set Detail</div>
          {setItem && (
            <div className="text-xs text-gray-500 mt-1">
              {setItem.name} | {setItem.start_date} → {setItem.end_date}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md">
            Back
          </button>
          <button onClick={() => navigate('/admin/management/executives')} className="px-3 py-2 border rounded-md">
            All Executive Sets
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-3 border rounded-md bg-gray-50 text-gray-700 text-sm">Loading…</div>
      )}
      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}
      {assignSuccess && !loading && (
        <div className="p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{assignSuccess}</div>
      )}

      {setItem && !loading && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border rounded-xl p-3 space-y-1">
              <div className="font-medium mb-1">Assigned Offices</div>
              {assignments.length === 0 && (
                <div className="text-xs text-gray-500 border rounded-md px-3 py-2">No assignments yet.</div>
              )}
              {assignments.length > 0 && (
                <div className="space-y-1">
                  {assignments.map((e) => {
                    const office = offices.find((o) => o.id === (e.executive_office_id || 0));
                    const memberInfo = memberLookup[e.member_id] || {};
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between border rounded-md px-3 py-1.5"
                      >
                        <div>
                          <div className="text-xs font-medium">{office?.name || e.position || 'Office'}</div>
                          <div className="text-[11px] text-gray-700">
                            Member: {memberInfo.name || memberInfo.membership_no || e.member_id}
                          </div>
                          {memberInfo.membership_no && (
                            <div className="text-[11px] text-gray-500">Membership No: {memberInfo.membership_no}</div>
                          )}
                          <div className="text-[10px] text-gray-400 break-all">UUID: {e.member_id}</div>
                        </div>
                        {office?.description && (
                          <div className="text-[11px] text-gray-500 max-w-xs truncate">
                            {office.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-xl p-3 space-y-2">
              <div className="font-medium mb-1">Assign Member</div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Member / Search</label>
                  <input
                    value={memberSearchQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMemberSearchQuery(v);
                      void searchMembers(v);
                    }}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Type membership ID or name to search (min 3 characters)"
                    disabled={assignSubmitting}
                  />
                  {memberSearchError && (
                    <div className="mt-1 text-[11px] text-red-600">{memberSearchError}</div>
                  )}
                  {memberSearchLoading && (
                    <div className="mt-1 text-[11px] text-gray-500">Searching…</div>
                  )}
                  {!memberSearchLoading && memberSearchResults.length > 0 && (
                    <div className="mt-1 max-h-40 overflow-y-auto border rounded-md divide-y text-xs bg-white">
                      {memberSearchResults.map((m: any) => (
                        <button
                          key={m.id || m.user_id || m.email}
                          type="button"
                          onClick={() => {
                            const uuid = m.id || m.uuid || m.user_uuid;
                            const memberId = String(uuid || '');
                            const displayName =
                              m.name ||
                              m.full_name ||
                              `${m.title || ''} ${m.surname || ''} ${m.firstname || ''}`.trim() ||
                              m.email ||
                              memberId;
                            setAssignForm((f) => ({ ...f, member_id: memberId }));
                            setMemberSearchQuery(displayName);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-indigo-50"
                        >
                          <div className="font-medium">{m.name || m.full_name || m.surname || m.email}</div>
                          <div className="text-[11px] text-gray-500">
                            Membership No:{' '}
                            {m.membership_no || m.membership_id || m.member_id || ''}
                          </div>
                          {m.id && (
                            <div className="text-[11px] text-gray-500">UUID: {m.id}</div>
                          )}
                          {m.email && (
                            <div className="text-[11px] text-gray-500">{m.email}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Office</label>
                  <select
                    value={assignForm.office_id}
                    onChange={(e) =>
                      setAssignForm((f) => ({
                        ...f,
                        office_id: (e.target.value ? Number(e.target.value) : '') as any,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    disabled={assignSubmitting}
                  >
                    <option value="">Select office</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Position</label>
                  <input
                    value={assignForm.position}
                    onChange={(e) =>
                      setAssignForm((f) => ({ ...f, position: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    disabled={assignSubmitting}
                  />
                </div>

                {assignError && (
                  <div className="text-xs text-red-600">{assignError}</div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void submitAssign()}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-60"
                    disabled={assignSubmitting}
                  >
                    {assignSubmitting ? 'Assigning…' : 'Assign Member'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveSetDetail;
