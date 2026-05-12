import express from 'express';
import User from '../models/User.js';
import Instructor from '../models/Instructor.js';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'instructor'] } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    if (user.role === 'instructor') {
      await Instructor.findOneAndDelete({ userId: req.params.id });
    }
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a user
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    await user.save();
    
    if (user.role === 'instructor') {
      const instructor = await Instructor.findOne({ userId: user._id });
      if (instructor) {
        instructor.name = user.name;
        instructor.email = user.email;
        await instructor.save();
      }
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an instructor
router.post('/instructors', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, assignedCourses } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: 'instructor'
    });
    
    // Also create the instructor profile
    const instructorProfile = await Instructor.create({
      name,
      email,
      userId: user._id
    });
    
    // Assign courses if any provided
    if (assignedCourses && Array.isArray(assignedCourses) && assignedCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: assignedCourses } },
        { instructor: name, instructorId: user._id }
      );
    }
    
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileId: instructorProfile._id,
      assignedCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
