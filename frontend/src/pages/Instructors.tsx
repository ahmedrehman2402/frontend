import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useCourses, useInstructors } from "@/hooks/useApi";
import { Star, Users, BookOpen, ExternalLink } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Instructors = () => {
  const { data: courses = [], error: coursesError } = useCourses();
  const { data: instructors = [], isLoading, error: instructorsError } = useInstructors();

  if (isLoading) {
    return (
      <main className="bg-background py-12">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-lg text-muted-foreground">Loading instructors...</p>
        </div>
      </main>
    );
  }

  if (coursesError || instructorsError) {
    return (
      <main className="bg-background py-12">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-lg text-destructive">Failed to load data from the server. Please try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <h1 className="mb-3 font-display text-3xl font-bold md:text-4xl">
            Meet Our Expert Faculty
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Learn from industry professionals who bring real-world experience to every lesson.
            Our instructors come from top companies and have trained thousands of students.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-8 md:grid-cols-2"
        >
          {instructors.map((instructor) => {
            const instructorCourses = courses.filter(
              (c) => c.instructorId === instructor.id
            );

            return (
              <motion.div
                key={instructor.id}
                variants={item}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="bg-slate-50/50 p-6 pb-8 border-b border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary">
                      {instructor.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {instructor.name}
                      </h2>
                      <p className="text-sm text-muted-foreground font-medium">{instructor.title}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                          {instructor.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {(instructor.students / 1000).toFixed(1)}k students
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                          {instructor.coursesTaught} courses
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {instructor.bio}
                  </p>
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Skills & Expertise
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {instructorCourses.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Courses
                      </p>
                      <div className="space-y-2">
                        {instructorCourses.map((course) => (
                          <a
                            key={course.id}
                            href={`/courses/${course.id}`}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                          >
                            <span className="font-medium">{course.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {(instructor.social?.twitter || instructor.social?.linkedin || instructor.social?.github) && (
                    <div className="mt-4 flex gap-3 border-t border-border pt-4">
                      {instructor.social?.linkedin && (
                        <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                          LinkedIn
                        </span>
                      )}
                      {instructor.social?.twitter && (
                        <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                          Twitter
                        </span>
                      )}
                      {instructor.social?.github && (
                        <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                          GitHub
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </main>
  );
};

export default Instructors;
