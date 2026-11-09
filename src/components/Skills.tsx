import { useState, useEffect, useRef } from 'react';
import { Code2, Globe, Database, Activity, BrainCircuit, Sparkles } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useScrollRefresh } from '../hooks/useScrollRefresh';

interface SkillCategory {
  title: string;
  skills: string[];
}

const iconMap: Record<string, React.ReactNode> = {
  "Data Analysis": <Activity className="w-4 h-4 text-[#FF4F00]" />,
  "Programming": <Code2 className="w-4 h-4 text-[#FF4F00]" />,
  "Databases": <Database className="w-4 h-4 text-[#FF4F00]" />,
  "Machine Learning / DL": <BrainCircuit className="w-4 h-4 text-[#FF4F00]" />,
  "Prompt Engineering": <Sparkles className="w-4 h-4 text-[#FF4F00]" />,
  "Web": <Globe className="w-4 h-4 text-[#FF4F00]" />,
};

const defaultCategories: SkillCategory[] = [
  {
    title: "Data Analysis",
    skills: ["Pandas", "NumPy", "Power BI", "Tableau", "Excel"]
  },
  {
    title: "Programming",
    skills: ["Python", "SQL", "R", "C/C++", "Java", "MATLAB"]
  },
  {
    title: "Databases",
    skills: ["Oracle", "MySQL", "NoSQL", "MongoDB"]
  },
  {
    title: "Machine Learning / DL",
    skills: ["Scikit-learn", "TensorFlow", "Keras"]
  },
  {
    title: "Prompt Engineering",
    skills: ["Leonardo.AI", "DALL-E", "GPT", "ChatGPT", "Chain-of-Thought"]
  },
  {
    title: "Web",
    skills: ["HTML", "CSS"]
  }
];

export default function Skills({ folio = '02' }: { folio?: string } = {}) {
  const [categories, setCategories] = useState<SkillCategory[]>(defaultCategories);
  const sectionRef = useRef<HTMLElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);

  // Keep ScrollTrigger calculations accurate as categories change
  useScrollRefresh([categories]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'portfolio_content', 'skills'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories.map((c: any) => ({
            title: c.title || '',
            skills: Array.isArray(c.skills) ? c.skills : []
          })));
        }
      }
    });
    return () => unsub();
  }, []);

  const { contextSafe } = useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced } = context.conditions as { isReduced: boolean };

      // Reduced motion: all elements are immediately visible without animation
      if (isReduced) {
        if (hairlineRef.current) gsap.set(hairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        gsap.set(".skill-category-block", { autoAlpha: 1, y: 0 });
        gsap.set(".skill-chip", { autoAlpha: 1, y: 0 });
        gsap.set(".category-accent-rule", { scaleX: 1 });
        return;
      }

      // 1. Hairline rule that draws with scrub as section enters viewport
      if (hairlineRef.current && sectionRef.current) {
        gsap.fromTo(hairlineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              end: "top 40%",
              scrub: true
            }
          }
        );
      }

      // Initial state before ScrollTrigger.batch fires
      gsap.set(".skill-category-block", { autoAlpha: 0, y: 22 });
      gsap.set(".skill-chip", { autoAlpha: 0, y: 6 });
      gsap.set(".category-accent-rule", { scaleX: 0.25, transformOrigin: "left center" });

      // 2. Category blocks reveal with ScrollTrigger.batch; chips stagger inside each block
      ScrollTrigger.batch(".skill-category-block", {
        interval: 0.1,
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.55,
            ease: "power2.out",
            overwrite: "auto"
          });

          // Stagger chips inside newly entered blocks
          batch.forEach((block) => {
            const chips = block.querySelectorAll(".skill-chip");
            if (chips.length > 0) {
              gsap.to(chips, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.035,
                duration: 0.35,
                ease: "power2.out",
                delay: 0.1,
                overwrite: "auto"
              });
            }
          });
        }
      });
    });
  }, { scope: sectionRef, dependencies: [categories], revertOnUpdate: true });

  // Hover handlers wrapped in contextSafe without CSS transition conflicts
  const handleChipMouseEnter = contextSafe((e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, { y: -2, duration: 0.2, ease: "power2.out" });
  });

  const handleChipMouseLeave = contextSafe((e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: "power2.out" });
  });

  const handleCategoryMouseEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const rule = e.currentTarget.querySelector('.category-accent-rule');
    if (rule) {
      gsap.to(rule, { scaleX: 1, duration: 0.3, ease: "power2.out" });
    }
  });

  const handleCategoryMouseLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const rule = e.currentTarget.querySelector('.category-accent-rule');
    if (rule) {
      gsap.to(rule, { scaleX: 0.25, duration: 0.3, ease: "power2.out" });
    }
  });

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative">
        {/* Section Header with Folio 02 */}
        <div className="flex flex-col items-start mb-6 w-full">
          <div className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                {folio} / SKILLS
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — TECHNICAL PROFICIENCIES
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-wider hidden sm:block">
              {categories.length} DOMAINS
            </div>
          </div>

          {/* Hairline rule that draws with scrub on entrance */}
          <div
            ref={hairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
          />

          {/* Left-Aligned Swiss Headline */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
            Technical <span className="text-[#FF4F00]">Skills</span>
          </h2>
          <p className="text-base text-[#0A0A0A]/70 max-w-2xl leading-relaxed">
            A comprehensive toolkit for statistical data analysis, machine learning model engineering, and scalable database systems.
          </p>
        </div>

        {/* Oversized background folio watermark */}
        <div className="absolute top-10 right-6 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.03] select-none pointer-events-none font-sans z-0">
          {folio}
        </div>

        {/* Category Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {categories.map((category) => (
            <div
              key={category.title}
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
              className="skill-category-block p-6 bg-[#FFFFFF] border border-[rgba(10,10,10,0.16)] hover:border-[#0A0A0A]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header with Icon and Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 border border-[rgba(10,10,10,0.16)] bg-[#F7F7F8] flex items-center justify-center shrink-0">
                    {iconMap[category.title] || <Code2 className="w-4 h-4 text-[#FF4F00]" />}
                  </div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">
                    {category.title}
                  </h3>
                </div>

                {/* Extending Accent Rule under category */}
                <div className="category-accent-rule w-full h-[1.5px] bg-[#FF4F00] mb-5 will-change-transform" />

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      onMouseEnter={handleChipMouseEnter}
                      onMouseLeave={handleChipMouseLeave}
                      className="skill-chip px-2.5 py-1 text-xs font-mono bg-[#F7F7F8] border border-[rgba(10,10,10,0.14)] text-[#0A0A0A]/80 hover:border-[#FF4F00] hover:text-[#0A0A0A] select-none will-change-transform"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
