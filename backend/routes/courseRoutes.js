import express from 'express';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import Attendance from '../models/Attendance.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const courseData = { ...req.body };
    // Optionally resolve instructorId by instructor name if not provided directly
    if (courseData.instructor && !courseData.instructorId) {
      const inst = await Instructor.findOne({ name: courseData.instructor });
      if (inst) courseData.instructorId = inst._id;
    }
    const createdCourse = await Course.create(courseData);
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    Object.assign(course, req.body);
    
    // Update instructorId if instructor name changed
    if (req.body.instructor) {
      const inst = await Instructor.findOne({ name: req.body.instructor });
      if (inst) course.instructorId = inst._id;
    }
    
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance
router.post('/:id/attendance', protect, async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const existing = await Attendance.findOne({
      student: req.user._id,
      course: req.params.id,
      date: dateStr
    });

    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const attendance = await Attendance.create({
      student: req.user._id,
      course: req.params.id,
      date: dateStr,
      status: 'Present'
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a course (Instructors/Admins)
router.get('/:id/attendance', protect, async (req, res) => {
  try {
    const attendances = await Attendance.find({ course: req.params.id }).populate('student', 'name email');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
