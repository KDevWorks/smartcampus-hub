import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { complaintAPI } from '../../../services/api';

interface Complaint {
  _id: string; // From backend
  title: string;
  student: {
    name: string;
  };
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  description: string;
}

export const ManageComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await complaintAPI.getAllComplaints();
        if (response.success && response.data) {
          setComplaints(response.data);
        }
      } catch (error) {
        console.error('Failed to load complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const updateStatus = async (id: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    try {
      const response = await complaintAPI.updateComplaintStatus(id, newStatus);
      if (response.success) {
        setComplaints(complaints.map(c =>
          c._id === id ? { ...c, status: newStatus } : c
        ));
        toast.success('Complaint status updated!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'in-progress': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'pending': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Manage Complaints</h1>
          <p className="text-muted-foreground">Review and update complaint status</p>
        </div>
      </div>

      <div className="space-y-4">
        {complaints.map((complaint, index) => (
          <motion.div
            key={complaint._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{complaint.title}</CardTitle>
                    <CardDescription className="mt-1">
                      By {complaint.student?.name || 'Unknown'} • {new Date(complaint.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{complaint.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{complaint.description}</p>

                <div className="flex items-center gap-3">
                  <Select
                    value={complaint.status}
                    onValueChange={(value: 'pending' | 'in-progress' | 'resolved') => updateStatus(complaint._id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {complaint.status === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
                    {complaint.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {complaint.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
