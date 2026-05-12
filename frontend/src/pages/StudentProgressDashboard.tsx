import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  LineChart, Line
} from 'recharts';
import { Target, TrendingUp, Trophy, BookOpen, Flame, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnrolledCourse {
  _id: string;
  courseId: {
    _id: string;
    title: string;
  };
  progress: number;
}

interface QuizScore {
  _id: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  date: string;
}

const StudentProgressDashboard = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
  const [coursesData, setCoursesData] = useState<{name: string, progress: number}[]>([]);
  const [rawEnrolledCourses, setRawEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [quizData, setQuizData] = useState<{date: string, score: number}[]>([]);
  const [streak, setStreak] = useState(0);
  const [hasMarkedToday, setHasMarkedToday] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Ping backend to mark student as globally active
    const pingActiveStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`http://localhost:5000/api/users/ping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => console.error("Failed to ping active status:", err));
      }
    };
    
    pingActiveStatus();
    const interval = setInterval(pingActiveStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        const [res, streakRes] = await Promise.all([
          fetch("http://localhost:5000/api/users/me/dashboard", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/users/me/attendance-streak", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const user = await res.json();
        
        // Sync local storage user state to ensure LiveChat widget has latest enrolledCourses
        const userStr = localStorage.getItem("user");
        if (userStr) {
          let localUser = null;
        try {
          if (userStr && userStr !== "undefined") {
            localUser = JSON.parse(userStr);
          }
        } catch(e) {}
          localUser.enrolledCourses = user.enrolledCourses;
          localStorage.setItem("user", JSON.stringify(localUser));
        }

        if (streakRes.ok) {
          const streakData = await streakRes.json();
          setStreak(streakData.streak || 0);
          setHasMarkedToday(streakData.markedToday);

          if (!streakData.markedToday && user.enrolledCourses.length > 0) {
            setTimeout(() => {
              toast({
                title: "🔔 Attendance Reminder",
                description: "You haven't marked your attendance for today!",
                variant: "destructive",
                duration: 6000
              });
            }, 1000);
          }
        }
        
        const cData = user.enrolledCourses.map((c: EnrolledCourse) => ({
          name: c.courseId?.title || "Unknown",
          progress: c.progress
        }));
        setCoursesData(cData);
        setRawEnrolledCourses(user.enrolledCourses);

        const qData = user.quizScores.map((q: QuizScore) => ({
          date: new Date(q.date).toLocaleDateString(),
          score: (q.score / q.totalQuestions) * 100
        }));
        // Sort chronologically
        setQuizData(qData);
        
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleMarkAttendance = async () => {
    const validCourse = rawEnrolledCourses.find(c => c && c.courseId);
    if (!validCourse) {
      toast({ title: "No Courses", description: "You must be enrolled in an active course to mark attendance." });
      return;
    }
    
    // Default to the first enrolled course to map the attendance record
    const targetCourseId = (validCourse.courseId as any)._id || validCourse.courseId;
    
    try {
      setIsMarking(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/courses/${targetCourseId}/attendance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.message === "Attendance already marked for today") {
           setHasMarkedToday(true);
           toast({ title: "Attendance Checked", description: "You've already marked attendance today! 🔥" });
           return;
        }
        throw new Error(data.message || "Failed to mark attendance");
      }
      
      toast({ title: "Success", description: "Daily attendance recorded! Streak updated 🔥" });
      setStreak(s => s + 1);
      setHasMarkedToday(true);
    } catch (error: any) {
      toast({ title: "Attendance Info", description: error.message });
    } finally {
      setIsMarking(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading charts...</div>;

  const noData = coursesData.length === 0 && quizData.length === 0;

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋</h1>
          <p className="text-muted-foreground text-lg">Your Learning Overview</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full font-bold">
            <Flame className="h-5 w-5 fill-current" />
            <span>{streak} Day Streak</span>
          </div>
          <Button 
            variant={hasMarkedToday ? "secondary" : "default"} 
            className={!hasMarkedToday ? "animate-pulse rounded-full" : "rounded-full"}
            disabled={isMarking || rawEnrolledCourses.length === 0 || hasMarkedToday} 
            onClick={handleMarkAttendance}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isMarking ? "Marking..." : hasMarkedToday ? "Attendance Marked" : "Mark Today's Attendance"}
          </Button>
        </div>
      </div>

      {noData ? (
        <div className="text-center p-12 glass-panel rounded-2xl border border-border">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No data to display</h2>
          <p className="text-muted-foreground">Enroll in some courses and take quizzes to see your progress charts.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          {/* Current Course Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border glass-panel p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-3">Current Course</p>
              <h2 className="font-display text-xl font-bold leading-tight mb-6">
                {rawEnrolledCourses.length > 0 ? rawEnrolledCourses[0].courseId.title : "No Active Courses"}
              </h2>
              {rawEnrolledCourses.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-foreground">Progress</span>
                    <span className="text-muted-foreground">{rawEnrolledCourses[0].progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full progress-gradient" 
                      style={{ width: `${rawEnrolledCourses[0].progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Button className="w-full rounded-full h-12 text-base font-semibold" disabled={rawEnrolledCourses.length === 0} onClick={() => rawEnrolledCourses.length > 0 && navigate(`/courses/${rawEnrolledCourses[0].courseId._id}`)}>
              {rawEnrolledCourses.length > 0 ? "Resume Lesson" : "Explore Courses"}
            </Button>
          </motion.div>

          {/* Course Progress Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-border glass-panel p-6">
            <h2 className="mb-6 font-display text-lg font-bold flex items-center gap-2">
              My Progress
            </h2>
            <div className="h-48 w-full">
              {coursesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', background: '#fff', color: '#0f172a', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                      {coursesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#colorUv)" />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No course progress recorded yet.</div>
              )}
            </div>
            <div className="mt-6 flex justify-between items-center px-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Hours learned</p>
                <p className="text-xl font-bold">45h</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Courses</p>
                <p className="text-xl font-bold">{rawEnrolledCourses.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-xl font-bold">{streak} days</p>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Live Sessions / Quiz Scores */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-border glass-panel p-6 flex flex-col">
            <h2 className="mb-6 font-display text-lg font-bold">
              Upcoming Live Sessions
            </h2>
            <div className="flex-1 space-y-3">
              {/* Fake live sessions to match screenshot aesthetics */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">3 PM</p>
                  <p className="text-xs text-muted-foreground">Q&A Session</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full font-bold border-primary/20 text-primary hover:bg-primary/10">RSVP</Button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">5 PM</p>
                  <p className="text-xs text-muted-foreground">Workshop</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full font-bold border-primary/20 text-primary hover:bg-primary/10">RSVP</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* My Courses Section */}
      {!noData && rawEnrolledCourses.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">My Courses</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rawEnrolledCourses.map((ec, idx) => (
              <div key={idx} className="rounded-3xl border border-border glass-panel p-4 flex flex-col hover:shadow-card-hover transition-all">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-primary-foreground/50" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 truncate">{ec.courseId.title}</h3>
                
                <div className="flex justify-between items-center text-sm mb-2 text-muted-foreground">
                  <div className="flex gap-1 text-yellow-400">
                    {'★★★★☆'}
                  </div>
                  <span className="font-semibold">{ec.progress}%</span>
                </div>
                
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
                  <div className="h-full rounded-full progress-gradient" style={{ width: `${ec.progress}%` }} />
                </div>
                
                <Button className="w-full rounded-full mt-auto font-semibold" onClick={() => navigate(`/courses/${ec.courseId._id}`)}>
                  Continue
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default StudentProgressDashboard;
