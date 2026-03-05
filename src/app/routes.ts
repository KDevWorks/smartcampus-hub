import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { Layout } from './components/Layout';
import { DashboardRouter } from './components/DashboardRouter';

// Student pages
import { StudentDashboard } from './pages/student/Dashboard';
import { AttendancePredictor } from './pages/student/AttendancePredictor';
import { MyAttendance } from './pages/student/MyAttendance';
import { SubmitComplaint } from './pages/student/SubmitComplaint';
import { SkillSwap } from './pages/student/SkillSwap';

// Staff pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { MySubjects } from './pages/staff/MySubjects';
import { MarkAttendance } from './pages/staff/MarkAttendance';
import { AttendanceHistory } from './pages/staff/AttendanceHistory';
import { ManageComplaints } from './pages/staff/ManageComplaints';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllUsers } from './pages/admin/AllUsers';
import { AllComplaints } from './pages/admin/AllComplaints';
import { AttendanceAnalytics } from './pages/admin/AttendanceAnalytics';

// Parent pages
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentAttendance } from './pages/parent/ParentAttendance';
import { ParentAcademicPerformance } from './pages/parent/ParentAcademicPerformance';
import { ParentAssignments } from './pages/parent/ParentAssignments';
import { ParentFeedback } from './pages/parent/ParentFeedback';
import { ParentNotifications } from './pages/parent/ParentNotifications';
import { ParentMeeting } from './pages/parent/ParentMeeting';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home
  },
  {
    path: '/',
    Component: Layout,
    children: [
      // Dashboard routes (role-specific)
      { path: 'dashboard', Component: DashboardRouter },
      
      // Student routes
      { path: 'attendance-predictor', Component: AttendancePredictor },
      { path: 'my-attendance', Component: MyAttendance },
      { path: 'submit-complaint', Component: SubmitComplaint },
      { path: 'skill-swap', Component: SkillSwap },
      
      // Staff routes
      { path: 'my-subjects', Component: MySubjects },
      { path: 'mark-attendance', Component: MarkAttendance },
      { path: 'attendance-history', Component: AttendanceHistory },
      { path: 'manage-complaints', Component: ManageComplaints },
      
      // Admin routes
      { path: 'all-users', Component: AllUsers },
      { path: 'all-complaints', Component: AllComplaints },
      { path: 'attendance-analytics', Component: AttendanceAnalytics },
      { path: 'reports', Component: AttendanceAnalytics }, // Reusing analytics for reports
      
      // Parent routes
      { path: 'parent-attendance', Component: ParentAttendance },
      { path: 'parent-performance', Component: ParentAcademicPerformance },
      { path: 'parent-assignments', Component: ParentAssignments },
      { path: 'parent-feedback', Component: ParentFeedback },
      { path: 'parent-notifications', Component: ParentNotifications },
      { path: 'parent-meeting', Component: ParentMeeting }
    ]
  }
]);