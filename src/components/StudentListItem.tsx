import React from 'react';

interface Props {
  name?: string;
  email: string;
  onView?: () => void;
}

const StudentListItem: React.FC<Props> = ({ name, email, onView }) => {
  return (
    <div className="flex items-center justify-between border rounded p-2 text-sm">
      <div className="truncate">
        <span className="font-medium">{name || email}</span>
        <span className="text-gray-500"> • {email}</span>
      </div>
      {onView && (
        <button onClick={onView} className="px-2 py-1 border rounded text-xs">View Logbook</button>
      )}
    </div>
  );
};

export default StudentListItem;
