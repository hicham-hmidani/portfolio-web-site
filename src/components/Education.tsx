import { motion } from 'motion/react';
import { GraduationCap, Award, ExternalLink, CheckCircle2, Building, Calendar, Globe, ArrowRight } from 'lucide-react';

const education = [
  {
    degree: "Master in Science and Technology",
    institution: "Faculty of Science and Technology, Errachidia",
    period: "2021 – 2023",
    field: "Computer Science and Complex Systems Engineering",
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    degree: "Bachelor of Science and Technology",
    institution: "Faculty of Science and Technology, Errachidia",
    period: "2020 – 2021",
    field: "Engineering and Management of Industrial Systems",
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    degree: "Baccalaureate",
    institution: "New Secondary School, Erfoud",
    period: "2016 – 2017",
    field: "Physical Sciences",
    icon: <GraduationCap className="w-5 h-5" />
  }
];

const googleCertifications = [
  {
    title: "Foundations: Data, Data, Everywhere",
    issuer: "Google",
    platform: "Coursera",
    date: "Nov 15, 2023",
    verifyUrl: "https://coursera.org/verify/3BCNC5V2AFSE",
    color: "bg-blue-500",
    glow: "shadow-blue-500/20",
    border: "border-blue-500/30"
  },
  {
    title: "Ask Questions to Make Data-Driven Decisions",
    issuer: "Google",
    platform: "Coursera",
    date: "Nov 23, 2023",
    verifyUrl: "https://coursera.org/verify/CLGY38CCZL6V",
    color: "bg-red-500",
    glow: "shadow-red-500/20",
    border: "border-red-500/30"
  },
  {
    title: "Prepare Data for Exploration",
    issuer: "Google",
    platform: "Coursera",
    date: "Dec 11, 2023",
    verifyUrl: "https://coursera.org/verify/T39GTBBZDJD2",
    color: "bg-yellow-500",
    glow: "shadow-yellow-500/20",
    border: "border-yellow-500/30"
  },
  {
    title: "Process Data from Dirty to Clean",
    issuer: "Google",
    platform: "Coursera",
    date: "Feb 15, 2024",
    verifyUrl: "https://coursera.org/verify/VV43T82XLDV6",
    color: "bg-green-500",
    glow: "shadow-green-500/20",
    border: "border-green-500/30"
  }
];

const specializedCertifications = [
  {
    title: "Prompt Engineering for ChatGPT",
    issuer: "Vanderbilt University",
    platform: "Coursera",
    date: "Dec 18, 2023",
    verifyUrl: "https://coursera.org/verify/MX4YZBY9F57E",
    badge: "University Certificate",
    note: "Authorized by a top-ranked US university",
    color: "bg-amber-500",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/50",
    special: true
  },
  {
    title: "Data Analysis with Python",
    issuer: "IBM",
    platform: "CognitiveClass.ai",
    date: "Nov 21, 2023",
    courseId: "DA0101EN",
    verifyUrl: "https://courses.cognitiveclass.ai/certificates/250a1fb56ee0453b99ed8b5ce8b12fca",
    color: "bg-blue-600",
    glow: "shadow-blue-600/20",
    border: "border-blue-600/30"
  },
  {
    title: "SQL for Data Science",
    issuer: "Great Learning Academy",
    platform: "Great Learning",
    date: "Nov 2023",
    verifyUrl: "https://mygreatlearning.com/certificate/WZBXPOHY",
    color: "bg-teal-500",
    glow: "shadow-teal-500/20",
    border: "border-teal-500/30"
  }
];

export default function Education() {
  return (
    <section id="education" className="relative z-10 py-24 bg-slate-50 text-slate-900 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-display mb-4"
          >
            Education & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Certifications</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-600 max-w-2xl mx-auto"
          >
            A comprehensive roadmap of my academic background and professional certifications.
          </motion.p>
        </div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20"
        >
          {[
            { label: 'Certifications', val: '7', icon: <Award className="w-5 h-5" /> },
            { label: 'Institutions', val: '4', icon: <Building className="w-5 h-5" /> },
            { label: 'Timeline', val: 'Nov 23 - Feb 24', icon: <Calendar className="w-5 h-5" /> },
            { label: 'Verification', val: '100% Clickable', icon: <Globe className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="text-teal-600 mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-slate-900 mb-1">{stat.val}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          
          {/* Education Column (4/12) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-display">Academic Path</h3>
            </div>

            <div className="space-y-6">
              {education.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-px before:bg-slate-200 last:before:hidden"
                >
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors group">
                    <div className="text-xs font-bold text-teal-600 mb-1">{item.period}</div>
                    <h4 className="text-lg font-bold font-display text-slate-900 mb-1 leading-tight group-hover:text-teal-600 transition-colors">
                      {item.degree}
                    </h4>
                    <div className="text-slate-600 text-sm mb-3">{item.field}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-2">
                      <Building className="w-3.5 h-3.5" />
                      {item.institution}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications Column (8/12) */}
          <div className="lg:col-span-8">
            {/* Category 1: Google Path */}
            <div className="mb-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold font-display">Google Data Analytics</h3>
                  </div>
                  <p className="text-sm text-slate-500">Professional Certificate Path</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 min-w-[240px] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600">Progress: 4/8 Courses</span>
                    <span className="text-xs text-slate-500">In Progress</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '50%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Roadmap connecting lines for desktop */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -translate-y-1/2 pointer-events-none" />
                
                {googleCertifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`group relative p-6 rounded-2xl bg-white border ${cert.border} shadow-sm hover:shadow-md transition-all hover:-translate-y-1`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${cert.color} flex items-center justify-center text-white shadow-lg`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
                        Step {index + 1}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {cert.title}
                    </h4>
                    <div className="text-xs text-slate-500 mb-4">
                      {cert.issuer} | Via {cert.platform}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-slate-500 font-medium">{cert.date}</span>
                      <a 
                        href={cert.verifyUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-500 flex items-center gap-1"
                      >
                        Verify <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Category 2: Specialized */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 border border-teal-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-display">Specialized Certifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specializedCertifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`group p-6 rounded-2xl bg-white border ${cert.border} shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col h-full`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${cert.color} flex items-center justify-center text-white shadow-xl`}>
                        <Award className="w-7 h-7" />
                      </div>
                      {cert.badge && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded border border-amber-500/50 text-amber-600 uppercase tracking-wider">
                          {cert.badge}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-teal-600 transition-colors">
                      {cert.title}
                    </h4>
                    
                    <div className="text-sm text-slate-600 mb-2">
                      {cert.issuer} <span className="text-slate-300 mx-1">|</span> Via {cert.platform}
                    </div>
                    
                    {cert.courseId && (
                      <div className="text-[10px] text-slate-400 mb-2 font-mono">ID: {cert.courseId}</div>
                    )}
                    
                    {cert.note && (
                      <p className="text-xs text-slate-500 italic mb-4">{cert.note}</p>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs text-slate-500">{cert.date}</span>
                      <a 
                        href={cert.verifyUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-900 transition-all border border-slate-200"
                      >
                        Verify Certificate
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
