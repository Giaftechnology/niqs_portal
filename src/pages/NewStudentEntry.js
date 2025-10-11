import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './NewStudentEntry.css';

function NewStudentEntry() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/supervisor-dashboard');
  };

  return (
    <div className="new-student-entry">
      <button className="back-btn" onClick={handleBackToDashboard}>
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="entry-content">
        <h1 className="entry-title">New Student</h1>
        <p className="entry-level">Level 1</p>

        <div className="week-selector">
          <button className="week-btn">Week 1</button>
        </div>
      </div>
    </div>
  );
}

export default NewStudentEntry;
