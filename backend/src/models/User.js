import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin', 'parent'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email}`;
    }
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Student-specific fields
  rollNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  department: {
    type: String,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI&DS', 'Other']
  },
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  batch: {
    type: String
  },
  cgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  
  // Staff-specific fields
  employeeId: {
    type: String,
    sparse: true,
    unique: true
  },
  designation: {
    type: String
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  
  // Parent-specific fields
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Common fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate auto roll number for students
userSchema.pre('save', async function(next) {
  if (this.role === 'student' && !this.rollNumber) {
    const year = new Date().getFullYear().toString().slice(-2);
    const dept = this.department || 'GEN';
    const count = await mongoose.model('User').countDocuments({ role: 'student' });
    this.rollNumber = `${dept}${year}B${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Generate auto employee ID for staff
userSchema.pre('save', async function(next) {
  if (this.role === 'staff' && !this.employeeId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.model('User').countDocuments({ role: 'staff' });
    this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
