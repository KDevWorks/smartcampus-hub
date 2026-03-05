import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { parentAPI } from '../../../services/api';
import { Calendar, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ParentAttendance: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildAttendance = async () => {
      try {
        const resChildren = await parentAPI.getChildren();
        if (resChildren.success && resChildren.data && resChildren.data.length > 0) {
          setChildren(resChildren.data);
          const firstChildId = resChildren.data[0]._id;
          setSelectedChild(firstChildId);

          const attendRes = await parentAPI.getChildAttendance(firstChildId);
          if (attendRes.success) {
            setAttendanceData(attendRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to load child attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildAttendance();
  }, []);

  const overallAttendance = attendanceData?.overallAttendance || {
    present: 99,
    absent: 21,
    total: 120,
    percentage: 82.5
  };

  const subjectAttendance = attendanceData?.subjectAttendance || [
    { subject: 'Data Structures', code: 'CS301', present: 18, total: 22, percentage: 81.8, status: 'warning' },
    { subject: 'DBMS', code: 'CS302', present: 21, total: 24, percentage: 87.5, status: 'safe' },
    { subject: 'Operating Systems', code: 'CS303', present: 17, total: 22, percentage: 77.3, status: 'warning' },
    { subject: 'Computer Networks', code: 'CS304', present: 22, total: 26, percentage: 84.6, status: 'safe' },
    { subject: 'Software Engineering', code: 'CS305', present: 21, total: 26, percentage: 80.8, status: 'warning' }
  ];

  const monthlyTrend = attendanceData?.monthlyTrend || [
    { month: 'Aug', attendance: 85 },
    { month: 'Sep', attendance: 88 },
    { month: 'Oct', attendance: 86 },
    { month: 'Nov', attendance: 83 },
    { month: 'Dec', attendance: 80 },
    { month: 'Jan', attendance: 88 },
    { month: 'Feb', attendance: 85 },
    { month: 'Mar', attendance: 82.5 }
  ];

  const recentAttendance = attendanceData?.recentAttendance || [
    { date: '2026-02-28', subject: 'Data Structures', status: 'present' },
    { date: '2026-02-28', subject: 'DBMS', status: 'present' },
    { date: '2026-02-27', subject: 'Computer Networks', status: 'present' },
    { date: '2026-02-27', subject: 'Operating Systems', status: 'absent' },
    { date: '2026-02-26', subject: 'Software Engineering', status: 'present' },
    { date: '2026-02-26', subject: 'Data Structures', status: 'absent' },
    { date: '2026-02-25', subject: 'DBMS', status: 'present' },
    { date: '2026-02-25', subject: 'Computer Networks', status: 'present' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-900';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-900';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-900';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-2">Attendance Tracking</h1>
        <p className="text-muted-foreground">Detailed view of your child's attendance records</p>
      </motion.div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
              <p className="text-2xl font-bold">{overallAttendance.percentage}%</p>
            </div>
          </div>
          {overallAttendance.percentage < 75 && (
            <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Below minimum requirement</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Present</p>
              <p className="text-2xl font-bold">{overallAttendance.present}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Absent</p>
              <p className="text-2xl font-bold">{overallAttendance.absent}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <p className="text-2xl font-bold">{overallAttendance.total}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-bold mb-6">Monthly Attendance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
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
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            />
            {/* 75% threshold line */}
            <Line
              type="monotone"
              dataKey={() => 75}
              stroke="rgb(239, 68, 68)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 rounded bg-primary"></div>
            <span>Attendance %</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 bg-red-500"></div>
            <span>75% Minimum Threshold</span>
          </div>
        </div>
      </motion.div>

      {/* Subject-wise Attendance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-bold mb-6">Subject-wise Attendance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-sm">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Code</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Present</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Total</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Percentage</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {subjectAttendance.map((subject, index) => (
                <motion.tr
                  key={subject.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{subject.subject}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">{subject.code}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{subject.present}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{subject.total}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold">{subject.percentage}%</span>
                      {subject.percentage >= 85 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : subject.percentage >= 75 ? (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(subject.status)}`}>
                        {subject.percentage < 75 && <AlertTriangle className="h-3 w-3" />}
                        {subject.percentage >= 85 ? 'Excellent' : subject.percentage >= 75 ? 'Good' : 'Low'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {subjectAttendance.some(s => s.percentage < 75) && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-yellow-900 dark:text-yellow-100">Attention Required</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Some subjects have attendance below 75%. Consider discussing this with faculty members.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Recent Attendance Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-bold mb-6">Recent Attendance Log</h2>
        <div className="space-y-3">
          {recentAttendance.map((record, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {record.status === 'present' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-sm">{record.subject}</p>
                  <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'present'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
