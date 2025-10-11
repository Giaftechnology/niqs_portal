import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import './SupervisorSelection.css';

function SupervisorSelection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('ff5a1bcf-a12f-4901-a2ee-376dab7d20e5');

  const handleSelect = () => {
    // Navigate to supervisor dashboard after selection
    navigate('/supervisor-dashboard');
  };

  return (
    <div className="supervisor-selection">
      <div className="selection-container">
        <div className="selection-header">
          <h1 className="selection-title">Select Your Supervisor</h1>
          <p className="selection-subtitle">Browse all users and send a supervision request to anyone</p>
        </div>

        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search supervisors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="supervisor-list">
          <div className="supervisor-item">
            <div className="supervisor-info">
              <div className="supervisor-avatar">
                <User size={24} color="#6b7280" />
              </div>
              <div className="supervisor-details">
                <h3 className="supervisor-name">b</h3>
                <p className="supervisor-id">ff5a1bcf-a12f-4901-a2ee-376dab7d20e5</p>
              </div>
            </div>
            <div className="supervisor-actions">
              <span className="supervisor-level">Level 1</span>
              <button className="select-btn" onClick={handleSelect}>
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupervisorSelection;
