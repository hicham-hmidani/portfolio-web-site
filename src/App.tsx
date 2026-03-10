import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Mail, MapPin, ChevronRight, Database, BarChart, Code2, Menu, X } from 'lucide-react';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import PromptEngineering from './components/PromptEngineering';
import WorkWithMe from './components/WorkWithMe';
import FeaturedService from './components/FeaturedService';
import Blog from './components/Blog';
import Education from './components/Education';
import Contact from './components/Contact';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);

  const titles = ["Junior Data Analyst/Scientist", "AI Prompt Engineer", "Database Administrator-MI"];

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'AI Prompts', href: '#prompt-engineering' },
    { name: 'Hire Me', href: '#work-with-me' },
    { name: 'Blog', href: '#blog' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/30 overflow-x-hidden relative">
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Sticky Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#" className="text-xl font-bold font-display tracking-tighter text-slate-900 flex items-center gap-2 z-50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-yellow-500 flex items-center justify-center text-sm text-white">
              H
            </div>
            Hicham<span className="text-teal-600">.</span>
          </a>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="hover:text-teal-600 transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-600 hover:text-teal-600 z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 py-6 px-6 flex flex-col gap-4 md:hidden shadow-2xl"
            >
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-600 hover:text-teal-600 transition-colors py-2 border-b border-slate-100"
                >
                  {link.name}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main id="about" className="relative z-10 container mx-auto px-6 pt-32 pb-32 md:pt-40 md:pb-40 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Text Content */}
        <div className="flex-1 flex flex-col items-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-green-600 text-xs font-medium shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Available for Freelance
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-teal-600 text-xs font-medium shadow-sm backdrop-blur-sm">
              <span className="font-bold">$10/hr</span> on Upwork
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight text-slate-900 mb-6 leading-[1.1]"
          >
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Hicham Hmidani</span>
            <br />
            <span className="inline-block min-w-[300px] text-slate-600">
              <AnimatePresence mode="wait">
                <motion.span
                  key={titleIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block"
                >
                  {titles[titleIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed"
          >
            A diligent and detail-oriented Junior Data Analyst/Scientist, AI Prompt Engineer, and Database Administrator holding a Master's degree in Computer Science and Complex Systems Engineering. I have a solid foundation in statistical analysis, machine learning, prompt engineering, and domain name investing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <a 
              href="#projects" 
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-md shadow-teal-500/20"
            >
              View My Work
              <ChevronRight className="w-4 h-4" />
            </a>
            <a 
              href="#contact" 
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold transition-all border border-slate-200 hover:border-slate-300 hover:scale-105 active:scale-95 shadow-sm backdrop-blur-sm"
            >
              Contact Me
              <Mail className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-slate-600"
          >
            <div className="flex items-center gap-4">
              <a href="https://github.com/hicham-hmidani" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white border border-slate-200 hover:text-teal-600 hover:border-teal-500/30 transition-all shadow-sm">
                <span className="sr-only">GitHub</span>
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/in/hicham-hmidani-b55a5521b/" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white border border-slate-200 hover:text-teal-600 hover:border-teal-500/30 transition-all shadow-sm">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-teal-600" />
              Ouarzazate, Morocco
            </div>
          </motion.div>
        </div>

        {/* Visual / Image Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 relative w-full max-w-md lg:max-w-none flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-[400px] aspect-square">
            {/* Decorative circles */}
            <div className="absolute inset-0 rounded-full border border-slate-200 bg-slate-50/50 backdrop-blur-3xl"></div>
            <div className="absolute inset-8 rounded-full border border-slate-200 bg-white/50"></div>
            
            {/* Abstract data lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30 animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-teal-600" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-yellow-500" strokeDasharray="2 6" />
            </svg>

            {/* Profile Image */}
            <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-white shadow-2xl shadow-slate-200/50 bg-slate-100">
               <img 
                 src="https://avatars.githubusercontent.com/u/112251991?v=4" 
                 alt="Hicham Hmidani" 
                 className="w-full h-full object-cover transition-all duration-700" 
                 referrerPolicy="no-referrer"
               />
            </div>

            {/* Floating skill badges */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 -left-6 bg-white/90 border border-slate-200 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3"
            >
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-700 font-medium">Python & ML</div>
                <div className="text-[10px] text-slate-500">Scikit-learn, TensorFlow</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-12 -right-8 bg-white/90 border border-slate-200 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3"
            >
              <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                <BarChart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-700 font-medium">Data Analytics</div>
                <div className="text-[10px] text-slate-500">Power BI, Tableau</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-4 left-12 bg-white/90 border border-slate-200 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3"
            >
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-700 font-medium">Databases</div>
                <div className="text-[10px] text-slate-500">SQL, MongoDB</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </main>

      {/* Skills Section */}
      <Skills />

      {/* Experience Section */}
      <Experience />

      {/* Projects Section */}
      <Projects />

      {/* AI Prompt Engineering Section */}
      <PromptEngineering />

      {/* Work With Me Section */}
      <WorkWithMe />

      {/* Featured Service Section */}
      <FeaturedService />

      {/* Blog Section */}
      <Blog />

      {/* Education Section */}
      <Education />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 text-sm bg-slate-50">
        <p>© {new Date().getFullYear()} Hicham Hmidani. All rights reserved.</p>
      </footer>
    </div>
  );
}
