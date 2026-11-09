import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Loader2,
  GripVertical,
  ArrowLeft,
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
  Briefcase,
  Layers,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  History
} from 'lucide-react';
import { saveSection } from '../admin/saveSection';
import HistoryDrawer from '../admin/ui/HistoryDrawer';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
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
import {
  defaultLayoutData,
  PortfolioLayoutData,
  LayoutSectionItem,
  SECTION_METAS
} from '../content/layoutDefaults';

// Sortable Row Component for Middle Sections
function SortableSectionRow({
  item,
  orderIndex,
  onToggleVisible
}: {
  item: LayoutSectionItem;
  orderIndex: number;
  onToggleVisible: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined
  };

  const meta = SECTION_METAS[item.id] || {
    id: item.id,
    name: item.id,
    fullName: item.id,
    href: `#${item.id}`,
    description: ''
  };

  const isVisible = item.visible !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-900/60 border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isDragging
          ? 'border-teal-500 shadow-2xl shadow-teal-500/20 bg-slate-900'
          : isVisible
          ? 'border-slate-800 hover:border-slate-700'
          : 'border-slate-800/60 opacity-60 bg-slate-950/40'
      }`}
    >
      <div className="flex items-start sm:items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-slate-500 hover:text-slate-200 mt-0.5 sm:mt-0 transition-colors"
          title="Drag to reorder"
          aria-label={`Reorder ${meta.fullName}`}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-xs font-bold text-teal-400">
          {String(orderIndex).padStart(2, '0')}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-white text-base">{meta.fullName}</h4>
            <span className="font-mono text-xs text-slate-500">{meta.href}</span>
            {isVisible ? (
              <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] font-mono rounded border border-teal-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono rounded border border-amber-500/20">
                Hidden
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{meta.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <button
          onClick={() => onToggleVisible(item.id)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            isVisible
              ? 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title={isVisible ? 'Hide section from public site' : 'Show section on public site'}
        >
          {isVisible ? (
            <>
              <Eye className="w-4 h-4 text-teal-400" />
              <span>Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>Hidden</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function SectionsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sections, setSections] = useState<LayoutSectionItem[]>(defaultLayoutData.sections);

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

    const unsub = onSnapshot(doc(db, 'portfolio_content', 'layout'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<PortfolioLayoutData>;
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          // Normalize with known sections in case any were omitted
          const allKnownIds = defaultLayoutData.sections.map(s => s.id);
          const merged = [...data.sections.filter(s => allKnownIds.includes(s.id))];
          allKnownIds.forEach(id => {
            if (!merged.some(s => s.id === id)) {
              merged.push({ id, visible: true });
            }
          });
          setSections(merged);
        } else {
          setSections(defaultLayoutData.sections);
        }
      } else {
        setSections(defaultLayoutData.sections);
      }
    }, (err) => {
      console.error('Error listening to portfolio_content/layout:', err);
    });

    return () => unsub();
  }, [loading]);

  const handleSaveSections = async (newSections: LayoutSectionItem[], notify: boolean = true) => {
    setSaving(true);
    try {
      await saveSection('layout', { sections: newSections }, {
        notify,
        successMessage: 'Section order & visibility updated live!'
      });
    } catch (err) {
      console.error('Failed to save layout:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex);
      setSections(reordered);
      handleSaveSections(reordered, true);
    }
  };

  const handleToggleVisible = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, visible: s.visible === false ? true : false } : s);
    setSections(updated);
    handleSaveSections(updated, true);
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset all sections to default order and make all sections visible?')) {
      setSections(defaultLayoutData.sections);
      await handleSaveSections(defaultLayoutData.sections, true);
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

  const visibleCount = sections.filter(s => s.visible !== false).length;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex">
      <Toaster position="top-right" />

      {/* Shared Admin Sidebar */}
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
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="font-medium">View Live Site</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-[#111827]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-white">Section Layout Manager</h2>
              <p className="text-xs text-slate-400">
                {visibleCount} of {sections.length} middle sections visible • Hero and Contact are fixed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors border border-slate-700"
            >
              <History className="w-4 h-4 text-teal-400" /> History
            </button>
            <button
              onClick={handleResetDefaults}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" /> Reset Default Order
            </button>
          </div>
        </header>

        <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* Real-time sync note callout */}
          <div className="p-4 bg-teal-950/40 border border-teal-800/60 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-200/90 leading-relaxed">
              <span className="font-bold text-teal-300">Live Synchronization:</span> Drag to reorder or toggle visibility.
              Changes go live immediately on the public website without requiring a build or server reload. Folio numerals
              (01, 02, 03...) and navigation active highlights automatically re-sequence so numbers never skip.
            </div>
          </div>

          <div className="space-y-3">
            {/* 1. Fixed Top: Hero Section */}
            <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-1.5 text-slate-600">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-400">
                  01
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">Hero & About</h4>
                    <span className="font-mono text-xs text-slate-500">#about</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
                      Fixed First
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Introduction, rotating titles, status badge, bio, and portrait.
                  </p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 bg-slate-800/50 border border-slate-700/50">
                Always Visible
              </div>
            </div>

            {/* 2. Reorderable Middle Sections via @dnd-kit */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 my-3">
                  {sections.map((section, idx) => (
                    <SortableSectionRow
                      key={section.id}
                      item={section}
                      orderIndex={idx + 2}
                      onToggleVisible={handleToggleVisible}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* 3. Fixed Bottom: Contact Section */}
            <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-1.5 text-slate-600">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-400">
                  {String(visibleCount + 2).padStart(2, '0')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">Contact & Inquiries</h4>
                    <span className="font-mono text-xs text-slate-500">#contact</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
                      Fixed Last
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inquiry form, contact methods, response SLA, and footer wordmark.
                  </p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 bg-slate-800/50 border border-slate-700/50">
                Always Visible
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Version History Safety Net Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        docId="layout"
        sectionTitle="Section Layout & Order"
        onRestored={(restoredData) => {
          if (restoredData?.sections) {
            setSections(restoredData.sections);
          }
        }}
      />
    </div>
  );
}
