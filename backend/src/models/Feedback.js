import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  feedbackType: {
    type: String,
    enum: ['academic', 'behavior', 'improvement', 'appreciation', 'warning'],
    default: 'academic'
  },
  category: {
    type: String,
    enum: ['attendance', 'performance', 'behavior', 'participation', 'general'],
    default: 'general'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  strengths: [{
    type: String
  }],
  areasOfImprovement: [{
    type: String
  }],
  comments: {
    type: String,
    required: true
  },
  suggestions: {
    type: String
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  parentViewed: {
    type: Boolean,
    default: false
  },
  parentViewedAt: {
    type: Date
  },
  studentViewed: {
    type: Boolean,
    default: false
  },
  studentViewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
feedbackSchema.index({ student: 1, semester: 1 });
feedbackSchema.index({ faculty: 1 });

// Mark as viewed by parent
feedbackSchema.methods.markAsViewedByParent = function() {
  this.parentViewed = true;
  this.parentViewedAt = new Date();
  return this.save();
};

// Mark as viewed by student
feedbackSchema.methods.markAsViewedByStudent = function() {
  this.studentViewed = true;
  this.studentViewedAt = new Date();
  return this.save();
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
