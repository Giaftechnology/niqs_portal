import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [enableMobileSidebar, setEnableMobileSidebar] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Configure application defaults</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Weeks per Year</label>
            <input type="number" value={weeksPerYear} onChange={(e) => setWeeksPerYear(parseInt(e.target.value || '0'))} className="w-full px-3 py-2 border border-gray-200 rounded-md" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800">Mobile Sidebar Toggle</div>
              <div className="text-xs text-gray-500">Enable hamburger menu on small screens</div>
            </div>
            <input type="checkbox" checked={enableMobileSidebar} onChange={(e) => setEnableMobileSidebar(e.target.checked)} />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
