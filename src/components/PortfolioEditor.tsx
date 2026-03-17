import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  User, 
  Zap, 
  Briefcase, 
  Mail, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Layout,
  Eye,
  MapPin
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast, { Toaster } from 'react-hot-toast';

// --- Sortable Item Component ---
function SortableExperienceItem({ id, entry, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-start gap-4 group"
    >
      <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-white">{entry.title || 'Untitled Role'}</h4>
            <p className="text-sm text-slate-400">{entry.company} • {entry.date}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(entry)} className="p-2 text-slate-400 hover:text-teal-500 transition-colors">
              <Plus className="w-4 h-4 rotate-45" /> {/* Using Plus as Edit icon placeholder or just use Edit2 if imported */}
            </button>
            <button onClick={() => onDelete(id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function PortfolioEditor() {
  const [activeTab, setActiveTab] = useState<'hero' | 'skills' | 'experience' | 'contact'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // --- State for each section ---
  const [hero, setHero] = useState({
    name: 'Hicham Hmidani',
    titles: ["Junior Data Analyst/Scientist", "AI Prompt Engineer", "Database Administrator-MI"],
    bio: "A diligent and detail-oriented Junior Data Analyst/Scientist...",
    available: true,
    rate: "$10/hr"
  });

  const [skills, setSkills] = useState({
    categories: [
      { name: 'Data Analysis', items: ['Python', 'SQL', 'Power BI'] },
      { name: 'AI & ML', items: ['TensorFlow', 'Scikit-learn'] }
    ]
  });

  const [experience, setExperience] = useState({
    entries: [
      { id: '1', title: 'Data Analyst', company: 'Freelance', date: '2023 - Present', points: ['Analyzed data...', 'Built dashboards...'] }
    ]
  });

  const [contact, setContact] = useState({
    email: 'hmidanihicham8@gmail.com',
    phone: '+212 600000000',
    location: 'Ouarzazate, Morocco',
    socials: {
      linkedin: 'https://linkedin.com/in/hicham-hmidani-b55a5521b/',
      github: 'https://github.com/hicham-hmidani',
      promptbase: '',
      upwork: ''
    }
  });

  // --- Sensors for DND ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const docs = ['hero', 'skills', 'experience', 'contact'];
      for (const d of docs) {
        const docRef = doc(db, 'portfolio_content', d);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (d === 'hero') setHero(data as any);
          if (d === 'skills') setSkills(data as any);
          if (d === 'experience') setExperience(data as any);
          if (d === 'contact') setContact(data as any);
        }
      }
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      toast.error("Failed to load portfolio content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string, data: any) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'portfolio_content', section), data);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} section saved!`);
    } catch (err) {
      console.error(`Error saving ${section}:`, err);
      toast.error(`Failed to save ${section}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Experience Handlers ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExperience((prev) => {
        const oldIndex = prev.entries.findIndex((e) => e.id === active.id);
        const newIndex = prev.entries.findIndex((e) => e.id === over.id);
        return {
          ...prev,
          entries: arrayMove(prev.entries, oldIndex, newIndex),
        };
      });
    }
  };

  const addExperience = () => {
    const newEntry = {
      id: Date.now().toString(),
      title: '',
      company: '',
      date: '',
      points: ['']
    };
    setExperience({ ...experience, entries: [newEntry, ...experience.entries] });
  };

  const deleteExperience = (id: string) => {
    setExperience({ ...experience, entries: experience.entries.filter(e => e.id !== id) });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setExperience({
      ...experience,
      entries: experience.entries.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  // --- Skills Handlers ---
  const addSkillCategory = () => {
    setSkills({
      ...skills,
      categories: [...skills.categories, { name: 'New Category', items: [] }]
    });
  };

  const deleteSkillCategory = (index: number) => {
    const newCats = [...skills.categories];
    newCats.splice(index, 1);
    setSkills({ ...skills, categories: newCats });
  };

  const addSkillToCategory = (catIndex: number) => {
    const newCats = [...skills.categories];
    newCats[catIndex].items.push('New Skill');
    setSkills({ ...skills, categories: newCats });
  };

  const deleteSkillFromCategory = (catIndex: number, skillIndex: number) => {
    const newCats = [...skills.categories];
    newCats[catIndex].items.splice(skillIndex, 1);
    setSkills({ ...skills, categories: newCats });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-[#111827] border-b border-slate-800 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <h1 className="text-xl font-bold">Portfolio Editor</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-500 transition-colors">
              <Eye className="w-4 h-4" />
              View Live
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="w-64 bg-[#111827] border-r border-slate-800 p-6 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'hero' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <User className="w-5 h-5" />
            Hero Section
          </button>
          <button 
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'skills' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Zap className="w-5 h-5" />
            Skills
          </button>
          <button 
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'experience' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Briefcase className="w-5 h-5" />
            Experience
          </button>
          <button 
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'contact' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Mail className="w-5 h-5" />
            Contact Info
          </button>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0a0f1e]">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* --- Hero Tab --- */}
            {activeTab === 'hero' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Hero Section</h2>
                  <button 
                    onClick={() => handleSave('hero', hero)}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </div>

                <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={hero.name}
                      onChange={(e) => setHero({...hero, name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Animated Titles</label>
                    <div className="space-y-3">
                      {hero.titles.map((title, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text" 
                            value={title}
                            onChange={(e) => {
                              const newTitles = [...hero.titles];
                              newTitles[idx] = e.target.value;
                              setHero({...hero, titles: newTitles});
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                          />
                          <button 
                            onClick={() => {
                              const newTitles = [...hero.titles];
                              newTitles.splice(idx, 1);
                              setHero({...hero, titles: newTitles});
                            }}
                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setHero({...hero, titles: [...hero.titles, 'New Title']})}
                        className="flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 font-medium"
                      >
                        <Plus className="w-4 h-4" /> Add Title
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio / About Me</label>
                    <textarea 
                      value={hero.bio}
                      onChange={(e) => setHero({...hero, bio: e.target.value})}
                      rows={5}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Availability</label>
                      <button 
                        onClick={() => setHero({...hero, available: !hero.available})}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${hero.available ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
                      >
                        {hero.available ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {hero.available ? 'Available' : 'Not Available'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hourly Rate</label>
                      <input 
                        type="text" 
                        value={hero.rate}
                        onChange={(e) => setHero({...hero, rate: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Skills Tab --- */}
            {activeTab === 'skills' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Skills & Expertise</h2>
                  <button 
                    onClick={() => handleSave('skills', skills)}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  {skills.categories.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <input 
                          type="text" 
                          value={cat.name}
                          onChange={(e) => {
                            const newCats = [...skills.categories];
                            newCats[catIdx].name = e.target.value;
                            setSkills({...skills, categories: newCats});
                          }}
                          className="bg-transparent border-b border-slate-800 text-xl font-bold focus:outline-none focus:border-teal-500 transition-all px-0 py-1"
                        />
                        <button 
                          onClick={() => deleteSkillCategory(catIdx)}
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {cat.items.map((skill, skillIdx) => (
                          <div key={skillIdx} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full pl-4 pr-2 py-1.5">
                            <input 
                              type="text" 
                              value={skill}
                              onChange={(e) => {
                                const newCats = [...skills.categories];
                                newCats[catIdx].items[skillIdx] = e.target.value;
                                setSkills({...skills, categories: newCats});
                              }}
                              className="bg-transparent border-none focus:outline-none text-sm w-24"
                            />
                            <button 
                              onClick={() => deleteSkillFromCategory(catIdx, skillIdx)}
                              className="text-slate-500 hover:text-red-500"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => addSkillToCategory(catIdx)}
                          className="flex items-center gap-2 bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-teal-500/20 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add Skill
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addSkillCategory}
                    className="w-full py-4 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 hover:text-teal-500 hover:border-teal-500/50 transition-all flex items-center justify-center gap-2 font-bold"
                  >
                    <Plus className="w-6 h-6" /> Add New Category
                  </button>
                </div>
              </div>
            )}

            {/* --- Experience Tab --- */}
            {activeTab === 'experience' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Work Experience</h2>
                  <div className="flex gap-4">
                    <button 
                      onClick={addExperience}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-semibold border border-slate-700"
                    >
                      <Plus className="w-5 h-5" />
                      Add Entry
                    </button>
                    <button 
                      onClick={() => handleSave('experience', experience)}
                      disabled={saving}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </button>
                  </div>
                </div>

                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={experience.entries.map(e => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {experience.entries.map((entry) => (
                        <div key={entry.id} className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="cursor-grab active:cursor-grabbing text-slate-600">
                                <GripVertical className="w-6 h-6" />
                              </div>
                              <input 
                                type="text" 
                                value={entry.title}
                                placeholder="Job Title"
                                onChange={(e) => updateExperience(entry.id, 'title', e.target.value)}
                                className="bg-transparent border-b border-slate-800 text-xl font-bold focus:outline-none focus:border-teal-500 transition-all flex-1"
                              />
                            </div>
                            <button 
                              onClick={() => deleteExperience(entry.id)}
                              className="text-red-500 hover:text-red-400 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company</label>
                              <input 
                                type="text" 
                                value={entry.company}
                                onChange={(e) => updateExperience(entry.id, 'company', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date Range</label>
                              <input 
                                type="text" 
                                value={entry.date}
                                onChange={(e) => updateExperience(entry.id, 'date', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Key Responsibilities</label>
                            <div className="space-y-3">
                              {entry.points.map((point, pIdx) => (
                                <div key={pIdx} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={point}
                                    onChange={(e) => {
                                      const newPoints = [...entry.points];
                                      newPoints[pIdx] = e.target.value;
                                      updateExperience(entry.id, 'points', newPoints);
                                    }}
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                                  />
                                  <button 
                                    onClick={() => {
                                      const newPoints = [...entry.points];
                                      newPoints.splice(pIdx, 1);
                                      updateExperience(entry.id, 'points', newPoints);
                                    }}
                                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                              <button 
                                onClick={() => {
                                  const newPoints = [...entry.points, ''];
                                  updateExperience(entry.id, 'points', newPoints);
                                }}
                                className="flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 font-medium"
                              >
                                <Plus className="w-4 h-4" /> Add Responsibility
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* --- Contact Tab --- */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Contact & Socials</h2>
                  <button 
                    onClick={() => handleSave('contact', contact)}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </div>

                <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        value={contact.email}
                        onChange={(e) => setContact({...contact, email: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                      <input 
                        type="text" 
                        value={contact.phone}
                        onChange={(e) => setContact({...contact, phone: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
                    <input 
                      type="text" 
                      value={contact.location}
                      onChange={(e) => setContact({...contact, location: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-800">
                    <h3 className="text-lg font-bold">Social Media Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">LinkedIn URL</label>
                        <input 
                          type="text" 
                          value={contact.socials.linkedin}
                          onChange={(e) => setContact({...contact, socials: {...contact.socials, linkedin: e.target.value}})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GitHub URL</label>
                        <input 
                          type="text" 
                          value={contact.socials.github}
                          onChange={(e) => setContact({...contact, socials: {...contact.socials, github: e.target.value}})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">PromptBase URL</label>
                        <input 
                          type="text" 
                          value={contact.socials.promptbase}
                          onChange={(e) => setContact({...contact, socials: {...contact.socials, promptbase: e.target.value}})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upwork URL</label>
                        <input 
                          type="text" 
                          value={contact.socials.upwork}
                          onChange={(e) => setContact({...contact, socials: {...contact.socials, upwork: e.target.value}})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Live Preview Panel */}
        <aside className="w-[400px] bg-[#111827] border-l border-slate-800 p-8 overflow-y-auto hidden xl:block">
          <div className="sticky top-0 space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Layout className="w-5 h-5 text-teal-500" />
              <h3 className="text-lg font-bold">Live Preview</h3>
            </div>

            <div className="bg-[#0a0f1e] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex-1 text-center">hichamhmidani.com</div>
              </div>

              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide">
                {/* Hero Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${hero.available ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                      {hero.available ? 'Available' : 'Busy'}
                    </div>
                    <div className="px-2 py-0.5 rounded-full text-[8px] font-bold border bg-teal-500/10 border-teal-500/30 text-teal-500">
                      {hero.rate}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold leading-tight">
                    Hi, I'm <span className="text-teal-500">{hero.name}</span>
                    <br />
                    <span className="text-slate-500 text-sm">{hero.titles[0]}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                    {hero.bio}
                  </p>
                </div>

                {/* Skills Preview */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skills</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.categories[0]?.items.slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-slate-800 text-[8px] text-slate-300 border border-slate-700">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Experience Preview */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experience</h5>
                  <div className="space-y-3">
                    {experience.entries.slice(0, 2).map((e) => (
                      <div key={e.id} className="space-y-1">
                        <div className="text-[10px] font-bold text-white">{e.title}</div>
                        <div className="text-[8px] text-slate-500">{e.company} • {e.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Preview */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</h5>
                  <div className="space-y-1 text-[9px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-2.5 h-2.5 text-teal-500" />
                      {contact.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-2.5 h-2.5 text-teal-500" />
                      {contact.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-teal-600/10 border border-teal-500/20">
              <p className="text-xs text-teal-500 leading-relaxed italic">
                "This preview shows a condensed version of how your changes will appear on the live site. Always save your changes to see them reflected globally."
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Helper for MapPin which wasn't imported
