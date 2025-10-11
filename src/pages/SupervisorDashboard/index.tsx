import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye } from 'lucide-react';
import { TabType } from '../../types';

const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('supervise');

  const handleLogout = (): void => {
    navigate('/login');
  };

  const handleViewLogbook = (): void => {
    navigate('/new-student-entry');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white px-8 py-8 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-indigo-500 mb-1">Supervisor Dashboard</h1>
          <p className="text-sm text-gray-500">Review and supervise student logbooks</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-8 pb-8">
        <div className="flex gap-3 mb-8 border-b-2 border-gray-200">
          <button
            className={`px-5 py-3 text-sm font-medium transition-all border-b-3 -mb-0.5 ${
              activeTab === 'supervision'
                ? 'text-gray-800 border-b-indigo-500'
                : 'text-gray-500 border-b-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('supervision')}
          >
            Supervision Requests
          </button>
          <button
            className={`px-5 py-3 text-sm font-medium transition-all border-b-3 -mb-0.5 ${
              activeTab === 'approval'
                ? 'text-gray-800 border-b-indigo-500'
                : 'text-gray-500 border-b-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('approval')}
          >
            Approval Requests
          </button>
          <button
            className={`px-5 py-3 text-sm font-medium rounded-lg transition-all border-2 ${
              activeTab === 'supervise'
                ? 'text-gray-800 bg-white border-indigo-500'
                : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('supervise')}
          >
            Supervise Entries
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">New Student</h3>
          <p className="text-sm text-gray-500 mb-4">Level 1</p>
          <button 
            onClick={handleViewLogbook}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
          >
            <Eye size={18} />
            View Logbook
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
