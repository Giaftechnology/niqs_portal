import React from 'react';
import { LogStatus, statusToClasses } from '../utils/logbook';

interface Props {
  status: LogStatus;
  className?: string;
}

const StatusPill: React.FC<Props> = ({ status, className }) => {
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${statusToClasses(status)} ${className || ''}`.trim()}>
      {status}
    </span>
  );
};

export default StatusPill;
