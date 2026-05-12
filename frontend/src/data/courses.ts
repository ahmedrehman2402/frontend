export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorId: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  syllabus: string[];
  tags: string[];
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  experience: string;
  coursesTaught: number;
  students: number;
  rating: number;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export const categories = [
  "All",
  "Web Development",
  "AI & Machine Learning",
  "Digital Marketing",
  "SEO",
  "Programming",
  "Data Science",
  "Mobile Development",
];

export const courses: Course[] = [
  {
    id: "1",
    title: "Complete React.js Masterclass",
    description: "Learn React from scratch. Build real-world projects with hooks, context API, Redux, and more. Perfect for beginners and intermediate developers.",
    category: "Web Development",
    instructor: "Sarah Chen",
    instructorId: "1",
    thumbnail: "",
    duration: "24 hours",
    lessons: 48,
    students: 12500,
    rating: 4.9,
    level: "Beginner",
    syllabus: ["React Fundamentals", "JSX & Components", "State & Props", "Hooks Deep Dive", "Context API", "React Router", "Redux Toolkit", "Building Real Projects"],
    tags: ["React", "JavaScript", "Frontend"],
  },
  {
    id: "2",
    title: "Python for AI & Machine Learning",
    description: "Master Python programming and dive into AI/ML with TensorFlow, PyTorch, and scikit-learn. Hands-on projects included.",
    category: "AI & Machine Learning",
    instructor: "Dr. James Wilson",
    instructorId: "2",
    thumbnail: "",
    duration: "32 hours",
    lessons: 64,
    students: 8900,
    rating: 4.8,
    level: "Intermediate",
    syllabus: ["Python Basics", "NumPy & Pandas", "Data Visualization", "Machine Learning Intro", "Deep Learning", "TensorFlow", "NLP Basics", "Real-World AI Projects"],
    tags: ["Python", "AI", "Machine Learning"],
  },
  {
    id: "3",
    title: "Digital Marketing Fundamentals",
    description: "Learn proven digital marketing strategies including social media, content marketing, email campaigns, and analytics.",
    category: "Digital Marketing",
    instructor: "Maria Rodriguez",
    instructorId: "3",
    thumbnail: "",
    duration: "16 hours",
    lessons: 32,
    students: 15200,
    rating: 4.7,
    level: "Beginner",
    syllabus: ["Marketing Strategy", "Social Media Marketing", "Content Creation", "Email Marketing", "Google Ads", "Analytics & Tracking", "SEO Basics", "Campaign Optimization"],
    tags: ["Marketing", "Social Media", "Analytics"],
  },
  {
    id: "4",
    title: "Advanced SEO & Content Strategy",
    description: "Master technical SEO, keyword research, link building, and content strategy to rank #1 on Google.",
    category: "SEO",
    instructor: "Alex Thompson",
    instructorId: "4",
    thumbnail: "",
    duration: "20 hours",
    lessons: 40,
    students: 6800,
    rating: 4.6,
    level: "Advanced",
    syllabus: ["Technical SEO Audit", "Keyword Research", "On-Page Optimization", "Link Building", "Content Strategy", "Local SEO", "Schema Markup", "SEO Analytics"],
    tags: ["SEO", "Content", "Google"],
  },
  {
    id: "5",
    title: "Full-Stack JavaScript Development",
    description: "Build complete web applications with Node.js, Express, MongoDB, and React. From frontend to backend mastery.",
    category: "Web Development",
    instructor: "Sarah Chen",
    instructorId: "1",
    thumbnail: "",
    duration: "40 hours",
    lessons: 80,
    students: 9400,
    rating: 4.9,
    level: "Intermediate",
    syllabus: ["Node.js Fundamentals", "Express.js", "MongoDB & Mongoose", "REST APIs", "Authentication", "React Frontend", "Deployment", "Testing"],
    tags: ["Node.js", "Express", "MongoDB", "React"],
  },
  {
    id: "6",
    title: "Data Science with Python",
    description: "Become a data scientist. Learn data analysis, visualization, statistics, and machine learning with Python.",
    category: "Data Science",
    instructor: "Dr. James Wilson",
    instructorId: "2",
    thumbnail: "",
    duration: "28 hours",
    lessons: 56,
    students: 7300,
    rating: 4.8,
    level: "Intermediate",
    syllabus: ["Statistics Fundamentals", "Python for Data", "Pandas Mastery", "Data Visualization", "Statistical Modeling", "Machine Learning", "Big Data Intro", "Capstone Project"],
    tags: ["Python", "Data Science", "Statistics"],
  },
  {
    id: "7",
    title: "React Native Mobile Development",
    description: "Build cross-platform mobile apps with React Native. Deploy to iOS and Android with a single codebase.",
    category: "Mobile Development",
    instructor: "Sarah Chen",
    instructorId: "1",
    thumbnail: "",
    duration: "22 hours",
    lessons: 44,
    students: 5600,
    rating: 4.7,
    level: "Intermediate",
    syllabus: ["React Native Setup", "Components & Styling", "Navigation", "State Management", "Native APIs", "Push Notifications", "App Store Deployment", "Performance Optimization"],
    tags: ["React Native", "Mobile", "iOS", "Android"],
  },
  {
    id: "8",
    title: "Prompt Engineering & ChatGPT Mastery",
    description: "Learn to write effective prompts for AI models. Master ChatGPT, Midjourney, and other AI tools for productivity.",
    category: "AI & Machine Learning",
    instructor: "Alex Thompson",
    instructorId: "4",
    thumbnail: "",
    duration: "12 hours",
    lessons: 24,
    students: 18500,
    rating: 4.9,
    level: "Beginner",
    syllabus: ["AI Fundamentals", "Prompt Basics", "Advanced Prompting", "ChatGPT for Business", "Midjourney", "AI Automation", "AI Ethics", "Future of AI"],
    tags: ["AI", "ChatGPT", "Prompt Engineering"],
  },
];

export const instructors: Instructor[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Full-Stack Developer",
    bio: "Former Google engineer with 10+ years of experience in web development. Passionate about teaching and building scalable applications. Has trained over 25,000 students worldwide.",
    avatar: "",
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "GraphQL"],
    experience: "10+ years",
    coursesTaught: 3,
    students: 27500,
    rating: 4.9,
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: "2",
    name: "Dr. James Wilson",
    title: "AI Research Scientist",
    bio: "PhD in Computer Science from MIT. Former AI researcher at DeepMind. Specializes in making complex AI concepts accessible to everyone.",
    avatar: "",
    skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Statistics"],
    experience: "12+ years",
    coursesTaught: 2,
    students: 16200,
    rating: 4.8,
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    title: "Digital Marketing Director",
    bio: "Led marketing teams at Shopify and HubSpot. Expert in growth marketing, content strategy, and data-driven campaigns. Speaker at major marketing conferences.",
    avatar: "",
    skills: ["Social Media", "Content Marketing", "Google Ads", "Analytics", "Email Marketing", "Brand Strategy"],
    experience: "8+ years",
    coursesTaught: 1,
    students: 15200,
    rating: 4.7,
    social: {
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    id: "4",
    name: "Alex Thompson",
    title: "SEO Consultant & AI Specialist",
    bio: "Founded an SEO agency that has helped 500+ businesses rank on page 1. Early adopter of AI tools for marketing and content creation.",
    avatar: "",
    skills: ["Technical SEO", "Content Strategy", "AI Tools", "Link Building", "Analytics", "Keyword Research"],
    experience: "9+ years",
    coursesTaught: 2,
    students: 25300,
    rating: 4.8,
    social: {
      twitter: "#",
      linkedin: "#",
    },
  },
];
