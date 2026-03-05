import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Brain, 
  Calendar, 
  MessageSquare, 
  Users, 
  BookOpen,
  ClipboardCheck,
  History,
  Settings,
  BarChart3,
  FileText,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Repeat,
  GraduationCap,
  ClipboardList,
  Bell,
  CalendarCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../components/ui/utils';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMenuByRole = (): MenuSection[] => {
    switch (user?.role) {
      case 'student':
        return [
          {
            items: [
              { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
              { icon: Brain, label: 'Attendance Predictor', path: '/attendance-predictor' },
              { icon: Calendar, label: 'My Attendance', path: '/my-attendance' },
              { icon: MessageSquare, label: 'Submit Complaint', path: '/submit-complaint' },
              { icon: Repeat, label: 'Skill Swap', path: '/skill-swap' }
            ]
          }
        ];
      case 'staff':
        return [
          {
            items: [
              { icon: LayoutDashboard, label: 'Staff Dashboard', path: '/dashboard' },
              { icon: BookOpen, label: 'My Subjects', path: '/my-subjects' },
              { icon: ClipboardCheck, label: 'Mark Attendance', path: '/mark-attendance' },
              { icon: History, label: 'Attendance History', path: '/attendance-history' },
              { icon: MessageSquare, label: 'Manage Complaints', path: '/manage-complaints' }
            ]
          }
        ];
      case 'admin':
        return [
          {
            items: [
              { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/dashboard' }
            ]
          },
          {
            title: 'Management',
            items: [
              { icon: Users, label: 'All Users', path: '/all-users' },
              { icon: MessageSquare, label: 'All Complaints', path: '/all-complaints' }
            ]
          },
          {
            title: 'Analytics',
            items: [
              { icon: BarChart3, label: 'Attendance Analytics', path: '/attendance-analytics' },
              { icon: FileText, label: 'Reports', path: '/reports' }
            ]
          }
        ];
      case 'parent':
        return [
          {
            items: [
              { icon: LayoutDashboard, label: 'Dashboard Overview', path: '/dashboard' },
              { icon: Calendar, label: 'Attendance', path: '/parent-attendance' },
              { icon: GraduationCap, label: 'Academic Performance', path: '/parent-performance' },
              { icon: ClipboardList, label: 'Assignments', path: '/parent-assignments' },
              { icon: MessageSquare, label: 'Faculty Feedback', path: '/parent-feedback' },
              { icon: Bell, label: 'Notifications', path: '/parent-notifications' },
              { icon: CalendarCheck, label: 'Meeting Request', path: '/parent-meeting' }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const menuSections = getMenuByRole();

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">SC</span>
              </div>
              <span className="font-semibold">SmartCampus</span>
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {section.title && !collapsed && (
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground",
                        collapsed ? "justify-center" : ""
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};