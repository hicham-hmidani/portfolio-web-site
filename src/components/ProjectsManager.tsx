import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  Github, 
  ExternalLink, 
  ArrowLeft, 
  Save, 
  X,
  Layout,
  BarChart3,
  Code2,
  Database,
  Layers
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

const PLATFORMS = ["Excel", "Python", "SQL", "Power BI", "Tableau"];

interface Project {
  id: string;
  title: string;
  description: string;
  tools: string[];
  githubUrl: string;
  demoUrl: string;
  stats: string;
  featured: boolean;
  platform: string;
  createdAt: any;
}

const INITIAL_PROJECTS = [
  {
    title: "Road Accident Dashboard",
    description: "Comprehensive analysis of road accident data to identify trends and safety improvements.",
    tools: ["Excel", "Data Cleaning", "Pivot Tables"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "417,883 casualties analyzed",
    featured: true,
    platform: "Excel"
  },
  {
    title: "Coffee Sales Dashboard",
    description: "Interactive sales performance tracking for a coffee retail business.",
    tools: ["Excel", "VLOOKUP", "Charts"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "15% revenue growth identified",
    featured: true,
    platform: "Excel"
  },
  {
    title: "Covid-19 Data Analysis",
    description: "Global pandemic trend analysis using SQL for data extraction and processing.",
    tools: ["SQL", "Data Exploration", "Joins"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "200+ countries tracked",
    featured: false,
    platform: "SQL"
  },
  {
    title: "Hybrid Renewable Energy Forecasting",
    description: "Predictive modeling for energy production from multiple renewable sources.",
    tools: ["Python", "TensorFlow", "Time Series"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "92% forecasting accuracy",
    featured: true,
    platform: "Python"
  },
  {
    title: "Traffic Sign Classification",
    description: "Deep learning model for real-time traffic sign recognition using computer vision.",
    tools: ["Python", "Keras", "CNN", "OpenCV"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "43 classes recognized",
    featured: false,
    platform: "Python"
  }
];

export default function ProjectsManager() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tools: [] as string[],
    githubUrl: '',
    demoUrl: '',
    stats: '',
    featured: false,
    platform: PLATFORMS[0]
  });
  const [newTool, setNewTool] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        fetchProjects();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    if (!window.confirm("This will add the 5 default projects. Continue?")) return;
    const loadingToast = toast.loading("Seeding data...");
    try {
      const batch = writeBatch(db);
      INITIAL_PROJECTS.forEach(p => {
        const docRef = doc(collection(db, "projects"));
        batch.set(docRef, { ...p, createdAt: serverTimestamp() });
      });
      await batch.commit();
      toast.success("Default projects added!", { id: loadingToast });
      fetchProjects();
    } catch (err) {
      toast.error("Failed to seed data", { id: loadingToast });
    }
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      tools: [],
      githubUrl: '',
      demoUrl: '',
      stats: '',
      featured: false,
      platform: PLATFORMS[0]
    });
    setView('editor');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      tools: project.tools || [],
      githubUrl: project.githubUrl,
      demoUrl: project.demoUrl,
      stats: project.stats,
      featured: project.featured,
      platform: project.platform
    });
    setView('editor');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Project deleted", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to delete", { id: loadingToast });
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    const loadingToast = toast.loading("Updating...");
    try {
      await updateDoc(doc(db, "projects", project.id), {
        featured: !project.featured
      });
      setProjects(projects.map(p => p.id === project.id ? { ...p, featured: !p.featured } : p));
      toast.success(project.featured ? "Removed from featured" : "Added to featured", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to update", { id: loadingToast });
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    const loadingToast = toast.loading("Saving project...");
    try {
      const projectData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
        toast.success("Project updated", { id: loadingToast });
      } else {
        await addDoc(collection(db, "projects"), {
          ...projectData,
          createdAt: serverTimestamp()
        });
        toast.success("New project added", { id: loadingToast });
      }
      
      fetchProjects();
      setView('list');
    } catch (err) {
      toast.error("Failed to save", { id: loadingToast });
    }
  };

  const addTool = () => {
    if (newTool && !formData.tools.includes(newTool)) {
      setFormData({ ...formData, tools: [...formData.tools, newTool] });
      setNewTool('');
    }
  };

  const removeTool = (tool: string) => {
    setFormData({ ...formData, tools: formData.tools.filter(t => t !== tool) });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && view === 'list') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <Toaster position="top-right" />
      
      <header className="bg-[#111827] border-b border-slate-800 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <h1 className="text-xl font-bold">Projects Manager</h1>
          </div>
          {view === 'list' && (
            <div className="flex gap-3">
              {projects.length === 0 && (
                <button 
                  onClick={seedData}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all text-sm"
                >
                  Seed Default Projects
                </button>
              )}
              <button 
                onClick={handleNewProject}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/20"
              >
                <Plus className="w-5 h-5" />
                Add New Project
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {view === 'list' ? (
          <div className="space-y-8">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-slate-800 rounded-2xl focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-[#111827]/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-teal-500/50 transition-all">
                  {/* Thumbnail Area */}
                  <div className="h-40 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 opacity-50"></div>
                    {project.platform === 'Excel' && <BarChart3 className="w-12 h-12 text-green-500/30" />}
                    {project.platform === 'Python' && <Code2 className="w-12 h-12 text-blue-500/30" />}
                    {project.platform === 'SQL' && <Database className="w-12 h-12 text-teal-500/30" />}
                    {(!['Excel', 'Python', 'SQL'].includes(project.platform)) && <Layers className="w-12 h-12 text-slate-500/30" />}
                    
                    {project.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-lg text-[10px] font-bold border border-yellow-500/30 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        FEATURED
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-800">
                      {project.platform}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-teal-400 transition-colors">{project.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {project.tools?.slice(0, 3).map(tool => (
                        <span key={tool} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                          {tool}
                        </span>
                      ))}
                      {project.tools?.length > 3 && <span className="text-[10px] text-slate-600">+{project.tools.length - 3} more</span>}
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(project)}
                          className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleFeatured(project)}
                          className={`p-2 rounded-lg transition-all ${project.featured ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" className="p-2 text-slate-500 hover:text-teal-400 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Editor View */
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-lg shadow-teal-500/20"
              >
                <Save className="w-5 h-5" />
                {editingProject ? 'Update Project' : 'Add Project'}
              </button>
            </div>

            <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Project Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Road Accident Dashboard"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform / Main Tool</label>
                    <select 
                      value={formData.platform}
                      onChange={(e) => setFormData({...formData, platform: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    >
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Key Stat</label>
                    <input 
                      type="text" 
                      value={formData.stats}
                      onChange={(e) => setFormData({...formData, stats: e.target.value})}
                      placeholder="e.g. 417,883 casualties analyzed"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    placeholder="Describe the project goals and your impact..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tools & Technologies</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tools.map(tool => (
                      <span key={tool} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-500 border border-teal-500/20 text-xs font-medium">
                        {tool}
                        <button onClick={() => removeTool(tool)} className="hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTool}
                      onChange={(e) => setNewTool(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                      placeholder="Add a tool (e.g. Pandas)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500 transition-all"
                    />
                    <button 
                      onClick={addTool}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GitHub URL</label>
                    <div className="relative">
                      <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                        placeholder="https://github.com/..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Demo URL (Optional)</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={formData.demoUrl}
                        onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                        placeholder="https://..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => setFormData({...formData, featured: !formData.featured})}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.featured ? 'bg-teal-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.featured ? 'left-7' : 'left-1'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Feature on Homepage</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
