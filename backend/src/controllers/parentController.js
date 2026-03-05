import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import Assignment from '../models/Assignment.js';
import Feedback from '../models/Feedback.js';
import Meeting from '../models/Meeting.js';
import Notification from '../models/Notification.js';

// @desc    Link child to parent account
// @route   POST /api/parent/link-child
// @access  Private (Parent)
export const linkChild = async (req, res) => {
  try {
    const { childEmail } = req.body;

    const child = await User.findOne({ email: childEmail, role: 'student' });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this email'
      });
    }

    const parent = await User.findById(req.user._id);
    
    if (parent.children.includes(child._id)) {
      return res.status(400).json({
        success: false,
        message: 'Child already linked'
      });
    }

    parent.children.push(child._id);
    await parent.save();

    res.status(200).json({
      success: true,
      message: 'Child linked successfully',
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get children list
// @route   GET /api/parent/children
// @access  Private (Parent)
export const getChildren = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id)
      .populate('children', 'name email rollNumber department year semester cgpa avatar');

    res.status(200).json({
      success: true,
      data: parent.children
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get child's dashboard overview
// @route   GET /api/parent/child/:childId/overview
// @access  Private (Parent)
export const getChildOverview = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to parent
    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const child = await User.findById(childId);

    // Get attendance summary
    const attendanceSummary = await Attendance.getAttendanceSummary(childId);
    const overallAttendance = await Attendance.calculateAttendancePercentage(childId);

    // Get latest grades
    const latestGrades = await Grade.find({ student: childId })
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending assignments
    const assignments = await Assignment.find({
      'subject': { $in: child.subjects || [] },
      dueDate: { $gte: new Date() }
    }).populate('subject', 'name');

    const pendingAssignments = assignments.filter(a => 
      !a.submissions.some(s => s.student.toString() === childId.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        student: child,
        attendance: {
          overall: overallAttendance,
          bySubject: attendanceSummary
        },
        grades: latestGrades,
        cgpa: child.cgpa,
        pendingAssignments: pendingAssignments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get child's attendance
// @route   GET /api/parent/child/:childId/attendance
// @access  Private (Parent)
export const getChildAttendance = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to parent
    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const summary = await Attendance.getAttendanceSummary(childId);
    const overall = await Attendance.calculateAttendancePercentage(childId);

    const recentAttendance = await Attendance.find({ student: childId })
      .populate('subject', 'name code')
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        overall,
        summary,
        recent: recentAttendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get child's academic performance
// @route   GET /api/parent/child/:childId/performance
// @access  Private (Parent)
export const getChildPerformance = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to parent
    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const grades = await Grade.find({ student: childId })
      .populate('subject', 'name code credits semester')
      .sort({ semester: -1 });

    const cgpa = await Grade.calculateCGPA(childId);
    
    // Get semester-wise performance
    const semesters = [...new Set(grades.map(g => g.semester))];
    const semesterData = [];
    
    for (const sem of semesters) {
      const sgpa = await Grade.calculateSGPA(childId, sem);
      semesterData.push({
        semester: sem,
        sgpa: parseFloat(sgpa)
      });
    }

    res.status(200).json({
      success: true,
      data: {
        grades,
        cgpa: parseFloat(cgpa),
        semesterData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get child's assignments
// @route   GET /api/parent/child/:childId/assignments
// @access  Private (Parent)
export const getChildAssignments = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to parent
    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const assignments = await Assignment.find({})
      .populate('subject', 'name code')
      .populate('createdBy', 'name')
      .sort({ dueDate: -1 });

    const assignmentsWithStatus = assignments.map(a => {
      const submission = a.submissions.find(
        s => s.student.toString() === childId.toString()
      );

      return {
        ...a.toObject(),
        submissionStatus: submission ? submission.status : 
          (a.dueDate < new Date() ? 'overdue' : 'pending'),
        submittedAt: submission?.submittedAt,
        marksObtained: submission?.marksObtained,
        feedback: submission?.feedback
      };
    });

    res.status(200).json({
      success: true,
      data: assignmentsWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get child's feedback
// @route   GET /api/parent/child/:childId/feedback
// @access  Private (Parent)
export const getChildFeedback = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to parent
    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const feedback = await Feedback.find({ student: childId })
      .populate('faculty', 'name designation')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    // Mark as viewed by parent
    for (const fb of feedback) {
      if (!fb.parentViewed) {
        await fb.markAsViewedByParent();
      }
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Request parent-teacher meeting
// @route   POST /api/parent/request-meeting
// @access  Private (Parent)
export const requestMeeting = async (req, res) => {
  try {
    const { 
      childId, 
      facultyId, 
      scheduledDate, 
      startTime, 
      endTime, 
      agenda,
      description 
    } = req.body;

    // Verify child belongs to parent
    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const meeting = await Meeting.create({
      title: `Parent-Teacher Meeting for ${childId}`,
      description,
      organizer: req.user._id,
      participants: [{
        user: facultyId,
        status: 'pending'
      }],
      scheduledDate,
      startTime,
      endTime,
      meetingType: 'parent-teacher',
      studentDiscussed: childId,
      agenda,
      status: 'scheduled'
    });

    // Notify faculty
    await Notification.create({
      recipient: facultyId,
      sender: req.user._id,
      type: 'meeting',
      title: 'New Meeting Request',
      message: `Parent has requested a meeting regarding student`,
      priority: 'high'
    });

    res.status(201).json({
      success: true,
      message: 'Meeting request sent successfully',
      data: meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get parent's meetings
// @route   GET /api/parent/meetings
// @access  Private (Parent)
export const getParentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ organizer: req.user._id })
      .populate('participants.user', 'name email')
      .populate('studentDiscussed', 'name rollNumber')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
