import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isInstructorLogin, setIsInstructorLogin] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      if (!isLogin) {
        // Just created an account
        toast({ title: "Account Created", description: "Please log in with your new credentials." });
        setIsLogin(true);
        setFormData({ ...formData, password: "" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (data.user.role === 'admin') {
        navigate("/admin");
      } else if (data.user.role === 'instructor') {
        navigate("/instructor");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="bg-primary/5 p-8 text-center">
          <h1 className="font-display text-2xl font-bold">
            {isLogin ? (isInstructorLogin ? "Instructor Login" : "Welcome Back!") : "Create an Account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin 
              ? (isInstructorLogin ? "Sign in to access your instructor dashboard and manage students." : "Sign in to access your dashboard and courses.") 
              : "Join thousands of learners entirely for free."}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                required
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full bg-cta-gradient font-bold" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? (isInstructorLogin ? "Sign In as Instructor" : "Sign In") : "Sign Up"}
              </Button>
              
              {isLogin && !isInstructorLogin && (
                <Button type="button" variant="outline" className="w-full border-primary/20 hover:bg-primary/5" onClick={() => setIsInstructorLogin(true)}>
                  Login as Instructor
                </Button>
              )}
              {isLogin && isInstructorLogin && (
                <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setIsInstructorLogin(false)}>
                  Back to Student Login
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-medium text-primary hover:underline hover:text-accent"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Auth;
