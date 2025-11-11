import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminStore } from '../../utils/adminStore';

const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon?: string }) => (
  <div className="p-4 border rounded-xl bg-white">
    <div className="flex items-center justify-between text-sm text-gray-500">
      <span>{label}</span>
      {icon && <span>{icon}</span>}
    </div>
    <div className="mt-2 text-2xl font-semibold text-gray-800">{value}</div>
  </div>
);

const ProcurementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const reqs = AdminStore.listRequisitions();
  const vendors = AdminStore.listVendors();
  const pos = AdminStore.listPOs();

  const totalReqs = reqs.length;
  const pending = reqs.filter(r => r.status === 'Pending').length;
  const approved = reqs.filter(r => r.status === 'Approved').length;
  const purchaseOrders = pos.length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const totalSpend = pos.reduce((s,p)=> s + (p.amount||0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your procurement operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Requisitions" value={totalReqs} icon="📄" />
        <StatCard label="Pending Approval" value={pending} icon="⏳" />
        <StatCard label="Approved" value={approved} icon="✅" />
        <StatCard label="Purchase Orders" value={purchaseOrders} icon="🧾" />
        <StatCard label="Active Vendors" value={activeVendors} icon="🧑‍💼" />
        <StatCard label="Total Spend" value={`₦${totalSpend.toLocaleString()}`} icon="💳" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 border rounded-xl">
          <div className="text-sm font-medium text-gray-800 mb-3">Monthly Spending Trends</div>
          <LineChartMini width={640} height={200} data={[120, 140, 130, 180, 220, 210, 260, 240, 270, 300, 290, 320]} />
        </div>
        <div className="bg-white p-4 border rounded-xl">
          <div className="text-sm font-medium text-gray-800 mb-3">Order Status Distribution</div>
          <DonutChart
            size={200}
            segments={[
              { label: 'Draft', value: reqs.filter(r=>r.status==='Draft').length, color: '#CBD5E1' },
              { label: 'Pending', value: pending, color: '#F59E0B' },
              { label: 'Approved', value: approved, color: '#10B981' },
            ]}
          />
        </div>
      </div>

      <div className="bg-white p-4 border rounded-xl">
        <div className="text-sm font-medium text-gray-800 mb-3">Quick Actions</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={()=>navigate('/admin/procurements/requisitions')} className="p-4 border rounded-lg text-left hover:bg-gray-50">
            <div className="text-sm font-medium text-gray-800">Create Purchase Requisition</div>
            <div className="text-xs text-gray-500">Start a new procurement request</div>
          </button>
          <button onClick={()=>navigate('/admin/procurements/vendors')} className="p-4 border rounded-lg text-left hover:bg-gray-50">
            <div className="text-sm font-medium text-gray-800">Add New Vendor</div>
            <div className="text-xs text-gray-500">Register a new supplier</div>
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Or go to <Link to="/admin/procurements/vendors" className="text-indigo-600">Vendors</Link> or <Link to="/admin/procurements/requisitions" className="text-indigo-600">Requisitions</Link>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;

// Minimal, dependency-free charts
const LineChartMini = ({ width, height, data }:{ width:number;height:number;data:number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 24;
  const w = width - pad*2;
  const h = height - pad*2;
  const points = data.map((v, i) => {
    const x = pad + (i/(data.length-1)) * w;
    const y = pad + h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="w-full">
      <rect x={0} y={0} width={width} height={height} rx={12} className="fill-transparent" />
      <polyline points={points} fill="none" stroke="#4F46E5" strokeWidth={2} />
      {data.map((v,i)=>{
        const x = pad + (i/(data.length-1)) * w;
        const y = pad + h - ((v - min) / (max - min || 1)) * h;
        return <circle key={i} cx={x} cy={y} r={2} fill="#4F46E5" />;
      })}
    </svg>
  );
};

const DonutChart = ({ size, segments }:{ size:number; segments: Array<{ label:string; value:number; color:string }> }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size/2;
  const inner = r*0.6;
  let angle = -Math.PI/2;
  const center = { x: r, y: r };
  const arcs = segments.map((s, idx) => {
    const theta = (s.value/total) * Math.PI*2;
    const x1 = center.x + r*Math.cos(angle);
    const y1 = center.y + r*Math.sin(angle);
    const x2 = center.x + r*Math.cos(angle + theta);
    const y2 = center.y + r*Math.sin(angle + theta);
    const large = theta > Math.PI ? 1 : 0;
    const d = `M ${center.x} ${center.y} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle += theta;
    return <path key={idx} d={d} fill={s.color} />;
  });
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size}>
        {arcs}
        <circle cx={center.x} cy={center.y} r={inner} fill="white" />
        <text x={center.x} y={center.y} textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-700">
          {total}
        </text>
      </svg>
      <div className="text-xs space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
            <span className="text-gray-700 w-20">{s.label}</span>
            <span className="text-gray-500">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
