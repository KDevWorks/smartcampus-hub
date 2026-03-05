import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  Calendar,
  MessageSquare,
  TrendingUp,
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceAPI, complaintAPI } from '../../../services/api';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [complaintCount, setComplaintCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Fetch real data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        // Fetch Attendance stats
        const attendanceData = await attendanceAPI.getStudentAttendance(user.id);
        if (attendanceData.success && attendanceData.data) {
          const summary = attendanceData.data.summary || [];
          const totalClasses = summary.reduce((sum: number, s: any) => sum + s.total, 0);
          const totalPresent = summary.reduce((sum: number, s: any) => sum + s.present, 0);
          const currentAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
          setAttendanceCount(currentAttendance);

          // Map recent records
          const records = attendanceData.data.records || [];
          setRecentActivities(records.slice(0, 5).map((record: any) => ({
            id: record._id,
            subject: record.subject?.name || 'Subject',
            status: record.status,
            date: new Date(record.date).toISOString().split('T')[0],
            time: new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }

        // Fetch Complaints data
        const complaintsData = await complaintAPI.getMyComplaints();
        if (complaintsData.success && (complaintsData.complaints || complaintsData.data)) {
          const list = complaintsData.complaints || complaintsData.data || [];
          const activeComplaints = list.filter((c: any) => c.status !== 'resolved');
          setComplaintCount(activeComplaints.length);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user]);

  const stats = [
    {
      title: 'Attendance',
      value: `${attendanceCount}%`,
      description: 'Overall attendance',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Complaints',
      value: complaintCount,
      description: 'Active complaints',
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Target',
      value: '75%',
      description: 'Attendance goal',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your attendance, view your progress, and manage complaints
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Attendance Predictor */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Predictor Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI Attendance Predictor</CardTitle>
              </div>
              <CardDescription>
                Predict how many classes you can skip or need to attend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current: {attendanceCount}%</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Target: 75%
                  </span>
                </div>
                <Progress value={attendanceCount} className="h-2" />
                <Link to="/attendance-predictor">
                  <Button className="w-full">
                    Launch Predictor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {activity.status === 'present' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{activity.subject}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${activity.status === 'present'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/my-attendance">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Attendance
              </Button>
            </Link>
            <Link to="/submit-complaint">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Complaint
              </Button>
            </Link>
            <Link to="/skill-swap">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Skill Swap
              </Button>
            </Link>
            <Link to="/attendance-predictor">
              <Button variant="outline" className="w-full justify-start">
                <Brain className="mr-2 h-4 w-4" />
                AI Predictor
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
