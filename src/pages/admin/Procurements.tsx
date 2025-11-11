import React, { useState } from 'react';

const AdminProcurements: React.FC = () => {
  const [q, setQ] = useState('');
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <span aria-hidden>🗂️</span>
        <span>Procurements</span>
      </div>
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Procurements" className="px-3 py-2 border rounded-md text-sm w-72"/>
        <button className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Procurement</button>
      </div>
      <div className="bg-white border rounded-xl p-4 text-sm text-gray-600">
        Placeholder: Define procurement management as needed.
      </div>
    </div>
  );
};

export default AdminProcurements;
