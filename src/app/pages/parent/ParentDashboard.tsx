import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { parentAPI } from '../../../services/api';
import {
  Calendar,
  GraduationCap,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  CalendarCheck
} from 'lucide-react';
import { Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [childOverview, setChildOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildrenAndData = async () => {
      try {
        const resChildren = await parentAPI.getChildren();
        if (resChildren.success && resChildren.data && resChildren.data.length > 0) {
          setChildren(resChildren.data);
          const firstChildId = resChildren.data[0]._id;
          setSelectedChild(firstChildId);

          const overviewRes = await parentAPI.getChildOverview(firstChildId);
          if (overviewRes.success) {
            setChildOverview(overviewRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to load parent data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildrenAndData();
  }, []);

  // Use API data or fallback to mock data while loading / if API is empty
  const studentData = childOverview?.student || {
    name: children[0]?.name || "Aditya Sharma",
    rollNumber: children[0]?.rollNumber || "CS21B1001",
    class: "B.Tech CSE - 3rd Year",
    semester: "6th Semester"
  };

  const summaryStats = childOverview?.summaryStats || {
    attendance: 82.5,
    cgpa: 8.6,
    riskStatus: 'warning' as 'safe' | 'warning' | 'critical',
    pendingAssignments: 3
  };

  const attendanceTrend = childOverview?.attendanceTrend || [
    { month: 'Jan', attendance: 88 },
    { month: 'Feb', attendance: 85 },
    { month: 'Mar', attendance: 80 },
    { month: 'Apr', attendance: 82 },
    { month: 'May', attendance: 82.5 }
  ];

  const performanceData = childOverview?.performanceData || [
    { subject: 'DS', marks: 85, average: 78 },
    { subject: 'DBMS', marks: 92, average: 82 },
    { subject: 'OS', marks: 78, average: 75 },
    { subject: 'CN', marks: 88, average: 80 },
    { subject: 'SE', marks: 82, average: 76 }
  ];

  const recentNotifications = childOverview?.recentNotifications || [
    { id: 1, type: 'attendance', message: 'Attendance updated for Data Structures', time: '2 hours ago', icon: Calendar, color: 'text-blue-500' },
    { id: 2, type: 'marks', message: 'Mid-term marks uploaded for DBMS', time: '5 hours ago', icon: GraduationCap, color: 'text-green-500' },
    { id: 3, type: 'assignment', message: 'New assignment: Operating Systems Project', time: '1 day ago', icon: ClipboardList, color: 'text-orange-500' },
    { id: 4, type: 'warning', message: 'Low attendance warning: Computer Networks', time: '2 days ago', icon: AlertTriangle, color: 'text-red-500' }
  ];

  const upcomingAssignments = childOverview?.upcomingAssignments || [
    { id: 1, name: 'OS Project Report', subject: 'Operating Systems', deadline: '2026-03-05', status: 'pending' },
    { id: 2, name: 'DBMS Case Study', subject: 'Database Management', deadline: '2026-03-08', status: 'pending' },
    { id: 3, name: 'CN Lab Assignment', subject: 'Computer Networks', deadline: '2026-03-10', status: 'submitted' }
  ];

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLabel = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-border/50"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome Back, Parent! 👋</h1>
        <p className="text-muted-foreground">Monitor your child's academic progress and performance</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div><span className="text-muted-foreground">Student:</span> <span className="font-medium">{studentData.name}</span></div>
          <div><span className="text-muted-foreground">Roll No:</span> <span className="font-medium">{studentData.rollNumber}</span></div>
          <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{studentData.class}</span></div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            {summaryStats.attendance < 75 && (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Overall Attendance</p>
          <p className="text-3xl font-bold">{summaryStats.attendance}%</p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {summaryStats.attendance >= 75 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={summaryStats.attendance >= 75 ? 'text-green-600' : 'text-red-600'}>
              {summaryStats.attendance >= 75 ? 'Above minimum' : 'Below 75%'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Current CGPA</p>
          <p className="text-3xl font-bold">{summaryStats.cgpa}</p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-green-600">Excellent performance</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${summaryStats.riskStatus === 'safe' ? 'bg-green-100 dark:bg-green-900/30' :
                summaryStats.riskStatus === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
              }`}>
              <AlertTriangle className={`h-6 w-6 ${summaryStats.riskStatus === 'safe' ? 'text-green-600 dark:text-green-400' :
                  summaryStats.riskStatus === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                }`} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Academic Risk</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getRiskColor(summaryStats.riskStatus)}`}>
            <span className="font-bold">{getRiskLabel(summaryStats.riskStatus)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Low attendance detected</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ClipboardList className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pending Assignments</p>
          <p className="text-3xl font-bold">{summaryStats.pendingAssignments}</p>
          <Link to="/parent-assignments" className="mt-2 text-xs text-primary hover:underline">
            View all assignments →
          </Link>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Attendance Trend</h2>
            <Link to="/parent-attendance" className="text-sm text-primary hover:underline">
              View Details
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span>75% minimum threshold</span>
          </div>
        </motion.div>

        {/* Academic Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Academic Performance</h2>
            <Link to="/parent-performance" className="text-sm text-primary hover:underline">
              View Details
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="marks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="average" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary"></div>
              <span>Student Marks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-muted"></div>
              <span>Class Average</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Recent Notifications</h2>
            <Link to="/parent-notifications" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className={`p-2 rounded-lg bg-accent ${notification.color}`}>
                  <notification.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Upcoming Assignments</h2>
            <Link to="/parent-assignments" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{assignment.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{assignment.subject}</p>
                  </div>
                  {assignment.status === 'submitted' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : assignment.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full ${assignment.status === 'submitted'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : assignment.status === 'pending'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Predictive Risk Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-900 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">Predictive Academic Risk Indicator</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(summaryStats.riskStatus)}`}>
                  {getRiskLabel(summaryStats.riskStatus)} Risk
                </span>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Contributing Factors:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                    <span>Attendance below 85% (Current: {summaryStats.attendance}%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Good academic performance (CGPA: {summaryStats.cgpa})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <span>{summaryStats.pendingAssignments} pending assignments</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-900">
                <p className="text-sm font-medium mb-2">Recommendation:</p>
                <p className="text-sm text-muted-foreground">
                  Consider scheduling a parent-teacher meeting to discuss attendance concerns.
                  The student is performing well academically but needs to improve attendance.
                </p>
                <Link
                  to="/parent-meeting"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Request Meeting
                  <CalendarCheck className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};