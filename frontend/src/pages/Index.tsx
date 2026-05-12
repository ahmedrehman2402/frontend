import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CourseCard from "@/components/CourseCard";
import { useCourses, useStats } from "@/hooks/useApi";
import {
  GraduationCap,
  Brain,
  BarChart3,
  Award,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Play,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Free Courses",
    description: "Access hundreds of high-quality courses across tech, marketing, and design — completely free.",
  },
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Learn from industry professionals from Google, Meta, and top startups.",
  },
  {
    icon: Brain,
    title: "Smart Quiz Generator",
    description: "Test your knowledge with interactive quizzes that adapt to your skill level.",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description: "Track your progress with detailed analytics, streaks, and visual charts.",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn verified certificates upon course completion to showcase your skills.",
  },
  {
    icon: Sparkles,
    title: "Adaptive Learning",
    description: "Our system adjusts difficulty based on your performance for optimal learning.",
  },
];



const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  const { data: courses = [] } = useCourses();
  const { data: statsData } = useStats();
  const featuredCourses = courses.slice(0, 4);

  const stats = [
    { value: statsData?.learners !== undefined ? `${statsData.learners > 0 ? statsData.learners : "50K+"}` : "50K+", label: "Active Learners" },
    { value: statsData?.courses !== undefined ? `${statsData.courses > 0 ? statsData.courses : "200+"}` : "200+", label: "Free Courses" },
    { value: statsData?.instructors !== undefined ? `${statsData.instructors > 0 ? statsData.instructors : "50+"}` : "50+", label: "Expert Instructors" },
    { value: statsData?.completionRate !== undefined ? `${statsData.completionRate}%` : "95%", label: "Completion Rate" },
  ];

  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    if (userStr && userStr !== "undefined") {
      user = JSON.parse(userStr);
    }
  } catch(e) {}

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 border-x-0 border-t-0 bg-background">
        {/* Background Image with 20% Opacity */}
        <div 
          className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"
        />
        
        {/* Subtle Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        {/* Glowing Soft Shadows (Light Mode Orbs) */}
        <div className="absolute inset-0 z-0 opacity-[0.05]">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-foreground blur-[150px]" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-8 flex justify-center">
              <img src="/logo.png" alt="LearnHub Logo" className="h-20 w-auto drop-shadow-sm" />
            </div>
            
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background/50 backdrop-blur-md px-4 py-1.5 text-sm text-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Advanced Learning Platform
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl tracking-tight">
              Learn for Free.
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Upskill with Smart Learning.
              </span>
            </h1>
            <p className="mb-10 text-lg text-foreground/80 md:text-xl">
              Access world-class courses, auto-generated quizzes, and personalized learning paths.
              Join thousands of learners advancing their careers — for free.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                <Link to="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg" className="glass-panel px-8 text-base font-semibold text-foreground hover:bg-foreground/5 shadow-sm">
                  <Link to="/auth?mode=register">
                    <Play className="mr-2 h-4 w-4" />
                    Join for Free
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={item} className="text-center">
                <p className="font-display text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              Everything You Need to{" "}
              <span className="text-gradient-primary">Succeed</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our platform combines expert-led content with cutting-edge technology
              to deliver a learning experience that adapts to you.
            </p>
          </motion.div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group rounded-2xl border border-border glass-panel p-8 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="bg-slate-50/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <h2 className="mb-3 font-display text-3xl font-bold md:text-4xl">
                Popular Free Courses
              </h2>
              <p className="text-muted-foreground">
                Start learning today with our most popular courses.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-2xl bg-hero-gradient p-8 md:p-14">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
                  <Brain className="h-4 w-4" />
                  Interactive
                </div>
                <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
                  Smart Quizzes That Adapt to You
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Our advanced quiz generator creates personalized assessments that adjust difficulty
                  based on your performance. Get instant feedback and detailed explanations.
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Auto-generated MCQs & true/false questions",
                    "Adaptive difficulty levels",
                    "Instant results with explanations",
                    "Performance-based recommendations",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-2 text-foreground/90">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      <span className="text-sm">{text}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="bg-cta-gradient font-semibold text-cta-foreground hover:opacity-90">
                  <Link to="/courses">
                    Try Smart Quiz
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex items-center justify-center"
              >
                <div className="rounded-3xl border border-white bg-white/50 p-6 backdrop-blur-md shadow-sm">
                  <div className="mb-4 rounded-2xl bg-white/80 border border-white p-4 shadow-sm">
                    <p className="mb-2 text-xs text-muted-foreground font-semibold">Question 3 of 10</p>
                    <p className="font-medium text-foreground">
                      Which React hook is used for side effects?
                    </p>
                  </div>
                  <div className="space-y-2">
                    {["useState", "useEffect", "useContext", "useMemo"].map((option, i) => (
                      <div
                        key={option}
                        className={`rounded-xl border px-4 py-3 text-sm transition-all font-medium shadow-sm ${
                          i === 1
                            ? "border-accent bg-accent/10 text-accent-foreground shadow-accent/20"
                            : "border-white bg-white/60 text-muted-foreground hover:bg-white"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {option}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GraduationCap className="mx-auto mb-6 h-12 w-12 text-primary" />
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              Ready to Start Learning?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Join over 50,000 learners who are advancing their careers with free,
              interactive courses.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {!user && (
                <Button asChild size="lg" className="bg-cta-gradient px-8 font-semibold text-cta-foreground hover:opacity-90">
                  <Link to="/auth?mode=register">Get Started — It's Free</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link to="/instructors">Meet Our Instructors</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Index;
