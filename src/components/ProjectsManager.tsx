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
import ConfirmDialog from '../admin/ui/ConfirmDialog';
import { isValidUrlInput, safeHref } from '../lib/url';

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
  imageUrl?: string;
  createdAt: any;
}

const INITIAL_PROJECTS = [
  {
    title: "Road Accident Dashboard",
    description: "Interactive dashboard analyzing road accident statistics with rich visualizations. Visuals included: KPI cards, monthly trend line chart (CY vs PY), casualties by vehicle type, road surface pie chart, location donut chart, light condition donut chart, filter panel. Key Insights: Cars = 79.8% of casualties | Single carriageway = most dangerous road | 62.4% accidents in daylight.",
    tools: ["Excel", "Data Visualization", "Dashboard", "Road Safety"],
    githubUrl: "https://github.com/hicham-hmidani/Road-Accident-Dashboard/blob/main/Road%20Accident%20Dashboard.md",
    demoUrl: "",
    stats: "Total Casualties: 417,883 | Fatal: 7,135 (1.7%) | Serious: 59,312 (14.2%) | Slight: 351,436 (84.1%)",
    featured: true,
    platform: "Excel",
    imageUrl: "https://picsum.photos/seed/road/800/450"
  },
  {
    title: "Coffee Sales Dashboard",
    description: "Sales analytics dashboard tracking coffee product performance across countries and customers. Visuals included: Timeline slicer (2019–2020), total sales over time line chart, sales by country bar chart, top 5 customers bar chart, roast type & loyalty card filters.",
    tools: ["Excel", "Sales Analysis", "Dashboard", "Business Intelligence"],
    githubUrl: "https://github.com/hicham-hmidani/PortfolioProjects/blob/main/Coffee%20Sales%20Dashboard",
    demoUrl: "",
    stats: "Top Market: US — $5,449 | Ireland: $1,295 | UK: $562 | Top Customer: Brenn Dundredge — $248",
    featured: true,
    platform: "Excel",
    imageUrl: "https://picsum.photos/seed/coffee/800/450"
  },
  {
    title: "Covid-19 Data Analysis",
    description: "Deep analysis of global Covid-19 data using advanced SQL queries to extract meaningful insights about pandemic trends and mortality rates.",
    tools: ["SQL", "Data Analysis", "Public Health", "SSMS"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "Advanced SQL queries for global pandemic trend analysis.",
    featured: true,
    platform: "SQL",
    imageUrl: "https://picsum.photos/seed/covid/800/450"
  },
  {
    title: "Hybrid Renewable Energy Forecasting",
    description: "Forecasting solar and wind energy production using machine learning and deep learning optimization. Study and analysis of chronological data.",
    tools: ["Python", "TensorFlow", "Scikit-learn", "Time Series", "Energy"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "92% forecasting accuracy achieved using hybrid ML/DL models.",
    featured: true,
    platform: "Python",
    imageUrl: "https://picsum.photos/seed/energy/800/450"
  },
  {
    title: "Traffic Sign Classification",
    description: "CNN-based deep learning model for automatic traffic sign classification and recognition with high precision.",
    tools: ["Python", "Keras", "CNN", "Computer Vision", "Deep Learning"],
    githubUrl: "https://github.com/hicham-hmidani",
    demoUrl: "",
    stats: "43 classes recognized with high precision using Computer Vision.",
    featured: true,
    platform: "Python",
    imageUrl: "https://picsum.photos/seed/traffic/800/450"
  }
];

export default function ProjectsManager() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmSeedOpen, setConfirmSeedOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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
    platform: PLATFORMS[0],
    imageUrl: ''
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
      const projectsData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Project[];
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const confirmSeedData = async () => {
    setConfirmSeedOpen(false);
    const loadingToast = toast.loading("Seeding data...");
    try {
      const batch = writeBatch(db);
      INITIAL_PROJECTS.forEach(p => {
        const docRef = doc(collection(db, "projects"));
        batch.set(docRef, { ...p, createdAt: serverTimestamp() });
      });
      await batch.commit();
      toast.success("5 default projects added!", { id: loadingToast });
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
      platform: PLATFORMS[0],
      imageUrl: ''
    });
    setView('editor');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      tools: Array.isArray(project.tools) ? project.tools : [],
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      stats: project.stats || '',
      featured: Boolean(project.featured),
      platform: project.platform || PLATFORMS[0],
      imageUrl: project.imageUrl || ''
    });
    setView('editor');
  };

  const confirmDeleteProject = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    const loadingToast = toast.loading("Deleting...");
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects(prev => prev.filter(p => p.id !== id));
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
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, featured: !p.featured } : p));
      toast.success(project.featured ? "Removed from featured" : "Added to featured", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to update", { id: loadingToast });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!isValidUrlInput(formData.imageUrl, { allowEmpty: true })) {
      toast.error("Image URL must start with https://");
      return;
    }
    if (!isValidUrlInput(formData.githubUrl, { allowEmpty: true })) {
      toast.error("GitHub URL must start with https://");
      return;
    }
    if (!isValidUrlInput(formData.demoUrl, { allowEmpty: true })) {
      toast.error("Demo URL must start with https://");
      return;
    }

    const loadingToast = toast.loading("Saving project...");
    try {
      const projectData = {
        ...formData,
        title: formData.title.trim(),
        githubUrl: formData.githubUrl.trim(),
        demoUrl: formData.demoUrl.trim(),
        imageUrl: formData.imageUrl.trim(),
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
      
      await fetchProjects();
      setView('list');
    } catch (err) {
      toast.error("Failed to save", { id: loadingToast });
    }
  };

  const addTool = () => {
    const trimmed = newTool.trim();
    if (trimmed && !formData.tools.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tools: [...prev.tools, trimmed] }));
      setNewTool('');
    }
  };

  const removeTool = (tool: string) => {
    setFormData(prev => ({ ...prev, tools: prev.tools.filter(t => t !== tool) }));
  };

  const filteredProjects = projects.filter(p => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.platform || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      
      <header className="bg-[#111827] border-b border-slate-800 px-4 sm:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold">Projects Manager</h1>
          </div>
          {view === 'list' && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {projects.length === 0 && (
                <button 
                  type="button"
                  onClick={() => setConfirmSeedOpen(true)}
                  className="px-3 sm:px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all text-xs sm:text-sm"
                >
                  Seed Default Projects
                </button>
              )}
              <button 
                type="button"
                onClick={handleNewProject}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-teal-500/20"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add New Project
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8">
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
              {filteredProjects.map((project) => {
                const imgHref = safeHref(project.imageUrl);
                const githubHref = safeHref(project.githubUrl);
                const demoHref = safeHref(project.demoUrl);
                const tools = Array.isArray(project.tools) ? project.tools : [];

                return (
                  <div key={project.id} className="bg-[#111827]/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-teal-500/50 transition-all">
                    {/* Thumbnail Area */}
                    <div className="h-40 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                      {imgHref ? (
                        <img
                          src={imgHref}
                          alt={project.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 opacity-50"></div>
                          {project.platform === 'Excel' && <BarChart3 className="w-12 h-12 text-green-500/30" />}
                          {project.platform === 'Python' && <Code2 className="w-12 h-12 text-blue-500/30" />}
                          {project.platform === 'SQL' && <Database className="w-12 h-12 text-teal-500/30" />}
                          {(!['Excel', 'Python', 'SQL'].includes(project.platform)) && <Layers className="w-12 h-12 text-slate-500/30" />}
                        </>
                      )}
                      
                      {project.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-[10px] font-bold border border-yellow-500/30 flex items-center gap-1 backdrop-blur-sm">
                          <Star className="w-3 h-3 fill-current" />
                          FEATURED
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 border border-slate-800">
                        {project.platform}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-teal-400 transition-colors">{project.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {tools.slice(0, 3).map(tool => (
                          <span key={tool} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                            {tool}
                          </span>
                        ))}
                        {tools.length > 3 && <span className="text-[10px] text-slate-600">+{tools.length - 3} more</span>}
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => handleEdit(project)}
                            className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleToggleFeatured(project)}
                            className={`p-2 rounded-lg transition-all ${project.featured ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
                            title="Toggle Featured"
                          >
                            <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeleteTargetId(project.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {githubHref && (
                            <a href={githubHref} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {demoHref && (
                            <a href={demoHref} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-teal-400 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Editor View */
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button 
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-lg shadow-teal-500/20"
              >
                <Save className="w-5 h-5" />
                {editingProject ? 'Update Project' : 'Add Project'}
              </button>
            </div>

            <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 sm:space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Project Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g. Road Accident Dashboard"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({...prev, imageUrl: e.target.value}))}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform / Main Tool</label>
                    <select 
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({...prev, platform: e.target.value}))}
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
                      onChange={(e) => setFormData(prev => ({...prev, stats: e.target.value}))}
                      placeholder="e.g. 417,883 casualties analyzed"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
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
                        <button type="button" onClick={() => removeTool(tool)} className="hover:text-white transition-colors">
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
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                      placeholder="Add a tool (e.g. Pandas)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500 transition-all"
                    />
                    <button 
                      type="button"
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
                        type="url" 
                        value={formData.githubUrl}
                        onChange={(e) => setFormData(prev => ({...prev, githubUrl: e.target.value}))}
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
                        type="url" 
                        value={formData.demoUrl}
                        onChange={(e) => setFormData(prev => ({...prev, demoUrl: e.target.value}))}
                        placeholder="https://..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.featured}
                      aria-label="Feature on Homepage"
                      onClick={() => setFormData(prev => ({...prev, featured: !prev.featured}))}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.featured ? 'bg-teal-600' : 'bg-slate-800'}`}
                    >
                      <span className={`block absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.featured ? 'left-7' : 'left-1'}`} />
                    </button>
                    <span className="text-sm font-bold text-slate-300">Feature on Homepage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmSeedOpen}
        title="Seed Default Projects"
        message="This will add the 5 default portfolio projects to Firestore. Continue?"
        confirmLabel="Seed Projects"
        onConfirm={confirmSeedData}
        onCancel={() => setConfirmSeedOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Project"
        message="Are you sure you want to delete this project? This cannot be undone."
        confirmLabel="Delete Project"
        destructive
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
