import React from 'react';
import { WEEKS } from '../utils/logbook';

interface Props {
  value: number;
  onChange: (w: number) => void;
  weeks?: number[];
  label?: string;
  size?: 'sm'|'md';
}

const WeekDropdown: React.FC<Props> = ({ value, onChange, weeks = WEEKS, label = 'Week', size='sm' }) => {
  const sizeCls = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-600">{label}</label>
      <select value={value} onChange={(e)=>onChange(Number(e.target.value))} className={`border rounded ${sizeCls}`}>
        {weeks.map(w => (<option key={w} value={w}>Week {w}</option>))}
      </select>
    </div>
  );
};

export default WeekDropdown;
