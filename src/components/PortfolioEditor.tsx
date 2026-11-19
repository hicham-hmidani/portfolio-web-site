import { useState, useEffect, useCallback } from 'react';
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
  MapPin,
  History,
  RotateCcw
} from 'lucide-react';
import { saveSection } from '../admin/saveSection';
import HistoryDrawer from '../admin/ui/HistoryDrawer';
import ConfirmDialog from '../admin/ui/ConfirmDialog';
import { isValidUrlInput, safeHref } from '../lib/url';
import { doc, getDoc } from 'firebase/firestore';
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

interface HeroState {
  name: string;
  titles: string[];
  bio: string;
  available: boolean;
  availableStatusText: string;
  rate: string;
  image: { url: string; alt: string; path?: string };
}

interface SkillCategoryEditor {
  name: string;
  items: string[];
}

interface ExperienceEntryEditor {
  id: string;
  title: string;
  company: string;
  date: string;
  badge: string;
  link: string;
  points: string[];
}

interface ContactState {
  email: string;
  phone: string;
  location: string;
  socials: {
    linkedin: string;
    github: string;
    promptbase: string;
    upwork: string;
  };
}

const DEFAULT_HERO: HeroState = {
  name: 'Hicham Hmidani',
  titles: ['Junior Data Analyst/Scientist', 'AI Prompt Engineer', 'Database Administrator-MI'],
  bio: "A diligent and detail-oriented Junior Data Analyst/Scientist, AI Prompt Engineer, and Database Administrator holding a Master's degree in Computer Science and Complex Systems Engineering. I have a solid foundation in statistical analysis, machine learning, prompt engineering, and domain name investing.",
  available: true,
  availableStatusText: 'AVAILABLE FOR FREELANCE',
  rate: '$10/hr',
  image: { url: '', alt: 'Portrait of Hicham Hmidani' }
};

const DEFAULT_SKILLS: { categories: SkillCategoryEditor[] } = {
  categories: [
    { name: 'Data Analysis', items: ['Pandas', 'NumPy', 'Power BI', 'Tableau', 'Excel'] },
    { name: 'Programming', items: ['Python', 'SQL', 'R', 'C/C++', 'Java', 'MATLAB'] },
    { name: 'Databases', items: ['Oracle', 'MySQL', 'NoSQL', 'MongoDB'] },
    { name: 'Machine Learning / DL', items: ['Scikit-learn', 'TensorFlow', 'Keras'] },
    { name: 'Prompt Engineering', items: ['Leonardo.AI', 'DALL-E', 'GPT', 'ChatGPT', 'Chain-of-Thought'] },
    { name: 'Web', items: ['HTML', 'CSS'] }
  ]
};

const DEFAULT_EXPERIENCE: { entries: ExperienceEntryEditor[] } = {
  entries: [
    {
      id: 'exp-1',
      title: 'Database Management Administrator',
      company: 'Moroccan Ministry of Interior',
      date: 'May 2024 – Present',
      badge: '',
      link: '',
      points: [
        'Managing and optimizing database systems to ensure data integrity, security, and high availability.',
        'Performing regular backups, monitoring performance, and troubleshooting database issues.'
      ]
    },
    {
      id: 'exp-2',
      title: 'Freelance Data Analyst',
      company: 'Upwork',
      date: 'Open to Offers',
      badge: '$10/hr',
      link: 'https://www.upwork.com/',
      points: [
        'Transforming raw data into meaningful insights.',
        'Building custom professional Excel dashboards with advanced analytics.',
        'Data cleaning, preparation, and visualization (Power BI, Tableau).',
        'Developing machine learning models and predictive analytics.'
      ]
    }
  ]
};

const DEFAULT_CONTACT: ContactState = {
  email: 'hmidanihicham8@gmail.com',
  phone: '+212 600000000',
  location: 'Ouarzazate, Morocco',
  socials: {
    linkedin: 'https://linkedin.com/in/hicham-hmidani-b55a5521b/',
    github: 'https://github.com/hicham-hmidani',
    promptbase: '',
    upwork: ''
  }
};

