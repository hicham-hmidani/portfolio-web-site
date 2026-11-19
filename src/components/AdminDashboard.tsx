import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  Loader2, 
  Home, 
  PenTool, 
  Palette, 
  FolderKanban, 
  Mail, 
  Store, 
  ExternalLink,
  ChevronRight,
  Plus,
  Eye,
  MessageSquare,
  Clock,
  GraduationCap,
  Briefcase,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-teal-500/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
          {icon}
        </div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Stats</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalProjects: 0,
    unreadMessages: 0,
    marketplaceItems: 0,
    publishedPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (loading) return;

    // Fetch Stats
    const fetchStats = async () => {
      try {
        const postsSnap = await getDocs(collection(db, 'blog_posts'));
        const projectsSnap = await getDocs(collection(db, 'projects'));
        const marketplaceSnap = await getDocs(collection(db, 'marketplace_items'));
        const publishedSnap = await getDocs(query(collection(db, 'blog_posts'), where('published', '==', true)));
        
        setStats(prev => ({
          ...prev,
          totalPosts: postsSnap.size,
          totalProjects: projectsSnap.size,
          marketplaceItems: marketplaceSnap.size,
          publishedPosts: publishedSnap.size
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    // Real-time unread messages
    const qMessages = query(collection(db, 'contact_messages'), where('read', '==', false));
    const unsubMessages = onSnapshot(qMessages, (snap) => {
      setStats(prev => ({ ...prev, unreadMessages: snap.size }));
    }, (err) => {
      console.warn('Could not sync unread messages count:', err);
    });

    // Fetch Recent Activity
    const fetchActivity = async () => {
      try {
        const activities: any[] = [];
        
        // Latest Posts
        const postsQ = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'), limit(4));
        const postsSnap = await getDocs(postsQ);
        postsSnap.forEach(docSnap => {
          activities.push({
            id: `post-${docSnap.id}`,
            type: 'post',
            title: docSnap.data().title || 'Untitled Post',
            date: docSnap.data().createdAt,
            icon: <PenTool className="w-4 h-4 text-teal-500" />
          });
        });

        // Latest Messages
        const messagesQ = query(collection(db, 'contact_messages'), orderBy('receivedAt', 'desc'), limit(4));
        const messagesSnap = await getDocs(messagesQ);
        messagesSnap.forEach(docSnap => {
          activities.push({
            id: `msg-${docSnap.id}`,
            type: 'message',
            title: `Message from ${docSnap.data().from_name || 'Visitor'}`,
            date: docSnap.data().receivedAt,
            icon: <Mail className="w-4 h-4 text-yellow-500" />
          });
        });

        // Latest Projects
        const projectsQ = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(4));
        const projectsSnap = await getDocs(projectsQ);
        projectsSnap.forEach(docSnap => {
          activities.push({
            id: `proj-${docSnap.id}`,
            type: 'project',
            title: `New Project: ${docSnap.data().title || 'Untitled Project'}`,
            date: docSnap.data().createdAt,
            icon: <FolderKanban className="w-4 h-4 text-blue-500" />
          });
        });

        setRecentActivity(activities.sort((a, b) => {
          const dateA = a.date?.toMillis?.() || 0;
          const dateB = b.date?.toMillis?.() || 0;
          return dateB - dateA;
        }));
      } catch (err) {
        console.error('Error fetching activity:', err);
      }
    };

    fetchStats();
    fetchActivity();

    return () => unsubMessages();
  }, [loading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { name: 'Overview', icon: <Home className="w-5 h-5" />, path: '/admin/dashboard' },
    { name: 'Blog Posts', icon: <PenTool className="w-5 h-5" />, path: '/admin/blog' },
    { name: 'Portfolio Editor', icon: <Palette className="w-5 h-5" />, path: '/admin/portfolio' },
    { name: 'Projects', icon: <FolderKanban className="w-5 h-5" />, path: '/admin/projects' },
    { name: 'Education & Certs', icon: <GraduationCap className="w-5 h-5" />, path: '/admin/education' },
    { name: 'Work With Me', icon: <Briefcase className="w-5 h-5" />, path: '/admin/work-with-me' },
    { name: 'Sections', icon: <Layers className="w-5 h-5" />, path: '/admin/sections' },
    { name: 'Messages', icon: <Mail className="w-5 h-5" />, path: '/admin/messages', badge: stats.unreadMessages },
    { name: 'Marketplace', icon: <Store className="w-5 h-5" />, path: '/admin/marketplace' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const displayedActivities = showAllActivity ? recentActivity : recentActivity.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 fixed inset-y-0 left-0 bg-[#111827] border-r border-slate-800 flex flex-col z-50 transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-yellow-500 flex items-center justify-center text-white font-bold">
              HH
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white">Dashboard</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
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
              {(link.badge ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
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

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="h-20 bg-[#111827]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate">Welcome back, Hicham</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <a 
              href="https://hichamhmidani.com" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex text-sm text-slate-400 hover:text-teal-500 transition-colors items-center gap-2"
            >
              hichamhmidani.com
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-500 font-bold shrink-0">
              H
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <StatCard 
              title="Total Blog Posts" 
              value={stats.totalPosts} 
              icon={<PenTool className="w-6 h-6" />} 
              color="text-teal-500" 
            />
            <StatCard 
              title="Total Projects" 
              value={stats.totalProjects} 
              icon={<FolderKanban className="w-6 h-6" />} 
              color="text-blue-500" 
            />
            <StatCard 
              title="Unread Messages" 
              value={stats.unreadMessages} 
              icon={<Mail className="w-6 h-6" />} 
              color="text-yellow-500" 
            />
            <StatCard 
              title="Marketplace Items" 
              value={stats.marketplaceItems} 
              icon={<Store className="w-6 h-6" />} 
              color="text-purple-500" 
            />
            <StatCard 
              title="Published Posts" 
              value={stats.publishedPosts} 
              icon={<Eye className="w-6 h-6" />} 
              color="text-green-500" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Clock className="w-6 h-6 text-teal-500" />
                    Recent Activity
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAllActivity((prev) => !prev)}
                    className="text-sm text-teal-500 hover:underline"
                  >
                    {showAllActivity ? 'Show Less' : 'View All'}
                  </button>
                </div>

                <div className="space-y-6">
                  {displayedActivities.length > 0 ? (
                    displayedActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                        <div className="p-3 rounded-xl bg-slate-800">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{activity.title}</h4>
                          <p className="text-xs text-slate-500">
                            {activity.date instanceof Timestamp 
                              ? activity.date.toDate().toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) 
                              : 'Just now'}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic">
                      No recent activity recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-8 text-white">Quick Actions</h3>
                <div className="space-y-4">
                  <Link 
                    to="/admin/blog" 
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">Write New Post</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/admin/projects" 
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all group border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <FolderKanban className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">Add New Project</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/admin/portfolio" 
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all group border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">Edit Portfolio</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gradient-to-br from-teal-900/20 to-yellow-900/20 border border-teal-500/20 rounded-3xl p-8">
                <h4 className="text-sm font-bold text-teal-500 uppercase tracking-widest mb-4">System Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Database Connection</span>
                    <span className="text-green-500 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Auth Service</span>
                    <span className="text-green-500 font-medium">Secure</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Environment</span>
                    <span className="text-yellow-500 font-medium">Production</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
