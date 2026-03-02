import { motion } from 'motion/react';
import { ExternalLink, Mail, Briefcase, Sparkles, DollarSign, Clock, TrendingUp, Layers, Send } from 'lucide-react';

export default function WorkWithMe() {
  return (
    <section id="work-with-me" className="relative z-10 py-24 bg-[#0a0f1e] border-y border-slate-800">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-teal-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-display text-white mb-4"
          >
            Work With <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-yellow-500">Me</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Available across multiple platforms for data analysis, AI prompt engineering, and freelance projects.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1: Upwork */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl bg-slate-900/50 border border-green-500/20 p-8 hover:border-green-500/50 transition-all duration-300 flex flex-col h-full shadow-lg shadow-green-900/10 hover:shadow-green-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-green-500/20 transition-colors"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6 border border-green-500/20 shrink-0">
              <Briefcase className="w-7 h-7" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Upwork</h3>
            <p className="text-slate-400 text-sm mb-6 flex-grow">
              Hire me for dedicated data science and analysis contracts.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>$10/hr Rate</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Open to Contract-to-Hire</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Specialty</p>
              <div className="flex flex-wrap gap-2">
                {["Data Analysis", "ML", "Dashboards"].map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-green-400 border border-green-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <a 
              href="https://www.upwork.com/" 
              target="_blank" 
              rel="noreferrer"
              className="mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Hire on Upwork
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Card 2: PromptBase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl bg-slate-900/50 border border-yellow-500/20 p-8 hover:border-yellow-500/50 transition-all duration-300 flex flex-col h-full shadow-lg shadow-yellow-900/10 hover:shadow-yellow-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-yellow-500/20 transition-colors"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-6 border border-yellow-500/20 shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">PromptBase</h3>
            <p className="text-slate-400 text-sm mb-6 flex-grow">
              Discover my engineered prompts for AI models.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                <span>Rank #1899 (@camih8)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Layers className="w-4 h-4 text-yellow-500" />
                <span>220+ Published Prompts</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Specialty</p>
              <div className="flex flex-wrap gap-2">
                {["AI Prompt Engineering", "Leonardo.AI", "ChatGPT"].map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-yellow-400 border border-yellow-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <a 
              href="https://promptbase.com/profile/camih8" 
              target="_blank" 
              rel="noreferrer"
              className="mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse My Prompts
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Card 3: Direct Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative overflow-hidden rounded-3xl bg-slate-900/50 border border-teal-500/20 p-8 hover:border-teal-500/50 transition-all duration-300 flex flex-col h-full shadow-lg shadow-teal-900/10 hover:shadow-teal-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-teal-500/20 transition-colors"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-6 border border-teal-500/20 shrink-0">
              <Mail className="w-7 h-7" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Direct Contact</h3>
            <p className="text-slate-400 text-sm mb-6 flex-grow">
              Reach out directly for custom inquiries or part-time roles.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-teal-500" />
                <span className="break-all">hmidanihicham8@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Clock className="w-4 h-4 text-teal-500" />
                <span>Remote Part-Time</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Available For</p>
              <div className="flex flex-wrap gap-2">
                {["Freelance Projects", "Part-Time Roles", "Consulting"].map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-teal-400 border border-teal-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <a 
              href="mailto:hmidanihicham8@gmail.com" 
              className="mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Send Email
              <Send className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
