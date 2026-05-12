import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <img src="/logo.png" alt="LearnHub Logo" className="h-10 w-auto" />
              <span className="font-display text-2xl font-bold tracking-tight">LearnHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering learners worldwide with free, interactive education.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-display font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary">Browse Courses</Link></li>
              <li><Link to="/instructors" className="hover:text-primary">Our Instructors</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-display font-semibold">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/categories/web-development" className="hover:text-primary cursor-pointer">Web Development</Link></li>
              <li><Link to="/categories/ai-machine-learning" className="hover:text-primary cursor-pointer">AI & Machine Learning</Link></li>
              <li><Link to="/categories/digital-marketing" className="hover:text-primary cursor-pointer">Digital Marketing</Link></li>
              <li><Link to="/categories/data-science" className="hover:text-primary cursor-pointer">Data Science</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-display font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about-us" className="hover:text-primary cursor-pointer">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary cursor-pointer">Careers</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary cursor-pointer">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary cursor-pointer">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © 2026 LearnHub. All rights reserved. Built with ❤️ for learners everywhere.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
