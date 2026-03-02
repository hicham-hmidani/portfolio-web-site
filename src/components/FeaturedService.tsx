import { motion } from 'motion/react';
import { ExternalLink, Clock, DollarSign, Star } from 'lucide-react';

export default function FeaturedService() {
  return (
    <section id="featured-service" className="relative z-10 py-24 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
          >
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-500">Service</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-600 max-w-2xl mx-auto"
          >
            Premium offerings available on Upwork Project Catalog.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="group relative overflow-hidden rounded-3xl bg-[#0a0f1e] border-2 border-yellow-500/30 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-500/50 flex flex-col md:flex-row gap-8 items-center">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-wide uppercase mb-6">
                <Star className="w-3.5 h-3.5 fill-yellow-500" />
                Upwork Project Catalog
              </div>
              
              <h4 className="text-2xl md:text-3xl font-bold font-display text-white mb-4 leading-tight">
                "You will get a Custom Professional Excel Dashboard with Advanced Analytics"
              </h4>
              
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                Need a powerful Excel dashboard? Get a fully custom, professional dashboard with advanced analytics tailored to your business data.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-8 md:mb-0">
                <div className="flex items-center gap-2 text-white">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">Starting Price</span>
                    <span className="font-bold text-lg">From $100</span>
                  </div>
                </div>
                
                <div className="w-px h-10 bg-slate-800 hidden sm:block"></div>
                
                <div className="flex items-center gap-2 text-white">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">Delivery Time</span>
                    <span className="font-bold text-lg">3 Days</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto shrink-0 relative z-10">
              <a 
                href="https://www.upwork.com/" 
                target="_blank" 
                rel="noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20 text-lg"
              >
                Order on Upwork
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
