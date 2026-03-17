import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coffee, Activity, Car, ArrowUpRight, Github, BarChart3, Lightbulb, LayoutDashboard, Database, Code2, Layers } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

interface Project {
  id: string;
  title: string;
  description: string;
  tools: string[];
  githubUrl: string;
  demoUrl: string;
  stats: string;
  featured: boolean;
  platform: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getProjectIcon = (platform: string) => {
    switch (platform) {
      case 'Excel': return <BarChart3 className="w-6 h-6" />;
      case 'Python': return <Code2 className="w-6 h-6" />;
      case 'SQL': return <Database className="w-6 h-6" />;
      case 'Power BI': return <BarChart3 className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
  };

  const getProjectStyles = (platform: string) => {
    switch (platform) {
      case 'Excel': return {
        accent: "from-green-400 to-green-500",
        hoverBorder: "group-hover:border-green-500/50",
        iconBg: "bg-green-500/10",
        iconColor: "text-green-500"
      };
      case 'Python': return {
        accent: "from-blue-400 to-blue-500",
        hoverBorder: "group-hover:border-blue-500/50",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-400"
      };
      case 'SQL': return {
        accent: "from-teal-400 to-teal-500",
        hoverBorder: "group-hover:border-teal-500/50",
        iconBg: "bg-teal-500/10",
        iconColor: "text-teal-400"
      };
      default: return {
        accent: "from-slate-400 to-slate-500",
        hoverBorder: "group-hover:border-slate-500/50",
        iconBg: "bg-slate-500/10",
        iconColor: "text-slate-400"
      };
    }
  };

  if (loading) return null;

  return (
    <section id="projects" className="relative z-10 container mx-auto px-6 py-24">
      <div className="mb-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
        >
          Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Projects</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-600 max-w-2xl mx-auto"
        >
          A selection of my recent work in data analysis, machine learning, and visualization.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {projects.map((project, index) => {
          const styles = getProjectStyles(project.platform);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${styles.hoverBorder} backdrop-blur-sm flex flex-col h-full`}
            >
              {/* Top Accent Gradient Line */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${styles.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${styles.iconBg} ${styles.iconColor} border border-slate-200 group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                    {getProjectIcon(project.platform)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-yellow-500 transition-all">
                      {project.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500/50"></span>
                      {project.platform}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-teal-600 hover:bg-slate-100 border border-slate-200 hover:border-teal-200 transition-all group/btn shadow-sm">
                      <Github className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-teal-600 hover:bg-slate-100 border border-slate-200 hover:border-teal-200 transition-all group/btn shadow-sm">
                      <ArrowUpRight className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
              
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                {project.description}
              </p>

              {project.stats && (
                <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block mb-1">Key Impact</span>
                      <p className="text-sm text-slate-600 leading-relaxed">{project.stats}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-slate-200">
                {project.tools?.map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 group-hover:border-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
