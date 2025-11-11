import React, { useEffect, useState } from 'react';

const ls = (key: string, fallback: any[] = []) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
};

const MembershipDashboard: React.FC = () => {
  const [counts, setCounts] = useState({
    probationals: 0,
    graduates: 0,
    students: 0,
    matured: 0,
    applications: 0,
    members: 0,
  });

  useEffect(() => {
    setCounts({
      probationals: ls('membership_probationals').length,
      graduates: ls('membership_graduates').length,
      students: ls('membership_students').length,
      matured: ls('membership_matured').length,
      applications: ls('membership_applications').length,
      members: ls('membership_members').length,
    });
  }, []);

  const Card = ({ title, value }: { title: string; value: number }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Membership Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of membership stats</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Probationals" value={counts.probationals} />
        <Card title="Graduates" value={counts.graduates} />
        <Card title="Students" value={counts.students} />
        <Card title="Matured Routes" value={counts.matured} />
        <Card title="Applications" value={counts.applications} />
        <Card title="Members" value={counts.members} />
      </div>
    </div>
  );
};

export default MembershipDashboard;
