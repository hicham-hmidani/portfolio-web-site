import { motion } from 'motion/react';
import { Briefcase, Database, Code, LineChart, Sparkles } from 'lucide-react';

const experiences = [
  {
    title: "Database Management Administrator",
    company: "Moroccan Ministry of Interior",
    date: "May 2024 – Present",
    icon: <Database className="w-5 h-5" />,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    description: [
      "Managing and optimizing database systems to ensure data integrity, security, and high availability.",
      "Performing regular backups, monitoring performance, and troubleshooting database issues."
    ]
  },
  {
    title: "Freelance Data Analyst",
    company: "Upwork",
    date: "Open to Offers",
    icon: <LineChart className="w-5 h-5" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    badge: "$10/hr",
    link: "https://www.upwork.com/",
    description: [
      "Transforming raw data into meaningful insights.",
      "Building custom professional Excel dashboards with advanced analytics.",
      "Data cleaning, preparation, and visualization (Power BI, Tableau).",
      "Developing machine learning models and predictive analytics."
    ]
  },
  {
    title: "Freelance AI Prompt Engineer",
    company: "PromptBase.com (@camih8)",
    date: "Dec 2023 – Present",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    badge: "🏆 Ranked #1899",
    link: "https://promptbase.com/profile/camih8",
    description: [
      "Published 220+ engineered AI prompts across Leonardo.AI, DALL-E, and ChatGPT categories.",
      "Ranked #1899 globally on PromptBase marketplace.",
      "Specializes in cinematic image prompts, interior design, wildlife photography, coloring book art, and business SaaS frameworks.",
      "Builds high-performance visual and business prompt systems engineered for real-world results."
    ]
  },
  {
    title: "Intern",
    company: "CodeSoft",
    date: "Dec 2023 – Jan 2024",
    icon: <Code className="w-5 h-5" />,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    description: [
      "Data preparation, correction, and exploration.",
      "Creation of prediction and classification algorithms.",
      "Creation of Machine Learning and Deep Learning models.",
      "Testing and optimization of results."
    ]
  },
  {
    title: "Intern",
    company: "AGRO DARAA SARL",
    date: "Feb 2023 – Jul 2023",
    icon: <LineChart className="w-5 h-5" />,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    description: [
      "Forecasting the energy production of a hybrid renewable system.",
      "Study and analysis of chronological data.",
      "Optimization of Machine Learning and Deep Learning models.",
      "Development and production of reports and dashboards."
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="relative z-10 container mx-auto px-6 py-24">
      <div className="mb-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
        >
          Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Experience</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-600 max-w-2xl mx-auto"
        >
          My journey in data analysis, machine learning, and database management.
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Vertical Line */}
        <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2"></div>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Timeline Dot/Icon */}
              <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 border-4 border-slate-50 z-10">
                <div className={`w-full h-full rounded-full flex items-center justify-center border ${exp.borderColor} ${exp.bgColor} ${exp.color}`}>
                  {exp.icon}
                </div>
              </div>

              {/* Content Card */}
              <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                {(() => {
                  const CardWrapper = exp.link ? 'a' : 'div';
                  const wrapperProps = exp.link 
                    ? { href: exp.link, target: "_blank", rel: "noreferrer", className: "block p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-sm hover:bg-slate-50 hover:border-yellow-500/30 transition-all group cursor-pointer shadow-sm" } 
                    : { className: "block p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-sm hover:bg-slate-50 transition-colors group shadow-sm" };
                  
                  return (
                    <CardWrapper {...(wrapperProps as any)}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <h3 className={`text-xl font-bold font-display text-slate-900 transition-colors flex flex-wrap items-center gap-2 ${exp.link ? 'group-hover:text-yellow-600' : 'group-hover:text-teal-600'}`}>
                          {exp.title}
                          {exp.badge && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 whitespace-nowrap">
                              {exp.badge}
                            </span>
                          )}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 whitespace-nowrap">
                          {exp.date}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-600 font-medium mb-4">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className={exp.link ? "group-hover:text-yellow-600 transition-colors" : ""}>{exp.company}</span>
                      </div>

                      <ul className="space-y-2">
                        {exp.description.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500/50 shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardWrapper>
                  );
                })()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
