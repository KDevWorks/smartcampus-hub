import express from 'express';
import {
  createComplaint,
  getAllComplaints,
  getComplaint,
  getMyComplaints,
  updateComplaintStatus,
  assignComplaint,
  addComment,
  resolveComplaint,
  deleteComplaint
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('student'), createComplaint);
router.get('/', protect, authorize('staff', 'admin'), getAllComplaints);
router.get('/my', protect, authorize('student'), getMyComplaints);
router.get('/:id', protect, getComplaint);
router.put('/:id/status', protect, authorize('staff', 'admin'), updateComplaintStatus);
router.put('/:id/assign', protect, authorize('admin'), assignComplaint);
router.post('/:id/comments', protect, addComment);
router.put('/:id/resolve', protect, authorize('staff', 'admin'), resolveComplaint);
router.delete('/:id', protect, authorize('admin'), deleteComplaint);

export default router;
