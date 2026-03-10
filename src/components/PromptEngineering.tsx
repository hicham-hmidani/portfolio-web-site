import { motion } from 'motion/react';
import { ExternalLink, CheckCircle2, FolderOpen, Bot, LayoutGrid, Star } from 'lucide-react';

export default function PromptEngineering() {
  const platforms = [
    { name: 'DALL-E', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: '🟡' },
    { name: 'Leonardo AI', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: '🔵' },
    { name: 'GPT', color: 'bg-green-100 text-green-700 border-green-200', dot: '🟢' },
    { name: 'Midjourney', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: '🟣' },
    { name: 'DeepSeek', color: 'bg-red-100 text-red-700 border-red-200', dot: '🔴' },
    { name: 'ChatGPT Image', color: 'bg-stone-100 text-stone-700 border-stone-200', dot: '🟤' },
    { name: 'Hailuo', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: '⚪' },
  ];

  const categories = [
    'Coloring Books', 'Interior Design', 'Movie Posters', 'KDP/Amazon Publishing',
    'Food Photography', 'Wildlife', 'Anime', 'Mobile Wallpapers', 'Business/SaaS',
    'Gaming Setup', 'Vehicle Art', 'Notebook/Planner Covers', 'Product Photography'
  ];

  return (
    <section id="prompt-engineering" className="relative z-10 py-24 bg-white border-y border-slate-200">
      {/* Background glow specific to this section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
          >
            AI Prompt <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Engineering</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-600 max-w-2xl mx-auto"
          >
            Crafting precise, high-performance prompts for visual and business AI systems.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-xl shadow-slate-200/50 relative overflow-hidden group"
        >
          {/* Card inner glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>

          {/* Profile Header Card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-yellow-500 p-0.5 shadow-lg shadow-slate-200 shrink-0">
                <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/promptbase.appspot.com/o/DALLE_IMAGES%2FuoYVPMiJa6MWP84cKAnatb953q92%2F1732361119171.png?alt=media&token=612159c0-a0d0-403f-a8cb-2b1c247017ad" 
                    alt="Hicham Hmidani PromptBase Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PromptBase.com</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs font-bold text-teal-600">@camih8</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900 mb-2">
                  Hicham Hmidani
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-slate-900">Rank:</span> #1899 globally
                  </span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-slate-900">Member since:</span> Dec 2023
                  </span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All 220+ Approved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row (4 animated counter boxes) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center hover:border-teal-300 transition-colors shadow-sm"
            >
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mb-3">
                <FolderOpen className="w-6 h-6"/>
              </div>
              <p className="text-2xl font-bold font-display text-slate-900 mb-1">220+</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Prompts Published</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center hover:border-teal-300 transition-colors shadow-sm"
            >
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 mb-3">
                <Bot className="w-6 h-6"/>
              </div>
              <p className="text-2xl font-bold font-display text-slate-900 mb-1">7</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Platforms</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center hover:border-teal-300 transition-colors shadow-sm"
            >
              <div className="p-3 rounded-xl bg-orange-50 text-orange-600 mb-3">
                <LayoutGrid className="w-6 h-6"/>
              </div>
              <p className="text-2xl font-bold font-display text-slate-900 mb-1">13+</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Niche Categories</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center hover:border-teal-300 transition-colors shadow-sm"
            >
              <div className="p-3 rounded-xl bg-green-50 text-green-600 mb-3">
                <Star className="w-6 h-6"/>
              </div>
              <p className="text-2xl font-bold font-display text-slate-900 mb-1">100%</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Approval Rate</p>
            </motion.div>
          </div>

          {/* Platforms Badge Row */}
          <div className="relative z-10 mb-10">
            <p className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider text-center md:text-left">Platforms Covered</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {platforms.map(platform => (
                <span 
                  key={platform.name} 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${platform.color} shadow-sm`}
                >
                  <span>{platform.dot}</span> {platform.name}
                </span>
              ))}
            </div>
          </div>

          {/* Categories Tag Cloud */}
          <div className="relative z-10 mb-12">
            <p className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider text-center md:text-left">Specialized Categories</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {categories.map(cat => (
                <span 
                  key={cat} 
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 text-sm hover:border-teal-300 hover:text-teal-700 transition-colors shadow-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="relative z-10 text-center md:text-left mt-8">
            <a 
              href="https://promptbase.com/profile/camih8" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/25 w-full md:w-auto"
            >
              Browse All 220+ Prompts
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
