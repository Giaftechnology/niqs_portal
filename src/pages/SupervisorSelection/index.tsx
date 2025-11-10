import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, User } from 'lucide-react';

const SupervisorSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelect = (): void => {
    if (!user) return;
    const statusKey = `student_supervision_status_${user.email}`;
    const nameKey = `student_supervisor_name_${user.email}`;
    localStorage.setItem(statusKey, 'pending');
    localStorage.setItem(nameKey, 'b');
    localStorage.setItem('student_request_email', user.email);
    navigate('/app/student-logbook');
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">Select Your Supervisor</h1>
          <p className="text-sm text-gray-500">Browse all users and send a supervision request to anyone</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3.5 border-2 border-indigo-500 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-600 transition-all"
            placeholder="Search supervisors..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <User size={24} color="#6b7280" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">b</h3>
                <p className="text-xs text-gray-500 font-mono">ff5a1bcf-a12f-4901-a2ee-376dab7d20e5</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Level 1</span>
              <button 
                onClick={handleSelect}
                className="px-6 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
              >
                Select
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <User size={24} color="#6b7280" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">b</h3>
                <p className="text-xs text-gray-500 font-mono">ff5a1bcf-a12f-4901-a2ee-376dab7d20e5</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Level 1</span>
              <button 
                onClick={handleSelect}
                className="px-6 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
              >
                Select
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <User size={24} color="#6b7280" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">b</h3>
                <p className="text-xs text-gray-500 font-mono">ff5a1bcf-a12f-4901-a2ee-376dab7d20e5</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Level 1</span>
              <button 
                onClick={handleSelect}
                className="px-6 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorSelection;
