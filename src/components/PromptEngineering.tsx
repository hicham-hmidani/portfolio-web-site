import { motion } from 'motion/react';
import { Sparkles, ExternalLink, TrendingUp, Calendar, Layers, Quote, Bot, ShoppingCart } from 'lucide-react';

export default function PromptEngineering() {
  const categories = [
    'Leonardo.AI Image Prompts',
    'DALL-E Prompts',
    'ChatGPT Business Prompts'
  ];

  const featuredPrompts = [
    { title: "Cinematic Sci-Fi Cityscapes", platform: "Leonardo.AI", price: "$4.99" },
    { title: "Minimalist Logo Generator", platform: "DALL-E 3", price: "$4.99" },
    { title: "SaaS Marketing Copywriter", platform: "ChatGPT", price: "$4.99" },
    { title: "Hyper-Realistic Wildlife", platform: "Leonardo.AI", price: "$4.99" },
    { title: "Boho Interior Design", platform: "DALL-E 3", price: "$4.99" },
    { title: "SEO Blog Post Architect", platform: "ChatGPT", price: "$4.99" },
    { title: "Vintage Coloring Book Art", platform: "Leonardo.AI", price: "$4.99" },
    { title: "Executive Summary Builder", platform: "ChatGPT", price: "$4.99" },
  ];

  return (
    <section id="prompt-engineering" className="relative z-10 py-24 bg-white border-y border-slate-200">
      {/* Background glow specific to this section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

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
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-yellow-500 p-0.5 shadow-lg shadow-slate-200 shrink-0">
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
                <h3 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
                  @camih8
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-600">
                    <Sparkles className="w-3 h-3" />
                  </span>
                </h3>
                <p className="text-slate-500 font-medium text-sm mt-1">PromptBase Marketplace</p>
              </div>
            </div>
            <a 
              href="https://promptbase.com/profile/camih8" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-teal-500/20 w-full md:w-auto justify-center"
            >
              Visit My PromptBase Profile
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 relative z-10">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 hover:border-teal-300 transition-colors shadow-sm">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <TrendingUp className="w-6 h-6"/>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Global Rank</p>
                <p className="text-2xl font-bold font-display text-slate-900">#1899</p>
              </div>
            </div>
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 hover:border-teal-300 transition-colors shadow-sm">
              <div className="p-3 rounded-xl bg-teal-100 text-teal-600">
                <Layers className="w-6 h-6"/>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Prompts</p>
                <p className="text-2xl font-bold font-display text-slate-900">67+</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 hover:border-teal-300 transition-colors shadow-sm">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Calendar className="w-6 h-6"/>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-xl font-bold font-display text-slate-900">Dec 2023</p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="relative p-8 rounded-2xl bg-slate-100 border border-slate-200 mb-10 relative z-10">
            <Quote className="absolute top-4 left-4 w-10 h-10 text-slate-200" />
            <p className="text-lg md:text-xl text-slate-700 italic text-center relative z-10 font-medium leading-relaxed px-4">
              "AI Prompt Architect building high-performance visual and business systems. From cinematic design to SaaS frameworks — engineered for real results."
            </p>
          </div>

          {/* Categories */}
          <div className="relative z-10 mb-12">
            <p className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Specialized Categories</p>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <span 
                  key={cat} 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-slate-700 border border-slate-200 text-sm font-medium hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Prompts Grid */}
          <div className="relative z-10 border-t border-slate-200 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold font-display text-slate-900">Featured Prompts</h4>
              <span className="text-sm text-teal-600 font-medium">All at $4.99</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredPrompts.map((prompt, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-300 transition-all group flex flex-col h-full shadow-sm">
                  <div className="text-xs font-medium text-teal-600 mb-2">{prompt.platform}</div>
                  <h5 className="text-sm font-bold text-slate-800 mb-4 flex-grow group-hover:text-teal-600 transition-colors">{prompt.title}</h5>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">{prompt.price}</span>
                    <a href="https://promptbase.com/profile/camih8" target="_blank" rel="noreferrer" className="p-1.5 rounded-md bg-slate-50 text-slate-500 hover:text-teal-600 hover:bg-slate-100 transition-colors border border-slate-200">
                      <ShoppingCart className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
