import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { parentAPI } from '../../../services/api';
import { GraduationCap, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const ParentAcademicPerformance: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildPerformance = async () => {
      try {
        const resChildren = await parentAPI.getChildren();
        if (resChildren.success && resChildren.data && resChildren.data.length > 0) {
          setChildren(resChildren.data);
          const firstChildId = resChildren.data[0]._id;
          setSelectedChild(firstChildId);

          const perfRes = await parentAPI.getChildPerformance(firstChildId);
          if (perfRes.success) {
            setPerformanceData(perfRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to load child performance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildPerformance();
  }, []);

  const overallPerformance = performanceData?.overallPerformance || {
    cgpa: 8.6,
    sgpa: 8.4,
    rank: 12,
    totalStudents: 120,
    percentile: 90
  };

  const subjectMarks = performanceData?.subjectMarks || [
    {
      subject: 'Data Structures',
      code: 'CS301',
      mid1: 42,
      mid2: 45,
      assignment: 18,
      total: 105,
      maxMarks: 110,
      percentage: 95.5,
      classAverage: 78,
      grade: 'O',
      status: 'excellent'
    },
    {
      subject: 'DBMS',
      code: 'CS302',
      mid1: 48,
      mid2: 44,
      assignment: 20,
      total: 112,
      maxMarks: 120,
      percentage: 93.3,
      classAverage: 82,
      grade: 'O',
      status: 'excellent'
    },
    {
      subject: 'Operating Systems',
      code: 'CS303',
      mid1: 35,
      mid2: 38,
      assignment: 15,
      total: 88,
      maxMarks: 110,
      percentage: 80.0,
      classAverage: 75,
      grade: 'A',
      status: 'good'
    },
    {
      subject: 'Computer Networks',
      code: 'CS304',
      mid1: 44,
      mid2: 46,
      assignment: 19,
      total: 109,
      maxMarks: 120,
      percentage: 90.8,
      classAverage: 80,
      grade: 'O',
      status: 'excellent'
    },
    {
      subject: 'Software Engineering',
      code: 'CS305',
      mid1: 40,
      mid2: 38,
      assignment: 17,
      total: 95,
      maxMarks: 110,
      percentage: 86.4,
      classAverage: 76,
      grade: 'A+',
      status: 'good'
    }
  ];

  const comparisonData = subjectMarks.map((s: any) => ({
    subject: s.code,
    student: s.percentage,
    average: s.classAverage
  }));

  const radarData = subjectMarks.map((s: any) => ({
    subject: s.code,
    score: s.percentage
  }));

  const semesterHistory = performanceData?.semesterHistory || [
    { semester: 'Sem 1', sgpa: 8.2, cgpa: 8.2 },
    { semester: 'Sem 2', sgpa: 8.4, cgpa: 8.3 },
    { semester: 'Sem 3', sgpa: 8.6, cgpa: 8.4 },
    { semester: 'Sem 4', sgpa: 8.8, cgpa: 8.5 },
    { semester: 'Sem 5', sgpa: 8.5, cgpa: 8.55 },
    { semester: 'Sem 6', sgpa: 8.4, cgpa: 8.6 }
  ];

  const getGradeColor = (grade: string) => {
    if (grade === 'O') return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-900';
    if (grade === 'A+' || grade === 'A') return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-900';
    if (grade === 'B+' || grade === 'B') return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-900';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-900';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-2">Academic Performance</h1>
        <p className="text-muted-foreground">Comprehensive view of your child's academic achievements</p>
      </motion.div>

      {/* Overall Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-900 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current CGPA</p>
              <p className="text-3xl font-bold">{overallPerformance.cgpa}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span>Excellent performance</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current SGPA</p>
              <p className="text-3xl font-bold">{overallPerformance.sgpa}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Semester 6</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="text-3xl font-bold">#{overallPerformance.rank}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Out of {overallPerformance.totalStudents} students</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Percentile</p>
              <p className="text-3xl font-bold">{overallPerformance.percentile}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Top performer</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-bold mb-6">Student vs Class Average</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
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
              <Bar dataKey="student" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Student" />
              <Bar dataKey="average" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} name="Class Avg" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary"></div>
              <span>Student Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-muted"></div>
              <span>Class Average</span>
            </div>
          </div>
        </motion.div>

        {/* Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-bold mb-6">Subject Performance Radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <Radar
                name="Performance"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Subject-wise Detailed Marks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-bold mb-6">Subject-wise Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-sm">Subject</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Mid 1</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Mid 2</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Assignments</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Total</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Percentage</th>
                <th className="text-center py-3 px-4 font-medium text-sm">Grade</th>
                <th className="text-center py-3 px-4 font-medium text-sm">vs Average</th>
              </tr>
            </thead>
            <tbody>
              {subjectMarks.map((subject, index) => (
                <motion.tr
                  key={subject.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{subject.subject}</p>
                      <p className="text-xs text-muted-foreground">{subject.code}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{subject.mid1}/50</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{subject.mid2}/50</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{subject.assignment}/20</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold">{subject.total}/{subject.maxMarks}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold">{subject.percentage}%</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {subject.percentage > subject.classAverage ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +{(subject.percentage - subject.classAverage).toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            {(subject.percentage - subject.classAverage).toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground">Strong Subjects</p>
                <p className="text-sm font-bold text-green-700 dark:text-green-300">
                  {subjectMarks.filter(s => s.percentage > 90).length} subjects
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-xs text-muted-foreground">Needs Improvement</p>
                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                  {subjectMarks.filter(s => s.percentage < 85).length} subjects
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Above Average</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {subjectMarks.filter(s => s.percentage > s.classAverage).length}/{subjectMarks.length} subjects
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Semester History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-bold mb-6">Academic Progress History</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {semesterHistory.map((sem, index) => (
            <motion.div
              key={sem.semester}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-2">{sem.semester}</p>
              <p className="text-lg font-bold mb-1">SGPA: {sem.sgpa}</p>
              <p className="text-sm text-muted-foreground">CGPA: {sem.cgpa}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