function normalizeHero(raw: any): HeroState {
  return {
    name: typeof raw?.name === 'string' && raw.name.trim() ? raw.name : DEFAULT_HERO.name,
    titles:
      Array.isArray(raw?.titles) && raw.titles.length > 0
        ? raw.titles.map((t: unknown) => String(t ?? ''))
        : DEFAULT_HERO.titles,
    bio: typeof raw?.bio === 'string' ? raw.bio : DEFAULT_HERO.bio,
    available: raw?.available !== undefined ? Boolean(raw.available) : DEFAULT_HERO.available,
    availableStatusText:
      typeof raw?.availableStatusText === 'string'
        ? raw.availableStatusText
        : DEFAULT_HERO.availableStatusText,
    rate: typeof raw?.rate === 'string' ? raw.rate : DEFAULT_HERO.rate,
    image: {
      url: typeof raw?.image?.url === 'string' ? raw.image.url : '',
      alt: typeof raw?.image?.alt === 'string' ? raw.image.alt : DEFAULT_HERO.image.alt,
      ...(typeof raw?.image?.path === 'string' ? { path: raw.image.path } : {})
    }
  };
}

function normalizeSkills(raw: any): { categories: SkillCategoryEditor[] } {
  if (!Array.isArray(raw?.categories)) return DEFAULT_SKILLS;
  const normalized = raw.categories.map((c: any) => ({
    name: String(c?.name ?? c?.title ?? ''),
    items: Array.isArray(c?.items)
      ? c.items.map((s: unknown) => String(s ?? ''))
      : Array.isArray(c?.skills)
      ? c.skills.map((s: unknown) => String(s ?? ''))
      : []
  }));
  return { categories: normalized.length > 0 ? normalized : DEFAULT_SKILLS.categories };
}

function normalizeExperience(raw: any): { entries: ExperienceEntryEditor[] } {
  if (!Array.isArray(raw?.entries)) return DEFAULT_EXPERIENCE;
  return {
    entries: raw.entries.map((exp: any, idx: number) => ({
      id: typeof exp?.id === 'string' && exp.id ? exp.id : `exp-${Date.now()}-${idx}`,
      title: String(exp?.title ?? ''),
      company: String(exp?.company ?? ''),
      date: String(exp?.date ?? ''),
      badge: String(exp?.badge ?? ''),
      link: String(exp?.link ?? ''),
      points: Array.isArray(exp?.points)
        ? exp.points.map((p: unknown) => String(p ?? ''))
        : Array.isArray(exp?.bulletPoints)
        ? exp.bulletPoints.map((p: unknown) => String(p ?? ''))
        : Array.isArray(exp?.description)
        ? exp.description.map((p: unknown) => String(p ?? ''))
        : []
    }))
  };
}

function normalizeContact(raw: any): ContactState {
  return {
    email: typeof raw?.email === 'string' ? raw.email : DEFAULT_CONTACT.email,
    phone: typeof raw?.phone === 'string' ? raw.phone : DEFAULT_CONTACT.phone,
    location: typeof raw?.location === 'string' ? raw.location : DEFAULT_CONTACT.location,
    socials: {
      linkedin: String(raw?.socials?.linkedin ?? ''),
      github: String(raw?.socials?.github ?? ''),
      promptbase: String(raw?.socials?.promptbase ?? ''),
      upwork: String(raw?.socials?.upwork ?? '')
    }
  };
}

