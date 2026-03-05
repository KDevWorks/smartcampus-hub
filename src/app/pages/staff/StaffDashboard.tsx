import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BookOpen, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { subjectsAPI } from '../../../services/api';
// We'll need a subject API route if it exists, or derive it from the user profile/attendance stats. 
// Assuming the backend has a way to get staff subjects. Let's check API_INTEGRATION_GUIDE.
// The guide lists `attendanceAPI.getAttendanceBySubject` and `attendanceAPI.getAttendanceHistory`, but not a direct `getStaffSubjects`.
// Let's assume the user object has subjects or we need a specific endpoint. 
// For now, looking at the backend, wait... I should check how the backend handles staff subjects.

interface Subject {
  id: number;
  name: string;
  code: string;
  totalStudents: number;
  averageAttendance: number;
}

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectsAPI.getMySubjects();
        if (response.success && response.data) {
          setSubjects(response.data);
        }
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const stats = [
    {
      title: 'Total Subjects',
      value: subjects.length,
      description: 'Subjects assigned',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Students',
      value: subjects.reduce((sum, s) => sum + s.totalStudents, 0),
      description: 'Across all subjects',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Avg Attendance',
      value: `${Math.round(subjects.reduce((sum, s) => sum + s.averageAttendance, 0) / subjects.length)}%`,
      description: 'Overall average',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 dark:text-green-400';
    if (percentage >= 75) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAttendanceBg = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500/10';
    if (percentage >= 75) return 'bg-orange-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your subjects and track student attendance
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
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {subject.code}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Students</span>
                  </div>
                  <span className="text-sm font-semibold">{subject.totalStudents}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Avg Attendance</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full ${getAttendanceBg(subject.averageAttendance)}`}>
                    <span className={`text-sm font-semibold ${getAttendanceColor(subject.averageAttendance)}`}>
                      {subject.averageAttendance}%
                    </span>
                  </div>
                </div>

                <Link to="/mark-attendance" state={{ subject }}>
                  <Button className="w-full" size="sm">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Mark Attendance
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/mark-attendance">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </Link>
            <Link to="/attendance-history">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                View History
              </Button>
            </Link>
            <Link to="/manage-complaints">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Complaints
              </Button>
            </Link>
            <Link to="/my-subjects">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                My Subjects
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
