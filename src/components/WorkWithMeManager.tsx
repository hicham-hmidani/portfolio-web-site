import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  ArrowLeft, 
  Save, 
  X,
  Briefcase,
  RotateCcw,
  Eye,
  EyeOff,
  Home,
  PenTool,
  Palette,
  FolderKanban,
  Mail,
  Store,
  ExternalLink,
  LogOut,
  GraduationCap,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  History
} from 'lucide-react';
import { saveSection } from '../admin/saveSection';
import HistoryDrawer from '../admin/ui/HistoryDrawer';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
import { workWithMeDefaults, WorkWithMeData, WorkWithMeCard } from '../content/workWithMeDefaults';

// Sortable Work Card Row
function SortableWorkCardRow({ 
  card, 
  onEdit, 
  onDelete, 
  onToggleVisible 
}: { 
  card: WorkWithMeCard; 
  onEdit: (card: WorkWithMeCard) => void; 
  onDelete: (id: string) => void; 
  onToggleVisible: (id: string) => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 mt-1 sm:mt-0">
          <GripVertical className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-base">{card.title}</h4>
            {card.visible === false && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono rounded">Hidden</span>
            )}
          </div>
          <p className="text-xs text-slate-400 max-w-xl line-clamp-1 mt-0.5">{card.blurb}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/40 border border-teal-900/50 px-2 py-0.5 rounded">
              CTA: {card.ctaLabel}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {card.bullets?.length || 0} bullets • {card.tags?.length || 0} tags
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button 
          onClick={() => onToggleVisible(card.id)} 
          className="p-2 text-slate-400 hover:text-white transition-colors" 
          title={card.visible === false ? "Show on public site" : "Hide from public site"}
        >
          {card.visible === false ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-teal-400" />}
        </button>
        <button onClick={() => onEdit(card)} className="p-2 text-slate-400 hover:text-teal-400 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(card.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function WorkWithMeManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<WorkWithMeData>(workWithMeDefaults);

  // Availability state (managed via portfolio_content/hero)
  const [heroAvailability, setHeroAvailability] = useState({
    available: true,
    statusText: 'AVAILABLE FOR FREELANCE'
  });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Modal editing card state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<WorkWithMeCard | null>(null);

  // Input states for bullets & tags chips in modal
  const [bulletInput, setBulletInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/admin/login');
      else setLoading(false);
    });
    return () => unsubAuth();
  }, [navigate]);

  useEffect(() => {
    if (loading) return;

    // 1. Listen to portfolio_content/workwithme
    const unsubWork = onSnapshot(doc(db, 'portfolio_content', 'workwithme'), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as Partial<WorkWithMeData>;
        setData({
          heading: d.heading || workWithMeDefaults.heading,
          intro: d.intro || workWithMeDefaults.intro,
          cards: d.cards || workWithMeDefaults.cards
        });
      } else {
        setData(workWithMeDefaults);
      }
    });

    // 2. Listen to portfolio_content/hero for availability
    const unsubHero = onSnapshot(doc(db, 'portfolio_content', 'hero'), (snap) => {
      if (snap.exists()) {
        const h = snap.data();
        setHeroAvailability({
          available: h.available !== undefined ? h.available : true,
          statusText: h.availableStatusText || (h.available ? 'AVAILABLE FOR FREELANCE' : 'CURRENTLY UNAVAILABLE')
        });
      }
    });

    return () => {
      unsubWork();
      unsubHero();
    };
  }, [loading]);

  const handleSaveData = async (newData: WorkWithMeData) => {
    setSaving(true);
    try {
      await saveSection('workwithme', newData, {
        notify: true,
        successMessage: 'Work With Me section saved successfully'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await saveSection('hero', {
        available: heroAvailability.available,
        availableStatusText: heroAvailability.statusText
      }, {
        notify: true,
        successMessage: 'Availability status updated successfully'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAvailability(false);
    }
  };

  const seedDefaults = async () => {
    if (confirm('Reset Work With Me section to in-code defaults?')) {
      await handleSaveData(workWithMeDefaults);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.cards.findIndex(c => c.id === active.id);
      const newIndex = data.cards.findIndex(c => c.id === over.id);
      const newCards = arrayMove(data.cards, oldIndex, newIndex);
      const updated = { ...data, cards: newCards };
      setData(updated);
      handleSaveData(updated);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { name: 'Overview', icon: <Home className="w-5 h-5" />, path: '/admin/dashboard' },
    { name: 'Blog Posts', icon: <PenTool className="w-5 h-5" />, path: '/admin/blog' },
    { name: 'Portfolio Editor', icon: <Palette className="w-5 h-5" />, path: '/admin/portfolio' },
    { name: 'Projects', icon: <FolderKanban className="w-5 h-5" />, path: '/admin/projects' },
    { name: 'Education & Certs', icon: <GraduationCap className="w-5 h-5" />, path: '/admin/education' },
    { name: 'Work With Me', icon: <Briefcase className="w-5 h-5" />, path: '/admin/work-with-me' },
    { name: 'Sections', icon: <Layers className="w-5 h-5" />, path: '/admin/sections' },
    { name: 'Messages', icon: <Mail className="w-5 h-5" />, path: '/admin/messages' },
    { name: 'Marketplace', icon: <Store className="w-5 h-5" />, path: '/admin/marketplace' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-[#111827] border-r border-slate-800 flex flex-col z-50">
        <div className="p-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-yellow-500 flex items-center justify-center text-white font-bold">
              HH
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Dashboard</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                location.pathname === link.path 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800 space-y-1">
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <ExternalLink className="w-5 h-5" />
            <span className="font-medium">View Live Site</span>
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-[#111827]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-semibold text-white">Work With Me Manager</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors border border-slate-700"
            >
              <History className="w-4 h-4 text-teal-400" /> History
            </button>
            <button
              onClick={seedDefaults}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" /> Seed from Defaults
            </button>
          </div>
        </header>

        <main className="p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Availability Control Box */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" /> Availability Status (Hero Banner)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Controls the live availability indicator badge shown in the hero section.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setHeroAvailability(prev => ({ ...prev, available: !prev.available }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    heroAvailability.available
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {heroAvailability.available ? (
                    <>
                      <ToggleRight className="w-5 h-5" /> Status: Available
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" /> Status: Unavailable
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveAvailability}
                  disabled={savingAvailability}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" /> {savingAvailability ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Status Text Label</label>
              <input
                type="text"
                value={heroAvailability.statusText}
                onChange={(e) => setHeroAvailability(prev => ({ ...prev, statusText: e.target.value }))}
                placeholder="AVAILABLE FOR FREELANCE"
                className="w-full mt-1.5 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Section Heading & Intro */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Section Copy</h3>
                <p className="text-xs text-slate-400 mt-0.5">Edit the top heading and introductory paragraph.</p>
              </div>
              <button
                onClick={() => handleSaveData(data)}
                disabled={saving}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-colors shadow-lg shadow-teal-500/20"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Copy'}
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Heading</label>
                <input
                  type="text"
                  value={data.heading}
                  onChange={(e) => setData({ ...data, heading: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Intro Description</label>
                <textarea
                  rows={3}
                  value={data.intro}
                  onChange={(e) => setData({ ...data, intro: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cards Manager */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Engagement Cards ({data.cards.length})</h3>
                <p className="text-xs text-slate-400">
                  Drag to reorder columns. Use <span className="font-mono text-teal-400">&#123;rate&#125;</span> in bullet text to dynamically insert the Upwork hourly rate.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCard({
                    id: `card-${Date.now()}`,
                    title: '',
                    blurb: '',
                    bullets: ['{rate} Standard Rate'],
                    tags: ['Data Analysis'],
                    ctaLabel: 'Learn More',
                    ctaUrl: 'https://',
                    visible: true
                  });
                  setBulletInput('');
                  setTagInput('');
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
              >
                <Plus className="w-4 h-4" /> Add Card
              </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={data.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {data.cards.map((card) => (
                    <SortableWorkCardRow
                      key={card.id}
                      card={card}
                      onEdit={(c) => {
                        setEditingCard(c);
                        setBulletInput('');
                        setTagInput('');
                        setIsModalOpen(true);
                      }}
                      onDelete={(id) => {
                        if (confirm('Delete this card?')) {
                          const newCards = data.cards.filter(c => c.id !== id);
                          const updated = { ...data, cards: newCards };
                          setData(updated);
                          handleSaveData(updated);
                        }
                      }}
                      onToggleVisible={(id) => {
                        const newCards = data.cards.map(c => c.id === id ? { ...c, visible: c.visible === false ? true : false } : c);
                        const updated = { ...data, cards: newCards };
                        setData(updated);
                        handleSaveData(updated);
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </main>
      </div>

      {/* Card Edit / Create Modal */}
      {isModalOpen && editingCard && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 my-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {data.cards.some(c => c.id === editingCard.id) ? 'Edit Engagement Card' : 'Add Engagement Card'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                // Validate CTA URL (https:// or mailto: only, never javascript:)
                const url = editingCard.ctaUrl.trim().toLowerCase();
                if (!url.startsWith('https://') && !url.startsWith('mailto:')) {
                  toast.error('CTA URL must begin with https:// or mailto:');
                  return;
                }
                if (url.startsWith('javascript:')) {
                  toast.error('JavaScript URLs are prohibited');
                  return;
                }

                const exists = data.cards.some(c => c.id === editingCard.id);
                const newCards = exists
                  ? data.cards.map(c => c.id === editingCard.id ? editingCard : c)
                  : [...data.cards, editingCard];
                
                const updated = { ...data, cards: newCards };
                setData(updated);
                handleSaveData(updated);
                setIsModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Card Title</label>
                <input
                  type="text"
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  placeholder="e.g. Upwork or PromptBase"
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Blurb / Summary</label>
                <textarea
                  rows={2}
                  value={editingCard.blurb}
                  onChange={(e) => setEditingCard({ ...editingCard, blurb: e.target.value })}
                  placeholder="Short description of the contract service"
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 resize-none"
                  required
                />
              </div>

              {/* Bullets Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono uppercase text-slate-400">
                    Bullets / Key Features (Use &#123;rate&#125; for rate)
                  </label>
                </div>

                <div className="space-y-2 mb-2">
                  {editingCard.bullets?.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-lg text-xs">
                      <span className="flex-1 text-slate-300 font-mono">{bullet}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingCard.bullets.filter((_, i) => i !== idx);
                          setEditingCard({ ...editingCard, bullets: updated });
                        }}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bulletInput}
                    onChange={(e) => setBulletInput(e.target.value)}
                    placeholder="e.g. {rate} Standard Rate or 24h Turnaround"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (bulletInput.trim()) {
                          setEditingCard({
                            ...editingCard,
                            bullets: [...(editingCard.bullets || []), bulletInput.trim()]
                          });
                          setBulletInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (bulletInput.trim()) {
                        setEditingCard({
                          ...editingCard,
                          bullets: [...(editingCard.bullets || []), bulletInput.trim()]
                        });
                        setBulletInput('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono"
                  >
                    Add Bullet
                  </button>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 mb-1 block">
                  Specialty Tags (Chips)
                </label>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editingCard.tags?.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-xs font-mono">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingCard.tags.filter((_, i) => i !== idx);
                          setEditingCard({ ...editingCard, tags: updated });
                        }}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g. Machine Learning, Python, Prompting"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim()) {
                          setEditingCard({
                            ...editingCard,
                            tags: [...(editingCard.tags || []), tagInput.trim()]
                          });
                          setTagInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim()) {
                        setEditingCard({
                          ...editingCard,
                          tags: [...(editingCard.tags || []), tagInput.trim()]
                        });
                        setTagInput('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400">CTA Button Label</label>
                  <input
                    type="text"
                    value={editingCard.ctaLabel}
                    onChange={(e) => setEditingCard({ ...editingCard, ctaLabel: e.target.value })}
                    placeholder="Hire on Upwork"
                    className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400">CTA URL (https:// or mailto:)</label>
                  <input
                    type="text"
                    value={editingCard.ctaUrl}
                    onChange={(e) => setEditingCard({ ...editingCard, ctaUrl: e.target.value })}
                    placeholder="https://www.upwork.com/..."
                    className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="card-visible"
                  checked={editingCard.visible !== false}
                  onChange={(e) => setEditingCard({ ...editingCard, visible: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="card-visible" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Card is visible on public website
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Safety Net Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        docId="workwithme"
        sectionTitle="Work With Me Section"
        onRestored={(restoredData) => {
          if (restoredData) setData(restoredData);
        }}
      />
    </div>
  );
}
