export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'supervisor' | 'admin';
  avatar?: string;
}

export interface Student extends User {
  level: number;
  supervisorId?: string;
  progress: number;
  lastActive: string;
}

export interface Supervisor extends User {
  maxStudents: number;
  currentStudents: number;
}

export interface LogbookEntry {
  id: string;
  studentId: string;
  week: number;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt: string;
  updatedAt: string;
}

export type TabType = 'supervise' | 'students' | 'reports';

export interface Tab {
  id: TabType;
  label: string;
  count?: number;
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
