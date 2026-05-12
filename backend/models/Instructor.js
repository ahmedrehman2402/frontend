import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, default: 'Instructor' },
  bio: { type: String, default: 'Passionate educator' },
  avatar: { type: String, default: '' },
  skills: [{ type: String }],
  experience: { type: String, default: '1+ years' },
  coursesTaught: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  social: {
    twitter: { type: String },
    linkedin: { type: String },
    github: { type: String }
  }
}, { timestamps: true });

export default mongoose.model('Instructor', instructorSchema);
