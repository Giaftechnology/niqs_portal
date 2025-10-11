import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye } from 'lucide-react';
import './SupervisorDashboard.css';

function SupervisorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('supervise');

  const handleLogout = () => {
    navigate('/login');
  };

  const handleViewLogbook = () => {
    navigate('/new-student-entry');
  };

  return (
    <div className="supervisor-dashboard">
      <header className="supervisor-header">
        <div>
          <h1 className="supervisor-title">Supervisor Dashboard</h1>
          <p className="supervisor-subtitle">Review and supervise student logbooks</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="supervisor-content">
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'supervision' ? 'active' : ''}`}
            onClick={() => setActiveTab('supervision')}
          >
            Supervision Requests
          </button>
          <button
            className={`tab ${activeTab === 'approval' ? 'active' : ''}`}
            onClick={() => setActiveTab('approval')}
          >
            Approval Requests
          </button>
          <button
            className={`tab ${activeTab === 'supervise' ? 'active' : ''}`}
            onClick={() => setActiveTab('supervise')}
          >
            Supervise Entries
          </button>
        </div>

        <div className="students-list">
          <div className="student-card">
            <h3 className="student-name">New Student</h3>
            <p className="student-level">Level 1</p>
            <button className="view-logbook-btn" onClick={handleViewLogbook}>
              <Eye size={18} />
              View Logbook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;
