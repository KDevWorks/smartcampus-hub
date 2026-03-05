import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Calendar,
  GraduationCap,
  AlertTriangle,
  ClipboardList,
  Users,
  CheckCircle,
  Info,
  Filter
} from 'lucide-react';
import { parentAPI } from '../../../services/api';

type NotificationType = 'attendance' | 'marks' | 'assignment' | 'exam' | 'general' | 'warning';
type FilterType = 'all' | NotificationType;

export const ParentNotifications: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [notificationsData, setNotificationsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildNotifications = async () => {
      try {
        const resChildren = await parentAPI.getChildren();
        if (resChildren.success && resChildren.data && resChildren.data.length > 0) {
          setChildren(resChildren.data);
          const firstChildId = resChildren.data[0]._id;
          setSelectedChild(firstChildId);

          const notifRes = await parentAPI.getChildNotifications(firstChildId);
          if (notifRes.success) {
            setNotificationsData(notifRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to load child notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildNotifications();
  }, []);

  const notifications = notificationsData?.notifications || [
    {
      id: 1,
      type: 'attendance' as NotificationType,
      title: 'Attendance Updated',
      message: 'Attendance has been updated for Data Structures. Present status marked for today\'s class.',
      subject: 'Data Structures (CS301)',
      timestamp: '2026-02-28T10:30:00',
      read: false,
      priority: 'normal'
    },
    {
      id: 2,
      type: 'warning' as NotificationType,
      title: 'Low Attendance Alert',
      message: 'Attendance in Operating Systems has dropped to 77.3%. Please ensure regular attendance to meet the minimum requirement of 75%.',
      subject: 'Operating Systems (CS303)',
      timestamp: '2026-02-28T09:15:00',
      read: false,
      priority: 'high'
    },
    {
      id: 3,
      type: 'marks' as NotificationType,
      title: 'Marks Uploaded',
      message: 'Mid-term examination marks have been uploaded for DBMS. Your child scored 92/100.',
      subject: 'DBMS (CS302)',
      timestamp: '2026-02-27T16:45:00',
      read: false,
      priority: 'normal'
    },
    {
      id: 4,
      type: 'assignment' as NotificationType,
      title: 'New Assignment',
      message: 'A new assignment "Operating Systems Project Report" has been assigned. Due date: March 5, 2026.',
      subject: 'Operating Systems (CS303)',
      timestamp: '2026-02-27T14:20:00',
      read: true,
      priority: 'normal'
    },
    {
      id: 5,
      type: 'assignment' as NotificationType,
      title: 'Assignment Deadline Approaching',
      message: 'Reminder: DBMS Case Study assignment is due in 3 days (March 8, 2026).',
      subject: 'DBMS (CS302)',
      timestamp: '2026-02-27T08:00:00',
      read: true,
      priority: 'medium'
    },
    {
      id: 6,
      type: 'exam' as NotificationType,
      title: 'End Semester Exam Schedule',
      message: 'End semester examination schedule has been released. Exams will begin from March 15, 2026.',
      subject: 'All Subjects',
      timestamp: '2026-02-26T11:30:00',
      read: true,
      priority: 'high'
    },
    {
      id: 7,
      type: 'marks' as NotificationType,
      title: 'Assignment Marks Updated',
      message: 'Assignment marks for Computer Networks Lab have been uploaded. Score: 19/20.',
      subject: 'Computer Networks (CS304)',
      timestamp: '2026-02-25T15:10:00',
      read: true,
      priority: 'normal'
    },
    {
      id: 8,
      type: 'general' as NotificationType,
      title: 'Parent-Teacher Meeting',
      message: 'Annual parent-teacher meeting scheduled for March 12, 2026. Please confirm your attendance.',
      subject: 'General Announcement',
      timestamp: '2026-02-24T10:00:00',
      read: true,
      priority: 'high'
    },
    {
      id: 9,
      type: 'attendance' as NotificationType,
      title: 'Absent Notification',
      message: 'Your child was marked absent in Operating Systems class on February 23, 2026.',
      subject: 'Operating Systems (CS303)',
      timestamp: '2026-02-23T12:00:00',
      read: true,
      priority: 'medium'
    },
    {
      id: 10,
      type: 'warning' as NotificationType,
      title: 'Late Assignment Submission',
      message: 'Software Engineering documentation was submitted late. Please ensure timely submissions in future.',
      subject: 'Software Engineering (CS305)',
      timestamp: '2026-02-22T17:30:00',
      read: true,
      priority: 'medium'
    }
  ];

  const stats = notificationsData?.stats || {
    total: notifications.length,
    unread: notifications.filter((n: any) => !n.read).length,
    attendance: notifications.filter((n: any) => n.type === 'attendance').length,
    marks: notifications.filter((n: any) => n.type === 'marks').length,
    assignment: notifications.filter((n: any) => n.type === 'assignment').length,
    exam: notifications.filter((n: any) => n.type === 'exam').length,
    warning: notifications.filter((n: any) => n.type === 'warning').length,
    general: notifications.filter((n: any) => n.type === 'general').length
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n: any) => n.type === filter);

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case 'attendance':
        return {
          icon: Calendar,
          color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
          iconColor: 'text-blue-500',
          label: 'Attendance'
        };
      case 'marks':
        return {
          icon: GraduationCap,
          color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
          iconColor: 'text-green-500',
          label: 'Marks'
        };
      case 'assignment':
        return {
          icon: ClipboardList,
          color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
          iconColor: 'text-orange-500',
          label: 'Assignment'
        };
      case 'exam':
        return {
          icon: AlertTriangle,
          color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
          iconColor: 'text-purple-500',
          label: 'Exam'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
          iconColor: 'text-red-500',
          label: 'Warning'
        };
      case 'general':
        return {
          icon: Info,
          color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
          iconColor: 'text-gray-500',
          label: 'General'
        };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date('2026-02-28T12:00:00');
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your child's academic activities</p>
        </div>
        {stats.unread > 0 && (
          <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold">
            {stats.unread} New
          </div>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto pb-2"
      >
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent text-foreground hover:bg-accent/80'
            }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'warning'
              ? 'bg-red-500 text-white'
              : 'bg-accent text-foreground hover:bg-accent/80'
            }`}
        >
          Warnings ({stats.warning})
        </button>
        <button
          onClick={() => setFilter('attendance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'attendance'
              ? 'bg-blue-500 text-white'
              : 'bg-accent text-foreground hover:bg-accent/80'
            }`}
        >
          Attendance ({stats.attendance})
        </button>
        <button
          onClick={() => setFilter('marks')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'marks'
              ? 'bg-green-500 text-white'
              : 'bg-accent text-foreground hover:bg-accent/80'
            }`}
        >
          Marks ({stats.marks})
        </button>
        <button
          onClick={() => setFilter('assignment')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'assignment'
              ? 'bg-orange-500 text-white'
              : 'bg-accent text-foreground hover:bg-accent/80'
            }`}
        >
          Assignments ({stats.assignment})
        </button>
        <button
          onClick={() => setFilter('exam')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'exam'
              ? 'bg-purple-500 text-white'
              : 'bg-accent text-foreground hover:bg-accent/80'
            }`}
        >
          Exams ({stats.exam})
        </button>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {filteredNotifications.map((notification, index) => {
          const typeConfig = getTypeConfig(notification.type);
          const TypeIcon = typeConfig.icon;

          return (
            <motion.div
              key={notification.id || notification._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.03 }}
              className={`bg-card border rounded-xl p-5 hover:shadow-lg transition-all ${notification.read ? 'border-border' : 'border-primary bg-primary/5'
                }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${typeConfig.color}`}>
                  <TypeIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{notification.title}</h3>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium">{notification.subject}</span>
                        <span>•</span>
                        <span>{getTimeAgo(notification.timestamp)}</span>
                      </div>
                    </div>
                    {notification.priority !== 'normal' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No notifications found</p>
        </div>
      )}

      {/* Summary Card */}
      {stats.unread > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary rounded-lg">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-lg">You have {stats.unread} unread notification{stats.unread !== 1 ? 's' : ''}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Stay informed about your child's academic progress and important updates
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