// --- Sortable Experience Card ---
function SortableExperienceCard({
  entry,
  onUpdate,
  onDelete
}: {
  entry: ExperienceEntryEditor;
  onUpdate: (id: string, field: keyof ExperienceEntryEditor, value: any) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#111827]/50 border rounded-3xl p-5 sm:p-8 space-y-6 ${
        isDragging ? 'border-teal-500 shadow-2xl shadow-teal-500/20' : 'border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Reorder experience entry"
            className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 shrink-0"
          >
            <GripVertical className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={entry.title}
            placeholder="Job Title"
            onChange={(e) => onUpdate(entry.id, 'title', e.target.value)}
            className="bg-transparent border-b border-slate-800 text-lg sm:text-xl font-bold focus:outline-none focus:border-teal-500 transition-all flex-1 min-w-0"
          />
        </div>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          aria-label="Delete experience entry"
          className="text-red-500 hover:text-red-400 p-2 shrink-0"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company</label>
          <input
            type="text"
            value={entry.company}
            onChange={(e) => onUpdate(entry.id, 'company', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date Range</label>
          <input
            type="text"
            value={entry.date}
            onChange={(e) => onUpdate(entry.id, 'date', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Badge (optional)</label>
          <input
            type="text"
            value={entry.badge}
            placeholder="e.g. $10/hr or Ranked #1899"
            onChange={(e) => onUpdate(entry.id, 'badge', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company Link (optional https://)</label>
          <input
            type="text"
            value={entry.link}
            placeholder="https://..."
            onChange={(e) => onUpdate(entry.id, 'link', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-mono text-sm"
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
                  onUpdate(entry.id, 'points', newPoints);
                }}
                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  const newPoints = [...entry.points];
                  newPoints.splice(pIdx, 1);
                  onUpdate(entry.id, 'points', newPoints);
                }}
                className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newPoints = [...entry.points, ''];
              onUpdate(entry.id, 'points', newPoints);
            }}
            className="flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Responsibility
          </button>
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmSeedOpen, setConfirmSeedOpen] = useState(false);
  const navigate = useNavigate();

  const [hero, setHero] = useState<HeroState>(DEFAULT_HERO);
  const [skills, setSkills] = useState<{ categories: SkillCategoryEditor[] }>(DEFAULT_SKILLS);
  const [experience, setExperience] = useState<{ entries: ExperienceEntryEditor[] }>(DEFAULT_EXPERIENCE);
  const [contact, setContact] = useState<ContactState>(DEFAULT_CONTACT);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const docs = ['hero', 'skills', 'experience', 'contact'] as const;
      const snaps = await Promise.all(docs.map((d) => getDoc(doc(db, 'portfolio_content', d))));

      snaps.forEach((docSnap, idx) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        const section = docs[idx];
        if (section === 'hero') setHero(normalizeHero(data));
        if (section === 'skills') setSkills(normalizeSkills(data));
        if (section === 'experience') setExperience(normalizeExperience(data));
        if (section === 'contact') setContact(normalizeContact(data));
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      toast.error('Failed to load portfolio content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [navigate, fetchData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async (section: 'hero' | 'skills' | 'experience' | 'contact') => {
    let payload: any;

    if (section === 'hero') {
      if (!hero.name.trim()) {
        toast.error('Full Name cannot be empty');
        return;
      }
      if (!isValidUrlInput(hero.image?.url || '', { allowEmpty: true })) {
        toast.error('Portrait image URL must start with https://');
        return;
      }
      payload = {
        ...hero,
        name: hero.name.trim(),
        titles: hero.titles.map((t) => t.trim()).filter(Boolean),
        bio: hero.bio.trim(),
        availableStatusText: hero.availableStatusText.trim(),
        rate: hero.rate.trim(),
        image: {
          ...hero.image,
          url: hero.image.url.trim(),
          alt: hero.image.alt.trim()
        }
      };
    } else if (section === 'skills') {
      payload = {
        categories: skills.categories
          .map((cat) => ({
            name: cat.name.trim(),
            items: cat.items.map((item) => item.trim()).filter(Boolean)
          }))
          .filter((cat) => cat.name || cat.items.length > 0)
      };
    } else if (section === 'experience') {
      for (const entry of experience.entries) {
        if (entry.link.trim() && !isValidUrlInput(entry.link, { allowEmpty: true })) {
          toast.error(`Experience link for "${entry.title || entry.company}" must start with https://`);
          return;
        }
      }
      payload = {
        entries: experience.entries.map((entry) => ({
          ...entry,
          title: entry.title.trim(),
          company: entry.company.trim(),
          date: entry.date.trim(),
          badge: entry.badge.trim(),
          link: entry.link.trim(),
          points: entry.points.map((p) => p.trim()).filter(Boolean)
        }))
      };
    } else if (section === 'contact') {
      const socialKeys = ['linkedin', 'github', 'promptbase', 'upwork'] as const;
      for (const key of socialKeys) {
        if (!isValidUrlInput(contact.socials[key], { allowEmpty: true })) {
          toast.error(`${key.charAt(0).toUpperCase() + key.slice(1)} URL must start with https://`);
          return;
        }
      }
      payload = {
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        location: contact.location.trim(),
        socials: {
          linkedin: contact.socials.linkedin.trim(),
          github: contact.socials.github.trim(),
          promptbase: contact.socials.promptbase.trim(),
          upwork: contact.socials.upwork.trim()
        }
      };
    }

    setSaving(true);
    try {
      await saveSection(section, payload, {
        notify: true,
        successMessage: `${section.charAt(0).toUpperCase() + section.slice(1)} section saved!`
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(`Error saving ${section}:`, err);
    } finally {
      setSaving(false);
    }
  };

  const handleSeedTabDefaults = async () => {
    setConfirmSeedOpen(false);
    if (activeTab === 'hero') {
      setHero(DEFAULT_HERO);
      await saveSection('hero', DEFAULT_HERO, { notify: true, successMessage: 'Hero seeded from defaults' });
    } else if (activeTab === 'skills') {
      setSkills(DEFAULT_SKILLS);
      await saveSection('skills', DEFAULT_SKILLS, { notify: true, successMessage: 'Skills seeded from defaults' });
    } else if (activeTab === 'experience') {
      setExperience(DEFAULT_EXPERIENCE);
      await saveSection('experience', DEFAULT_EXPERIENCE, { notify: true, successMessage: 'Experience seeded from defaults' });
    } else if (activeTab === 'contact') {
      setContact(DEFAULT_CONTACT);
      await saveSection('contact', DEFAULT_CONTACT, { notify: true, successMessage: 'Contact seeded from defaults' });
    }
    setHasUnsavedChanges(false);
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
          entries: arrayMove(prev.entries, oldIndex, newIndex)
        };
      });
      setHasUnsavedChanges(true);
    }
  };

  const addExperience = () => {
    const newEntry: ExperienceEntryEditor = {
      id: `exp-${Date.now()}`,
      title: '',
      company: '',
      date: '',
      badge: '',
      link: '',
      points: ['']
    };
    setExperience((prev) => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    setHasUnsavedChanges(true);
  };

  const deleteExperience = (id: string) => {
    setExperience((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
    setHasUnsavedChanges(true);
  };

  const updateExperience = (id: string, field: keyof ExperienceEntryEditor, value: any) => {
    setExperience((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    }));
    setHasUnsavedChanges(true);
  };

  // --- Skills Handlers ---
  const addSkillCategory = () => {
    setSkills((prev) => ({
      ...prev,
      categories: [...prev.categories, { name: 'New Category', items: [] }]
    }));
    setHasUnsavedChanges(true);
  };

  const deleteSkillCategory = (index: number) => {
    setSkills((prev) => {
      const newCats = [...prev.categories];
      newCats.splice(index, 1);
      return { ...prev, categories: newCats };
    });
    setHasUnsavedChanges(true);
  };

  const addSkillToCategory = (catIndex: number) => {
    setSkills((prev) => {
      const newCats = prev.categories.map((c, idx) =>
        idx === catIndex ? { ...c, items: [...c.items, 'New Skill'] } : c
      );
      return { ...prev, categories: newCats };
    });
    setHasUnsavedChanges(true);
  };

  const deleteSkillFromCategory = (catIndex: number, skillIndex: number) => {
    setSkills((prev) => {
      const newCats = prev.categories.map((c, idx) =>
        idx === catIndex ? { ...c, items: c.items.filter((_, sIdx) => sIdx !== skillIndex) } : c
      );
      return { ...prev, categories: newCats };
    });
    setHasUnsavedChanges(true);
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
      <header className="bg-[#111827] border-b border-slate-800 px-4 sm:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold">Portfolio Editor</h1>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
                Unsaved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setConfirmSeedOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seed defaults</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono transition-colors border border-slate-700"
            >
              <History className="w-4 h-4 text-teal-400" />
              <span>History ({activeTab})</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-teal-500 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Live</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar / Mobile Tabs */}
        <aside className="w-full md:w-64 bg-[#111827] border-b md:border-b-0 md:border-r border-slate-800 p-3 sm:p-6 flex md:flex-col gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 text-sm ${
              activeTab === 'hero' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Hero Section</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 text-sm ${
              activeTab === 'skills' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Skills</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 text-sm ${
              activeTab === 'experience' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Experience</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 text-sm ${
              activeTab === 'contact' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Contact Info</span>
          </button>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0f1e]">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* --- Hero Tab --- */}
            {activeTab === 'hero' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Hero Section</h2>
                  <button
                    type="button"
                    onClick={() => handleSave('hero')}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50 text-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

                <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={hero.name}
                      onChange={(e) => {
                        setHero({ ...hero, name: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
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
                              setHero({ ...hero, titles: newTitles });
                              setHasUnsavedChanges(true);
                            }}
                            className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newTitles = [...hero.titles];
                              newTitles.splice(idx, 1);
                              setHero({ ...hero, titles: newTitles });
                              setHasUnsavedChanges(true);
                            }}
                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setHero({ ...hero, titles: [...hero.titles, 'New Title'] });
                          setHasUnsavedChanges(true);
                        }}
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
                      onChange={(e) => {
                        setHero({ ...hero, bio: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      rows={5}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Availability</label>
                      <button
                        type="button"
                        onClick={() => {
                          setHero({ ...hero, available: !hero.available });
                          setHasUnsavedChanges(true);
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                          hero.available
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'bg-red-500/10 border-red-500/50 text-red-500'
                        }`}
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
                        onChange={(e) => {
                          setHero({ ...hero, rate: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Availability Status Label</label>
                    <input
                      type="text"
                      value={hero.availableStatusText}
                      onChange={(e) => {
                        setHero({ ...hero, availableStatusText: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="AVAILABLE FOR FREELANCE"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Portrait Image URL (optional https://)
                      </label>
                      {hero.image?.url && (
                        <button
                          type="button"
                          onClick={() => {
                            setHero({ ...hero, image: { ...hero.image, url: '' } });
                            setHasUnsavedChanges(true);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 font-mono"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={hero.image?.url || ''}
                      onChange={(e) => {
                        setHero({ ...hero, image: { ...hero.image, url: e.target.value } });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-mono text-sm"
                    />
                    {safeHref(hero.image?.url) && (
                      <div className="flex items-center gap-4 pt-1">
                        <img
                          src={safeHref(hero.image.url)}
                          alt={hero.image.alt || 'Portrait preview'}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                        />
                        <input
                          type="text"
                          value={hero.image.alt}
                          onChange={(e) => {
                            setHero({ ...hero, image: { ...hero.image, alt: e.target.value } });
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Image alt description"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- Skills Tab --- */}
            {activeTab === 'skills' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Skills & Expertise</h2>
                  <button
                    type="button"
                    onClick={() => handleSave('skills')}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50 text-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  {skills.categories.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const newCats = skills.categories.map((c, idx) =>
                              idx === catIdx ? { ...c, name: e.target.value } : c
                            );
                            setSkills({ ...skills, categories: newCats });
                            setHasUnsavedChanges(true);
                          }}
                          className="bg-transparent border-b border-slate-800 text-lg sm:text-xl font-bold focus:outline-none focus:border-teal-500 transition-all px-0 py-1 flex-1 min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => deleteSkillCategory(catIdx)}
                          className="text-red-500 hover:text-red-400 p-2 shrink-0"
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
                                const newCats = skills.categories.map((c, cIdx) =>
                                  cIdx === catIdx
                                    ? {
                                        ...c,
                                        items: c.items.map((item, sIdx) => (sIdx === skillIdx ? e.target.value : item))
                                      }
                                    : c
                                );
                                setSkills({ ...skills, categories: newCats });
                                setHasUnsavedChanges(true);
                              }}
                              className="bg-transparent border-none focus:outline-none text-sm w-28"
                            />
                            <button
                              type="button"
                              onClick={() => deleteSkillFromCategory(catIdx, skillIdx)}
                              className="text-slate-500 hover:text-red-500"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSkillToCategory(catIdx)}
                          className="flex items-center gap-2 bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-teal-500/20 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add Skill
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Work Experience</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={addExperience}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold border border-slate-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('experience')}
                      disabled={saving}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50 text-sm"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={experience.entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-6">
                      {experience.entries.map((entry) => (
                        <SortableExperienceCard
                          key={entry.id}
                          entry={entry}
                          onUpdate={updateExperience}
                          onDelete={deleteExperience}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* --- Contact Tab --- */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Contact & Socials</h2>
                  <button
                    type="button"
                    onClick={() => handleSave('contact')}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50 text-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

                <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => {
                          setContact({ ...contact, email: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => {
                          setContact({ ...contact, phone: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
                    <input
                      type="text"
                      value={contact.location}
                      onChange={(e) => {
                        setContact({ ...contact, location: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-800">
                    <h3 className="text-lg font-bold">Social Media Profiles (https://)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">LinkedIn URL</label>
                        <input
                          type="text"
                          value={contact.socials.linkedin}
                          onChange={(e) => {
                            setContact({
                              ...contact,
                              socials: { ...contact.socials, linkedin: e.target.value }
                            });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GitHub URL</label>
                        <input
                          type="text"
                          value={contact.socials.github}
                          onChange={(e) => {
                            setContact({
                              ...contact,
                              socials: { ...contact.socials, github: e.target.value }
                            });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">PromptBase URL</label>
                        <input
                          type="text"
                          value={contact.socials.promptbase}
                          onChange={(e) => {
                            setContact({
                              ...contact,
                              socials: { ...contact.socials, promptbase: e.target.value }
                            });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upwork URL</label>
                        <input
                          type="text"
                          value={contact.socials.upwork}
                          onChange={(e) => {
                            setContact({
                              ...contact,
                              socials: { ...contact.socials, upwork: e.target.value }
                            });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-mono text-sm"
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
                    <div
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${
                        hero.available
                          ? 'bg-green-500/10 border-green-500/30 text-green-500'
                          : 'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}
                    >
                      {hero.available ? hero.availableStatusText || 'Available' : 'Busy'}
                    </div>
                    <div className="px-2 py-0.5 rounded-full text-[8px] font-bold border bg-teal-500/10 border-teal-500/30 text-teal-500">
                      {hero.rate}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold leading-tight">
                    Hi, I'm <span className="text-teal-500">{hero.name}</span>
                    <br />
                    <span className="text-slate-500 text-sm">{hero.titles[0] || ''}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">{hero.bio}</p>
                </div>

                {/* Skills Preview */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skills</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.categories[0]?.items.slice(0, 5).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-slate-800 text-[8px] text-slate-300 border border-slate-700"
                      >
                        {s}
                      </span>
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
                        <div className="text-[8px] text-slate-500">
                          {e.company} • {e.date}
                        </div>
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
                "This preview shows a condensed version of how your changes will appear on the live site. Always save
                your changes to see them reflected globally."
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Version History Safety Net Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        docId={activeTab}
        sectionTitle={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section`}
        onRestored={(restoredData) => {
          if (activeTab === 'hero') setHero(normalizeHero(restoredData));
          if (activeTab === 'skills') setSkills(normalizeSkills(restoredData));
          if (activeTab === 'experience') setExperience(normalizeExperience(restoredData));
          if (activeTab === 'contact') setContact(normalizeContact(restoredData));
          setHasUnsavedChanges(false);
        }}
      />

      <ConfirmDialog
        isOpen={confirmSeedOpen}
        title={`Seed ${activeTab} from defaults?`}
        message={`This will reset the "${activeTab}" section to the built-in defaults and save immediately (a snapshot of current data will be kept in History).`}
        confirmLabel="Seed Defaults"
        onConfirm={handleSeedTabDefaults}
        onCancel={() => setConfirmSeedOpen(false)}
      />
    </div>
  );
}
