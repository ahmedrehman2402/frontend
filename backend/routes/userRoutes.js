import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import Attendance from '../models/Attendance.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/users/enroll/:courseId
// @desc    Enroll logged-in user into a course
// @access  Private (student only)
router.post('/enroll/:courseId', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.find(
      (c) => c.courseId.toString() === req.params.courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    user.enrolledCourses.push({
      courseId: course._id,
      progress: 0,
      completedLessons: 0,
      lastAccessed: new Date()
    });

    await user.save();
    
    // Also bump up course students count
    course.students = (course.students || 0) + 1;
    await course.save();

    res.status(200).json({ message: 'Successfully enrolled in course!', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/dashboard
// @desc    Get populated user data for dashboard
// @access  Private
router.get('/me/dashboard', protect, async (req, res) => {
  try {
    // Populate the course references inside enrolledCourses
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses.courseId',
      select: 'title lessons duration thumbnail instructor'
    }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/attendance-streak
// @desc    Get user's consecutive attendance streak
// @access  Private
router.get('/me/attendance-streak', protect, async (req, res) => {
  try {
    const attendances = await Attendance.find({ student: req.user._id })
      .sort({ date: -1 })
      .select('date');

    if (attendances.length === 0) {
      return res.json({ streak: 0, markedToday: false });
    }

    // Filter to unique days in descending order
    const uniqueDates = [...new Set(attendances.map(a => a.date))];
    
    let streak = 0;
    
    // Server uses pure UTC date string for attendance
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Construct yesterday based purely on the UTC generated today
    const yesterdayDate = new Date(todayStr); // Parses dynamically as midnight UTC
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    
    const markedToday = uniqueDates.length > 0 && uniqueDates[0] === todayStr;

    // the streak is only active if the latest record is today or yesterday
    if (uniqueDates.length === 0 || (!markedToday && uniqueDates[0] !== yesterdayStr)) {
      return res.json({ streak: 0, markedToday });
    }

    let currentDateStr = uniqueDates[0];

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === currentDateStr) {
        streak++;
        // Manually step back exactly one string day
        const curDate = new Date(currentDateStr);
        curDate.setUTCDate(curDate.getUTCDate() - 1);
        currentDateStr = curDate.toISOString().split('T')[0];
      } else {
        break; // Streak broken
      }
    }

    res.json({ streak, markedToday });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/quiz/:courseId
// @desc    Submit a finished AI quiz score
// @access  Private
router.post('/quiz/:courseId', protect, async (req, res) => {
  try {
    const { score, totalQuestions, difficulty, date } = req.body;
    const user = await User.findById(req.user._id);
    
    user.quizScores.push({
      courseId: req.params.courseId,
      score,
      totalQuestions,
      difficulty: difficulty || 'Medium',
      date: date || new Date()
    });

    // Check if we also want to simulate course progress bump 
    // when they take a quiz, for demo purposes we can just bump it.
    const enrolledIndex = user.enrolledCourses.findIndex(
      (c) => c.courseId.toString() === req.params.courseId
    );

    if (enrolledIndex !== -1) {
      user.enrolledCourses[enrolledIndex].progress = 100;
      user.enrolledCourses[enrolledIndex].lastAccessed = new Date();
    }

    await user.save();
    res.status(200).json({ message: 'Quiz score saved successfully', quizScores: user.quizScores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    
    if (req.body.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(req.body.password)) {
        return res.status(400).json({ message: 'Password is too weak. Must be at least 8 chars with 1 uppercase, 1 number, and 1 special character.' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Sync to Instructor if applicable
    if (user.role === 'instructor') {
      const instructor = await Instructor.findOne({ userId: user._id });
      if (instructor) {
        if (req.body.name) instructor.name = req.body.name;
        if (req.body.email) instructor.email = req.body.email;
        await instructor.save();
      }
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile details
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/ping
// @desc    Update lastAccessed for a specific course or all enrolled courses
// @access  Private
router.post('/ping', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (courseId) {
      const enrolledIndex = user.enrolledCourses.findIndex(c => c.courseId.toString() === courseId);
      if (enrolledIndex !== -1) {
        user.enrolledCourses[enrolledIndex].lastAccessed = new Date();
      }
    } else {
       user.enrolledCourses.forEach(ec => ec.lastAccessed = new Date());
    }
    
    user.markModified('enrolledCourses');
    await user.save();
    res.status(200).json({ message: 'Ping updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
