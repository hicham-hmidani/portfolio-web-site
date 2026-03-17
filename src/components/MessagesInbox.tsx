import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Reply, 
  ArrowLeft, 
  Clock, 
  User, 
  Inbox,
  Calendar,
  Search,
  ChevronRight,
  Circle
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

interface Message {
  id: string;
  from_name: string;
  from_email: string;
  message: string;
  read: boolean;
  receivedAt: Timestamp;
}

export default function MessagesInbox() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      }
    });

    const q = query(collection(db, "contact_messages"), orderBy("receivedAt", "desc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, [navigate]);

  const selectedMessage = useMemo(() => 
    messages.find(m => m.id === selectedMessageId), 
    [messages, selectedMessageId]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: messages.length,
      unread: messages.filter(m => !m.read).length,
      thisWeek: messages.filter(m => m.receivedAt.toDate() >= startOfWeek).length,
      thisMonth: messages.filter(m => m.receivedAt.toDate() >= startOfMonth).length,
    };
  }, [messages]);

  const filteredMessages = useMemo(() => 
    messages.filter(m => 
      m.from_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [messages, searchQuery]
  );

  const handleSelectMessage = async (id: string) => {
    setSelectedMessageId(id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) {
      try {
        await updateDoc(doc(db, "contact_messages", id), { read: true });
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, "contact_messages", id));
      if (selectedMessageId === id) setSelectedMessageId(null);
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      await updateDoc(doc(db, "contact_messages", id), { read: !currentRead });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col h-screen overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-[#111827] border-b border-slate-800 px-8 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <h1 className="text-xl font-bold">Messages Inbox</h1>
          </div>
          
          {/* Stats Bar */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total</span>
              <span className="text-lg font-bold text-white">{stats.total}</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unread</span>
              <span className="text-lg font-bold text-teal-500">{stats.unread}</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">This Week</span>
              <span className="text-lg font-bold text-blue-500">{stats.thisWeek}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Message List */}
        <aside className="w-full md:w-[400px] bg-[#111827] border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg.id)}
                  className={`w-full text-left p-4 border-b border-slate-800/50 transition-all hover:bg-slate-800/50 relative group ${selectedMessageId === msg.id ? 'bg-teal-500/5 border-l-4 border-l-teal-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-bold truncate pr-4 ${!msg.read ? 'text-white' : 'text-slate-400'}`}>
                      {msg.from_name}
                    </span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatDate(msg.receivedAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mb-1">
                    {msg.from_email}
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-1">
                    {msg.message}
                  </div>
                  
                  {!msg.read && (
                    <div className="absolute right-4 bottom-4">
                      <Circle className="w-2 h-2 fill-teal-500 text-teal-500" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right Panel: Message View */}
        <main className="flex-1 bg-[#0a0f1e] overflow-y-auto p-8">
          {selectedMessage ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedMessage.from_name}</h2>
                    <p className="text-sm text-slate-500">{selectedMessage.from_email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.read)}
                    className={`p-2 rounded-lg transition-all ${selectedMessage.read ? 'text-slate-400 hover:text-white' : 'text-teal-500 hover:bg-teal-500/10'}`}
                    title={selectedMessage.read ? "Mark as unread" : "Mark as read"}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${selectedMessage.read ? '' : 'fill-current opacity-20'}`} />
                  </button>
                  <a 
                    href={`mailto:${selectedMessage.from_email}?subject=Re: Portfolio Inquiry&body=Hi ${selectedMessage.from_name},%0D%0A%0D%0A`}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                    title="Reply"
                  >
                    <Reply className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-[#111827]/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-6 text-xs text-slate-500 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Received: {selectedMessage.receivedAt.toDate().toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    ID: {selectedMessage.id}
                  </div>
                </div>

                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-end">
                <a 
                  href={`mailto:${selectedMessage.from_email}?subject=Re: Portfolio Inquiry&body=Hi ${selectedMessage.from_name},%0D%0A%0D%0A`}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20"
                >
                  <Reply className="w-5 h-5" />
                  Reply to {selectedMessage.from_name.split(' ')[0]}
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Mail className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a message to read</p>
              <p className="text-sm">Your inbox is ready for action</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
