import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// Get subjects assigned to staff
router.get('/my-subjects', protect, authorize('staff', 'admin'), async (req, res) => {
    try {
        const subjects = await Subject.find({ faculty: req.user.id });

        // Calculate stats for each subject
        const subjectsWithStats = await Promise.all(subjects.map(async (subject) => {
            const totalStudents = subject.students ? subject.students.length : 0;

            // calculate average attendance
            const stats = await Attendance.aggregate([
                { $match: { subject: subject._id } },
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

            const averageAttendance = stats.length > 0 && stats[0].total > 0
                ? Math.round((stats[0].present / stats[0].total) * 100)
                : 0;

            return {
                id: subject._id,
                name: subject.name,
                code: subject.code,
                totalStudents,
                averageAttendance
            };
        }));

        res.status(200).json({
            success: true,
            data: subjectsWithStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get students enrolled in a specific subject
router.get('/:id/students', protect, authorize('staff', 'admin'), async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('students', 'name rollNumber email');

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subject.students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all subjects (public for signup/dropdowns)
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find().select('name code department semester faculty');
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
