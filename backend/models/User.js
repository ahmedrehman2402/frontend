import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  enrolledCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progress: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    completedLessons: { type: Number, default: 0 }
  }],
  quizScores: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    score: { type: Number },
    totalQuestions: { type: Number },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);
