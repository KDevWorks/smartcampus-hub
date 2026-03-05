import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, User, Calendar, TrendingUp, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { parentAPI } from '../../../services/api';

type FeedbackType = 'positive' | 'neutral' | 'improvement';
type FilterType = 'all' | FeedbackType;

export const ParentFeedback: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildFeedback = async () => {
      try {
        const resChildren = await parentAPI.getChildren();
        if (resChildren.success && resChildren.data && resChildren.data.length > 0) {
          setChildren(resChildren.data);
          const firstChildId = resChildren.data[0]._id;
          setSelectedChild(firstChildId);

          const feedbackRes = await parentAPI.getChildFeedback(firstChildId);
          if (feedbackRes.success) {
            setFeedbackData(feedbackRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to load child feedback:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildFeedback();
  }, []);

  const feedbacks = feedbackData?.feedbacks || [
    {
      id: 1,
      teacherName: 'Dr. Rajesh Kumar',
      subject: 'Data Structures',
      code: 'CS301',
      feedback: 'Aditya shows excellent problem-solving skills and consistently delivers quality work. His implementation of tree algorithms was particularly impressive. Keep up the good work!',
      date: '2026-02-25',
      type: 'positive' as FeedbackType,
      tags: ['Good Performance', 'Active Participation']
    },
    {
      id: 2,
      teacherName: 'Prof. Sneha Sharma',
      subject: 'Database Management Systems',
      code: 'CS302',
      feedback: 'Outstanding performance in both theory and practical sessions. His database normalization project demonstrated deep understanding of concepts. One of the top performers in the class.',
      date: '2026-02-22',
      type: 'positive' as FeedbackType,
      tags: ['Excellent', 'Top Performer']
    },
    {
      id: 3,
      teacherName: 'Dr. Amit Verma',
      subject: 'Operating Systems',
      code: 'CS303',
      feedback: 'Aditya needs to improve his attendance in OS classes. While his understanding is good, missing classes affects his practical knowledge. Please ensure regular attendance.',
      date: '2026-02-20',
      type: 'improvement' as FeedbackType,
      tags: ['Needs Improvement', 'Attendance']
    },
    {
      id: 4,
      teacherName: 'Prof. Priya Mehta',
      subject: 'Computer Networks',
      code: 'CS304',
      feedback: 'Good grasp of networking concepts. Lab work is satisfactory. Could participate more actively in class discussions.',
      date: '2026-02-18',
      type: 'neutral' as FeedbackType,
      tags: ['Good Performance']
    },
    {
      id: 5,
      teacherName: 'Dr. Vikram Singh',
      subject: 'Software Engineering',
      code: 'CS305',
      feedback: 'Late submission of SRS documentation. Content quality is good but needs to work on time management and meeting deadlines consistently.',
      date: '2026-02-15',
      type: 'improvement' as FeedbackType,
      tags: ['Needs Improvement', 'Time Management']
    },
    {
      id: 6,
      teacherName: 'Dr. Rajesh Kumar',
      subject: 'Data Structures',
      code: 'CS301',
      feedback: 'Excellent participation in coding competitions. His AVL tree implementation showed creativity and efficiency. Recommend encouraging him to participate in more competitive programming.',
      date: '2026-02-10',
      type: 'positive' as FeedbackType,
      tags: ['Excellent', 'Competitive Programming']
    },
    {
      id: 7,
      teacherName: 'Prof. Sneha Sharma',
      subject: 'Database Management Systems',
      code: 'CS302',
      feedback: 'Regular attendance and active participation in class. Shows genuine interest in the subject.',
      date: '2026-02-05',
      type: 'positive' as FeedbackType,
      tags: ['Good Performance', 'Regular Attendance']
    }
  ];

  const stats = feedbackData?.stats || {
    total: feedbacks.length,
    positive: feedbacks.filter((f: any) => f.type === 'positive').length,
    neutral: feedbacks.filter((f: any) => f.type === 'neutral').length,
    improvement: feedbacks.filter((f: any) => f.type === 'improvement').length
  };

  const filteredFeedbacks = filter === 'all'
    ? feedbacks
    : feedbacks.filter((f: any) => f.type === filter);

  const getTypeConfig = (type: FeedbackType) => {
    switch (type) {
      case 'positive':
        return {
          color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400',
          icon: CheckCircle,
          iconColor: 'text-green-500',
          label: 'Positive'
        };
      case 'neutral':
        return {
          color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-400',
          icon: MessageSquare,
          iconColor: 'text-blue-500',
          label: 'Neutral'
        };
      case 'improvement':
        return {
          color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-400',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          label: 'Needs Attention'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-2">Faculty Feedback</h1>
        <p className="text-muted-foreground">Track teacher feedback and performance insights</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setFilter('all')}
          className={`bg-card border rounded-xl p-6 cursor-pointer transition-all ${filter === 'all' ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Feedback</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setFilter('positive')}
          className={`bg-card border rounded-xl p-6 cursor-pointer transition-all ${filter === 'positive' ? 'border-green-500 shadow-lg' : 'border-border hover:border-green-500/50'
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.positive}</p>
              <p className="text-xs text-muted-foreground">Positive</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setFilter('neutral')}
          className={`bg-card border rounded-xl p-6 cursor-pointer transition-all ${filter === 'neutral' ? 'border-blue-500 shadow-lg' : 'border-border hover:border-blue-500/50'
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.neutral}</p>
              <p className="text-xs text-muted-foreground">Neutral</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setFilter('improvement')}
          className={`bg-card border rounded-xl p-6 cursor-pointer transition-all ${filter === 'improvement' ? 'border-yellow-500 shadow-lg' : 'border-border hover:border-yellow-500/50'
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.improvement}</p>
              <p className="text-xs text-muted-foreground">Needs Attention</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Summary Alert */}
      {stats.improvement > 0 && filter === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-yellow-900 dark:text-yellow-100">
                {stats.improvement} feedback{stats.improvement !== 1 ? 's' : ''} require{stats.improvement === 1 ? 's' : ''} attention
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Teachers have highlighted some areas where your child can improve. Review these feedbacks carefully.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feedback List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {filter === 'all' ? 'All Feedback' : `${getTypeConfig(filter as FeedbackType).label} Feedback`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {filteredFeedbacks.map((feedback, index) => {
            const typeConfig = getTypeConfig(feedback.type);
            const TypeIcon = typeConfig.icon;

            return (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className={`border rounded-xl p-6 ${typeConfig.color} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <TypeIcon className={`h-6 w-6 ${typeConfig.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <h3 className="font-bold">{feedback.teacherName}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{feedback.subject}</span>
                          <span>•</span>
                          <span className="font-mono text-xs">{feedback.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(feedback.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mb-3">
                      <p className="text-sm leading-relaxed">{feedback.feedback}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {feedback.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/70 dark:bg-black/30 border border-current/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No {filter !== 'all' && `${getTypeConfig(filter as FeedbackType).label.toLowerCase()}`} feedback found</p>
          </div>
        )}
      </motion.div>

      {/* Action Recommendations */}
      {stats.improvement > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-bold mb-4">Recommended Actions</h2>
          <div className="space-y-3">
            {feedbacks.filter(f => f.type === 'improvement').map((feedback, index) => (
              <div key={feedback.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{feedback.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feedback.tags.includes('Attendance') && 'Schedule a discussion about regular attendance'}
                    {feedback.tags.includes('Time Management') && 'Help develop better time management strategies'}
                    {!feedback.tags.includes('Attendance') && !feedback.tags.includes('Time Management') && 'Consider scheduling a parent-teacher meeting'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
