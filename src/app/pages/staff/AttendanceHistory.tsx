import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { Button } from '../../components/ui/button';
import { History, ChevronDown, Calendar, Users, Edit3, X, UserCheck, UserX } from 'lucide-react';
import { motion } from 'motion/react';
import { attendanceAPI } from '../../../services/api';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string; // the backend returns `_id`
  subject: {
    name: string;
    code: string;
  };
  date: string;
  status: string;
}

// Grouped record per subject and date for the UI
interface GroupedRecord {
  id: string;
  subject: string;
  code: string;
  date: string;
  present: number;
  absent: number;
  total: number;
}

export const AttendanceHistory: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<GroupedRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUpdateRecord, setSelectedUpdateRecord] = useState<GroupedRecord | null>(null);
  const [updateStudents, setUpdateStudents] = useState<any[]>([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getAttendanceHistory();
      if (response.success && response.data) {
        const rawRecords = response.data;
        if (Array.isArray(rawRecords) && rawRecords.length > 0) {
          const grouped = rawRecords.reduce((acc: Record<string, GroupedRecord>, curr: any) => {
            // Ensure we have a valid subject object and date before proceeding
            if (!curr.subject || !curr.date) return acc;

            const dateStr = new Date(curr.date).toISOString().split('T')[0];
            const subjectId = curr.subject._id || curr.subject;
            const key = `${subjectId}-${dateStr}`;

            if (!acc[key]) {
              acc[key] = {
                id: key,
                subject: curr.subject.name || 'Unknown Subject',
                code: curr.subject.code || '',
                date: dateStr,
                present: 0,
                absent: 0,
                total: 0
              };
            }

            acc[key].total += 1;
            if (curr.status === 'present' || curr.status === 'late') {
              acc[key].present += 1;
            } else if (curr.status === 'absent') {
              acc[key].absent += 1;
            }

            return acc;
          }, {});

          setAttendanceRecords(Object.values(grouped));
        } else {
          setAttendanceRecords([]);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const openUpdateModal = async (record: GroupedRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUpdateRecord(record);
    setLoadingUpdate(true);
    try {
      const subjectId = record.id.split('-')[0];
      const response = await attendanceAPI.getAttendanceBySubject(subjectId, record.date);
      if (response.success && response.data) {
        setUpdateStudents(response.data.map((r: any) => ({
          id: r.student._id,
          name: r.student.name,
          rollNumber: r.student.rollNumber,
          attendance: r.status as 'present' | 'absent'
        })));
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setUpdateStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: status } : s));
  };

  const submitUpdate = async () => {
    if (!selectedUpdateRecord) return;
    setIsSubmitting(true);
    try {
      const payload = updateStudents.map(s => ({
        studentId: s.id,
        status: s.attendance
      }));
      const subjectId = selectedUpdateRecord.id.split('-')[0];
      const response = await attendanceAPI.updateAttendance(subjectId, selectedUpdateRecord.date, payload);
      if (response.success) {
        toast.success('Attendance updated successfully');
        setSelectedUpdateRecord(null);
        await fetchHistory();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Attendance History</h1>
          <p className="text-muted-foreground">View previous attendance records</p>
        </div>
      </div>

      <div className="space-y-3">
        {attendanceRecords.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Collapsible open={openItems.includes(record.id)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between" onClick={() => toggleItem(record.id)}>
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base">{record.subject}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{record.code}</Badge>
                        {record.date === new Date().toISOString().split('T')[0] && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={(e) => openUpdateModal(record, e)}
                          >
                            <Edit3 className="h-4 w-4" />
                            Update
                          </Button>
                        )}
                        <ChevronDown className={`h-5 w-5 transition-transform ${openItems.includes(record.id) ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 pt-4">
                      <div className="p-4 rounded-lg bg-green-500/10">
                        <p className="text-sm text-green-600 dark:text-green-400 mb-1">Present</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{record.present}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-1">Absent</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{record.absent}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10">
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Percentage</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.round((record.present / record.total) * 100)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </motion.div>
        ))}
      </div>

      {/* Update Modal Overlay */}
      {selectedUpdateRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Edit3 className="h-5 w-5 text-primary" /> Update Attendance</h2>
                <p className="text-sm text-muted-foreground">{selectedUpdateRecord.subject} • {selectedUpdateRecord.date}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedUpdateRecord(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {loadingUpdate ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {updateStudents.map((student) => (
                    <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 gap-3">
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={student.attendance === 'present' ? 'default' : 'outline'}
                          className={student.attendance === 'present' ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}
                          onClick={() => handleAttendanceChange(student.id, 'present')}
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Present
                        </Button>
                        <Button
                          size="sm"
                          variant={student.attendance === 'absent' ? 'default' : 'outline'}
                          className={student.attendance === 'absent' ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : ''}
                          onClick={() => handleAttendanceChange(student.id, 'absent')}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
              <Button variant="outline" onClick={() => setSelectedUpdateRecord(null)}>Cancel</Button>
              <Button onClick={submitUpdate} disabled={loadingUpdate || isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
