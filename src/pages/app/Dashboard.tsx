import React from 'react';
import { Activity, Users, ClipboardList, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; delta?: string; icon: React.ReactNode; tone?: 'indigo' | 'purple' | 'emerald' | 'amber' }> = ({ title, value, delta, icon, tone = 'indigo' }) => {
  const map: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${map[tone]}`}>{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-2xl font-semibold text-gray-800 mt-1">{value}</div>
        {delta && <div className="text-xs text-gray-400 mt-1">{delta}</div>}
      </div>
    </div>
  );
};

const LineChart: React.FC<{ data: number[] }> = ({ data }) => {
  const width = 600;
  const height = 200;
  const padding = 24;
  const max = Math.max(...data, 1);
  const stepX = (width - padding * 2) / (data.length - 1);
  const points = data.map((d, i) => [padding + i * stepX, height - padding - (d / max) * (height - padding * 2)] as const);
  const path = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="#6366f1" strokeWidth="2" />
      <polygon
        points={`${points.map(([x, y]) => `${x},${y}`).join(' ')} ${padding + (data.length - 1) * stepX},${height - padding} ${padding},${height - padding}`}
        fill="url(#grad)"
      />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill="#6366f1" />
      ))}
    </svg>
  );
};

const BarChart: React.FC<{ data: number[] }> = ({ data }) => {
  const width = 240;
  const height = 180;
  const padding = 16;
  const gap = 8;
  const max = Math.max(...data, 1);
  const barW = (width - padding * 2 - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      {data.map((d, i) => {
        const h = (d / max) * (height - padding * 2);
        const x = padding + i * (barW + gap);
        const y = height - padding - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={4} className="fill-emerald-400/70" />;
      })}
    </svg>
  );
};

const Dashboard: React.FC = () => {
  const weekly = [12, 16, 10, 18, 22, 17, 25, 28, 24, 30, 26, 33];
  const queues = [54, 31, 12, 22];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of activity across the system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Active Students" value={1240} delta="+3.2% this week" icon={<Users size={18} />} tone="indigo" />
        <StatCard title="Pending Approvals" value={87} delta="-1.1% since yesterday" icon={<ClipboardList size={18} />} tone="purple" />
        <StatCard title="Approved Logs Today" value={316} delta="+8.4% today" icon={<CheckCircle2 size={18} />} tone="emerald" />
        <StatCard title="Flags / Issues" value={12} delta="+2 new" icon={<AlertTriangle size={18} />} tone="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Weekly Activity</h2>
            <span className="text-xs text-gray-400">Last 12 weeks</span>
          </div>
          <LineChart data={weekly} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Queues</h2>
            <Layers size={16} className="text-gray-400" />
          </div>
          <BarChart data={queues} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center justify-between bg-gray-50 rounded p-2"><span>Supervisor approvals</span><span className="font-medium text-gray-800">54</span></div>
            <div className="flex items-center justify-between bg-gray-50 rounded p-2"><span>Accessor grading</span><span className="font-medium text-gray-800">31</span></div>
            <div className="flex items-center justify-between bg-gray-50 rounded p-2"><span>Account verifications</span><span className="font-medium text-gray-800">12</span></div>
            <div className="flex items-center justify-between bg-gray-50 rounded p-2"><span>New registrations</span><span className="font-medium text-gray-800">22</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
          <Activity size={16} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-gray-50">Student A submitted log for Week 12</div>
          <div className="p-3 rounded-lg bg-gray-50">Supervisor B approved 4 logs</div>
          <div className="p-3 rounded-lg bg-gray-50">Accessor C graded 7 logs</div>
          <div className="p-3 rounded-lg bg-gray-50">New graduate registered</div>
          <div className="p-3 rounded-lg bg-gray-50">HR updated databank records</div>
          <div className="p-3 rounded-lg bg-gray-50">Accounts reconciled 14 payments</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
