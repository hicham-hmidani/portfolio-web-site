import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  ArrowLeft, 
  Save, 
  X,
  GraduationCap,
  Award,
  ArrowUpDown,
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
  Briefcase,
  Layers,
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
import { educationDefaults, certificationsDefaults, EducationItem, CertificationItem } from '../content/educationDefaults';

// --- Sortable Education Row ---
function SortableEduRow({ item, onEdit, onDelete, onToggleVisible }: { item: EducationItem; onEdit: (item: EducationItem) => void; onDelete: (id: string) => void; onToggleVisible: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300">
          <GripVertical className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-sm">{item.degree}</h4>
            {item.visible === false && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono rounded">Hidden</span>
            )}
          </div>
          <p className="text-xs text-slate-400">{item.institution} • {item.period} • {item.field}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onToggleVisible(item.id)} className="p-2 text-slate-400 hover:text-white transition-colors" title={item.visible === false ? "Show" : "Hide"}>
          {item.visible === false ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-teal-400" />}
        </button>
        <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-teal-400 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Sortable Cert Row ---
function SortableCertRow({ item, onEdit, onDelete, onToggleVisible }: { item: CertificationItem; onEdit: (item: CertificationItem) => void; onDelete: (id: string) => void; onToggleVisible: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300">
          <GripVertical className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-sm">{item.title}</h4>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">{item.group}</span>
            {item.visible === false && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono rounded">Hidden</span>
            )}
          </div>
          <p className="text-xs text-slate-400">{item.issuer} ({item.platform}) • {item.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onToggleVisible(item.id)} className="p-2 text-slate-400 hover:text-white transition-colors" title={item.visible === false ? "Show" : "Hide"}>
          {item.visible === false ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-teal-400" />}
        </button>
        <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-teal-400 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function EducationManager() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'education' | 'certifications'>('education');
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [certificationsList, setCertificationsList] = useState<CertificationItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [sortDesc, setSortDesc] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Edit / Add modal states
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const navigate = useNavigate();

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
    const unsubEdu = onSnapshot(doc(db, 'portfolio_content', 'education'), (snap) => {
      if (snap.exists() && snap.data().items) {
        setEducationList(snap.data().items);
      } else {
        setEducationList(educationDefaults.items);
      }
    });

    const unsubCert = onSnapshot(doc(db, 'portfolio_content', 'certifications'), (snap) => {
      if (snap.exists() && snap.data().items) {
        setCertificationsList(snap.data().items);
      } else {
        setCertificationsList(certificationsDefaults.items);
      }
    });

    return () => {
      unsubEdu();
      unsubCert();
    };
  }, [loading]);

  const handleSaveEducation = async (items: EducationItem[]) => {
    setSaving(true);
    try {
      await saveSection('education', { items }, {
        notify: true,
        successMessage: 'Education updated successfully'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCertifications = async (items: CertificationItem[]) => {
    setSaving(true);
    try {
      await saveSection('certifications', { items }, {
        notify: true,
        successMessage: 'Certifications updated successfully'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const seedDefaults = async (type: 'education' | 'certifications') => {
    if (type === 'education') {
      await handleSaveEducation(educationDefaults.items);
    } else {
      await handleSaveCertifications(certificationsDefaults.items);
    }
  };

  const handleDragEndEdu = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = educationList.findIndex(i => i.id === active.id);
      const newIndex = educationList.findIndex(i => i.id === over.id);
      const newList = arrayMove(educationList, oldIndex, newIndex);
      setEducationList(newList);
      handleSaveEducation(newList);
    }
  };

  const handleDragEndCert = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = certificationsList.findIndex(i => i.id === active.id);
      const newIndex = certificationsList.findIndex(i => i.id === over.id);
      const newList = arrayMove(certificationsList, oldIndex, newIndex);
      setCertificationsList(newList);
      handleSaveCertifications(newList);
    }
  };

  const handleSortCertsByDate = () => {
    const sorted = [...certificationsList].sort((a, b) => {
      const timeA = Date.parse(a.date) || 0;
      const timeB = Date.parse(b.date) || 0;
      return sortDesc ? timeA - timeB : timeB - timeA;
    });
    setSortDesc(!sortDesc);
    setCertificationsList(sorted);
    handleSaveCertifications(sorted);
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
            <h2 className="text-xl font-semibold text-white">Education & Certifications Manager</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors border border-slate-700"
            >
              <History className="w-4 h-4 text-teal-400" /> History ({activeTab === 'education' ? 'Education' : 'Certifications'})
            </button>
            {activeTab === 'education' ? (
              <button
                onClick={() => seedDefaults('education')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Seed from Defaults
              </button>
            ) : (
              <button
                onClick={() => seedDefaults('certifications')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Seed from Defaults
              </button>
            )}
          </div>
        </header>

        <main className="p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('education')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'education' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Academic Education ({educationList.length})
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'certifications' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" /> Certifications ({certificationsList.length})
            </button>
          </div>

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">Manage your academic degrees and educational background.</p>
                <button
                  onClick={() => {
                    setEditingEdu({ id: `edu-${Date.now()}`, degree: '', institution: '', period: '', field: '', visible: true });
                    setIsEduModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndEdu}>
                <SortableContext items={educationList.map(e => e.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {educationList.map((item) => (
                      <SortableEduRow
                        key={item.id}
                        item={item}
                        onEdit={(e) => { setEditingEdu(e); setIsEduModalOpen(true); }}
                        onDelete={(id) => {
                          if (confirm('Are you sure you want to delete this item?')) {
                            const newList = educationList.filter(i => i.id !== id);
                            setEducationList(newList);
                            handleSaveEducation(newList);
                          }
                        }}
                        onToggleVisible={(id) => {
                          const newList = educationList.map(i => i.id === id ? { ...i, visible: i.visible === false ? true : false } : i);
                          setEducationList(newList);
                          handleSaveEducation(newList);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-slate-400">Manage professional certificates, issuer platforms, and verification links.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSortCertsByDate}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors border border-slate-700"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort by Date ({sortDesc ? 'Oldest' : 'Newest'})
                  </button>
                  <button
                    onClick={() => {
                      setEditingCert({ id: `cert-${Date.now()}`, title: '', issuer: '', platform: '', date: new Date().toISOString().split('T')[0], verifyUrl: '', group: 'Specialized', visible: true });
                      setIsCertModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                  >
                    <Plus className="w-4 h-4" /> Add Certification
                  </button>
                </div>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCert}>
                <SortableContext items={certificationsList.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {certificationsList.map((item) => (
                      <SortableCertRow
                        key={item.id}
                        item={item}
                        onEdit={(c) => { setEditingCert(c); setIsCertModalOpen(true); }}
                        onDelete={(id) => {
                          if (confirm('Are you sure you want to delete this certification?')) {
                            const newList = certificationsList.filter(i => i.id !== id);
                            setCertificationsList(newList);
                            handleSaveCertifications(newList);
                          }
                        }}
                        onToggleVisible={(id) => {
                          const newList = certificationsList.map(i => i.id === id ? { ...i, visible: i.visible === false ? true : false } : i);
                          setCertificationsList(newList);
                          handleSaveCertifications(newList);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </main>
      </div>

      {/* Education Modal */}
      {isEduModalOpen && editingEdu && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {educationList.some(e => e.id === editingEdu.id) ? 'Edit Education' : 'Add Education'}
              </h3>
              <button onClick={() => setIsEduModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Check duplicate title
                const duplicate = educationList.some(item => item.id !== editingEdu.id && item.degree.toLowerCase() === editingEdu.degree.toLowerCase());
                if (duplicate) {
                  if (!confirm(`Warning: An education entry with the degree "${editingEdu.degree}" already exists. Proceed?`)) {
                    return;
                  }
                }

                const exists = educationList.some(item => item.id === editingEdu.id);
                const newList = exists ? educationList.map(item => item.id === editingEdu.id ? editingEdu : item) : [...educationList, editingEdu];
                setEducationList(newList);
                handleSaveEducation(newList);
                setIsEduModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Degree / Qualification</label>
                <input
                  type="text"
                  value={editingEdu.degree}
                  onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Institution / School</label>
                <input
                  type="text"
                  value={editingEdu.institution}
                  onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Period (e.g. 2021 – 2023)</label>
                <input
                  type="text"
                  value={editingEdu.period}
                  onChange={(e) => setEditingEdu({ ...editingEdu, period: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Field / Specialization</label>
                <input
                  type="text"
                  value={editingEdu.field}
                  onChange={(e) => setEditingEdu({ ...editingEdu, field: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEduModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {isCertModalOpen && editingCert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {certificationsList.some(c => c.id === editingCert.id) ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <button onClick={() => setIsCertModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Check duplicate title
                const duplicate = certificationsList.some(item => item.id !== editingCert.id && item.title.toLowerCase() === editingCert.title.toLowerCase());
                if (duplicate) {
                  if (!confirm(`Warning: A certification with the title "${editingCert.title}" already exists. Proceed?`)) {
                    return;
                  }
                }

                // Validate URL (https:// or mailto:, never javascript:)
                if (editingCert.verifyUrl.toLowerCase().startsWith('javascript:')) {
                  toast.error('JavaScript URLs are not allowed');
                  return;
                }

                const exists = certificationsList.some(item => item.id === editingCert.id);
                const newList = exists ? certificationsList.map(item => item.id === editingCert.id ? editingCert : item) : [...certificationsList, editingCert];
                setCertificationsList(newList);
                handleSaveCertifications(newList);
                setIsCertModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Certification Title</label>
                <input
                  type="text"
                  value={editingCert.title}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400">Issuer (e.g. Google)</label>
                  <input
                    type="text"
                    value={editingCert.issuer}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400">Platform (e.g. Coursera)</label>
                  <input
                    type="text"
                    value={editingCert.platform}
                    onChange={(e) => setEditingCert({ ...editingCert, platform: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400">Completion Date</label>
                  <input
                    type="date"
                    value={editingCert.date}
                    onChange={(e) => setEditingCert({ ...editingCert, date: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400">Group / Category</label>
                  <select
                    value={editingCert.group}
                    onChange={(e) => setEditingCert({ ...editingCert, group: e.target.value as 'Google' | 'Specialized' })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Google">Google</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400">Verification URL (https://)</label>
                <input
                  type="text"
                  value={editingCert.verifyUrl}
                  onChange={(e) => setEditingCert({ ...editingCert, verifyUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Certification
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
        docId={activeTab}
        sectionTitle={activeTab === 'education' ? 'Academic Education' : 'Professional Certifications'}
        onRestored={(restoredData) => {
          if (activeTab === 'education' && restoredData.items) {
            setEducationList(restoredData.items);
          } else if (activeTab === 'certifications' && restoredData.items) {
            setCertificationsList(restoredData.items);
          }
        }}
      />
    </div>
  );
}
