import { motion } from 'motion/react';
import { GraduationCap, Award, BookOpen, Building } from 'lucide-react';

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
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    degree: "Baccalaureate",
    institution: "New Secondary School, Erfoud",
    period: "2016 – 2017",
    field: "Physical Sciences",
    icon: <Building className="w-5 h-5" />
  }
];

const certifications = [
  {
    title: "Ask Question to Make Data Driven Decisions",
    issuer: "Google / Coursera",
    date: "November 23, 2023",
    icon: <Award className="w-5 h-5" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30"
  },
  {
    title: "Data Analysis With Python",
    issuer: "IBM / Cognitive Class",
    date: "November 21, 2023",
    icon: <Award className="w-5 h-5" />,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30"
  },
  {
    title: "SQL For Data Science",
    issuer: "Great Learning Academy",
    date: "November 4, 2023",
    icon: <Award className="w-5 h-5" />,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30"
  }
];

export default function Education() {
  return (
    <section id="education" className="relative z-10 container mx-auto px-6 py-24">
      <div className="mb-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
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
          My academic background and continuous learning achievements.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* Education Column */}
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 border border-yellow-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900">Education</h3>
          </motion.div>

          <div className="space-y-6">
            {education.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-px before:bg-slate-200 last:before:hidden"
              >
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                </div>
                
                <div className="p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-sm hover:bg-slate-50 transition-colors group shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h4 className="text-lg font-bold font-display text-slate-900 group-hover:text-yellow-600 transition-colors">
                      {item.degree}
                    </h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 whitespace-nowrap">
                      {item.period}
                    </span>
                  </div>
                  <div className="text-teal-600 font-medium text-sm mb-2">
                    {item.field}
                  </div>
                  <div className="text-slate-600 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    {item.institution}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Certifications Column */}
        <div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600 border border-teal-200">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900">Certifications</h3>
          </motion.div>

          <div className="space-y-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-sm hover:bg-slate-50 transition-all hover:-translate-y-1 group shadow-sm"
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${cert.borderColor} ${cert.bgColor} ${cert.color} group-hover:scale-110 transition-transform duration-300`}>
                  {cert.icon}
                </div>
                
                <div>
                  <h4 className="text-lg font-bold font-display text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-yellow-500 transition-all">
                    {cert.title}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-slate-400" />
                      {cert.issuer}
                    </span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-slate-500">
                      {cert.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
