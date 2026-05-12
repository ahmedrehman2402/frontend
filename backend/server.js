import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import courseRoutes from './routes/courseRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import User from './models/User.js';
import Message from './models/Message.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket');

  socket.on('join_course_room', (courseId) => {
    socket.join(courseId);
    console.log(`User joined course room: ${courseId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { courseId, senderId, text } = data;
      // Save message to database
      const newMessage = await Message.create({
        courseRoom: courseId,
        sender: senderId,
        text: text
      });
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name role');
      
      // Emit to everyone in the room
      io.to(courseId).emit('receive_message', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    
    // Seed default admin
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('Default admin seeded.');
    }

    // Seed default categories
    const Category = (await import('./models/Category.js')).default;
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const defaultCats = [
        "Web Development", "AI & Machine Learning", "Digital Marketing",
        "SEO", "Programming", "Data Science", "Mobile Development"
      ];
      await Category.insertMany(defaultCats.map(name => ({ name })));
      console.log('Default categories seeded.');
    }
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
