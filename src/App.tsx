import { Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminPlaceholder from './components/AdminPlaceholder';
import BlogManager from './components/BlogManager';
import PortfolioEditor from './components/PortfolioEditor';
import ProjectsManager from './components/ProjectsManager';
import MessagesInbox from './components/MessagesInbox';
import MarketplaceManager from './components/MarketplaceManager';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
      {/* Admin Sub-pages */}
      <Route path="/admin/blog" element={<BlogManager />} />
      <Route path="/admin/portfolio" element={<PortfolioEditor />} />
      <Route path="/admin/projects" element={<ProjectsManager />} />
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
      <Route path="/admin/marketplace-manager" element={<Navigate to="/admin/marketplace" replace />} />
      <Route path="/admin/marketplace-manager.html" element={<Navigate to="/admin/marketplace" replace />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
