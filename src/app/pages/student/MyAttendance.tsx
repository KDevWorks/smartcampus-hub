import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

import { useAuth } from '../../contexts/AuthContext';
import { attendanceAPI } from '../../../services/api';
import { toast } from 'sonner';

interface Subject {
  _id?: string;
  id: number;
  name: string;
  code: string;
  totalClasses: number;
  presentCount: number;
  percentage: number;
}

export const MyAttendance: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (!user?.id) return;
        const response = await attendanceAPI.getStudentAttendance(user.id);
        if (response.success && response.data) {
          const summaryData = response.data?.summary || [];
          const formattedSubjects = summaryData.map((stat: any, index: number) => ({
            id: index + 1,
            _id: stat._id,
            name: stat.subject || 'Subject',
            code: stat.subjectCode || `SUB${index + 1}`,
            totalClasses: stat.total || 0,
            presentCount: stat.present || 0,
            percentage: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0
          }));
          setSubjects(formattedSubjects);
        }
      } catch (error) {
        toast.error('Failed to load attendance data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);


  const overallStats = {
    totalClasses: subjects.reduce((sum, s) => sum + s.totalClasses, 0),
    totalPresent: subjects.reduce((sum, s) => sum + s.presentCount, 0),
    averagePercentage: subjects.length > 0 ? (subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length).toFixed(1) : '0.0'
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading attendance data...</div>;
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 dark:text-green-400';
    if (percentage >= 75) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceBg = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500/10';
    if (percentage >= 75) return 'bg-orange-500/10';
    return 'bg-red-500/10';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return '[&>div]:bg-green-600';
    if (percentage >= 75) return '[&>div]:bg-orange-500';
    return '[&>div]:bg-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="text-muted-foreground">Track your attendance across all subjects</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Overall Attendance
                  </p>
                  <p className="text-3xl font-bold">{overallStats.averagePercentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average across all subjects
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Classes Attended
                  </p>
                  <p className="text-3xl font-bold">{overallStats.totalPresent}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Out of {overallStats.totalClasses} classes
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Subjects
                  </p>
                  <p className="text-3xl font-bold">{subjects.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total enrolled subjects
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <TrendingDown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subject Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Subject-wise Attendance</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription>{subject.code}</CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${getPerformanceBg(subject.percentage)}`}>
                      <span className={`text-sm font-semibold ${getPerformanceColor(subject.percentage)}`}>
                        {subject.percentage}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress
                      value={subject.percentage}
                      className={`h-2 ${getProgressColor(subject.percentage)}`}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Present</p>
                        <p className="font-semibold">{subject.presentCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Absent</p>
                        <p className="font-semibold">{subject.totalClasses - subject.presentCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold">{subject.totalClasses}</p>
                      </div>
                    </div>

                    {subject.percentage < 75 && (
                      <div className="p-2 rounded-lg bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                        ⚠️ Below 75% threshold. Attend next classes to improve.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
