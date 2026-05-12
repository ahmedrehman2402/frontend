import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useCourses, useInstructors } from "@/hooks/useApi";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Play,
  Download,
  Award,
} from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const { data: courses = [], isLoading: loadingCourses } = useCourses();
  const { data: instructors = [], isLoading: loadingInstructors } = useInstructors();
  const isLoading = loadingCourses || loadingInstructors;
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  
  const userStr = localStorage.getItem("user");
  let parsedUser = null;
  try {
    if (userStr && userStr !== "undefined") {
      parsedUser = JSON.parse(userStr);
    }
  } catch(e) {}
  const [user, setUser] = useState(parsedUser);
  const isEnrolled = Array.isArray(user?.enrolledCourses) 
    ? user.enrolledCourses.some((c: any) => (c.courseId?._id || c.courseId) === id) 
    : false;

  const navigate = useNavigate();
  const { toast } = useToast();

  // Ping backend to mark student as active
  useEffect(() => {
    if (!isEnrolled || !id) return;

    const pingActiveStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`http://localhost:5000/api/users/ping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ courseId: id })
        }).catch(err => console.error("Failed to ping active status:", err));
      }
    };
    
    // Initial ping on load
    pingActiveStatus();
    
    // Set up an interval to ping every 5 minutes (300000 ms)
    const interval = setInterval(pingActiveStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [id, isEnrolled]);

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "Authentication required", description: "Please log in to enroll.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/users/enroll/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to enroll");
      
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      
      toast({ title: "Success", description: "You have been enrolled!" });
      // Remove automatic navigation here so they stay on the course page and can mark attendance
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      setIsMarkingAttendance(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "Authentication required", description: "Please log in to mark attendance.", variant: "destructive" });
        return;
      }
      const res = await fetch(`http://localhost:5000/api/courses/${course.id}/attendance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark attendance");
      toast({ title: "Success", description: "Attendance marked for today!" });
    } catch (error: any) {
      toast({ title: "Attendance Info", description: error.message });
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  const course = courses.find((c: any) => c.id === id);

  if (!course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-display text-2xl font-bold">Course Not Found</h2>
          <p className="mb-4 text-muted-foreground">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const instructor = instructors.find((i: any) => i.id === course.instructorId);

  const levelColors: Record<string, string> = {
    Beginner: "bg-success/10 text-success",
    Intermediate: "bg-cta/10 text-cta",
    Advanced: "bg-destructive/10 text-destructive",
  };

  return (
    <main className="bg-background pb-20">
      {/* Hero */}
      <div className="bg-hero-gradient py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Link
            to="/courses"
            className="mb-6 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className={levelColors[course.level]}>{course.level}</Badge>
              <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground">
                {course.category}
              </Badge>
            </div>
            <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-5xl">
              {course.title}
            </h1>
            <p className="mb-6 text-lg text-primary-foreground/80">{course.description}</p>
            <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {course.lessons} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {(course.students || 0).toLocaleString()} students
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-cta text-cta" />
                {course.rating || 0} rating
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isEnrolled ? (
                <Button size="lg" onClick={handleEnroll} disabled={isEnrolling} className="bg-primary px-8 font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                  <Play className="mr-2 h-4 w-4" />
                  {isEnrolling ? "Enrolling..." : "Enroll for Free"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={isMarkingAttendance}
                  onClick={handleMarkAttendance}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isMarkingAttendance ? "Marking..." : "Mark Today's Attendance"}
                </Button>
              )}
              
              <Button
                size="lg"
                variant="outline"
                className="glass-panel text-foreground shadow-sm hover:bg-foreground/5"
                onClick={() => toast({ title: "Downloading Syllabus", description: `Your download for ${course.title} syllabus will begin shortly.` })}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Syllabus
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Syllabus */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="mb-6 font-display text-2xl font-bold">Course Syllabus</h2>
              <div className="space-y-3">
                {(Array.isArray(course.syllabus) ? course.syllabus : []).map((module: any, i: number) => (
                  <div
                    key={module}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{module}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.ceil((course.lessons || 1) / ((Array.isArray(course.syllabus) ? course.syllabus.length : 1) || 1))} lessons
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tags */}
            <div className="mt-8">
              <h3 className="mb-3 font-display font-semibold">Skills You'll Learn</h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(course.tags) ? course.tags : []).map((tag: any) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Card */}
            {instructor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <h3 className="mb-4 font-display font-semibold">Your Instructor</h3>
                <Link to={`/instructors`} className="group flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                    {instructor.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {instructor.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{instructor.title}</p>
                  </div>
                </Link>
                <p className="mt-3 text-sm text-muted-foreground">{typeof instructor.bio === 'string' ? instructor.bio.slice(0, 120) : ''}...</p>
              </motion.div>
            )}

            {/* What you get */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="mb-4 font-display font-semibold">What's Included</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { icon: Play, text: `${course.lessons} video lessons` },
                  { icon: Download, text: "Downloadable resources" },
                  { icon: Award, text: "Certificate of completion" },
                  { icon: BookOpen, text: "Lifetime access" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4 text-accent" />
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CourseDetail;
