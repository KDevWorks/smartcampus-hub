import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceAPI } from '../../../services/api';
import { toast } from 'sonner';

interface PredictionResult {
  currentPercentage: number;
  canSkip: number;
  needToAttend: number;
  recommendation: string;
  status: 'safe' | 'warning' | 'danger';
}

export const AttendancePredictor: React.FC = () => {
  const { user } = useAuth();
  const [totalLectures, setTotalLectures] = useState<string>('');
  const [attendedLectures, setAttendedLectures] = useState<string>('');
  const [targetPercentage, setTargetPercentage] = useState<string>('75');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculatePrediction = async () => {
    setIsCalculating(true);

    try {
      if (!user?.id) throw new Error("User not found");

      const response = await attendanceAPI.predictAttendance(user.id, parseInt(targetPercentage));

      if (response.success && response.data && response.data.length > 0) {
        // Aggregate all subjects
        let totalCurrentPercentage = 0;
        let totalCanSkip = 0;
        let totalNeedToAttend = 0;

        response.data.forEach((sub: any) => {
          totalCurrentPercentage += parseFloat(sub.currentPercentage);
          totalCanSkip += sub.canMiss;
          totalNeedToAttend += sub.classesNeeded;
        });

        const avgPercentage = totalCurrentPercentage / response.data.length;

        let status: 'safe' | 'warning' | 'danger' = 'safe';
        const target = parseInt(targetPercentage);
        if (avgPercentage < target - 5) status = 'danger';
        else if (avgPercentage < target) status = 'warning';

        setResult({
          currentPercentage: Number(avgPercentage.toFixed(2)),
          canSkip: totalCanSkip,
          needToAttend: totalNeedToAttend,
          recommendation: status === 'safe'
            ? `You have a good buffer! Across all subjects, you can afford to miss ${totalCanSkip} more classes.`
            : `You need to attend ${totalNeedToAttend} more classes across your subjects to hit your ${targetPercentage}% target.`,
          status: status
        });
      } else {
        toast.info("No attendance data found in database to predict on.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch prediction from AI");
    } finally {
      setIsCalculating(false);
    }
  };

  const getStatusColor = (status: 'safe' | 'warning' | 'danger') => {
    switch (status) {
      case 'safe':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getStatusBg = (status: 'safe' | 'warning' | 'danger') => {
    switch (status) {
      case 'safe':
        return 'bg-green-500/10';
      case 'warning':
        return 'bg-orange-500/10';
      case 'danger':
        return 'bg-red-500/10';
    }
  };

  const getProgressColor = (percentage: number, target: number) => {
    if (percentage >= target + 5) return 'bg-green-600';
    if (percentage >= target) return 'bg-orange-500';
    return 'bg-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Attendance Predictor</h1>
          <p className="text-muted-foreground">
            Calculate how many classes you can skip or need to attend
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
          <CardDescription>
            Provide your attendance information to get AI-powered predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2 col-span-1 md:col-span-3">
              <Label htmlFor="target">Target % (Default: 75%)</Label>
              <Input
                id="target"
                type="number"
                placeholder="75"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(e.target.value)}
                min="0"
                max="100"
              />
            </div>
          </div>

          <Button
            onClick={calculatePrediction}
            className="w-full mt-6"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Brain className="h-4 w-4" />
                </motion.div>
                Calculating...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Predict Attendance
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`border-2 ${result.status === 'safe' ? 'border-green-500/20' : result.status === 'warning' ? 'border-orange-500/20' : 'border-red-500/20'}`}>
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
                <CardDescription>AI-powered attendance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Current Percentage */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Attendance</span>
                    <span className="text-2xl font-bold">{result.currentPercentage}%</span>
                  </div>
                  <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getProgressColor(result.currentPercentage, parseInt(targetPercentage))}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.currentPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className={`p-4 rounded-xl ${getStatusBg(result.status)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {result.status === 'safe' ? (
                        <TrendingUp className={`h-5 w-5 ${getStatusColor(result.status)}`} />
                      ) : result.status === 'warning' ? (
                        <Minus className={`h-5 w-5 ${getStatusColor(result.status)}`} />
                      ) : (
                        <TrendingDown className={`h-5 w-5 ${getStatusColor(result.status)}`} />
                      )}
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className={`text-2xl font-bold capitalize ${getStatusColor(result.status)}`}>
                      {result.status}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm font-medium mb-1">Can Skip</p>
                    <p className="text-2xl font-bold">{result.canSkip} classes</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm font-medium mb-1">Need to Attend</p>
                    <p className="text-2xl font-bold">{result.needToAttend} classes</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-xl ${getStatusBg(result.status)}`}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Recommendation
                  </h4>
                  <p className="text-sm">{result.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      {!result && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center text-sm text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Enter your attendance details above to get AI-powered predictions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
