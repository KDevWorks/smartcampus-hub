import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, CheckCircle, Clock, XCircle, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { parentAPI } from '../../../services/api';

type AssignmentStatus = 'submitted' | 'pending' | 'late' | 'overdue';
type FilterType = 'all' | AssignmentStatus;

export const ParentAssignments: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [assignmentsData, setAssignmentsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildAssignments = async () => {
      try {
        const resChildren = await parentAPI.getChildren();
        if (resChildren.success && resChildren.data && resChildren.data.length > 0) {
          setChildren(resChildren.data);
          const firstChildId = resChildren.data[0]._id;
          setSelectedChild(firstChildId);

          const assignRes = await parentAPI.getChildAssignments(firstChildId);
          if (assignRes.success) {
            setAssignmentsData(assignRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to load child assignments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildAssignments();
  }, []);

  const assignments = assignmentsData?.assignments || [
    {
      id: 1,
      name: 'Operating Systems Project Report',
      subject: 'Operating Systems',
      code: 'CS303',
      description: 'Design and implement a multi-threaded process scheduler',
      assignedDate: '2026-02-15',
      dueDate: '2026-03-05',
      submittedDate: null,
      status: 'pending' as AssignmentStatus,
      marks: null,
      maxMarks: 20,
      feedback: null
    },
    {
      id: 2,
      name: 'DBMS Case Study',
      subject: 'Database Management Systems',
      code: 'CS302',
      description: 'Analyze a real-world database system and create ER diagrams',
      assignedDate: '2026-02-18',
      dueDate: '2026-03-08',
      submittedDate: null,
      status: 'pending' as AssignmentStatus,
      marks: null,
      maxMarks: 20,
      feedback: null
    },
    {
      id: 3,
      name: 'Computer Networks Lab Assignment 4',
      subject: 'Computer Networks',
      code: 'CS304',
      description: 'Implement TCP/IP socket programming',
      assignedDate: '2026-02-20',
      dueDate: '2026-03-10',
      submittedDate: '2026-02-27',
      status: 'submitted' as AssignmentStatus,
      marks: 19,
      maxMarks: 20,
      feedback: 'Excellent implementation with proper error handling'
    },
    {
      id: 4,
      name: 'Data Structures Assignment 3',
      subject: 'Data Structures',
      code: 'CS301',
      description: 'AVL Tree implementation and balancing',
      assignedDate: '2026-02-10',
      dueDate: '2026-02-25',
      submittedDate: '2026-02-24',
      status: 'submitted' as AssignmentStatus,
      marks: 18,
      maxMarks: 20,
      feedback: 'Good work, minor optimization needed'
    },
    {
      id: 5,
      name: 'Software Engineering Documentation',
      subject: 'Software Engineering',
      code: 'CS305',
      description: 'Complete SRS and design documents',
      assignedDate: '2026-02-12',
      dueDate: '2026-02-28',
      submittedDate: '2026-03-01',
      status: 'late' as AssignmentStatus,
      marks: 15,
      maxMarks: 20,
      feedback: 'Late submission. Good content but needs better formatting'
    },
    {
      id: 6,
      name: 'CN Lab Assignment 3',
      subject: 'Computer Networks',
      code: 'CS304',
      description: 'Network topology design',
      assignedDate: '2026-01-25',
      dueDate: '2026-02-10',
      submittedDate: null,
      status: 'overdue' as AssignmentStatus,
      marks: 0,
      maxMarks: 20,
      feedback: 'Not submitted'
    }
  ];

  const stats = assignmentsData?.stats || {
    total: assignments.length,
    submitted: assignments.filter((a: any) => a.status === 'submitted').length,
    pending: assignments.filter((a: any) => a.status === 'pending').length,
    late: assignments.filter((a: any) => a.status === 'late').length,
    overdue: assignments.filter((a: any) => a.status === 'overdue').length
  };

  const filteredAssignments = filter === 'all'
    ? assignments
    : assignments.filter((a: any) => a.status === filter);

  const getStatusConfig = (status: AssignmentStatus) => {
    switch (status) {
      case 'submitted':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-900',
          label: 'Submitted',
          iconColor: 'text-green-500'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-900',
          label: 'Pending',
          iconColor: 'text-orange-500'
        };
      case 'late':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-900',
          label: 'Late',
          iconColor: 'text-yellow-500'
        };
      case 'overdue':
        return {
          icon: XCircle,
          color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-900',
          label: 'Overdue',
          iconColor: 'text-red-500'
        };
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date('2026-02-28'); // Using consistent date
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-2">Assignments</h1>
        <p className="text-muted-foreground">Track all assignments and submission status</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setFilter('all')}
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${filter === 'all' ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
            }`}
        >
          <ClipboardList className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setFilter('submitted')}
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${filter === 'submitted' ? 'border-green-500 shadow-lg' : 'border-border hover:border-green-500/50'
            }`}
        >
          <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.submitted}</p>
          <p className="text-xs text-muted-foreground">Submitted</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setFilter('pending')}
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${filter === 'pending' ? 'border-orange-500 shadow-lg' : 'border-border hover:border-orange-500/50'
            }`}
        >
          <Clock className="h-5 w-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setFilter('late')}
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${filter === 'late' ? 'border-yellow-500 shadow-lg' : 'border-border hover:border-yellow-500/50'
            }`}
        >
          <AlertTriangle className="h-5 w-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats.late}</p>
          <p className="text-xs text-muted-foreground">Late</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setFilter('overdue')}
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${filter === 'overdue' ? 'border-red-500 shadow-lg' : 'border-border hover:border-red-500/50'
            }`}
        >
          <XCircle className="h-5 w-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold">{stats.overdue}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </motion.div>
      </div>

      {/* Assignments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {filter === 'all' ? 'All Assignments' : `${getStatusConfig(filter as AssignmentStatus).label} Assignments`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {filteredAssignments.map((assignment, index) => {
            const statusConfig = getStatusConfig(assignment.status);
            const StatusIcon = statusConfig.icon;
            const daysRemaining = getDaysRemaining(assignment.dueDate);

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${statusConfig.color}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{assignment.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{assignment.subject}</span>
                          <span>•</span>
                          <span className="font-mono text-xs">{assignment.code}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assigned:</span>
                        <span className="font-medium">{new Date(assignment.assignedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className={`font-medium ${assignment.status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                            assignment.status === 'pending' && daysRemaining <= 3 ? 'text-orange-600 dark:text-orange-400' :
                              ''
                          }`}>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                          {assignment.status === 'pending' && (
                            <span className="ml-2 text-xs">
                              ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'})
                            </span>
                          )}
                        </span>
                      </div>
                      {assignment.submittedDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">Submitted:</span>
                          <span className="font-medium">{new Date(assignment.submittedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {assignment.marks !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Marks:</span>
                          <span className="font-bold text-primary">
                            {assignment.marks}/{assignment.maxMarks}
                          </span>
                        </div>
                      )}
                    </div>

                    {assignment.feedback && (
                      <div className="p-3 rounded-lg bg-accent/50 border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Faculty Feedback:</p>
                        <p className="text-sm">{assignment.feedback}</p>
                      </div>
                    )}

                    {assignment.status === 'pending' && daysRemaining <= 3 && daysRemaining > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900">
                        <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Deadline approaching - {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</span>
                        </div>
                      </div>
                    )}

                    {assignment.status === 'overdue' && (
                      <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900">
                        <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                          <XCircle className="h-4 w-4" />
                          <span>Assignment overdue - Please follow up with the student</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No {filter !== 'all' && `${getStatusConfig(filter as AssignmentStatus).label.toLowerCase()}`} assignments found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
