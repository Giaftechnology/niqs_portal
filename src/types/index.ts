export interface User {
  id: string;
  name: string;
  email: string;
  level: number;
}

export interface Student extends User {
  supervisorId?: string;
  weeksCompleted: number;
  totalEntries: number;
  supervisionStatus: 'pending' | 'approved' | 'rejected';
}

export interface Supervisor extends User {
  students: Student[];
}

export interface LogbookEntry {
  id: string;
  studentId: string;
  week: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export type TabType = 'supervision' | 'approval' | 'supervise';
