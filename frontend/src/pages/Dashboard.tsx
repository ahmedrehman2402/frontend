import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import {
  BookOpen,
  Trophy,
  Flame,
  Target,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
  Bot
} from "lucide-react";

import CertificateGenerator from "@/components/CertificateGenerator";
import AIQuizModal from "@/components/AIQuizModal";

interface EnrolledCourse {
  _id: string; // the subdocument ID
  courseId: {
    _id: string;
    title: string;
    lessons: number;
    duration: string;
    thumbnail: string;
    instructor: string;
  };
  progress: number;
  completedLessons: number;
  lastAccessed: string;
}

interface QuizScore {
  _id: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
  date: string;
}

const Dashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Learner");

  // modal state
  const [activeQuizCourse, setActiveQuizCourse] = useState<{ id: string; title: string; category: string } | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const res = await fetch("http://localhost:5000/api/users/me/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const user = await res.json();
      
      setUserName(user.name);
      setEnrolledCourses(user.enrolledCourses || []);
      setQuizScores(user.quizScores || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  const completedCount = enrolledCourses.filter(c => c.progress === 100).length;
  // fake average logic
  const avgScore = quizScores.length > 0 
    ? Math.round((quizScores.reduce((acc, q) => acc + (q.score / q.totalQuestions) * 100, 0)) / quizScores.length) 
    : 0;

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: enrolledCourses.length.toString(), color: "text-primary" },
    { icon: Trophy, label: "Completed", value: completedCount.toString(), color: "text-accent" },
    { icon: Flame, label: "Day Streak", value: "1", color: "text-cta" },
    { icon: Target, label: "Avg Score", value: `${avgScore}%`, color: "text-primary" },
  ];

  return (
    <main className="bg-background py-8">
      {activeQuizCourse && (
        <AIQuizModal 
          courseId={activeQuizCourse.id}
          courseTitle={activeQuizCourse.title}
          category={activeQuizCourse.category}
          onClose={() => setActiveQuizCourse(null)}
          onSuccess={(score) => {
             toast({ title: `Quiz Complete! You scored ${score}.` });
             fetchDashboardData(); // refresh dashboard to see progress update
          }}
        />
      )}

      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 font-display text-3xl font-bold">
              Welcome back, {userName.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground">Track your progress and attempt AI quizzes.</p>
          </div>
          <Button onClick={() => navigate('/progress')} variant="outline" className="border-primary text-primary hover:bg-primary/10 w-fit">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Progress Charts
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Course Progress */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="mb-4 font-display text-xl font-bold">Your Enrolled Courses</h2>
              <div className="space-y-4">
                {enrolledCourses.length === 0 && (
                  <div className="p-8 text-center bg-card border border-border rounded-xl">
                    <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                    <Button onClick={() => navigate('/courses')}>Browse Catalog</Button>
                  </div>
                )}

                {enrolledCourses.map((enrollee) => {
                  if (!enrollee.courseId) return null; // Avoid crash if course was deleted
                  const course = enrollee.courseId;

                  return (
                  <div key={enrollee._id} className="rounded-xl border border-border bg-card p-5 shadow-card flex flex-col md:flex-row gap-5 items-center">
                    {course.thumbnail ? (
                      <img src={`http://localhost:5000${course.thumbnail}`} alt="" className="w-24 h-24 rounded-lg object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}

                    <div className="flex-1 w-full">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-bold text-lg leading-tight">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {course.duration} total • Taught by {course.instructor}
                          </p>
                        </div>
                        {enrollee.progress === 100 ? (
                          <Badge className="bg-success/10 text-success whitespace-nowrap">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <span className="text-sm font-bold text-primary">{enrollee.progress}%</span>
                        )}
                      </div>
                      <Progress value={enrollee.progress} className="h-2 mb-3" />
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground font-medium">Last accessed: {new Date(enrollee.lastAccessed).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2">
                          {enrollee.progress < 100 ? (
                            <Button size="sm" onClick={() => setActiveQuizCourse({ id: course._id, title: course.title, category: "Web Development" })} className="bg-cta-gradient font-bold shadow-md hover:shadow-lg transition-all">
                              <Bot className="w-4 h-4 mr-2" /> Take AI Quiz
                            </Button>
                          ) : (
                            <CertificateGenerator studentName={userName} courseName={course.title} completionDate={enrollee.lastAccessed} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-4 font-display font-semibold flex items-center gap-2">
                 <Award className="h-5 w-5 text-primary"/> AI Quiz History
              </h3>
              <div className="space-y-4">
                {quizScores.length === 0 && <p className="text-sm text-muted-foreground">No quizzes taken yet.</p>}
                
                {quizScores.slice().reverse().map((quiz, idx) => (
                  <div key={quiz._id || idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">Quiz Attempt</p>
                      <p className="text-xs text-muted-foreground">{new Date(quiz.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-primary">
                        {quiz.score}/{quiz.totalQuestions}
                      </p>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {quiz.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Dashboard;
