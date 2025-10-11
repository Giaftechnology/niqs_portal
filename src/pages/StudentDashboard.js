import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, TrendingUp } from 'lucide-react';
import './StudentDashboard.css';

function StudentDashboard() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/login');
  };

  const handleSelectSupervisor = () => {
    navigate('/supervisor-selection');
  };

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <BookOpen size={24} color="white" />
          </div>
          <div>
            <h1 className="header-title">Logbook System</h1>
            <p className="header-subtitle">z</p>
          </div>
        </div>
        <button className="sign-out-btn" onClick={handleSignOut}>
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="card level-card">
            <div className="card-header">
              <BookOpen size={20} color="#6366f1" />
              <h3>Current Level</h3>
            </div>
            <h2 className="level-title">Level 1</h2>
          </div>

          <div className="card progress-card">
            <div className="card-header">
              <TrendingUp size={20} color="#1f2937" />
              <h3>Progress</h3>
            </div>
            <div className="progress-item">
              <span className="progress-label">Weeks Completed</span>
              <span className="progress-value">0 / 52</span>
            </div>
            <div className="total-entries">
              <span className="entries-label">Total Entries</span>
              <span className="entries-value">0</span>
            </div>
          </div>

          <div className="card supervision-card">
            <h3 className="supervision-title">Supervision Status</h3>
            <p className="supervision-message">Your supervision request was rejected.</p>
            <button className="select-supervisor-btn" onClick={handleSelectSupervisor}>
              Select Different Supervisor
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="logbook-access-card">
            <h2 className="access-title">Logbook Access</h2>
            <p className="access-message">
              You need an approved supervisor before you can start filling your logbook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
