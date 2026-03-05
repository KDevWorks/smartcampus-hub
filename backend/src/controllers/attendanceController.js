import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private (Staff only)
export const markAttendance = async (req, res) => {
  try {
    const { subjectId, date, attendanceData } = req.body;
    // attendanceData: [{ studentId, status, period, remarks }]

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const markedAttendance = [];
    const errors = [];

    for (const record of attendanceData) {
      try {
        const attendance = await Attendance.create({
          student: record.studentId,
          subject: subjectId,
          date: date || new Date(),
          status: record.status,
          markedBy: req.user._id,
          period: record.period,
          remarks: record.remarks,
          academicYear: subject.academicYear,
          semester: subject.semester
        });

        markedAttendance.push(attendance);

        // Send notification if absent
        if (record.status === 'absent') {
          await Notification.create({
            recipient: record.studentId,
            sender: req.user._id,
            type: 'attendance',
            title: 'Attendance Alert',
            message: `You were marked absent for ${subject.name}`,
            priority: 'medium'
          });
        }
      } catch (error) {
        errors.push({
          studentId: record.studentId,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: markedAttendance,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);
    const { subjectId } = req.query;

    const query = { student: studentId };
    if (subjectId) {
      query.subject = subjectId;
    }

    const attendance = await Attendance.find(query)
      .populate('subject')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    // Calculate summary
    const summary = await Attendance.getAttendanceSummary(studentId);

    // Return the required structure `{ success: true, attendance: [...records] }`
    // while keeping `data` to avoid breaking existing frontend logic.
    res.status(200).json({
      success: true,
      attendance: attendance,
      data: {
        records: attendance,
        summary: summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance by subject
// @route   GET /api/attendance/subject/:subjectId
// @access  Private (Staff)
export const getAttendanceBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date } = req.query;

    const query = { subject: subjectId };
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name rollNumber')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats/:studentId
// @access  Private
export const getAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    const stats = await Attendance.aggregate([
      {
        $match: { student: new mongoose.Types.ObjectId(studentId) }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const percentage = stats.length > 0
      ? ((stats[0].present / stats[0].total) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        present: stats[0]?.present || 0,
        absent: stats[0]?.absent || 0,
        percentage: parseFloat(percentage)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Predict attendance (AI-based)
// @route   GET /api/attendance/predict/:studentId
// @access  Private
export const predictAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { targetDate, requiredPercentage = 75 } = req.query;

    // Get current attendance
    const summary = await Attendance.getAttendanceSummary(studentId);

    // Simple prediction logic
    const predictions = summary.map(subject => {
      const currentPercentage = (subject.present / subject.total) * 100;

      // Calculate how many classes student can miss
      const canMiss = Math.floor(
        (subject.present - (requiredPercentage * subject.total / 100)) /
        (requiredPercentage / 100)
      );

      // Calculate how many classes needed to reach required percentage
      const classesNeeded = currentPercentage < requiredPercentage
        ? Math.ceil(
          (requiredPercentage * subject.total - 100 * subject.present) /
          (100 - requiredPercentage)
        )
        : 0;

      return {
        subject: subject.subject,
        subjectCode: subject.subjectCode,
        currentPercentage: currentPercentage.toFixed(2),
        status: currentPercentage >= requiredPercentage ? 'safe' : 'warning',
        canMiss: Math.max(0, canMiss),
        classesNeeded: Math.max(0, classesNeeded),
        prediction: currentPercentage >= requiredPercentage
          ? `You can miss ${Math.max(0, canMiss)} more classes`
          : `You need to attend ${classesNeeded} more classes to reach ${requiredPercentage}%`
      };
    });

    res.status(200).json({
      success: true,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance/history
// @access  Private (Staff)
export const getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate, subjectId } = req.query;

    const query = {};

    if (req.user.role === 'staff') {
      query.markedBy = req.user.id;
    }

    if (subjectId) {
      query.subject = subjectId;
    } else if (req.user.role === 'staff') {
      // If no specific subject is provided, filter by all subjects assigned to this staff member
      const Subject = mongoose.model('Subject');
      const staffSubjects = await Subject.find({ faculty: req.user.id }).select('_id');
      const staffSubjectIds = staffSubjects.map(sub => sub._id);

      if (staffSubjectIds.length > 0) {
        query.subject = { $in: staffSubjectIds };
      } else {
        // If staff has no subjects, they shouldn't see any attendance history
        return res.status(200).json({ success: true, data: [] });
      }
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name rollNumber')
      .populate('subject', 'name code')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update attendance (Correction for today)
// @route   PUT /api/attendance/update
// @access  Private (Staff only)
export const updateAttendance = async (req, res) => {
  try {
    const { subjectId, date, attendanceData } = req.body;
    // attendanceData: [{ studentId, status }]

    const requestDate = new Date(date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    if (requestDate !== today) {
      return res.status(403).json({
        success: false,
        message: 'You can only update attendance records for today.'
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const updatedRecords = [];
    const errors = [];

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    for (const record of attendanceData) {
      try {
        const attendance = await Attendance.findOneAndUpdate(
          {
            student: record.studentId,
            subject: subjectId,
            markedBy: req.user._id,
            date: { $gte: startDate, $lte: endDate }
          },
          { status: record.status },
          { new: true }
        );

        if (attendance) {
          updatedRecords.push(attendance);
        } else {
          errors.push({
            studentId: record.studentId,
            error: 'Record not found or unauthorized to update'
          });
        }
      } catch (error) {
        errors.push({
          studentId: record.studentId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: updatedRecords,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};