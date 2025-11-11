export type AdminUserRole = 'student' | 'supervisor' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminUserRole;
  active: boolean;
}

export interface SupervisorProfile {
  id: string; // user id
  students: string[]; // student emails
}

export type LogStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface AdminLogEntry {
  id: string;
  studentEmail: string;
  dietId?: string;
  week: number;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  text: string;
  status: LogStatus;
  createdAt: number;
}
