import { useEffect, useState, useMemo, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Send,
  CheckCircle2,
  Circle,
  Clock,
  X
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
  Timestamp 
} from 'firebase/firestore';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import Markdown from 'react-markdown';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmDialog from '../admin/ui/ConfirmDialog';

const CATEGORIES = [
  "Data Analysis",
  "AI & Prompts",
  "Machine Learning",
  "Freelancing",
  "Domain Investing"
];

interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
  published: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function BlogManager() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    excerpt: '',
    content: '',
    readTime: '',
    published: false
  });

  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    autofocus: false,
    placeholder: "Write your article in Markdown...",
    status: false,
    minHeight: "400px"
  }), []);

  const handleContentChange = useCallback((val: string) => {
    setFormData(prev => ({ ...prev, content: val }));
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "blog_posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as BlogPost[];
      setPosts(postsData);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        fetchPosts();
      }
    });
    return () => unsubscribe();
  }, [navigate, fetchPosts]);

  const handleNewPost = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      category: CATEGORIES[0],
      excerpt: '',
      content: '',
      readTime: '',
      published: false
    });
    setView('editor');
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      category: post.category || CATEGORIES[0],
      excerpt: post.excerpt || '',
      content: post.content || '',
      readTime: post.readTime || '',
      published: Boolean(post.published)
    });
    setView('editor');
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const postId = deleteTargetId;
    setDeleteTargetId(null);

    const loadingToast = toast.loading("Deleting post...");
    try {
      await deleteDoc(doc(db, "blog_posts", postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted successfully", { id: loadingToast });
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error("Failed to delete post", { id: loadingToast });
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    const loadingToast = toast.loading(post.published ? "Moving to drafts..." : "Publishing...");
    try {
      await updateDoc(doc(db, "blog_posts", post.id), {
        published: !post.published,
        updatedAt: serverTimestamp()
      });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
      toast.success(post.published ? "Moved to drafts" : "Post published!", { id: loadingToast });
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to update status", { id: loadingToast });
    }
  };

  const handleSave = async (isPublishing: boolean) => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const loadingToast = toast.loading("Saving post...");
    try {
      const postData = {
        ...formData,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        readTime: formData.readTime.trim() || '5 min read',
        published: isPublishing,
        updatedAt: serverTimestamp()
      };

      if (editingPost) {
        await updateDoc(doc(db, "blog_posts", editingPost.id), postData);
        toast.success("Post updated successfully", { id: loadingToast });
      } else {
        await addDoc(collection(db, "blog_posts"), {
          ...postData,
          createdAt: serverTimestamp()
        });
        toast.success("New post created", { id: loadingToast });
      }
      
      await fetchPosts();
      setView('list');
    } catch (err) {
      console.error("Error saving post:", err);
      toast.error("Failed to save post", { id: loadingToast });
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const title = (post.title || '').toLowerCase();
      const matchesSearch = title.includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' 
        ? true 
        : filterStatus === 'published' ? post.published : !post.published;
      const matchesCategory = filterCategory === 'all' ? true : post.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [posts, searchQuery, filterStatus, filterCategory]);

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
      
      {/* Sidebar-like Header for Mobile/Desktop consistency */}
      <header className="bg-[#111827] border-b border-slate-800 px-4 sm:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold truncate">Blog Manager</h1>
          </div>
          {view === 'list' && (
            <button 
              type="button"
              onClick={handleNewPost}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              New Post
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        {view === 'list' ? (
          <div className="space-y-6">
            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search posts by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-slate-800 rounded-2xl focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Posts Table */}
            <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-teal-400 transition-colors">{post.title}</div>
                          <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">{post.excerpt}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 whitespace-nowrap">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {post.published ? (
                            <span className="inline-flex items-center gap-1.5 text-green-500 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-yellow-500 text-xs font-bold">
                              <Circle className="w-3.5 h-3.5" />
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                          {post.createdAt instanceof Timestamp ? post.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => handleTogglePublished(post)}
                              title={post.published ? "Move to Draft" : "Publish Now"}
                              className={`p-2 rounded-lg transition-colors ${post.published ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
                            >
                              {post.published ? <Circle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleEdit(post)}
                              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                              title="Edit Post"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setPreviewPost(post)}
                              className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setDeleteTargetId(post.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPosts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                          No posts found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Editor View */
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button 
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Posts
              </button>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleSave(false)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all border border-slate-700"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  Save Draft
                </button>
                <button 
                  type="button"
                  onClick={() => handleSave(true)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Publish
                </button>
              </div>
            </div>

            <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Post Title</label>
                <input 
                  type="text"
                  placeholder="Enter a compelling title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-0 py-2 bg-transparent border-b border-slate-800 text-2xl sm:text-4xl font-bold focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Read Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="e.g. 6 min read"
                      value={formData.readTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Excerpt</label>
                <textarea 
                  placeholder="A short description for the post card..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-2 prose-editor">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Content (Markdown)</label>
                <div className="rounded-xl overflow-hidden border border-slate-800">
                  <SimpleMDE 
                    value={formData.content}
                    onChange={handleContentChange}
                    options={mdeOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* In-App Markdown Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400">
                  {previewPost.category} • {previewPost.readTime || '5 min read'}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{previewPost.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPost(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto prose prose-invert prose-slate max-w-none">
              <Markdown>{previewPost.content || previewPost.excerpt || '*No content written yet.*'}</Markdown>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmLabel="Delete Post"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <style>{`
        .prose-editor .editor-toolbar {
          background: #1f2937;
          border-color: #374151;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .prose-editor .editor-toolbar button {
          color: #9ca3af;
        }
        .prose-editor .editor-toolbar button.active,
        .prose-editor .editor-toolbar button:hover {
          background: #374151;
          color: #fff;
        }
        .prose-editor .CodeMirror {
          background: #0f172a;
          color: #e2e8f0;
          border-color: #374151;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .prose-editor .CodeMirror-cursor {
          border-left: 2px solid #00d4d4;
        }
        .prose-editor .editor-preview {
          background: #0a0f1e;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
