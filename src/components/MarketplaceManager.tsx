import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  ExternalLink, 
  ArrowLeft, 
  Save, 
  X,
  ShoppingBag,
  Briefcase,
  Eye,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Zap,
  Bot
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot,
  query, 
  where,
  orderBy, 
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

const AI_MODELS = ["Leonardo.AI", "DALL-E", "GPT", "Midjourney"];

interface Prompt {
  id: string;
  title: string;
  model: string;
  price: number;
  views: number;
  sales: number;
  url: string;
  featured: boolean;
  platform: 'PromptBase';
}

interface UpworkConfig {
  title: string;
  price: string;
  deliveryTime: string;
  description: string;
  hourlyRate: number;
  featuredProjects: string[]; // IDs of projects
}

const INITIAL_PROMPTS = [
  {
    title: "Professional Movie Posters",
    model: "Leonardo.AI",
    views: 265,
    sales: 13,
    price: 4.99,
    url: "https://promptbase.com/profile/camih8",
    featured: true,
    platform: 'PromptBase'
  },
  {
    title: "Dalle Customizable Coloring",
    model: "DALL-E",
    views: 144,
    sales: 7,
    price: 4.99,
    url: "https://promptbase.com/profile/camih8",
    featured: true,
    platform: 'PromptBase'
  },
  {
    title: "Coloring Book Covers",
    model: "DALL-E",
    views: 97,
    sales: 4,
    price: 4.99,
    url: "https://promptbase.com/profile/camih8",
    featured: true,
    platform: 'PromptBase'
  },
  {
    title: "Notebook Planner Cover Generator",
    model: "DALL-E",
    views: 99,
    sales: 3,
    price: 4.99,
    url: "https://promptbase.com/profile/camih8",
    featured: false,
    platform: 'PromptBase'
  },
  {
    title: "Minimalist Ramadan Planner",
    model: "Leonardo.AI",
    views: 92,
    sales: 1,
    price: 4.99,
    url: "https://promptbase.com/profile/camih8",
    featured: false,
    platform: 'PromptBase'
  }
];

