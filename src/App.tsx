import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Portfolio from './components/Portfolio';

const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const BlogManager = lazy(() => import('./components/BlogManager'));
const PortfolioEditor = lazy(() => import('./components/PortfolioEditor'));
const ProjectsManager = lazy(() => import('./components/ProjectsManager'));
const MessagesInbox = lazy(() => import('./components/MessagesInbox'));
const MarketplaceManager = lazy(() => import('./components/MarketplaceManager'));
const EducationManager = lazy(() => import('./components/EducationManager'));
const WorkWithMeManager = lazy(() => import('./components/WorkWithMeManager'));
const SectionsManager = lazy(() => import('./components/SectionsManager'));

function AdminPageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Admin Sub-pages */}
        <Route path="/admin/blog" element={<BlogManager />} />
        <Route path="/admin/portfolio" element={<PortfolioEditor />} />
        <Route path="/admin/projects" element={<ProjectsManager />} />
        <Route path="/admin/education" element={<EducationManager />} />
        <Route path="/admin/work-with-me" element={<WorkWithMeManager />} />
        <Route path="/admin/sections" element={<SectionsManager />} />
        <Route path="/admin/messages" element={<MessagesInbox />} />
        <Route path="/admin/marketplace" element={<MarketplaceManager />} />
        
        {/* Legacy/Requested .html redirects or routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login.html" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/dashboard.html" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/blog-manager" element={<Navigate to="/admin/blog" replace />} />
        <Route path="/admin/blog-manager.html" element={<Navigate to="/admin/blog" replace />} />
        <Route path="/admin/portfolio-editor" element={<Navigate to="/admin/portfolio" replace />} />
        <Route path="/admin/portfolio-editor.html" element={<Navigate to="/admin/portfolio" replace />} />
        <Route path="/admin/projects-manager" element={<Navigate to="/admin/projects" replace />} />
        <Route path="/admin/projects-manager.html" element={<Navigate to="/admin/projects" replace />} />
        <Route path="/admin/messages.html" element={<Navigate to="/admin/messages" replace />} />
        <Route path="/admin/education.html" element={<Navigate to="/admin/education" replace />} />
        <Route path="/admin/work-with-me.html" element={<Navigate to="/admin/work-with-me" replace />} />
        <Route path="/admin/sections.html" element={<Navigate to="/admin/sections" replace />} />
        <Route path="/admin/marketplace-manager" element={<Navigate to="/admin/marketplace" replace />} />
        <Route path="/admin/marketplace-manager.html" element={<Navigate to="/admin/marketplace" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
