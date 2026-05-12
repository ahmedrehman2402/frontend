import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  thumbnail: { type: String, default: '' },
  duration: { type: String, required: true },
  lessons: { type: Number, required: true },
  students: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Advance', 'Pro'], required: true },
  syllabus: [{ type: String }],
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
