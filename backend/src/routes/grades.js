import express from 'express';
import {
  addOrUpdateGrade,
  getStudentGrades,
  getSubjectPerformance,
  getAcademicSummary,
  getClassRank
} from '../controllers/gradeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('staff', 'admin'), addOrUpdateGrade);
router.get('/student/:studentId', protect, getStudentGrades);
router.get('/subject/:subjectId', protect, authorize('staff', 'admin'), getSubjectPerformance);
router.get('/summary/:studentId', protect, getAcademicSummary);
router.get('/rank/:studentId', protect, getClassRank);

export default router;
