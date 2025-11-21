import React, { useMemo, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';
import { AdminStore } from '../../utils/adminStore';
import { supervisionStatusKey, supervisorNameKey, STUDENT_REQUEST_EMAIL_KEY, supervisorEmailKey } from '../../utils/logbook';

const SupervisorSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const supervisors = useMemo(() => AdminStore.listSupervisorUsers(), []);
  const membershipIndex = useMemo(() => {
    try {
      const list = JSON.parse(localStorage.getItem('membership_members') || '[]') as Array<{ email:string; membershipNo?: string; name?: string }>;
      const map = new Map<string, { membershipNo?: string; name?: string }>();
      list.forEach(m => map.set(m.email, { membershipNo: m.membershipNo, name: m.name }));
      return map;
    } catch { return new Map<string, { membershipNo?: string; name?: string }>(); }
  }, []);
  const options = useMemo(() => supervisors.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    membershipNo: membershipIndex.get(s.email)?.membershipNo,
  })), [supervisors, membershipIndex]);
  const filtered = useMemo(() => options.filter(o => {
    const q = searchQuery.toLowerCase();
    return [o.name, o.email, o.membershipNo].filter(Boolean).some(v => String(v).toLowerCase().includes(q));
  }), [options, searchQuery]);
  const [selectedId, setSelectedId] = useState<string>('');

  const handleSelect = (): void => {
    if (!user) return;
    const target = options.find(o => o.id === (selectedId || (filtered[0]?.id || '')));
    if (!target) return;
    localStorage.setItem(supervisionStatusKey(user.email), 'pending');
    localStorage.setItem(supervisorNameKey(user.email), target.name || target.email);
    localStorage.setItem(STUDENT_REQUEST_EMAIL_KEY, user.email);
    localStorage.setItem(supervisorEmailKey(user.email), target.email);
    navigate('/app/student-logbook');
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">Select Your Supervisor</h1>
          <p className="text-sm text-gray-500">Search by membership ID or name, then choose from the dropdown.</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3.5 border-2 border-indigo-500 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-600 transition-all"
            placeholder="Search by membership ID or name..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-5 space-y-4">
          <div className="text-xs text-gray-600">Choose Supervisor</div>
          <select
            value={selectedId || (filtered[0]?.id || '')}
            onChange={e=>setSelectedId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
          >
            {filtered.map(o => (
              <option key={o.id} value={o.id}>
                {o.name} {o.membershipNo ? `• ${o.membershipNo}` : ''} • {o.email}
              </option>
            ))}
            {filtered.length===0 && (
              <option value="" disabled>No supervisors match your search</option>
            )}
          </select>
          <div className="flex justify-end">
            <button 
              onClick={handleSelect}
              className="px-6 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
              disabled={filtered.length===0}
            >
              Select Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorSelection;
