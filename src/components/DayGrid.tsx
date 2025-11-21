import React from 'react';
import { Day, DAYS } from '../utils/logbook';

interface Props {
  values: Partial<Record<Day, string>>;
  placeholder?: string;
  className?: string;
}

const DayGrid: React.FC<Props> = ({ values, placeholder='— (No entry)', className }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 text-sm ${className || ''}`.trim()}>
      {DAYS.map(d => (
        <div key={d} className="border rounded p-3">
          <div className="text-xs text-gray-500 mb-1">{d}</div>
          <div className="whitespace-pre-wrap min-h-[64px]">{values[d] || placeholder}</div>
        </div>
      ))}
    </div>
  );
};

export default DayGrid;
