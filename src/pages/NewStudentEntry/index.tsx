import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NewStudentEntry: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = (): void => {
    navigate('/supervisor-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button 
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-sm text-gray-800 hover:text-indigo-500 transition-colors mb-10"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-4xl font-semibold text-indigo-500 mb-2">New Student</h1>
        <p className="text-sm text-gray-500 mb-8">Level 1</p>

        <div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all">
            Week 1
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewStudentEntry;
