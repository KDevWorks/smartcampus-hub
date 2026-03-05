import express from 'express';
import {
  linkChild,
  getChildren,
  getChildOverview,
  getChildAttendance,
  getChildPerformance,
  getChildAssignments,
  getChildFeedback,
  requestMeeting,
  getParentMeetings
} from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/link-child', protect, authorize('parent'), linkChild);
router.get('/children', protect, authorize('parent'), getChildren);
router.get('/child/:childId/overview', protect, authorize('parent'), getChildOverview);
router.get('/child/:childId/attendance', protect, authorize('parent'), getChildAttendance);
router.get('/child/:childId/performance', protect, authorize('parent'), getChildPerformance);
router.get('/child/:childId/assignments', protect, authorize('parent'), getChildAssignments);
router.get('/child/:childId/feedback', protect, authorize('parent'), getChildFeedback);
router.post('/request-meeting', protect, authorize('parent'), requestMeeting);
router.get('/meetings', protect, authorize('parent'), getParentMeetings);

export default router;
