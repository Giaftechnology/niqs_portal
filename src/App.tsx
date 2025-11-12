import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GlobalAlerts from './components/GlobalAlerts';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import NewStudentEntry from './pages/NewStudentEntry';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { AuthProvider, RequireAuth, RequireProfile } from './context/AuthContext';
import ChangePassword from './pages/ChangePassword';
import ConfirmTemp from './pages/ConfirmTemp';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/app/Dashboard';
import Admin from './pages/app/Admin';
import Exams from './pages/app/Exams';
import Accounts from './pages/app/Accounts';
import StudentLogbook from './pages/app/StudentLogbook';
import SupervisorLogbook from './pages/app/SupervisorLogbook';
import HR from './pages/app/HR';
import SuperviseStudentLog from './pages/app/SuperviseStudentLog';
import Databank from './pages/app/Databank';
import SupervisorSelection from './pages/SupervisorSelection';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/Users';
import StaffDetail from './pages/admin/StaffDetail';
import AddStaffWizard from './pages/admin/AddStaffWizard';
import AdminSupervisors from './pages/admin/Supervisors';
import AdminLogs from './pages/admin/Logs';
import AdminRoles from './pages/admin/Roles';
import AdminSettings from './pages/admin/Settings';
import AdminModules from './pages/admin/Modules';
import AdminActions from './pages/admin/Actions';
import AdminRoleDetail from './pages/admin/RoleDetail';
import { RequireAdmin } from './context/AuthContext';
import Onboarding from './pages/Onboarding';
// New admin sections (stubs)
import AdminExams from './pages/admin/Exams';
import AdminEvents from './pages/admin/Events';
import ProcurementDashboard from './pages/admin/ProcurementDashboard';
import AdminAccessors from './pages/admin/Accessors';
import AdminStudents from './pages/admin/Students';
import AdminSubmissions from './pages/admin/Submissions';
import AdminDietManagement from './pages/admin/DietManagement';
import AdminDietDetail from './pages/admin/DietDetail';
import SubmissionDetail from './pages/admin/SubmissionDetail';
import AdminVendors from './pages/admin/Vendors';
import AdminRequisitions from './pages/admin/Requisitions';
import SupervisorAssignments from './pages/admin/SupervisorAssignments';
import PurchaseOrders from './pages/admin/PurchaseOrders';
import AdminProfile from './pages/admin/Profile';
import MembershipDashboard from './pages/admin/membership/Dashboard';
import MembershipProbationals from './pages/admin/membership/Probationals';
import MembershipGraduates from './pages/admin/membership/Graduates';
import MembershipStudents from './pages/admin/membership/Students';
import MembershipMaturedRoutes from './pages/admin/membership/MaturedRoutes';
import MembershipApplications from './pages/admin/membership/Applications';
import MembershipMembers from './pages/admin/membership/Members';
import MembershipProfileView from './pages/admin/membership/ProfileView';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <GlobalAlerts />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/confirm-temp" element={<RequireAuth><ConfirmTemp /></RequireAuth>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/add" element={<AddStaffWizard />} />
            <Route path="users/:id" element={<StaffDetail />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="supervisors" element={<AdminSupervisors />} />
            <Route path="logs" element={<AdminLogs />} />
            {/* Access Control (new) */}
            <Route path="access/modules" element={<AdminModules />} />
            <Route path="access/actions" element={<AdminActions />} />
            <Route path="access/roles" element={<AdminRoles />} />
            {/* Back-compat old paths */}
            <Route path="modules" element={<AdminModules />} />
            <Route path="actions" element={<AdminActions />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="roles/:id" element={<AdminRoleDetail />} />
            {/* New sections */}
            <Route path="exams" element={<AdminExams />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="procurements" element={<ProcurementDashboard />} />
            <Route path="procurements/vendors" element={<AdminVendors />} />
            <Route path="procurements/purchase-orders" element={<PurchaseOrders />} />
            <Route path="procurements/requisitions" element={<AdminRequisitions />} />
            {/* Membership group */}
            <Route path="membership" element={<MembershipDashboard />} />
            <Route path="membership/probationals" element={<MembershipProbationals />} />
            <Route path="membership/graduates" element={<MembershipGraduates />} />
            <Route path="membership/students" element={<MembershipStudents />} />
            <Route path="membership/matured-routes" element={<MembershipMaturedRoutes />} />
            <Route path="membership/applications" element={<MembershipApplications />} />
            <Route path="membership/members" element={<MembershipMembers />} />
            <Route path="membership/profile/:email" element={<MembershipProfileView />} />
            {/* Logbook group */}
            <Route path="logbook/supervisors" element={<AdminSupervisors />} />
            <Route path="logbook/accessors" element={<AdminAccessors />} />
            <Route path="logbook/diet-management" element={<AdminDietManagement />} />
            <Route path="logbook/diet-management/:id" element={<AdminDietDetail />} />
            <Route path="logbook/diet-management/:id/submissions/:sid" element={<SubmissionDetail />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="databank" element={<AdminDashboard />} />
          </Route>
          <Route path="/profile" element={<RequireAuth><RequireProfile><Profile /></RequireProfile></RequireAuth>} />
          <Route path="/change-password" element={<RequireAuth><RequireProfile><ChangePassword /></RequireProfile></RequireAuth>} />
          <Route path="/app" element={<RequireAuth><RequireProfile><DashboardLayout /></RequireProfile></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="admin" element={<Admin />} />
            <Route path="exams" element={<Exams />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="student-logbook" element={<RequireProfile><StudentDashboard /></RequireProfile>} />
            <Route path="supervisor-logbook" element={<RequireProfile><SupervisorLogbook /></RequireProfile>} />
            <Route path="supervised-logbook/:email" element={<RequireProfile><SuperviseStudentLog /></RequireProfile>} />
            <Route path="accessor-logbook" element={<RequireProfile><SupervisorLogbook /></RequireProfile>} />
            <Route path="supervisor-selection" element={<SupervisorSelection />} />
            <Route path="hr" element={<HR />} />
            <Route path="databank" element={<Databank />} />
          </Route>
          <Route path="/student-dashboard" element={<RequireAuth><RequireProfile><StudentDashboard /></RequireProfile></RequireAuth>} />
          <Route path="/supervisor-selection" element={<RequireAuth><RequireProfile><SupervisorSelection /></RequireProfile></RequireAuth>} />
          <Route path="/supervisor-dashboard" element={<RequireAuth><RequireProfile><SupervisorDashboard /></RequireProfile></RequireAuth>} />
          <Route path="/new-student-entry" element={<RequireAuth><RequireProfile><NewStudentEntry /></RequireProfile></RequireAuth>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
