import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, TrendingUp } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = (): void => {
    navigate('/login');
  };

  const handleSelectSupervisor = (): void => {
    navigate('/supervisor-selection');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white px-8 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <BookOpen size={24} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Logbook System</h1>
            <p className="text-xs text-gray-500">z</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <div className="flex gap-6 p-8 max-w-7xl mx-auto">
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} color="#6366f1" />
              <h3 className="text-sm font-semibold text-gray-800">Current Level</h3>
            </div>
            <h2 className="text-4xl font-bold text-indigo-500 mt-2">Level 1</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} color="#1f2937" />
              <h3 className="text-sm font-semibold text-gray-800">Progress</h3>
            </div>
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
              <span className="text-sm text-gray-500">Weeks Completed</span>
              <span className="text-sm font-semibold text-gray-800">0 / 52</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-1">
              <span className="text-xs text-gray-500">Total Entries</span>
              <span className="text-2xl font-bold text-gray-800">0</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Supervision Status</h3>
            <p className="text-sm text-red-600 mb-4">Your supervision request was rejected.</p>
            <button 
              onClick={handleSelectSupervisor}
              className="w-full py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Select Different Supervisor
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Logbook Access</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              You need an approved supervisor before you can start filling your logbook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
