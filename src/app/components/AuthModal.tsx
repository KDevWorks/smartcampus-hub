import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { subjectsAPI } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [fetchingSubjects, setFetchingSubjects] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  React.useEffect(() => {
    if (mode === 'signup' && role === 'staff') {
      const loadSubjects = async () => {
        setFetchingSubjects(true);
        try {
          const res = await subjectsAPI.getAllSubjects();
          if (res.success && res.data) {
            setAvailableSubjects(res.data);
          }
        } catch (error) {
          console.error("Failed to load subjects", error);
        } finally {
          setFetchingSubjects(false);
        }
      };
      loadSubjects();
    }
  }, [mode, role]);

  const { login, register } = useAuth();

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        await register(name, email, password, role, role === 'staff' ? selectedSubjects : undefined);
      } else {
        await login(email, password);
      }
      toast.success(`Welcome ${mode === 'login' ? 'back' : 'to SmartCampus'}!`);
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('student');
    setSelectedSubjects([]);
    setErrors({});
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Sign up to get started with SmartCampus'}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'signup' && role === 'staff' && (
              <div className="space-y-2">
                <Label>Assign Subjects</Label>
                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2 bg-muted/20">
                  {fetchingSubjects ? (
                    <div className="flex items-center justify-center p-2 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading subjects...
                    </div>
                  ) : availableSubjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subjects found.</p>
                  ) : (
                    availableSubjects.map((sub: any) => (
                      <div
                        key={sub._id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedSubjects.includes(sub._id) ? 'bg-primary/10 border-primary' : 'hover:bg-accent border-transparent'} border`}
                        onClick={() => {
                          setSelectedSubjects(prev =>
                            prev.includes(sub._id) ? prev.filter(id => id !== sub._id) : [...prev, sub._id]
                          );
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.code}</p>
                        </div>
                        {selectedSubjects.includes(sub._id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Select the subjects you will be teaching.</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={switchMode}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};