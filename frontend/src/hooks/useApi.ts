import { useQuery } from "@tanstack/react-query";
import type { Course, Instructor } from "@/data/courses";

const API_URL = "http://localhost:5000/api";

export const useCourses = () => {
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/courses`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      // Map _id to id for the frontend CourseCard components
      return data.map((c: any) => ({ ...c, id: c._id }));
    },
  });
};

export const useInstructors = () => {
  return useQuery<Instructor[]>({
    queryKey: ["instructors"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/instructors`);
      if (!res.ok) throw new Error("Failed to fetch instructors");
      const data = await res.json();
      return data.map((i: any) => ({ ...i, id: i._id }));
    },
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
};
