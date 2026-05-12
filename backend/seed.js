import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Instructor from './models/Instructor.js';
import User from './models/User.js';

dotenv.config();

const instructorsData = [
  { name: "Sarah Chen", title: "Senior Full-Stack Developer", bio: "Former Google engineer with 10+ years of experience.", avatar: "", skills: ["React", "Node.js", "TypeScript", "MongoDB"], experience: "10+ years", coursesTaught: 3, students: 27500, rating: 4.9, social: {} },
  { name: "Dr. James Wilson", title: "AI Research Scientist", bio: "PhD in Computer Science from MIT.", avatar: "", skills: ["Python", "TensorFlow", "PyTorch"], experience: "12+ years", coursesTaught: 2, students: 16200, rating: 4.8, social: {} },
  { name: "Maria Rodriguez", title: "Digital Marketing Director", bio: "Led marketing teams at Shopify and HubSpot.", avatar: "", skills: ["Social Media", "Content Marketing"], experience: "8+ years", coursesTaught: 1, students: 15200, rating: 4.7, social: {} },
  { name: "Alex Thompson", title: "SEO Consultant & AI Specialist", bio: "Founded an SEO agency.", avatar: "", skills: ["Technical SEO", "AI Tools"], experience: "9+ years", coursesTaught: 2, students: 25300, rating: 4.8, social: {} },
];

const coursesData = [
  { title: "Complete React.js Masterclass", description: "Learn React from scratch.", category: "Web Development", instructor: "Sarah Chen", instructorName: "Sarah Chen", duration: "24 hours", lessons: 48, students: 12500, rating: 4.9, level: "Beginner", syllabus: ["React Fundamentals", "Hooks", "Redux"], tags: ["React", "JavaScript"] },
  { title: "Python for AI & Machine Learning", description: "Master Python programming.", category: "AI & Machine Learning", instructor: "Dr. James Wilson", instructorName: "Dr. James Wilson", duration: "32 hours", lessons: 64, students: 8900, rating: 4.8, level: "Intermediate", syllabus: ["Python Basics", "TensorFlow"], tags: ["Python", "AI"] },
  { title: "Digital Marketing Fundamentals", description: "Learn proven digital marketing strategies.", category: "Digital Marketing", instructor: "Maria Rodriguez", instructorName: "Maria Rodriguez", duration: "16 hours", lessons: 32, students: 15200, rating: 4.7, level: "Beginner", syllabus: ["Marketing Strategy", "SEO Basics"], tags: ["Marketing"] },
  { title: "Advanced SEO & Content Strategy", description: "Master technical SEO.", category: "SEO", instructor: "Alex Thompson", instructorName: "Alex Thompson", duration: "20 hours", lessons: 40, students: 6800, rating: 4.6, level: "Advanced", syllabus: ["Technical SEO", "Link Building"], tags: ["SEO"] },
  { title: "Full-Stack JavaScript Development", description: "Build complete web apps.", category: "Web Development", instructor: "Sarah Chen", instructorName: "Sarah Chen", duration: "40 hours", lessons: 80, students: 9400, rating: 4.9, level: "Intermediate", syllabus: ["Node.js", "Express", "MongoDB", "React"], tags: ["Node.js"] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Course.deleteMany({});
    await Instructor.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin user
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created Admin user: admin@example.com / admin123');

    // Create Instructors
    const createdInstructors = [];
    for (let i = 0; i < instructorsData.length; i++) {
      const data = instructorsData[i];
      // Create user account for instructor
      const user = await User.create({
        name: data.name,
        email: `instructor${i + 1}@example.com`,
        password: 'instructor123',
        role: 'instructor'
      });
      // Create instructor profile
      const instructorProfile = await Instructor.create({
        ...data,
        userId: user._id
      });
      createdInstructors.push(instructorProfile);
    }
    console.log('Inserted instructors and their user accounts');

    // Create a map to find instructor IDs
    const instructorMap = {};
    createdInstructors.forEach(inst => {
      instructorMap[inst.name] = inst._id;
    });

    const mappedCourses = coursesData.map(course => {
      const { instructorName, ...rest } = course;
      return {
        ...rest,
        instructorId: instructorMap[course.instructor]
      };
    });

    await Course.insertMany(mappedCourses);
    console.log('Inserted courses');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
