import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const learnersCount = await User.countDocuments({ role: 'student' });
    const coursesCount = await Course.countDocuments();
    const instructorsCount = await User.countDocuments({ role: 'instructor' });
    
    let completionRate = 95;
    const usersWithEnrollments = await User.find({ "enrolledCourses.0": { $exists: true } });
    
    if (usersWithEnrollments.length > 0) {
       let totalProgress = 0;
       let totalEnrollments = 0;
       usersWithEnrollments.forEach(user => {
           user.enrolledCourses.forEach(enrollment => {
               totalProgress += (enrollment.progress || 0);
               totalEnrollments++;
           });
       });
       if (totalEnrollments > 0) {
           completionRate = Math.round(totalProgress / totalEnrollments);
       }
    }

    res.json({
      learners: learnersCount,
      courses: coursesCount,
      instructors: instructorsCount,
      completionRate: completionRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