export default function MarketplaceManager() {
  const [activeTab, setActiveTab] = useState<'promptbase' | 'upwork'>('promptbase');
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [upworkConfig, setUpworkConfig] = useState<UpworkConfig>({
    title: 'Data Visualization & Dashboard Specialist',
    price: 'Starting from $50',
    deliveryTime: '3-5 Days',
    description: 'Expert Excel & SQL dashboard creation for business insights.',
    hourlyRate: 10,
    featuredProjects: []
  });
  const [projects, setProjects] = useState<any[]>([]);
  
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [promptForm, setPromptForm] = useState({
    title: '',
    model: AI_MODELS[0],
    price: 4.99,
    views: 0,
    sales: 0,
    url: '',
    featured: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/admin/login');
    });

    // Fetch Prompts
    const qPrompts = query(collection(db, "marketplace_items"), where("platform", "==", "PromptBase"));
    const unsubscribePrompts = onSnapshot(qPrompts, (snapshot) => {
      const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Prompt[];
      setPrompts(pData);
      setLoading(false);
    });

    // Fetch Upwork Config
    const fetchUpwork = async () => {
      const docRef = doc(db, "marketplace_items", "upwork_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUpworkConfig(docSnap.data() as UpworkConfig);
      }
    };
    fetchUpwork();

    // Fetch Projects for Upwork Tab
    const fetchProjects = async () => {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchProjects();

    return () => {
      unsubscribeAuth();
      unsubscribePrompts();
    };
  }, [navigate]);

  const handleSavePrompt = async () => {
    if (!promptForm.title || !promptForm.url) {
      toast.error("Title and URL are required");
      return;
    }

    const loadingToast = toast.loading("Saving prompt...");
    try {
      const data = { ...promptForm, platform: 'PromptBase', updatedAt: serverTimestamp() };
      if (editingPromptId) {
        await updateDoc(doc(db, "marketplace_items", editingPromptId), data);
        toast.success("Prompt updated", { id: loadingToast });
      } else {
        await addDoc(collection(db, "marketplace_items"), { ...data, createdAt: serverTimestamp() });
        toast.success("Prompt added", { id: loadingToast });
      }
      setIsAddingPrompt(false);
      setEditingPromptId(null);
      setPromptForm({ title: '', model: AI_MODELS[0], price: 4.99, views: 0, sales: 0, url: '', featured: false });
    } catch (err) {
      toast.error("Failed to save prompt", { id: loadingToast });
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPromptId(prompt.id);
    setPromptForm({
      title: prompt.title,
      model: prompt.model,
      price: prompt.price,
      views: prompt.views,
      sales: prompt.sales,
      url: prompt.url,
      featured: prompt.featured
    });
    setIsAddingPrompt(true);
  };

  const handleDeletePrompt = async (id: string) => {
    if (!window.confirm("Delete this prompt?")) return;
    try {
      await deleteDoc(doc(db, "marketplace_items", id));
      toast.success("Prompt deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleToggleFeatured = async (prompt: Prompt) => {
    try {
      await updateDoc(doc(db, "marketplace_items", prompt.id), { featured: !prompt.featured });
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleSaveUpwork = async () => {
    const loadingToast = toast.loading("Saving Upwork settings...");
    try {
      await setDoc(doc(db, "marketplace_items", "upwork_config"), {
        ...upworkConfig,
        platform: 'Upwork',
        updatedAt: serverTimestamp()
      });
      toast.success("Upwork settings saved", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to save", { id: loadingToast });
    }
  };

  const seedPrompts = async () => {
    if (!window.confirm("Seed default prompts?")) return;
    const loadingToast = toast.loading("Seeding...");
    try {
      for (const p of INITIAL_PROMPTS) {
        await addDoc(collection(db, "marketplace_items"), { ...p, createdAt: serverTimestamp() });
      }
      toast.success("Prompts seeded", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to seed", { id: loadingToast });
    }
  };

  const toggleProjectFeature = (projectId: string) => {
    const current = upworkConfig.featuredProjects || [];
    const updated = current.includes(projectId) 
      ? current.filter(id => id !== projectId)
      : [...current, projectId];
    setUpworkConfig({ ...upworkConfig, featuredProjects: updated });
  };

  if (loading) {
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
            <h1 className="text-xl font-bold">Marketplace Manager</h1>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('promptbase')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'promptbase' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              PromptBase
            </button>
            <button 
              onClick={() => setActiveTab('upwork')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'upwork' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Briefcase className="w-4 h-4" />
              Upwork
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {activeTab === 'promptbase' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-500" />
                PromptBase Marketplace
              </h2>
              <div className="flex gap-3">
                {prompts.length === 0 && (
                  <button onClick={seedPrompts} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all text-sm">
                    Seed Default Prompts
                  </button>
                )}
                <button 
                  onClick={() => { setIsAddingPrompt(true); setEditingPromptId(null); }}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Add New Prompt
                </button>
              </div>
            </div>

            {isAddingPrompt && (
              <div className="bg-[#111827] border border-teal-500/30 rounded-3xl p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{editingPromptId ? 'Edit Prompt' : 'Add New Prompt'}</h3>
                  <button onClick={() => setIsAddingPrompt(false)} className="p-2 hover:bg-slate-800 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                    <input 
                      type="text" 
                      value={promptForm.title}
                      onChange={(e) => setPromptForm({...promptForm, title: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Model</label>
                    <select 
                      value={promptForm.model}
                      onChange={(e) => setPromptForm({...promptForm, model: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    >
                      {AI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={promptForm.price}
                      onChange={(e) => setPromptForm({...promptForm, price: parseFloat(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Views</label>
                    <input 
                      type="number" 
                      value={promptForm.views}
                      onChange={(e) => setPromptForm({...promptForm, views: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sales</label>
                    <input 
                      type="number" 
                      value={promptForm.sales}
                      onChange={(e) => setPromptForm({...promptForm, sales: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">PromptBase URL</label>
                    <input 
                      type="text" 
                      value={promptForm.url}
                      onChange={(e) => setPromptForm({...promptForm, url: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div 
                      onClick={() => setPromptForm({...promptForm, featured: !promptForm.featured})}
                      className={`w-12 h-6 rounded-full transition-all relative ${promptForm.featured ? 'bg-teal-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${promptForm.featured ? 'left-7' : 'left-1'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-300">Feature on Homepage</span>
                  </label>
                  <button 
                    onClick={handleSavePrompt}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    {editingPromptId ? 'Update Prompt' : 'Add Prompt'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-6 space-y-4 group hover:border-teal-500/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPrompt(prompt)} className="p-2 text-slate-500 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePrompt(prompt.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-teal-400 transition-colors">{prompt.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-slate-700 uppercase font-bold tracking-wider">
                        {prompt.model}
                      </span>
                      <span className="text-xs text-teal-500 font-bold">${prompt.price}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Views</p>
                        <p className="text-sm font-bold">{prompt.views}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-500" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Sales</p>
                        <p className="text-sm font-bold">{prompt.sales}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={() => handleToggleFeatured(prompt)}
                      className={`flex items-center gap-2 text-xs font-bold transition-all ${prompt.featured ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Star className={`w-4 h-4 ${prompt.featured ? 'fill-current' : ''}`} />
                      {prompt.featured ? 'Featured' : 'Mark Featured'}
                    </button>
                    <a href={prompt.url} target="_blank" className="text-slate-500 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Upwork Tab */
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-blue-500" />
                Upwork Service Manager
              </h2>
              <button 
                onClick={handleSaveUpwork}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20"
              >
                <Save className="w-5 h-5" />
                Save Upwork Settings
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Rate & Service Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                  <h3 className="text-lg font-bold border-b border-slate-800 pb-4">Service Offering</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Title</label>
                      <input 
                        type="text" 
                        value={upworkConfig.title}
                        onChange={(e) => setUpworkConfig({...upworkConfig, title: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Starting Price</label>
                        <input 
                          type="text" 
                          value={upworkConfig.price}
                          onChange={(e) => setUpworkConfig({...upworkConfig, price: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Time</label>
                        <input 
                          type="text" 
                          value={upworkConfig.deliveryTime}
                          onChange={(e) => setUpworkConfig({...upworkConfig, deliveryTime: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                      <textarea 
                        value={upworkConfig.description}
                        onChange={(e) => setUpworkConfig({...upworkConfig, description: e.target.value})}
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                  <h3 className="text-lg font-bold border-b border-slate-800 pb-4">Featured Projects on Upwork</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(project => (
                      <button 
                        key={project.id}
                        onClick={() => toggleProjectFeature(project.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${upworkConfig.featuredProjects?.includes(project.id) ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        <span className="text-sm font-bold truncate pr-4">{project.title}</span>
                        {upworkConfig.featuredProjects?.includes(project.id) && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Rate Editor */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-3xl p-8 shadow-xl shadow-teal-500/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-md">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Hourly Rate</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white">$</span>
                      <input 
                        type="number" 
                        value={upworkConfig.hourlyRate}
                        onChange={(e) => setUpworkConfig({...upworkConfig, hourlyRate: parseInt(e.target.value)})}
                        className="bg-transparent border-b-2 border-white/30 text-5xl font-black text-white w-24 focus:outline-none focus:border-white transition-all"
                      />
                      <span className="text-xl font-bold text-white/70 mb-1">/hr</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      This rate is displayed in your Hero section and Upwork service card.
                    </p>
                  </div>
                </div>

                <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Preview</h4>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-teal-400">{upworkConfig.price}</span>
                    </div>
                    <h5 className="text-sm font-bold truncate">{upworkConfig.title}</h5>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {upworkConfig.deliveryTime}</div>
                      <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${upworkConfig.hourlyRate}/hr</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
