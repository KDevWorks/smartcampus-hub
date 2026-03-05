import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  assessments: {
    mid1: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    mid2: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    assignment: {
      type: Number,
      default: 0,
      min: 0,
      max: 20
    },
    quiz: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    endSem: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  total: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'I', 'W'],
    default: 'I' // I = Incomplete
  },
  gradePoints: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  remarks: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate total, percentage, and grade before saving
gradeSchema.pre('save', function(next) {
  const { mid1, mid2, assignment, quiz } = this.assessments;
  
  // Calculate total (out of 130: mid1(50) + mid2(50) + assignment(20) + quiz(10))
  this.total = mid1 + mid2 + assignment + quiz;
  
  // Calculate percentage
  this.percentage = ((this.total / 130) * 100).toFixed(2);
  
  // Calculate grade based on percentage
  if (this.percentage >= 90) {
    this.grade = 'O';
    this.gradePoints = 10;
  } else if (this.percentage >= 80) {
    this.grade = 'A+';
    this.gradePoints = 9;
  } else if (this.percentage >= 70) {
    this.grade = 'A';
    this.gradePoints = 8;
  } else if (this.percentage >= 60) {
    this.grade = 'B+';
    this.gradePoints = 7;
  } else if (this.percentage >= 50) {
    this.grade = 'B';
    this.gradePoints = 6;
  } else if (this.percentage >= 40) {
    this.grade = 'C';
    this.gradePoints = 5;
  } else {
    this.grade = 'F';
    this.gradePoints = 0;
  }
  
  next();
});

// Calculate SGPA for a student in a semester
gradeSchema.statics.calculateSGPA = async function(studentId, semester) {
  const grades = await this.find({ student: studentId, semester }).populate('subject');
  
  if (grades.length === 0) return 0;
  
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  grades.forEach(grade => {
    const credits = grade.subject.credits;
    totalCredits += credits;
    totalGradePoints += grade.gradePoints * credits;
  });
  
  return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
};

// Calculate CGPA for a student
gradeSchema.statics.calculateCGPA = async function(studentId) {
  const grades = await this.find({ student: studentId }).populate('subject');
  
  if (grades.length === 0) return 0;
  
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  grades.forEach(grade => {
    const credits = grade.subject.credits;
    totalCredits += credits;
    totalGradePoints += grade.gradePoints * credits;
  });
  
  return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
};

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
