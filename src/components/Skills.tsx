import { motion } from 'motion/react';
import { Code2, Globe, Database, PieChart, Activity, BrainCircuit, Wrench, Sparkles } from 'lucide-react';

const skillCategories = [
  {
    title: "Data Analysis",
    icon: <Activity className="w-6 h-6" />,
    skills: ["Pandas", "NumPy", "Power BI", "Tableau", "Excel"],
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20"
  },
  {
    title: "Programming",
    icon: <Code2 className="w-6 h-6" />,
    skills: ["Python", "SQL", "R", "C/C++", "Java", "MATLAB"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  },
  {
    title: "Databases",
    icon: <Database className="w-6 h-6" />,
    skills: ["Oracle", "MySQL", "NoSQL", "MongoDB"],
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20"
  },
  {
    title: "Machine Learning / DL",
    icon: <BrainCircuit className="w-6 h-6" />,
    skills: ["Scikit-learn", "TensorFlow", "Keras"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  },
  {
    title: "Prompt Engineering",
    icon: <Sparkles className="w-6 h-6" />,
    skills: ["Leonardo.AI", "DALL-E", "GPT", "ChatGPT", "Chain-of-Thought"],
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20"
  },
  {
    title: "Web",
    icon: <Globe className="w-6 h-6" />,
    skills: ["HTML", "CSS"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  }
];

export default function Skills() {
  return (
    <section id="skills" className="relative z-10 container mx-auto px-6 py-24">
      <div className="mb-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
        >
          Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Skills</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-600 max-w-2xl mx-auto"
        >
          A comprehensive toolkit for extracting insights, building models, and delivering data-driven solutions.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {skillCategories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-sm hover:bg-slate-50 transition-all duration-300 group hover:-translate-y-1 shadow-sm`}
          >
            <div className={`w-12 h-12 rounded-xl ${category.bgColor} ${category.color} flex items-center justify-center mb-6 border ${category.borderColor} group-hover:scale-110 transition-transform duration-300`}>
              {category.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{category.title}</h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map(skill => (
                <span 
                  key={skill} 
                  className="px-3 py-1 text-xs font-medium rounded-full bg-slate-50 text-slate-600 border border-slate-200 group-hover:border-slate-300 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
