import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, UserCog, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'motion/react';
import { adminAPI } from '../../../services/api';

export const AdminDashboard: React.FC = () => {
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [complaintCount, setComplaintCount] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [complaintStats, setComplaintStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await adminAPI.getOverview();
        if (response.success && response.data) {
          const { studentCount, staffCount, complaintCount, avgAttendance, complaintsByStatus } = response.data;
          setStudentCount(studentCount);
          setStaffCount(staffCount);
          setComplaintCount(complaintCount);
          setAvgAttendance(avgAttendance);

          // Format complaints
          const formattedComplaints = complaintsByStatus.map((c: any) => {
            let color = '#3b82f6';
            if (c._id === 'pending') color = '#f97316';
            else if (c._id === 'resolved') color = '#22c55e';

            return {
              name: c._id.charAt(0).toUpperCase() + c._id.slice(1).replace('-', ' '),
              value: c.count,
              color
            }
          });

          if (formattedComplaints.length === 0) {
            // Fallback default
            setComplaintStats([
              { name: 'Pending', value: 0, color: '#f97316' },
              { name: 'In Progress', value: 0, color: '#3b82f6' },
              { name: 'Resolved', value: 0, color: '#22c55e' }
            ]);
          } else {
            setComplaintStats(formattedComplaints);
          }
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      }
    };

    fetchAdminStats();
  }, []);

  // Removed hardcoded animation that was overwriting API data

  const stats = [
    { title: 'Total Students', value: studentCount, icon: Users, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10' },
    { title: 'Total Staff', value: staffCount, icon: UserCog, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10' },
    { title: 'Total Complaints', value: complaintCount, icon: MessageSquare, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10' },
    { title: 'Avg Attendance', value: `${avgAttendance}%`, icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500/10' }
  ];

  const complaintData = complaintStats;

  const attendanceData = [
    { month: 'Aug', attendance: 75 },
    { month: 'Sep', attendance: 78 },
    { month: 'Oct', attendance: 80 },
    { month: 'Nov', attendance: 76 },
    { month: 'Dec', attendance: 82 },
    { month: 'Jan', attendance: 79 },
    { month: 'Feb', attendance: 81 }
  ];

  const monthlyData = [
    { month: 'Aug', students: 1180, staff: 82 },
    { month: 'Sep', students: 1195, staff: 83 },
    { month: 'Oct', students: 1210, staff: 84 },
    { month: 'Nov', students: 1220, staff: 84 },
    { month: 'Dec', students: 1235, staff: 85 },
    { month: 'Jan', students: 1240, staff: 85 },
    { month: 'Feb', students: 1247, staff: 85 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of campus management system</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Complaint Status Distribution</CardTitle>
            <CardDescription>Current status of all complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={complaintData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={100} fill="#8884d8" dataKey="value">
                  {complaintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
            <CardDescription>Average attendance over months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Trend</CardTitle>
            <CardDescription>Students and staff growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" />
                <Bar dataKey="staff" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
