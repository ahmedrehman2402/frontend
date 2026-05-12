import express from 'express';
import Instructor from '../models/Instructor.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get instructor's students
router.get('/students', protect, authorize('instructor'), async (req, res) => {
  try {
    let instructorProfile = await Instructor.findOne({ userId: req.user._id });
    if (!instructorProfile) {
      // Auto-heal: If user is an instructor but missing profile, create one gracefully
      instructorProfile = await Instructor.create({
        name: req.user.name,
        email: req.user.email,
        userId: req.user._id
      });
    }

    // Find courses taught by this instructor by either ID or string name
    const courses = await Course.find({
      $or: [
        { instructorId: instructorProfile._id },
        { instructor: instructorProfile.name }
      ]
    });
    const courseIds = courses.map(c => c._id);

    // Find users who have any of these courses in their enrolledCourses array
    const users = await User.find({ 'enrolledCourses.courseId': { $in: courseIds } }).select('-password');
    
    // Map data to return relevant info (student name, email, course, progress)
    const studentsData = [];
    users.forEach(user => {
      user.enrolledCourses.forEach(ec => {
        const courseIdStr = typeof ec.courseId === 'object' && ec.courseId ? ec.courseId._id?.toString() : ec.courseId?.toString();
        const course = courses.find(c => c._id.toString() === courseIdStr);
        if (course) {
          studentsData.push({
            studentId: user._id,
            name: user.name,
            email: user.email,
            courseId: course._id,
            courseTitle: course.title,
            progress: ec.progress,
            completedLessons: ec.completedLessons,
            lastAccessed: ec.lastAccessed
          });
        }
      });
    });

    res.json(studentsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student progress
router.patch('/students/:studentId/progress', protect, authorize('instructor'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, progress, completedLessons } = req.body;

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courseIndex = user.enrolledCourses.findIndex(c => c.courseId.toString() === courseId);
    if (courseIndex === -1) return res.status(400).json({ message: 'User not enrolled in this course' });

    user.enrolledCourses[courseIndex].progress = progress !== undefined ? progress : user.enrolledCourses[courseIndex].progress;
    user.enrolledCourses[courseIndex].completedLessons = completedLessons !== undefined ? completedLessons : user.enrolledCourses[courseIndex].completedLessons;

    await user.save();
    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove student from course
router.delete('/students/:studentId/course/:courseId', protect, authorize('instructor'), async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.enrolledCourses = user.enrolledCourses.filter(c => c.courseId.toString() !== courseId);
    await user.save();
    
    res.json({ message: 'Student removed from course' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    res.json(instructor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
