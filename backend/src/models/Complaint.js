import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide complaint title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide complaint description']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Infrastructure',
      'Academic',
      'Hostel',
      'Transport',
      'Library',
      'Laboratory',
      'Cafeteria',
      'Sports',
      'Administration',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected', 'closed'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionNote: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  department: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ category: 1 });

// Method to add comment
complaintSchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text: text
  });
  return this.save();
};

// Method to resolve complaint
complaintSchema.methods.resolve = function(userId, resolutionNote) {
  this.status = 'resolved';
  this.resolution = {
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolutionNote: resolutionNote
  };
  return this.save();
};

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
