import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    responseAt: Date
  }],
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  meetingType: {
    type: String,
    enum: ['parent-teacher', 'staff', 'counseling', 'placement', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  agenda: {
    type: String
  },
  notes: {
    type: String
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  studentDiscussed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  meetingLink: {
    type: String
  }
}, {
  timestamps: true
});

// Method to accept meeting
meetingSchema.methods.acceptMeeting = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.status = 'accepted';
    participant.responseAt = new Date();
  }
  
  return this.save();
};

// Method to reject meeting
meetingSchema.methods.rejectMeeting = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.status = 'rejected';
    participant.responseAt = new Date();
  }
  
  return this.save();
};

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
