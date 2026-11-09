import { useState, useEffect, useRef } from 'react';
import { Briefcase, Database, Code, LineChart, Sparkles, ExternalLink } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useScrollRefresh } from '../hooks/useScrollRefresh';

interface ExperienceItem {
  title: string;
  company: string;
  date: string;
  description: string[];
  badge?: string;
  link?: string;
}

const defaultExperiences: ExperienceItem[] = [
  {
    title: "Database Management Administrator",
    company: "Moroccan Ministry of Interior",
    date: "May 2024 – Present",
    description: [
      "Managing and optimizing database systems to ensure data integrity, security, and high availability.",
      "Performing regular backups, monitoring performance, and troubleshooting database issues."
    ]
  },
  {
    title: "Freelance Data Analyst",
    company: "Upwork",
    date: "Open to Offers",
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
    description: [
      "Forecasting the energy production of a hybrid renewable system.",
      "Study and analysis of chronological data.",
      "Optimization of Machine Learning and Deep Learning models.",
      "Development and production of reports and dashboards."
    ]
  }
];

export default function Experience({ folio = '03' }: { folio?: string } = {}) {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(defaultExperiences);
  const sectionRef = useRef<HTMLElement>(null);
  const headerHairlineRef = useRef<HTMLDivElement>(null);
  const timelineListRef = useRef<HTMLDivElement>(null);
  const timelineProgressRef = useRef<HTMLDivElement>(null);
  const timelineProgressMobileRef = useRef<HTMLDivElement>(null);

  // Keep ScrollTrigger calculations accurate as experiences change
  useScrollRefresh([experiences]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'portfolio_content', 'experience'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.entries && Array.isArray(data.entries)) {
          const merged: ExperienceItem[] = data.entries.map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || '',
            date: exp.date || '',
            badge: exp.badge || '',
            link: exp.link || '',
            description: Array.isArray(exp.bulletPoints)
              ? exp.bulletPoints
              : Array.isArray(exp.description)
              ? exp.description
              : []
          }));
          setExperiences(merged);
        }
      }
    });
    return () => unsub();
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced, isDesktop } = context.conditions as {
        isReduced: boolean;
        isDesktop: boolean;
      };

      // 1. Reduced motion: reveal all items statically
      if (isReduced) {
        if (headerHairlineRef.current) gsap.set(headerHairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        if (timelineProgressRef.current) gsap.set(timelineProgressRef.current, { scaleY: 1 });
        if (timelineProgressMobileRef.current) gsap.set(timelineProgressMobileRef.current, { scaleY: 1 });
        gsap.set(".experience-entry", { autoAlpha: 1, y: 0, opacity: 1, clipPath: "none" });
        gsap.set(".entry-bullet", { autoAlpha: 1, y: 0 });
        return;
      }

      // 2. Header hairline draw
      if (headerHairlineRef.current && sectionRef.current) {
        gsap.fromTo(headerHairlineRef.current,
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

      // 3. Vertical timeline accent line scrubbed across the whole list (scaleY, transform-origin top)
      const activeProgressBar = isDesktop
        ? timelineProgressRef.current
        : timelineProgressMobileRef.current;

      if (activeProgressBar && timelineListRef.current) {
        gsap.fromTo(activeProgressBar,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: timelineListRef.current,
              start: "top 65%",
              end: "bottom 75%",
              scrub: true
            }
          }
        );
      }

      // 4. Reveal each entry with a y-mask / clip-path & stagger bullets line by line
      const entries = gsap.utils.toArray<HTMLElement>(".experience-entry");

      entries.forEach((entryEl) => {
        const bullets = entryEl.querySelectorAll(".entry-bullet");

        const entryTl = gsap.timeline({
          scrollTrigger: {
            trigger: entryEl,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        });

        entryTl.fromTo(entryEl,
          { autoAlpha: 0, y: 30, clipPath: "inset(0% 0% 100% 0%)" },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.6,
            ease: "power3.out"
          }
        );

        if (bullets.length > 0) {
          entryTl.fromTo(bullets,
            { autoAlpha: 0, y: 8 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.06,
              duration: 0.35,
              ease: "power2.out"
            },
            "-=0.25"
          );
        }
      });

      // 5. Desktop: Entry nearest viewport centre becomes "active" (accent marker, opacity 1.0; others 0.5)
      if (isDesktop && entries.length > 0) {
        entries.forEach((entryEl, index) => {
          ScrollTrigger.create({
            trigger: entryEl,
            start: "top 55%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (self.isActive) {
                entries.forEach((other, i) => {
                  gsap.to(other, {
                    opacity: i === index ? 1 : 0.5,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                  const marker = other.querySelector<HTMLElement>(".timeline-marker");
                  if (marker) {
                    gsap.to(marker, {
                      backgroundColor: i === index ? "#FF4F00" : "#FFFFFF",
                      borderColor: i === index ? "#FF4F00" : "rgba(10,10,10,0.25)",
                      scale: i === index ? 1.3 : 1,
                      duration: 0.3
                    });
                  }
                });
              }
            }
          });
        });
      } else {
        // Mobile: all entries remain at full opacity without dimming
        gsap.set(entries, { opacity: 1 });
      }
    });
  }, { scope: sectionRef, dependencies: [experiences], revertOnUpdate: true });

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative">
        {/* Section Header with Folio 03 */}
        <div className="flex flex-col items-start mb-12 w-full">
          <div className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                {folio} / EXPERIENCE
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — CAREER & ROLES
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-wider hidden sm:block">
              {experiences.length} POSITIONS
            </div>
          </div>

          {/* Hairline rule that draws with scrub on entrance */}
          <div
            ref={headerHairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
          />

          {/* Left-Aligned Swiss Headline */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
            Professional <span className="text-[#FF4F00]">Experience</span>
          </h2>
          <p className="text-base text-[#0A0A0A]/70 max-w-2xl leading-relaxed">
            My career timeline in database management, data analysis, prompt engineering, and predictive machine learning.
          </p>
        </div>

        {/* Oversized background folio watermark */}
        <div className="absolute top-10 right-6 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.03] select-none pointer-events-none font-sans z-0">
          {folio}
        </div>

        {/* Timeline Container */}
        <div ref={timelineListRef} className="relative mt-16 max-w-5xl mx-auto">
          {/* Desktop Timeline Rail (centered between date and content) */}
          <div className="hidden md:block absolute left-[240px] top-0 bottom-0 w-px bg-[rgba(10,10,10,0.14)] -translate-x-1/2">
            <div
              ref={timelineProgressRef}
              className="w-px h-full bg-[#FF4F00] will-change-transform origin-top scale-y-0"
            />
          </div>

          {/* Mobile Timeline Rail (single column left edge) */}
          <div className="md:hidden absolute left-3 top-0 bottom-0 w-px bg-[rgba(10,10,10,0.14)]">
            <div
              ref={timelineProgressMobileRef}
              className="w-px h-full bg-[#FF4F00] will-change-transform origin-top scale-y-0"
            />
          </div>

          {/* Experience Entries List */}
          <div className="space-y-16">
            {experiences.map((exp, index) => {
              const CardContent = (
                <div className="experience-entry relative flex flex-col md:flex-row items-start gap-6 md:gap-10 transition-opacity">
                  {/* Left Column: Date block as large numeral / text block */}
                  <div className="w-full md:w-[220px] md:text-right shrink-0 pl-8 md:pl-0">
                    <div className="text-base md:text-lg font-bold font-mono tracking-tight text-[#0A0A0A] uppercase">
                      {exp.date}
                    </div>
                    {exp.badge && (
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-[11px] font-mono font-bold text-[#FF4F00]">
                        {exp.badge}
                      </div>
                    )}
                  </div>

                  {/* Timeline Marker Dot */}
                  <div className="absolute left-3 md:left-[240px] top-1.5 -translate-x-1/2 flex items-center justify-center z-10">
                    <div className="timeline-marker w-3 h-3 bg-white border border-[rgba(10,10,10,0.3)] transition-transform" />
                  </div>

                  {/* Right Column: Role, Company, and Bullet Points */}
                  <div className="flex-1 w-full pl-8 md:pl-6">
                    <div className="p-6 md:p-8 bg-[#FFFFFF] border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A]/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[#0A0A0A]">
                          {exp.title}
                        </h3>
                      </div>

                      <div className="mb-5 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#0A0A0A]/60">
                        <Briefcase className="w-3.5 h-3.5 text-[#FF4F00]" />
                        {exp.link ? (
                          <a
                            href={exp.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-[#FF4F00] transition-colors"
                          >
                            <span>{exp.company}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span>{exp.company}</span>
                        )}
                      </div>

                      <ul className="space-y-2.5 pt-4 border-t border-[rgba(10,10,10,0.08)]">
                        {exp.description.map((bullet, i) => (
                          <li
                            key={i}
                            className="entry-bullet flex items-start gap-3 text-sm text-[#0A0A0A]/75 leading-relaxed"
                          >
                            <span className="mt-2 w-1.5 h-1.5 bg-[#FF4F00] shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );

              return <div key={`${exp.title}-${index}`}>{CardContent}</div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
