import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// Get Admin Dashboard Overview Analytics
router.get('/overview', protect, authorize('admin'), async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const staffCount = await User.countDocuments({ role: 'staff' });
        const complaintCount = await Complaint.countDocuments();

        // Calculate overall average attendance
        const attendanceStats = await Attendance.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const avgAttendance = attendanceStats.length > 0 && attendanceStats[0].total > 0
            ? Math.round((attendanceStats[0].present / attendanceStats[0].total) * 100)
            : 0;

        // Get complaint distribution
        const complaintsByStatus = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                studentCount,
                staffCount,
                complaintCount,
                avgAttendance,
                complaintsByStatus
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get comprehensive attendance analytics
router.get('/attendance-analytics', protect, authorize('admin'), async (req, res) => {
    try {
        // Mocking some of the complex aggregations for the sake of the dashboard demo
        // In a real scenario, this would group by subject and calculate trends over weeks based on actual records

        const subjectData = [
            { subject: 'Data Structures', attendance: 82 },
            { subject: 'Web Dev', attendance: 88 },
            { subject: 'DBMS', attendance: 76 },
            { subject: 'OS', attendance: 79 },
            { subject: 'Networks', attendance: 83 },
            { subject: 'Software Eng', attendance: 74 }
        ];

        const trendData = [
            { week: 'Week 1', attendance: 75 },
            { week: 'Week 2', attendance: 78 },
            { week: 'Week 3', attendance: 80 },
            { week: 'Week 4', attendance: 76 },
            { week: 'Week 5', attendance: 82 },
            { week: 'Week 6', attendance: 79 },
            { week: 'Week 7', attendance: 81 }
        ];

        res.status(200).json({
            success: true,
            data: {
                subjectData,
                trendData
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
