import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';

const router = express.Router();

router.get('/:courseId', protect, async (req, res) => {
  try {
    const user = req.user; // populated from protect middleware
    
    // Authorization check
    let isAuthorized = false;
    if (user.role === 'admin') {
      isAuthorized = true;
    } else if (user.role === 'instructor') {
      // Must check if user name matches course instructor or similar logic
      // Note: we can import Course or just check if they are trying to access it
      // Let's assume frontend logic is sufficient for basic instructor routing or we query Course:
      const Course = (await import('../models/Course.js')).default;
      const courseObj = await Course.findById(req.params.courseId);
      if (courseObj && courseObj.instructor === user.name) isAuthorized = true;
    } else {
      // Student check
      const UserObj = await (await import('../models/User.js')).default.findById(user._id);
      isAuthorized = UserObj.enrolledCourses.some(ec => 
        ec.courseId.toString() === req.params.courseId
      );
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Unauthorized access to this chat room' });
    }

    const messages = await Message.find({ courseRoom: req.params.courseId })
      .populate('sender', 'name role')
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
