import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, User, Clock, CheckCircle, XCircle, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { parentAPI } from '../../../services/api';

type MeetingStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export const ParentMeeting: React.FC = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [meetingHistory, setMeetingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    date: '',
    time: '',
    reason: '',
    message: ''
  });

  const fetchMeetings = async () => {
    try {
      const response = await parentAPI.getParentMeetings();
      if (response.success && response.data) {
        setMeetingHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const teachers = [
    { name: 'Dr. Rajesh Kumar', subject: 'Data Structures (CS301)' },
    { name: 'Prof. Sneha Sharma', subject: 'DBMS (CS302)' },
    { name: 'Dr. Amit Verma', subject: 'Operating Systems (CS303)' },
    { name: 'Prof. Priya Mehta', subject: 'Computer Networks (CS304)' },
    { name: 'Dr. Vikram Singh', subject: 'Software Engineering (CS305)' }
  ];

  const reasons = [
    'Academic Performance Discussion',
    'Attendance Concern',
    'Behavioral Discussion',
    'Course Guidance',
    'Assignment Queries',
    'Career Counseling',
    'General Discussion',
    'Other'
  ];

  // Fallback to initial mock data if no meetings exist for visual demo
  const displayMeetings = meetingHistory.length > 0 ? meetingHistory : [
    {
      id: 1,
      teacher: 'Dr. Rajesh Kumar',
      subject: 'Data Structures',
      date: '2026-03-10',
      time: '10:00 AM',
      reason: 'Academic Performance Discussion',
      status: 'approved' as MeetingStatus,
      requestDate: '2026-02-28',
      message: 'Would like to discuss academic progress and future opportunities',
      response: 'Meeting confirmed. Looking forward to meeting you.'
    },
    {
      id: 2,
      teacher: 'Dr. Amit Verma',
      subject: 'Operating Systems',
      date: '2026-03-08',
      time: '2:00 PM',
      reason: 'Attendance Concern',
      status: 'pending' as MeetingStatus,
      requestDate: '2026-02-27',
      message: 'Need to discuss attendance issues and catch-up plan',
      response: null
    },
    {
      id: 3,
      teacher: 'Prof. Sneha Sharma',
      subject: 'DBMS',
      date: '2026-02-15',
      time: '11:30 AM',
      reason: 'Academic Performance Discussion',
      status: 'completed' as MeetingStatus,
      requestDate: '2026-02-05',
      message: 'Discuss semester performance and project guidance',
      response: 'Meeting completed successfully. Student is doing well.'
    },
    {
      id: 4,
      teacher: 'Dr. Vikram Singh',
      subject: 'Software Engineering',
      date: '2026-02-20',
      time: '3:00 PM',
      reason: 'Assignment Queries',
      status: 'rejected' as MeetingStatus,
      requestDate: '2026-02-18',
      message: 'Need clarification on late submission',
      response: 'Please schedule during office hours instead. Office hours: Mon-Fri 4-5 PM'
    }
  ];

  const stats = {
    total: displayMeetings.length,
    pending: displayMeetings.filter((m: any) => m.status === 'pending').length,
    approved: displayMeetings.filter((m: any) => m.status === 'approved').length,
    completed: displayMeetings.filter((m: any) => m.status === 'completed').length,
    rejected: displayMeetings.filter((m: any) => m.status === 'rejected').length
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teacher || !formData.date || !formData.time || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await parentAPI.requestMeeting(formData);
      if (response.success) {
        toast.success('Meeting request submitted successfully!');
        setShowRequestForm(false);
        setFormData({
          teacher: '',
          subject: '',
          date: '',
          time: '',
          reason: '',
          message: ''
        });
        // Refresh the list to show the new meeting
        fetchMeetings();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit meeting request');
    }
  };

  const getStatusConfig = (status: MeetingStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-900',
          label: 'Pending',
          iconColor: 'text-orange-500'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-900',
          label: 'Approved',
          iconColor: 'text-green-500'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-900',
          label: 'Rejected',
          iconColor: 'text-red-500'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-900',
          label: 'Completed',
          iconColor: 'text-blue-500'
        };
    }
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
          <h1 className="text-2xl font-bold mb-2">Parent-Teacher Meetings</h1>
          <p className="text-muted-foreground">Schedule and manage meetings with faculty members</p>
        </div>
        {!showRequestForm && (
          <Button onClick={() => setShowRequestForm(true)} className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            Request Meeting
          </Button>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <CalendarCheck className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Requests</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-orange-200 dark:border-orange-900 rounded-xl p-5"
        >
          <Clock className="h-5 w-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-green-200 dark:border-green-900 rounded-xl p-5"
        >
          <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-blue-200 dark:border-blue-900 rounded-xl p-5"
        >
          <CheckCircle className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </motion.div>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Request New Meeting</h2>
            <Button variant="outline" onClick={() => setShowRequestForm(false)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Teacher <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.teacher}
                  onChange={(e) => {
                    const selected = teachers.find(t => t.name === e.target.value);
                    setFormData({
                      ...formData,
                      teacher: e.target.value,
                      subject: selected?.subject || ''
                    });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choose a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.name} value={teacher.name}>
                      {teacher.name} - {teacher.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select reason</option>
                  {reasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Message / Details
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Provide additional details about the purpose of the meeting..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" className="gap-2">
                <CalendarCheck className="h-4 w-4" />
                Submit Request
              </Button>
              <p className="text-xs text-muted-foreground">
                Your request will be sent to the teacher for approval
              </p>
            </div>
          </form>
        </motion.div>
      )}

      {/* Meeting History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-bold">Meeting History</h2>

        <div className="space-y-4">
          {displayMeetings.map((meeting: any, index: number) => {
            const statusConfig = getStatusConfig(meeting.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={meeting.id || meeting._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`border rounded-xl p-6 ${statusConfig.color} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <StatusIcon className={`h-6 w-6 ${statusConfig.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <h3 className="font-bold">{meeting.teacher}</h3>
                        </div>
                        <p className="text-sm">{meeting.subject}</p>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border bg-white/70 dark:bg-black/30 border-current/20`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="font-medium">
                          {new Date(meeting.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{meeting.time}</span>
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium mb-1">Reason:</p>
                      <p className="text-sm font-medium mb-2">{meeting.reason}</p>
                      <p className="text-xs font-medium mb-1">Your Message:</p>
                      <p className="text-sm">{meeting.message}</p>
                    </div>

                    {meeting.response && (
                      <div className="bg-white/70 dark:bg-black/30 rounded-lg p-3 border border-current/10">
                        <p className="text-xs font-medium mb-1">Teacher's Response:</p>
                        <p className="text-sm">{meeting.response}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-3">
                      Requested on: {meeting.requestDate ? new Date(meeting.requestDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-900 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold mb-2">Meeting Guidelines</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Meeting requests are reviewed within 24-48 hours</li>
              <li>• Choose your preferred date and time, subject to teacher availability</li>
              <li>• Teachers may suggest alternative times if requested slot is unavailable</li>
              <li>• Please arrive 5 minutes before the scheduled time</li>
              <li>• For urgent matters, contact the faculty directly via their office hours</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
