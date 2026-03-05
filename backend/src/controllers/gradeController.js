import Grade from '../models/Grade.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Add/Update grades
// @route   POST /api/grades
// @access  Private (Staff)
export const addOrUpdateGrade = async (req, res) => {
  try {
    const { studentId, subjectId, assessments, semester, academicYear } = req.body;

    let grade = await Grade.findOne({
      student: studentId,
      subject: subjectId,
      semester,
      academicYear
    });

    if (grade) {
      // Update existing grade
      grade.assessments = assessments;
      grade.updatedBy = req.user._id;
      await grade.save();
    } else {
      // Create new grade
      grade = await Grade.create({
        student: studentId,
        subject: subjectId,
        assessments,
        semester,
        academicYear,
        updatedBy: req.user._id
      });
    }

    // Update student CGPA
    const cgpa = await Grade.calculateCGPA(studentId);
    await User.findByIdAndUpdate(studentId, { cgpa });

    // Notify student
    await Notification.create({
      recipient: studentId,
      sender: req.user._id,
      type: 'grade',
      title: 'New Marks Uploaded',
      message: `Marks have been uploaded for ${grade.subject.name}`,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Grade added/updated successfully',
      data: grade
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student grades
// @route   GET /api/grades/student/:studentId
// @access  Private
export const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, academicYear } = req.query;

    const query = { student: studentId };
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const grades = await Grade.find(query)
      .populate('subject', 'name code credits')
      .populate('updatedBy', 'name')
      .sort({ semester: -1 });

    // Calculate SGPA and CGPA
    const sgpa = semester 
      ? await Grade.calculateSGPA(studentId, semester)
      : null;
    const cgpa = await Grade.calculateCGPA(studentId);

    res.status(200).json({
      success: true,
      data: {
        grades,
        sgpa,
        cgpa
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get subject-wise performance
// @route   GET /api/grades/subject/:subjectId
// @access  Private (Staff)
export const getSubjectPerformance = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const grades = await Grade.find({ subject: subjectId })
      .populate('student', 'name rollNumber')
      .sort({ total: -1 });

    // Calculate statistics
    const totalStudents = grades.length;
    const avgPercentage = totalStudents > 0
      ? grades.reduce((sum, g) => sum + parseFloat(g.percentage), 0) / totalStudents
      : 0;

    const gradeDistribution = {
      O: grades.filter(g => g.grade === 'O').length,
      'A+': grades.filter(g => g.grade === 'A+').length,
      A: grades.filter(g => g.grade === 'A').length,
      'B+': grades.filter(g => g.grade === 'B+').length,
      B: grades.filter(g => g.grade === 'B').length,
      C: grades.filter(g => g.grade === 'C').length,
      F: grades.filter(g => g.grade === 'F').length
    };

    res.status(200).json({
      success: true,
      data: {
        grades,
        statistics: {
          totalStudents,
          avgPercentage: avgPercentage.toFixed(2),
          gradeDistribution
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get academic performance summary
// @route   GET /api/grades/summary/:studentId
// @access  Private
export const getAcademicSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const grades = await Grade.find({ student: studentId })
      .populate('subject', 'name code semester')
      .sort({ semester: 1 });

    // Calculate semester-wise SGPA
    const semesterData = [];
    const semesters = [...new Set(grades.map(g => g.semester))];
    
    for (const sem of semesters) {
      const sgpa = await Grade.calculateSGPA(studentId, sem);
      semesterData.push({
        semester: sem,
        sgpa: parseFloat(sgpa)
      });
    }

    const cgpa = await Grade.calculateCGPA(studentId);

    res.status(200).json({
      success: true,
      data: {
        semesterData,
        cgpa: parseFloat(cgpa),
        totalSemesters: semesters.length,
        totalSubjects: grades.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get class rank
// @route   GET /api/grades/rank/:studentId
// @access  Private
export const getClassRank = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all students in same department and year
    const students = await User.find({
      role: 'student',
      department: student.department,
      year: student.year
    }).sort({ cgpa: -1 });

    const rank = students.findIndex(s => s._id.toString() === studentId.toString()) + 1;
    const totalStudents = students.length;
    const percentile = totalStudents > 0
      ? (((totalStudents - rank + 1) / totalStudents) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        rank,
        totalStudents,
        percentile: parseFloat(percentile),
        cgpa: student.cgpa
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
