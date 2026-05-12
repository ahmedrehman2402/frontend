import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, UserCheck, Activity, CalendarDays, History, X, UserX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EnrolledStudent {
  studentId: string;
  name: string;
  email: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  lastAccessed?: string;
}

interface AttendanceRecord {
  _id: string;
  student: { _id: string; name: string; email: string };
  course: string;
  date: string;
  status: string;
}

const InstructorDashboard = () => {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [attendances, setAttendances] = useState<Record<string, AttendanceRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<{ name: string, studentId: string, courseId: string, courseTitle: string } | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }
      const res = await fetch("https://backend-production-b478c.up.railway.app/api/instructors/students", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch students");
      }
      const data = await res.json();
      setStudents(data);

      // Fetch attendance for each unique course
      const uniqueCourses = Array.from(new Set(data.map((s: any) => s.courseId)));
      const atts: Record<string, AttendanceRecord[]> = {};
      for (const cid of uniqueCourses) {
        const attRes = await fetch(`https://backend-production-b478c.up.railway.app/api/courses/${cid}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (attRes.ok) {
          atts[cid as string] = await attRes.json();
        }
      }
      setAttendances(atts);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [navigate]);

  const updateProgress = async (studentId: string, courseId: string, currentProgress: number) => {
    try {
      const token = localStorage.getItem("token");
      const newProgress = Math.min(100, currentProgress + 10);
      const res = await fetch(`https://backend-production-b478c.up.railway.app/api/instructors/students/${studentId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, progress: newProgress })
      });
      if (!res.ok) throw new Error("Failed to update progress");
      toast({ title: "Success", description: "Progress updated successfully" });
      fetchStudents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const removeStudent = async (studentId: string, courseId: string) => {
    if (!confirm("Are you sure you want to remove this student from your course?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://backend-production-b478c.up.railway.app/api/instructors/students/${studentId}/course/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to remove student");
      toast({ title: "Success", description: "Student removed from course" });
      fetchStudents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const isStudentActive = (lastAccessed?: string) => {
    if (!lastAccessed) return false;
    const lastTime = new Date(lastAccessed).getTime();
    const now = Date.now();
    return (now - lastTime) < 30 * 60 * 1000; // Active within last 30 minutes
  };

  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    Object.values(attendances).forEach(records => {
      records.forEach(record => {
        if (record.date === selectedDate) {
          if (record.status === 'Present') present++;
          if (record.status === 'Absent') absent++;
        }
      });
    });
    return { present, absent };
  }, [attendances, selectedDate]);

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <main className="container mx-auto px-4 py-12 relative">
      <div className="mb-8 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Filter Attendance:</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto h-9"
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-4 mb-12">
        <div className="rounded-2xl border glass-panel p-6 shadow-card flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Students Present</p>
            <h3 className="text-2xl font-bold">{attendanceStats.present}</h3>
          </div>
        </div>
        <div className="rounded-2xl border glass-panel p-6 shadow-card flex items-center gap-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <UserX className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Students Absent</p>
            <h3 className="text-2xl font-bold">{attendanceStats.absent}</h3>
          </div>
        </div>
        <div className="rounded-2xl border glass-panel p-6 shadow-card flex items-center gap-4">
          <div className="rounded-full bg-secondary p-3">
            <BookOpen className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Unique Courses</p>
            <h3 className="text-2xl font-bold">{new Set(students.map(s => s.courseId)).size}</h3>
          </div>
        </div>
        <div className="rounded-2xl border glass-panel p-6 shadow-card flex items-center gap-4">
          <div className="rounded-full bg-accent/10 p-3">
            <Activity className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Currently Active</p>
            <h3 className="text-2xl font-bold">{students.filter(s => isStudentActive(s.lastAccessed)).length}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" /> Enrolled Students Scope
        </h2>
        <div className="rounded-2xl border glass-panel text-card-foreground shadow-card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Student Name</th>
                <th className="px-4 py-3 font-medium">Course Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s, idx) => (
                <tr key={`${s.studentId}-${s.courseId}-${idx}`} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {s.name}
                    <div className="text-xs text-muted-foreground font-normal">{s.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{s.courseTitle}</td>
                  <td className="px-4 py-3">
                    {isStudentActive(s.lastAccessed) ? (
                      <span className="inline-flex items-center rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-semibold text-success">
                        Active Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent to-primary transition-all rounded-full" style={{ width: `${s.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 mr-2 text-primary hover:bg-primary/10" onClick={() => setSelectedStudentForHistory({ name: s.name, studentId: s.studentId, courseId: s.courseId, courseTitle: s.courseTitle })}>
                      <History className="h-4 w-4 mr-1" /> History
                    </Button>
                    <Button variant="outline" size="sm" className="mr-2 h-8" onClick={() => updateProgress(s.studentId, s.courseId, s.progress)}>
                      Bump
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => removeStudent(s.studentId, s.courseId)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No students are currently enrolled in your courses.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Modal */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 border border-border shadow-card relative max-h-[80vh] flex flex-col">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setSelectedStudentForHistory(null)}>
              <X className="h-4 w-4" />
            </Button>

            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <CalendarDays className="h-5 w-5 text-primary" /> Attendance History
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedStudentForHistory.name} - {selectedStudentForHistory.courseTitle}
            </p>

            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-medium rounded-tl-md">Date</th>
                    <th className="px-4 py-2 font-medium rounded-tr-md">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(attendances[selectedStudentForHistory.courseId] || [])
                    .filter(record => record.student?._id === selectedStudentForHistory.studentId)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record, idx) => (
                      <tr key={idx} className="hover:bg-muted/50">
                        <td className="px-4 py-3">{record.date}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${record.status === 'Present' ? 'bg-success/20 text-success' : 'bg-destructive/10 text-destructive'}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {((attendances[selectedStudentForHistory.courseId] || []).filter(record => record.student?._id === selectedStudentForHistory.studentId).length === 0) && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">No attendance records found for this student.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedStudentForHistory(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default InstructorDashboard;
