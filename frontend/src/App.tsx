import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Instructors from "./pages/Instructors";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import Auth from "./pages/Auth";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";
import StudentProgressDashboard from "./pages/StudentProgressDashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/instructors" element={<Instructors />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/progress" element={<StudentProgressDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/categories/web-development" element={<PlaceholderPage title="Web Development" />} />
              <Route path="/categories/ai-machine-learning" element={<PlaceholderPage title="AI & Machine Learning" />} />
              <Route path="/categories/digital-marketing" element={<PlaceholderPage title="Digital Marketing" />} />
              <Route path="/categories/data-science" element={<PlaceholderPage title="Data Science" />} />
              <Route path="/about-us" element={<PlaceholderPage title="About Us" />} />
              <Route path="/careers" element={<PlaceholderPage title="Careers" />} />
              <Route path="/privacy-policy" element={<PlaceholderPage title="Privacy Policy" />} />
              <Route path="/terms-of-service" element={<PlaceholderPage title="Terms of Service" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <LiveChat />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
