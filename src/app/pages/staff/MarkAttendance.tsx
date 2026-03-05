import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { ClipboardCheck, Search, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { subjectsAPI, attendanceAPI } from '../../../services/api';

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  email: string;
  attendance: 'present' | 'absent' | null;
}

export const MarkAttendance: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [markAllPresent, setMarkAllPresent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectsAPI.getMySubjects();
        if (response.success && response.data) {
          setAvailableSubjects(response.data);
        }
      } catch (error) {
        console.error('Failed to load subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch students when subject changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!subject) return;
      try {
        const response = await attendanceAPI.getAttendanceBySubject(subject, date);
        if (response.success && response.data && response.data.length > 0) {
          // Attendance already marked for this date
          setStudents(response.data.map((record: any) => ({
            id: record.student._id,
            name: record.student.name,
            rollNumber: record.student.rollNumber,
            email: record.student.email || '',
            attendance: record.status as 'present' | 'absent'
          })));
        } else {
          // No attendance yet, fetch enrolled students
          const studentsResponse = await subjectsAPI.getSubjectStudents(subject);
          if (studentsResponse.success && studentsResponse.data) {
            setStudents(studentsResponse.data.map((student: any) => ({
              id: student._id,
              name: student.name,
              rollNumber: student.rollNumber,
              email: student.email || '',
              attendance: null
            })));
          }
        }
      } catch (error) {
        console.error('Failed to load students', error);
      }
    };
    fetchStudents();
  }, [subject, date]);

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent') => {
    setStudents(students.map(s =>
      s.id === studentId ? { ...s, attendance: status } : s
    ));
  };

  const handleMarkAllPresent = (checked: boolean) => {
    setMarkAllPresent(checked);
    if (checked) {
      setStudents(students.map(s => ({ ...s, attendance: 'present' as const })));
    } else {
      setStudents(students.map(s => ({ ...s, attendance: null })));
    }
  };

  const handleSubmit = async () => {
    if (!subject) {
      toast.error('Please select a subject');
      return;
    }

    const unmarked = students.filter(s => s.attendance === null);
    if (unmarked.length > 0) {
      toast.error(`Please mark attendance for all students (${unmarked.length} unmarked)`);
      return;
    }

    setIsSubmitting(true);

    try {
      const attendanceData = students.map(s => ({
        studentId: s.id, // the API expects the mongo ID. Assuming id holds the _id now (or needs mapping)
        status: s.attendance,
        period: 1, // Assuming a default period
        remarks: ''
      }));

      const response = await attendanceAPI.markAttendance(subject, date, attendanceData);

      if (response.success) {
        const presentCount = students.filter(s => s.attendance === 'present').length;
        toast.success(`Attendance marked successfully! (${presentCount}/${students.length} present)`);
        // Refresh to show updated data
        const refreshResponse = await attendanceAPI.getAttendanceBySubject(subject, date);
        if (refreshResponse.success && refreshResponse.data) {
          setStudents(refreshResponse.data.map((record: any) => ({
            id: record.student._id,
            name: record.student.name,
            rollNumber: record.student.rollNumber,
            email: record.student.email || '',
            attendance: record.status as 'present' | 'absent'
          })));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: students.filter(s => s.attendance === 'present').length,
    absent: students.filter(s => s.attendance === 'absent').length,
    unmarked: students.filter(s => s.attendance === null).length
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Mark Attendance</h1>
          <p className="text-muted-foreground">Record student attendance for today's class</p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
          <CardDescription>Select subject and date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Present</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Absent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400">Unmarked</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.unmarked}</p>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription>Mark present or absent for each student</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={markAllPresent}
                onCheckedChange={handleMarkAllPresent}
              />
              <Label>Mark All Present</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Students */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.rollNumber} • {student.email}</p>
                  </div>
                  <RadioGroup
                    value={student.attendance || ''}
                    onValueChange={(value) => handleAttendanceChange(student.id, value as 'present' | 'absent')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="present" id={`${student.id}-present`} />
                      <Label htmlFor={`${student.id}-present`} className="flex items-center gap-1 cursor-pointer">
                        <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Present
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absent" id={`${student.id}-absent`} />
                      <Label htmlFor={`${student.id}-absent`} className="flex items-center gap-1 cursor-pointer">
                        <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                        Absent
                      </Label>
                    </div>
                  </RadioGroup>
                </motion.div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full mt-4"
            disabled={isSubmitting || stats.unmarked > 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
