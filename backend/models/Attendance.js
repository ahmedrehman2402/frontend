import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: String, // Storing date as YYYY-MM-DD for easy querying
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present'
  }
}, { timestamps: true });

// Ensure a student can only be marked present once per course per day
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
