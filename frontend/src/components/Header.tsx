import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "Instructors", path: "/instructors" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    if (userStr && userStr !== "undefined") {
      user = JSON.parse(userStr);
    }
  } catch(e) {}

  const dashboardLabel = user?.role === 'admin' ? "Admin Console" : user?.role === 'instructor' ? "Instructor Dashboard" : "Dashboard";
  const dashboardPath = user?.role === 'admin' ? "/admin" : user?.role === 'instructor' ? "/instructor" : "/dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="LearnHub Logo" className="h-10 w-auto" />
          <span className="font-display text-2xl font-bold text-foreground tracking-tight">
            LearnHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              to={dashboardPath}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === dashboardPath
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {dashboardLabel}
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth?mode=login">Log In</Link>
              </Button>
              <Button asChild size="sm" className="bg-cta-gradient font-semibold text-cta-foreground hover:opacity-90">
                <Link to="/auth?mode=register">Join Free</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={dashboardPath} className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/progress" className="cursor-pointer">Progress Charts</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-foreground md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <Link
                  to={dashboardPath}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === dashboardPath
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {dashboardLabel}
                </Link>
              )}
              <div className="mt-3 flex gap-3">
                {!user ? (
                  <>
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 bg-cta-gradient font-semibold text-cta-foreground">
                      <Link to="/auth?mode=register" onClick={() => setIsOpen(false)}>Join Free</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link to="/progress" onClick={() => setIsOpen(false)}>Charts</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-destructive" onClick={() => { handleLogout(); setIsOpen(false); }}>
                      Log Out
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
