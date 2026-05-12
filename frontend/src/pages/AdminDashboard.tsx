import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Trash2, PlusCircle, ShieldAlert, BookOpen, UploadCloud, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
  category: string;
  instructor: string;
  thumbnail: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  
  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInst, setNewInst] = useState<{name: string, email: string, password: string, assignedCourses: string[]}>({ name: "", email: "", password: "", assignedCourses: [] });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{_id:string, name:string}[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCourse, setNewCourse] = useState({
    title: "", description: "", category: "", instructor: "", duration: "10 hours", lessons: 10, level: "Beginner"
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }
      
      const [usersRes, coursesRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/courses"),
        fetch("http://localhost:5000/api/categories")
      ]);
      
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      
      setUsers(await usersRes.json());
      setCourses(await coursesRes.json());
      setCategories(await categoriesRes.json());
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // --- USER API ---
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user completely?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      toast({ title: "Success", description: "User deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingUser)
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast({ title: "Success", description: "User updated successfully" });
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newInst)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create instructor");
      
      toast({ title: "Success", description: "Instructor created successfully" });
      setNewInst({ name: "", email: "", password: "", assignedCourses: [] });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // --- COURSE API ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create category");
      toast({ title: "Success", description: "Category created successfully" });
      setNewCatName("");
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete category");
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let thumbnailUrl = "";

      // 1. Upload Image if exists
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadRes = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData
        });
        if (!uploadRes.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadRes.json();
        thumbnailUrl = uploadData.image; 
      }

      // 2. Create Course
      const coursePayload = { ...newCourse, thumbnail: thumbnailUrl };
      const courseRes = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(coursePayload)
      });
      if (!courseRes.ok) throw new Error("Failed to create course");
      
      toast({ title: "Success", description: "Course created successfully" });
      setNewCourse({ title: "", description: "", category: "", instructor: "", duration: "10 hours", lessons: 10, level: "Beginner" });
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete course");
      toast({ title: "Success", description: "Course deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const token = localStorage.getItem("token");
      let thumbnailUrl = editingCourse.thumbnail;

      // Upload new Image if exists
      if (editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);
        const uploadRes = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData
        });
        if (!uploadRes.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadRes.json();
        thumbnailUrl = uploadData.image; 
      }

      const updatedPayload = { ...editingCourse, thumbnail: thumbnailUrl };

      const res = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedPayload)
      });
      if (!res.ok) throw new Error("Failed to update course");
      toast({ title: "Success", description: "Course updated successfully" });
      setEditingCourse(null);
      setEditImageFile(null);
      setEditImagePreview("");
      if (editFileInputRef.current) editFileInputRef.current.value = "";
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <ShieldAlert className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <Button 
          variant={activeTab === "users" ? "default" : "outline"} 
          onClick={() => setActiveTab("users")}
          className="flex gap-2"
        >
          <Users className="h-4 w-4" /> Manage Users
        </Button>
        <Button 
          variant={activeTab === "courses" ? "default" : "outline"} 
          onClick={() => setActiveTab("courses")}
          className="flex gap-2"
        >
          <BookOpen className="h-4 w-4" /> Manage Courses
        </Button>
      </div>

      {activeTab === "users" && (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" /> All Users & Instructors
            </h2>
            <div className="rounded-2xl border glass-panel text-card-foreground shadow-card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === 'instructor' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'admin' && (
                          <>
                            <Button variant="ghost" size="sm" className="mr-2 text-primary hover:bg-primary/10" onClick={() => setEditingUser(u)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(u._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border glass-panel shadow-card p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Add Instructor
              </h2>
              <form onSubmit={handleCreateInstructor} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input required value={newInst.name} onChange={e => setNewInst({...newInst, name: e.target.value})} placeholder="Instructor Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input required type="email" value={newInst.email} onChange={e => setNewInst({...newInst, email: e.target.value})} placeholder="instructor@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input required type="password" value={newInst.password} onChange={e => setNewInst({...newInst, password: e.target.value})} placeholder="Secure password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Courses</label>
                  <select 
                    multiple 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newInst.assignedCourses}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions);
                      setNewInst({...newInst, assignedCourses: options.map(o => o.value)});
                    }}
                  >
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                  <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
                </div>
                <Button type="submit" className="w-full mt-2">Create</Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Active Courses
            </h2>
            <div className="rounded-2xl border glass-panel text-card-foreground shadow-card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Course Title</th>
                    <th className="px-4 py-3 font-medium">Instructor</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map(c => (
                    <tr key={c._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          {c.thumbnail && <img src={`http://localhost:5000${c.thumbnail}`} alt="" className="w-10 h-10 rounded object-cover" />}
                          {!c.thumbnail && <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center"><BookOpen className="h-4 w-4 text-muted-foreground"/></div>}
                          <span>{c.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.instructor}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="mr-2 text-primary hover:bg-primary/10" onClick={() => {
                          setEditingCourse(c);
                          setEditImagePreview(`http://localhost:5000${c.thumbnail}`);
                          setEditImageFile(null);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCourse(c._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No courses found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border glass-panel shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Add New Category
              </h2>
              <div className="space-y-4 mb-6">
                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <Input required value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New Category Name" className="h-9" />
                  <Button type="submit" size="sm" className="h-9">Add</Button>
                </form>
                
                {categories.length > 0 && (
                  <div className="mt-4 border rounded-md p-3 bg-muted/30 max-h-48 overflow-y-auto">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Existing Categories</h3>
                    <ul className="space-y-1">
                      {categories.map(c => (
                        <li key={c._id} className="flex items-center justify-between text-sm py-1 border-b last:border-0 border-border/50">
                          {c.name}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDeleteCategory(c._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <hr className="my-6 border-border" />

              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Create Course
              </h2>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input required value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} placeholder="e.g. Intro to Python" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input required value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} placeholder="Course overview" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select required value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Level</label>
                    <select required value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Advance">Advance</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructor (Name)</label>
                  <Input required value={newCourse.instructor} onChange={e => setNewCourse({...newCourse, instructor: e.target.value})} placeholder="e.g. Sarah Chen" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thumbnail Image</label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="w-4 h-4 mr-2" /> Upload
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="h-8 w-8 rounded object-cover" />}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading}>Publish Course</Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 border border-border shadow-card">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <Input required value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} placeholder="Name" />
              <Input required type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} placeholder="Email" />
              <select className="w-full rounded-md border p-2" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
              <div className="flex gap-3 justify-end mt-4">
                <Button variant="ghost" type="button" onClick={() => setEditingUser(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 border border-border shadow-card">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <Input required value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} placeholder="Title" />
              <Input required value={editingCourse.category} onChange={e => setEditingCourse({...editingCourse, category: e.target.value})} placeholder="Category" />
              <Input required value={editingCourse.instructor} onChange={e => setEditingCourse({...editingCourse, instructor: e.target.value})} placeholder="Instructor Name" />
              <div className="space-y-2">
                <label className="text-sm font-medium">New Thumbnail (Optional)</label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => editFileInputRef.current?.click()}>
                    <UploadCloud className="w-4 h-4 mr-2" /> Upload
                  </Button>
                  <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={handleEditImageChange} />
                  {editImagePreview && <img src={editImagePreview} alt="Preview" className="h-8 w-8 rounded object-cover" />}
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button variant="ghost" type="button" onClick={() => {
                  setEditingCourse(null);
                  setEditImageFile(null);
                  setEditImagePreview("");
                }}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
