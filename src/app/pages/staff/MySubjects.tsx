import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { subjectsAPI } from '../../../services/api';

interface Subject {
  id: string; // The ID from backend is likely a string (MongoDB ObjectId)
  name: string;
  code: string;
  totalStudents: number;
  averageAttendance: number; // Mapping this to avgAttendance
  // lecturesCompleted: We'll have to omit this or mock it since it's not currently returned
}

export const MySubjects: React.FC = () => {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectsAPI.getMySubjects();
        if (response.success && response.data) {
          setSubjects(response.data);
        }
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">My Subjects</h1>
          <p className="text-muted-foreground">View all subjects assigned to you</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription className="mt-2">
                      <Badge variant="outline">{subject.code}</Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Students</span>
                    </div>
                    <span className="font-semibold">{subject.totalStudents}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Lectures Completed</span>
                    </div>
                    <span className="font-semibold">{/* Mocking since not in API */} 42</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Average Attendance</span>
                    </div>
                    <span className="font-semibold">{subject.averageAttendance}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
