import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import SupervisorSelection from './pages/SupervisorSelection';
import SupervisorDashboard from './pages/SupervisorDashboard';
import NewStudentEntry from './pages/NewStudentEntry';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { AuthProvider, RequireAuth } from './context/AuthContext';
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
import Databank from './pages/app/Databank';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/confirm-temp" element={<RequireAuth><ConfirmTemp /></RequireAuth>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
          <Route path="/app" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="admin" element={<Admin />} />
            <Route path="exams" element={<Exams />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="student-logbook" element={<StudentDashboard />} />
            <Route path="supervisor-logbook" element={<SupervisorDashboard />} />
            <Route path="accessor-logbook" element={<SupervisorLogbook />} />
            <Route path="hr" element={<HR />} />
            <Route path="databank" element={<Databank />} />
          </Route>
          <Route path="/student-dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
          <Route path="/supervisor-selection" element={<RequireAuth><SupervisorSelection /></RequireAuth>} />
          <Route path="/supervisor-dashboard" element={<RequireAuth><SupervisorDashboard /></RequireAuth>} />
          <Route path="/new-student-entry" element={<RequireAuth><NewStudentEntry /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
