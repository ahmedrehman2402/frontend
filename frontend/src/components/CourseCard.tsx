import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { Course } from "@/data/courses";

interface CourseCardProps {
  course: Course;
  index?: number;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-cta/10 text-cta",
  Advanced: "bg-destructive/10 text-destructive",
};

const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/courses/${course.id}`} className="group block">
        <div className="overflow-hidden rounded-2xl border border-border glass-panel shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
          <div className="relative aspect-video bg-hero-gradient flex items-center justify-center overflow-hidden">
            {course.thumbnail ? (
              <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                <BookOpen className="h-12 w-12 text-primary-foreground/60 z-10" />
              </>
            )}
            <Badge className={`absolute top-3 right-3 ${levelColors[course.level]}`}>
              {course.level}
            </Badge>
          </div>
          <div className="p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
              {course.category}
            </p>
            <h3 className="mb-2 font-display text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {course.description}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course.lessons} lessons
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-cta text-cta" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {(course.students / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
