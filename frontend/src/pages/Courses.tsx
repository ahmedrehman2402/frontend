import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import CourseCard from "@/components/CourseCard";
import { type Course } from "@/data/courses";
import { useCourses } from "@/hooks/useApi";
import { Search } from "lucide-react";

const Courses = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: courses = [], isLoading: loadingCourses } = useCourses();
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => {
        const fetchCats = data.map((c: any) => c.name);
        setCategories(["All", ...fetchCats]);
      })
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, []);

  const isLoading = loadingCourses || loadingCats;

  const filteredCourses = courses.filter((course: Course) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (course.title?.toLowerCase() || '').includes(searchLower) ||
      (course.description?.toLowerCase() || '').includes(searchLower) ||
      (Array.isArray(course.tags) ? course.tags : []).some((t) => (t?.toLowerCase() || '').includes(searchLower));
    const matchesCategory = activeCategory === "All" || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="bg-background py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="mb-3 font-display text-3xl font-bold md:text-4xl">
            Explore Free Courses
          </h1>
          <p className="text-muted-foreground">
            Browse our catalog of free courses taught by industry experts.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses, topics, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <p className="mb-6 text-sm text-muted-foreground">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
        </p>
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">Loading courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course: Course, index: number) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No courses found. Try a different search or category.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Courses;
