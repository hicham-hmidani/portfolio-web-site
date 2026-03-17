import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AdminPlaceholder({ title }: { title: string }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="bg-[#111827]/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-slate-400">This module is currently under development. Check back soon!</p>
        </div>
      </div>
    </div>
  );
}
