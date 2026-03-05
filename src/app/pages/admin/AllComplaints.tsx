import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { MessageSquare } from 'lucide-react';
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
}

export const AllComplaints: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
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

  const filteredComplaints = statusFilter === 'all'
    ? complaints
    : complaints.filter(c => c.status === statusFilter);

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
          <h1 className="text-3xl font-bold">All Complaints</h1>
          <p className="text-muted-foreground">Manage and track all complaints</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400">Pending</p>
            <p className="text-2xl font-bold">{complaints.filter(c => c.status === 'pending').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">In Progress</p>
            <p className="text-2xl font-bold">{complaints.filter(c => c.status === 'in-progress').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Resolved</p>
            <p className="text-2xl font-bold">{complaints.filter(c => c.status === 'resolved').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Complaint List</CardTitle>
              <CardDescription>Filter and view all complaints</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredComplaints.map((complaint, index) => (
              <motion.div key={complaint._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <div className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{complaint.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">By {complaint.student?.name || 'Unknown'} • {new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">{complaint.category}</Badge>
                  </div>
                  <Badge className={getStatusColor(complaint.status)}>{complaint.status.replace('-', ' ')}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
