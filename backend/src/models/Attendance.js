import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: {
    type: String,
    trim: true
  },
  period: {
    type: Number,
    min: 1,
    max: 8
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance entries
attendanceSchema.index({ student: 1, subject: 1, date: 1, period: 1 }, { unique: true });

// Static method to calculate attendance percentage
attendanceSchema.statics.calculateAttendancePercentage = async function (studentId, subjectId = null) {
  const query = { student: studentId };
  if (subjectId) {
    query.subject = subjectId;
  }

  const totalClasses = await this.countDocuments(query);
  const presentClasses = await this.countDocuments({ ...query, status: { $in: ['present', 'late'] } });

  if (totalClasses === 0) return 0;
  return ((presentClasses / totalClasses) * 100).toFixed(2);
};

// Method to get attendance summary
attendanceSchema.statics.getAttendanceSummary = async function (studentId) {
  const summary = await this.aggregate([
    {
      $match: { student: new mongoose.Types.ObjectId(studentId) }
    },
    {
      $group: {
        _id: '$subject',
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
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subjectDetails'
      }
    },
    {
      $unwind: '$subjectDetails'
    },
    {
      $project: {
        subject: '$subjectDetails.name',
        subjectCode: '$subjectDetails.code',
        total: 1,
        present: 1,
        absent: 1,
        percentage: {
          $multiply: [
            { $divide: ['$present', '$total'] },
            100
          ]
        }
      }
    }
  ]);

  return summary;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
