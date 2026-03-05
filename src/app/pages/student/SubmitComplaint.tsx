import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Send, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { complaintAPI } from '../../../services/api';
import { ScrollArea } from '../../components/ui/scroll-area';

interface Complaint {
  id: number;
  title: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  date: string;
  description: string;
}

export const SubmitComplaint: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getMyComplaints();
      if (response.success && (response.complaints || response.data)) {
        const list = response.complaints || response.data || [];
        setMyComplaints(list.map((c: any) => ({
          id: c._id,
          title: c.title,
          category: c.category,
          status: c.status,
          date: new Date(c.createdAt).toLocaleDateString(),
          description: c.description
        })));
      }
    } catch (error) {
      console.error('Failed to load complaints:', error);
    }
  };

  React.useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category || !description) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await complaintAPI.createComplaint({ title, category, description });
      if (response.success) {
        toast.success('Complaint submitted successfully!');
        setTitle('');
        setCategory('');
        setDescription('');
        // Refresh complaints list
        fetchComplaints();
      }
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'pending':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Submit Complaint</h1>
          <p className="text-muted-foreground">Report issues and track their status</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submit Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>New Complaint</CardTitle>
              <CardDescription>Fill in the details to submit your complaint</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief title of your complaint"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="IT">IT & Technology</SelectItem>
                      <SelectItem value="Faculty">Faculty</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your complaint in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Complaints List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>My Complaints</CardTitle>
              <CardDescription>History of your submitted issues</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[600px] w-full p-6">
                {myComplaints.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>You have not submitted any complaints yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myComplaints.map((complaint) => {
                      const getTileColor = (status: string) => {
                        switch (status) {
                          case 'resolved': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
                          case 'in-progress': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
                          case 'pending': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
                          default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
                        }
                      };

                      return (
                        <div key={complaint.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg leading-tight mb-1">{complaint.title}</h3>
                              <Badge variant="outline" className="text-xs mb-2">{complaint.category}</Badge>
                            </div>
                            <Badge variant="secondary" className={`capitalize border whitespace-nowrap ml-2 ${getTileColor(complaint.status)}`}>
                              {complaint.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 break-words">
                            {complaint.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Submitted on {complaint.date}</span>
                            </div>
                            <div className="flex items-center gap-1 font-medium capitalize">
                              {getStatusIcon(complaint.status)}
                              <span>{complaint.status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
