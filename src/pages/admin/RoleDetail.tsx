import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';

const RoleDetailPage: React.FC = () => {
  const { id } = useParams();
  const [role, setRole] = useState(() => AdminStore.listRoles().find(r=>r.id===id));
  const modules = AdminStore.listModules();
  const actions = AdminStore.listActions();

  const title = role ? role.name : 'Role';

  const toggle = (moduleName: string, actionName: string, value: boolean) => {
    if (!role) return;
    AdminStore.togglePermission(role.id, moduleName, actionName, value);
    setRole(AdminStore.listRoles().find(r=>r.id===id));
  };

  const refresh = () => setRole(AdminStore.listRoles().find(r=>r.id===id));

  const grid = useMemo(()=>modules.map(m=>({
    module: m.name,
    perms: actions.map(a=>({ action:a.name, on: !!role?.permissions?.[m.name]?.[a.name] }))
  })), [modules, actions, role]);

  if (!role) return <div className="text-sm text-gray-500">Role not found.</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <p className="text-xs text-gray-500">Created at: {role.createdAt}</p>
      </div>
      <div className="bg-white border rounded-xl overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left">
              <th className="p-3">Module</th>
              {actions.map(a=> (
                <th key={a.id} className="p-3 capitalize">{a.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row)=> (
              <tr key={row.module} className="border-t">
                <td className="p-3 capitalize">{row.module}</td>
                {row.perms.map(p=> (
                  <td key={p.action} className="p-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={p.on} onChange={(e)=>toggle(row.module, p.action, e.target.checked)} />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={refresh} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
    </div>
  );
};

export default RoleDetailPage;
