import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StudentDashboard } from '../pages/student/Dashboard';
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ParentDashboard } from '../pages/parent/ParentDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <StudentDashboard />;
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'parent':
      return <ParentDashboard />;
    default:
      return <StudentDashboard />;
  }
};