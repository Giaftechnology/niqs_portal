import React from 'react';

const LineChart: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#6366f1' }) => {
  const width = 600, height = 200, pad = 24;
  const max = Math.max(...data, 1);
  const stepX = (width - pad * 2) / (data.length - 1);
  const points = data.map((d, i) => [pad + i * stepX, height - pad - (d / max) * (height - pad * 2)] as const);
  const path = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
      <polygon points={`${points.map(([x,y]) => `${x},${y}`).join(' ')} ${pad + (data.length-1)*stepX},${height-pad} ${pad},${height-pad}`} fill="url(#g)" />
      {points.map(([x,y], i) => (<circle key={i} cx={x} cy={y} r={2.5} fill={color} />))}
    </svg>
  );
};

const BarChart: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#10b981' }) => {
  const width = 260, height = 180, pad = 16, gap = 8;
  const max = Math.max(...data, 1);
  const barW = (width - pad * 2 - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      {data.map((d, i) => {
        const h = (d / max) * (height - pad * 2);
        const x = pad + i * (barW + gap);
        const y = height - pad - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={4} fill={color} opacity={0.7} />;
      })}
    </svg>
  );
};

const AdminDashboard: React.FC = () => {
  const users = [720, 740, 760, 790, 810, 860, 920, 980, 1040, 1120, 1180, 1248];
  const approvals = [12, 18, 14, 19, 25, 16, 22];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Admin Overview</h1>
        <p className="text-sm text-gray-500">Key metrics and quick actions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500">Total Users</div>
          <div className="text-2xl font-semibold text-gray-800 mt-1">1,248</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500">Active Students</div>
          <div className="text-2xl font-semibold text-gray-800 mt-1">932</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500">Supervisors</div>
          <div className="text-2xl font-semibold text-gray-800 mt-1">116</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Users Growth</h2>
            <span className="text-xs text-gray-400">Last 12 months</span>
          </div>
          <LineChart data={users} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Approvals Weekly</h2>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <BarChart data={approvals} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Admin Activity</h2>
        <ul className="text-sm text-gray-600 list-disc pl-6 space-y-2">
          <li>Created new supervisor role policy</li>
          <li>Updated databank schema</li>
          <li>Reviewed 4 access requests</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
