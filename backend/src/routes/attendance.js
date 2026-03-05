import express from 'express';
import {
  markAttendance,
  getStudentAttendance,
  getAttendanceBySubject,
  getAttendanceStats,
  predictAttendance,
  getAttendanceHistory,
  updateAttendance
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/mark', protect, authorize('staff', 'admin'), markAttendance);
router.put('/update', protect, authorize('staff', 'admin'), updateAttendance);
router.get('/student/:studentId', protect, authorize('student'), getStudentAttendance);
router.get('/subject/:subjectId', protect, authorize('staff', 'admin'), getAttendanceBySubject);
router.get('/stats/:studentId', protect, getAttendanceStats);
router.get('/predict/:studentId', protect, predictAttendance);
router.get('/history', protect, authorize('staff', 'admin'), getAttendanceHistory);

export default router;
