import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';

interface Permission { id: number; name: string; guard_name?: string; action?: string }

interface PermissionGroups { [module: string]: Array<{ id: number; name: string; action: string }>; }

interface Role {
  id: number | string;
  name: string;
  guard_name?: string;
  created_at?: string | null;
  updated_at?: string | null;
  permissions?: Permission[];
}

interface ExecOfficeDetail {
  id: number | string;
  name: string;
  slug?: string;
  description?: string;
  role_id?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  role?: Role | null;
}

const ExecutiveOfficeDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [office, setOffice] = useState<ExecOfficeDetail | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permGroups, setPermGroups] = useState<PermissionGroups>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loadingOffice, setLoadingOffice] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadOffice = async () => {
    if (!id) return;
    setLoadingOffice(true); setError(null);
    try {
      const res = await apiFetch<any>(`/api/executive-offices/${encodeURIComponent(String(id))}`);
      const data: ExecOfficeDetail = res?.data || res;
      setOffice(data);
      const r = data.role || null;
      setRole(r);
      const initial: Record<string, boolean> = {};
      (r?.permissions || []).forEach((p) => { if (p?.name) initial[p.name] = true; });
      setSelected(initial);
    } catch (e: any) {
      setError(e?.message || 'Failed to load executive office');
    } finally {
      setLoadingOffice(false);
    }
  };

  const loadPermissions = async () => {
    setLoadingPerms(true); setError(null);
    try {
      const res = await apiFetch<any>('/api/access/permissions');
      const data = res?.data || res || {};
      setPermGroups(data as PermissionGroups);
    } catch (e: any) {
      setError(e?.message || 'Failed to load permissions');
    } finally {
      setLoadingPerms(false);
    }
  };

  useEffect(() => { void loadOffice(); }, [id]);
  useEffect(() => { void loadPermissions(); }, []);

  const allActions = useMemo(() => {
    const set = new Set<string>();
    Object.values(permGroups).forEach((list) => {
      list.forEach((p) => { if (p.action) set.add(p.action); });
    });
    return Array.from(set).sort();
  }, [permGroups]);

  const grid = useMemo(() => {
    return Object.entries(permGroups).map(([moduleName, perms]) => ({
      module: moduleName,
      cells: allActions.map((action) => {
        const perm = perms.find((p) => p.action === action);
        const permName = perm?.name;
        return {
          action,
          permName,
          on: permName ? !!selected[permName] : false,
        };
      }),
    }));
  }, [permGroups, allActions, selected]);

  const togglePermission = (permName: string | undefined, value: boolean) => {
    if (!permName) return;
    setSelected((prev) => {
      const next = { ...prev };
      if (value) next[permName] = true; else delete next[permName];
      return next;
    });
  };

  const savePermissions = async () => {
    if (!role?.id) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      const body = { permissions: Object.keys(selected) };
      const res = await apiFetch<any>(`/api/access/roles/${encodeURIComponent(String(role.id))}/permissions`, {
        method: 'POST',
        body,
      });
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'Permissions updated.';
      setMessage(msg);
      await loadOffice();
    } catch (e: any) {
      setError(e?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const revokeAll = async () => {
    if (!role?.id) return;
    setRevoking(true); setError(null); setMessage(null);
    try {
      const res = await apiFetch<any>(`/api/access/roles/${encodeURIComponent(String(role.id))}/permissions/revoke`);
      const msg =
        (typeof res?.message === 'string' && res.message) ||
        (typeof res?.data?.message === 'string' && res.data.message) ||
        'All permissions revoked.';
      setMessage(msg);
      setSelected({});
      await loadOffice();
    } catch (e: any) {
      setError(e?.message || 'Failed to revoke permissions');
    } finally {
      setRevoking(false);
    }
  };

  if (loadingOffice && !office) return <div className="text-sm text-gray-500">Loading executive office…</div>;
  if (!office) return <div className="text-sm text-gray-500">Executive office not found.</div>;

  const title = office.name || 'Executive Office';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          <p className="text-xs text-gray-500">Role: {role?.name || '—'}</p>
        </div>
        <button
          onClick={() => navigate('/admin/management/executives')}
          className="px-3 py-1.5 border rounded-md text-xs"
        >
          ← Back to Executive Offices
        </button>
      </div>
      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 border-red-200 text-sm">{error}</div>
      )}
      {message && (
        <div className="p-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm">{message}</div>
      )}
      <div className="bg-white border rounded-xl overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left">
              <th className="p-3">Module</th>
              {allActions.map((action) => (
                <th key={action} className="p-3 capitalize">{action}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.module} className="border-t">
                <td className="p-3 capitalize">{row.module}</td>
                {row.cells.map((cell) => (
                  <td key={cell.action} className="p-3">
                    {cell.permName ? (
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={cell.on}
                          onChange={(e) => togglePermission(cell.permName, e.target.checked)}
                        />
                      </label>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={savePermissions}
          disabled={saving || !role?.id}
          className="px-3 py-2 border rounded-md text-sm bg-indigo-600 text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Permissions'}
        </button>
        <button
          onClick={revokeAll}
          disabled={revoking || !role?.id}
          className="px-3 py-2 border rounded-md text-sm text-red-700 border-red-300 disabled:opacity-60"
        >
          {revoking ? 'Revoking…' : 'Revoke All'}
        </button>
      </div>
    </div>
  );
};

export default ExecutiveOfficeDetailPage;
