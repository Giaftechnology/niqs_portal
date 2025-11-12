export type AdminUserRole = 'student' | 'supervisor' | 'admin' | '-';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminUserRole;
  active: boolean;
}

export interface AdminActivity {
  id: string;
  userEmail: string;
  message: string;
  createdAt: number;
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

export interface StaffProfile {
  id: string;
  createdAt: string;
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  nationality?: string;
  stateOfOrigin?: string;
  lga?: string;
  contactAddress?: string;
  phoneNumber?: string;
  emailAddress: string;
  // Employment Information
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  employmentType?: string;
  dateHired?: string;
  confirmationDate?: string;
  employmentStatus?: string;
  supervisor?: string;
  workLocation?: string;
  // Payroll and Benefits
  basicSalary?: string;
  bankName?: string;
  accountNumber?: string;
  pensionPin?: string;
  taxId?: string;
  nhfNumber?: string;
  paymentMethod?: string;
  // Upload
  photoBase64?: string;
}
