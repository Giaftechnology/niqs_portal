export type Day = 'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday';
export const DAYS: Day[] = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export type LogStatus = 'submitted'|'approved'|'rejected'|'pending';

export const WEEKS: number[] = Array.from({ length: 52 }, (_, i) => i + 1);

export const entriesKey = (email: string, week: number) => `student_entries_${email}_week_${week}`;

// supervision keys
export const supervisionStatusKey = (email: string) => `student_supervision_status_${email}`;
export const supervisorEmailKey = (studentEmail: string) => `student_supervisor_email_${studentEmail}`;
export const supervisorNameKey = (email: string) => `student_supervisor_name_${email}`;

export const STUDENT_REQUEST_EMAIL_KEY = 'student_request_email';

export const statusToClasses = (status: LogStatus): string => {
  switch (status) {
    case 'submitted':
      return 'bg-green-100 text-green-700';
    case 'approved':
      return 'bg-blue-100 text-blue-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};
