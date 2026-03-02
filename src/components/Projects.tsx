import { motion } from 'motion/react';
import { Coffee, Activity, Sun, Car, ArrowUpRight, Github, BarChart3, Lightbulb, LayoutDashboard } from 'lucide-react';

const projects = [
  {
    title: "Road Accident Dashboard",
    tool: "Microsoft Excel",
    description: "Interactive dashboard with 417,883 total casualties analyzed across vehicle types, road surfaces, light conditions.",
    stats: [
      { icon: "🚨", label: "Total Casualties", value: "417,883" },
      { icon: "☠️", label: "Fatal", value: "7,135 (1.7%)" },
      { icon: "⚠️", label: "Serious", value: "59,312 (14.2%)" },
      { icon: "✅", label: "Slight", value: "351,436 (84.1%)" }
    ],
    visuals: "KPI cards, monthly trend line chart (CY vs PY), casualties by vehicle type, road surface pie chart, location donut chart, light condition donut chart, filter panel",
    insights: "Cars = 79.8% of casualties | Single carriageway = most dangerous road | 62.4% accidents in daylight",
    tags: ["Excel", "Data Visualization", "Road Safety"],
    githubLink: "https://github.com/hicham-hmidani/Road-Accident-Dashboard/blob/main/Road%20Accident%20Dashboard.md",
    icon: <Car className="w-6 h-6" />,
    accent: "from-yellow-400 to-yellow-500",
    hoverBorder: "group-hover:border-yellow-500/50",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-400"
  },
  {
    title: "Coffee Sales Dashboard",
    tool: "Microsoft Excel",
    description: "Sales analytics dashboard tracking coffee product performance across countries and customers.",
    stats: [
      { icon: "🇺🇸", label: "Top Market", value: "$5,449" },
      { icon: "🇮🇪", label: "Ireland", value: "$1,295" },
      { icon: "☕", label: "Coffee Types", value: "4 Varieties" },
      { icon: "👑", label: "Top Customer", value: "$248" }
    ],
    visuals: "Timeline slicer (2019–2020), total sales over time line chart, sales by country bar chart, top 5 customers bar chart, roast type & loyalty card filters",
    insights: "Top Markets: US ($5,449), Ireland ($1,295), UK ($562) | Types: Arabica, Excelsa, Liberica, Robusta | Sizes: 0.2kg, 0.5kg, 1.0kg, 2.5kg | Top Customer: Brenn Dundredge",
    tags: ["Excel", "Sales Analysis", "Dashboard", "Business Intelligence"],
    githubLink: "https://github.com/hicham-hmidani/PortfolioProjects/blob/main/Coffee%20Sales%20Dashboard",
    icon: <Coffee className="w-6 h-6" />,
    accent: "from-teal-400 to-teal-500",
    hoverBorder: "group-hover:border-teal-500/50",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-400"
  },
  {
    title: "SuperMarkets Sales Dashboard",
    tool: "Microsoft Excel",
    description: "Data visualization dashboard analyzing supermarket sales performance.",
    tags: ["Excel", "Dashboard", "Sales Analytics"],
    icon: <BarChart3 className="w-6 h-6" />,
    accent: "from-green-400 to-green-500",
    hoverBorder: "group-hover:border-green-500/50",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500"
  },
  {
    title: "Covid-19 Data Analysis",
    tool: "SQL Server Management Studio",
    description: "Deep analysis of global Covid-19 data using advanced SQL queries.",
    tags: ["SQL", "Data Analysis", "Public Health", "SSMS"],
    icon: <Activity className="w-6 h-6" />,
    accent: "from-rose-400 to-red-500",
    hoverBorder: "group-hover:border-rose-500/50",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-400"
  },
  {
    title: "Titanic Survival Prediction",
    tool: "Python, Scikit-learn",
    description: "Machine learning classification model predicting passenger survival.",
    tags: ["Python", "Scikit-learn", "ML", "Classification"],
    icon: <Activity className="w-6 h-6" />,
    accent: "from-teal-400 to-teal-500",
    hoverBorder: "group-hover:border-teal-500/50",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-400"
  },
  {
    title: "Traffic Sign Classification",
    tool: "Deep Learning",
    description: "Deep learning classification model designed to accurately identify and categorize various traffic signs for autonomous systems.",
    tags: ["Deep Learning", "Computer Vision", "Neural Networks"],
    icon: <Car className="w-6 h-6" />,
    accent: "from-yellow-400 to-yellow-500",
    hoverBorder: "group-hover:border-yellow-500/50",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-400"
  }
];

export default function Projects() {
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
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${project.hoverBorder} backdrop-blur-sm flex flex-col h-full ${project.stats ? 'lg:col-span-2' : ''}`}
          >
            {/* Top Accent Gradient Line */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${project.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${project.iconBg} ${project.iconColor} border border-slate-200 group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                  {project.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-yellow-500 transition-all">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500/50"></span>
                    {project.tool}
                  </p>
                </div>
              </div>
              {project.githubLink && (
                <a href={project.githubLink} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-teal-600 hover:bg-slate-100 border border-slate-200 hover:border-teal-200 transition-all group/btn shadow-sm">
                  <Github className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </a>
              )}
            </div>
            
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              {project.description}
            </p>

            {/* Detailed Stats & Insights (Only for detailed projects like Project 1) */}
            {project.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {project.stats.map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center shadow-sm">
                    <span className="text-xl mb-1">{stat.icon}</span>
                    <span className="text-xs font-medium text-slate-500 mb-1">{stat.label}</span>
                    <span className="text-sm font-bold text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}

            {(project.visuals || project.insights) && (
              <div className="space-y-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                {project.visuals && (
                  <div className="flex items-start gap-3">
                    <LayoutDashboard className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block mb-1">Visuals Included</span>
                      <p className="text-sm text-slate-600 leading-relaxed">{project.visuals}</p>
                    </div>
                  </div>
                )}
                {project.insights && (
                  <div className="flex items-start gap-3 pt-4 border-t border-slate-200">
                    <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block mb-1">Key Insights</span>
                      <p className="text-sm text-slate-600 leading-relaxed">{project.insights}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-slate-200">
              {project.tags.map((tag, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 group-hover:border-slate-300 transition-colors flex items-center gap-1.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
