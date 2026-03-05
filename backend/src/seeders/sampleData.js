import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import Feedback from '../models/Feedback.js';
import connectDB from '../config/database.js';

dotenv.config();

const studentNames = [
  'Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Gupta', 'Vikram Patel',
  'Sneha Desai', 'Rohan Das', 'Anjali Verma', 'Karan Malhotra', 'Pooja Reddy',
  'Arjun Nair', 'Kavya Menon', 'Siddharth Rao', 'Riya Joshi', 'Aditya Iyer',
  'Nisha Pillai', 'Varun Kapoor', 'Meera Rajput', 'Yash Singhania', 'Tara Ahuja'
];

const staffData = [
  { name: 'Dr. Alan Turing', email: 'alan.staff@smartcampus.edu', dept: 'CSE' },
  { name: 'Dr. Grace Hopper', email: 'grace.staff@smartcampus.edu', dept: 'CSE' },
  { name: 'Dr. John von Neumann', email: 'john.staff@smartcampus.edu', dept: 'CSE' },
  { name: 'Dr. Ada Lovelace', email: 'ada.staff@smartcampus.edu', dept: 'CSE' },
  { name: 'Dr. Srinivasa Ramanujan', email: 'ramanujan.staff@smartcampus.edu', dept: 'Other' }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await Grade.deleteMany({});
    await Complaint.deleteMany({});
    await Assignment.deleteMany({});
    await Feedback.deleteMany({});
    console.log('✅ Existing data cleared');

    // 1. Admin
    console.log('👥 Creating Admin...');
    const admin = await User.create([{
      name: 'Super Admin',
      email: 'admin@smartcampus.edu',
      password: 'admin123',
      role: 'admin'
    }]);

    // 2. Staff
    console.log('👥 Creating 5 Staff members...');
    const staffMembers = [];
    for (const s of staffData) {
      const staffUser = await User.create({
        name: s.name,
        email: s.email,
        password: 'staff123',
        role: 'staff',
        department: s.dept,
        designation: 'Professor'
      });
      staffMembers.push(staffUser);
    }

    // 3. Students (20)
    console.log('👥 Creating 20 Students...');
    const studentsData = studentNames.map((name, i) => ({
      name,
      email: `student${i + 1}@smartcampus.edu`,
      password: 'student123',
      role: 'student',
      department: 'CSE',
      year: 3,
      semester: 6,
      batch: '2026'
    }));

    const students = [];
    for (const st of studentsData) {
      students.push(await User.create(st));
    }

    // 4. Parents (20 - one per student)
    console.log('👥 Creating 20 Parents...');
    const parentsData = studentNames.map((name, i) => {
      const parentName = `Mr/Ms. ${name.split(' ')[1]}`;
      return {
        name: parentName,
        email: `parent${i + 1}@smartcampus.edu`,
        password: 'parent123',
        role: 'parent',
        phone: `+91-98765432${i.toString().padStart(2, '0')}`,
        children: [students[i]._id] // Link to student immediately
      };
    });

    const parents = [];
    for (const pt of parentsData) {
      parents.push(await User.create(pt));
    }

    // 5. Subjects (6 Subjects)
    console.log('📚 Creating 6 Subjects...');
    const subjectsData = [
      { name: 'Data Structures', code: 'CSE101', dept: 'CSE', type: 'Theory', facultyIndex: 0 },
      { name: 'DBMS', code: 'CSE102', dept: 'CSE', type: 'Theory', facultyIndex: 1 },
      { name: 'Operating Systems', code: 'CSE103', dept: 'CSE', type: 'Theory', facultyIndex: 2 },
      { name: 'Computer Networks', code: 'CSE104', dept: 'CSE', type: 'Theory', facultyIndex: 3 },
      { name: 'Mathematics', code: 'MAT101', dept: 'Other', type: 'Theory', facultyIndex: 4 },
      { name: 'Artificial Intelligence', code: 'CSE105', dept: 'CSE', type: 'Theory', facultyIndex: 0 },
    ];

    const subjects = await Subject.create(subjectsData.map(s => ({
      name: s.name,
      code: s.code,
      department: s.dept,
      semester: 6,
      credits: 3,
      type: s.type,
      faculty: staffMembers[s.facultyIndex]._id,
      students: students.map(st => st._id),
      academicYear: '2025-2026',
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'A101' },
      ]
    })));

    // Link subjects to staff
    for (let i = 0; i < staffMembers.length; i++) {
      const staffSubjects = subjects.filter(sub => sub.faculty.toString() === staffMembers[i]._id.toString());
      await User.findByIdAndUpdate(staffMembers[i]._id, { subjects: staffSubjects.map(s => s._id) });
    }

    // Link subjects to students
    const allSubjectIds = subjects.map(s => s._id);
    await User.updateMany({ role: 'student' }, { $set: { subjects: allSubjectIds } });

    // 6. Attendance Records
    console.log('📝 Creating 30 days of realistic Attendance...');
    // We want: 3 < 65%, 5 between 65-75%, 12 > 75%
    const attendanceRecords = [];

    // Categorize students
    const lowAttStudents = students.slice(0, 3); // index 0,1,2 (prob 0.55)
    const medAttStudents = students.slice(3, 8); // index 3,4,5,6,7 (prob 0.70)
    const highAttStudents = students.slice(8, 20); // index 8-19 (prob 0.90)

    const getAttendanceStatus = (studentIndex) => {
      let prob = 0.90;
      if (studentIndex < 3) prob = 0.55;
      else if (studentIndex < 8) prob = 0.70;
      return Math.random() < prob ? 'present' : 'absent';
    };

    const daysToSimulate = 30;
    let actualClassesPerSubject = 0;

    for (let day = daysToSimulate; day > 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(9, 0, 0, 0);

      // Skip weekends to be realistic
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      actualClassesPerSubject++;

      for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
        const subject = subjects[sIdx];

        for (let stIdx = 0; stIdx < students.length; stIdx++) {
          const student = students[stIdx];

          attendanceRecords.push({
            student: student._id,
            subject: subject._id,
            date: date,
            status: getAttendanceStatus(stIdx),
            markedBy: subject.faculty,
            period: 1,
            academicYear: '2025-2026',
            semester: 6
          });
        }
      }
    }
    await Attendance.insertMany(attendanceRecords);

    // Update subject totalClasses
    for (const sub of subjects) {
      await Subject.findByIdAndUpdate(sub._id, { totalClasses: actualClassesPerSubject });
    }

    // 7. Academic Marks (Grades)
    console.log('📊 Creating Grades...');
    // Total is out of 130 (Mid1=50, Mid2=50, Ass=20, Quiz=10). We map this to 100%.
    // 3 high (80+), 3 low (<50), 14 moderate (60-75)
    const grades = [];
    for (let stIdx = 0; stIdx < students.length; stIdx++) {
      const student = students[stIdx];

      for (const subject of subjects) {
        let mid1, mid2, assignment, quiz;

        if (stIdx < 3) {
          // High performer
          mid1 = Math.floor(Math.random() * 5) + 42; // 42-46
          mid2 = Math.floor(Math.random() * 5) + 44; // 44-48
          assignment = Math.floor(Math.random() * 3) + 17; // 17-19
          quiz = Math.floor(Math.random() * 2) + 8; // 8-9
        } else if (stIdx >= 17) {
          // Low performer (let's use the last 3 for variety)
          mid1 = Math.floor(Math.random() * 10) + 15; // 15-24
          mid2 = Math.floor(Math.random() * 10) + 18; // 18-27
          assignment = Math.floor(Math.random() * 5) + 8; // 8-12
          quiz = Math.floor(Math.random() * 3) + 4; // 4-6
        } else {
          // Moderate
          mid1 = Math.floor(Math.random() * 10) + 30; // 30-39
          mid2 = Math.floor(Math.random() * 10) + 28; // 28-37
          assignment = Math.floor(Math.random() * 4) + 13; // 13-16
          quiz = Math.floor(Math.random() * 2) + 6; // 6-7
        }

        grades.push({
          student: student._id,
          subject: subject._id,
          academicYear: '2025-2026',
          semester: 6,
          assessments: { mid1, mid2, assignment, quiz },
          updatedBy: subject.faculty
        });
      }
    }
    // We can insertMany, but inserting triggers bypassing the `pre('save')` hook calculating totals.
    // Let's create them iteratively to trigger pre-save calculation for grades.
    for (const gradeData of grades) {
      await Grade.create(gradeData);
    }

    // Update CGPAs
    for (const student of students) {
      const cgpa = await Grade.calculateCGPA(student._id);
      await User.findByIdAndUpdate(student._id, { cgpa: parseFloat(cgpa) });
    }

    // 8. Complaints
    console.log('🎫 Creating Complaints...');
    const complaintData = [
      { title: 'Projector broken in A101', desc: 'The lamp burns out repeatedly.', cat: 'Infrastructure', status: 'resolved', prio: 'medium' },
      { title: 'Hostel WiFi dropping', desc: 'Cannot connect in B block nights.', cat: 'Hostel', status: 'pending', prio: 'high' },
      { title: 'More library books needed', desc: 'Operating systems books are out of stock.', cat: 'Library', status: 'in-progress', prio: 'medium' },
      { title: 'Transport bus delayed', desc: 'Route 4 is routinely 20 mins late.', cat: 'Transport', status: 'pending', prio: 'high' },
      { title: 'Late attendance posting', desc: 'Data structures attendance not posted for 2 weeks.', cat: 'Academic', status: 'resolved', prio: 'medium' },
      { title: 'Cafeteria food too spicy', desc: 'Recent meals have excessive chili.', cat: 'Cafeteria', status: 'in-progress', prio: 'low' },
      { title: 'Unbalanced assignment load', desc: 'Multiple heavy assignments due same day.', cat: 'Academic', status: 'pending', prio: 'urgent' }
    ];

    for (let i = 0; i < complaintData.length; i++) {
      const cd = complaintData[i];
      const studentAlias = students[i % students.length];
      await Complaint.create({
        title: cd.title,
        description: cd.desc,
        category: cd.cat,
        priority: cd.prio,
        status: cd.status,
        submittedBy: studentAlias._id,
        department: 'CSE',
        assignedTo: (cd.status === 'in-progress' || cd.status === 'resolved') ? admin[0]._id : undefined,
        resolution: cd.status === 'resolved' ? {
          resolvedBy: admin[0]._id,
          resolvedAt: new Date(),
          resolutionNote: 'Handled by management.'
        } : undefined
      });
    }

    // Assignments
    console.log('📝 Creating some Assignments...');
    await Assignment.create([
      { title: 'BST Implementation', description: 'Implement Binary Search Tree', subject: subjects[0]._id, createdBy: staffMembers[0]._id, dueDate: new Date(Date.now() + 86400000 * 5), totalMarks: 10, type: 'homework' },
      { title: 'SQL Queries', description: 'Basic joins', subject: subjects[1]._id, createdBy: staffMembers[1]._id, dueDate: new Date(Date.now() + 86400000 * 2), totalMarks: 15, type: 'homework' }
    ]);

    // Feedbacks
    console.log('💬 Creating some feedback...');
    await Feedback.create([
      { student: students[0]._id, subject: subjects[0]._id, faculty: staffMembers[0]._id, academicYear: '2025-2026', semester: 6, feedbackType: 'academic', category: 'performance', rating: 5, comments: 'Exceptional performance.' }
    ]);

    console.log('\n✨ Database seeded successfully with REALISTIC DEMO DATA! ✨\n');
    console.log('📋 Summary:');
    console.log(`   Admin: 1`);
    console.log(`   Staff: 5`);
    console.log(`   Students: 20`);
    console.log(`   Parents: 20`);
    console.log(`   Subjects: 6`);
    console.log(`   Attendance Records: ${attendanceRecords.length}`);
    console.log(`   Grades: ${grades.length}`);
    console.log(`   Complaints: ${complaintData.length}`);

    console.log('\n🔐 Test Credentials (All Passwords are `role` + 123 e.g `student123`):');
    console.log('   Admin: admin@smartcampus.edu / admin123');
    console.log('   Staff: alan.staff@smartcampus.edu / staff123');
    console.log('   Student 1 (Low attendance/High Grade): student1@smartcampus.edu / student123');
    console.log('   Student 18 (High attendance/Low Grade): student18@smartcampus.edu / student123');
    console.log('   Parent of Student 1: parent1@smartcampus.edu / parent123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
