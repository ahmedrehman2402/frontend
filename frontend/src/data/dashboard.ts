export interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  totalLessons: number;
  completedLessons: number;
}

export interface QuizScore {
  id: string;
  courseName: string;
  score: number;
  totalQuestions: number;
  date: string;
  difficulty: string;
}

export const enrolledCourses: EnrolledCourse[] = [];

export const quizScores: QuizScore[] = [];

export const weeklyProgress = [];

export const monthlyScores = [];
