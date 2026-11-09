import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Github, BarChart3, Database, Code2, Layers } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../lib/gsap';
import { useScrollRefresh } from '../hooks/useScrollRefresh';

interface Project {
  id: string;
  title: string;
  description: string;
  tools: string[];
  githubUrl: string;
  demoUrl: string;
  stats: string;
  featured: boolean;
  platform: string;
  imageUrl?: string;
  createdAt?: any;
}

interface ParsedStat {
  isNumeric: boolean;
  prefix?: string;
  targetNumber?: number;
  hasCommas?: boolean;
  suffix?: string;
  text?: string;
  originalText: string;
}

function parseStatPart(str: string): ParsedStat {
  const trimmed = str.trim();
  const match = trimmed.match(/^(.*?)(\b\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { isNumeric: false, text: trimmed, originalText: trimmed };
  }

  const rawNum = match[2].replace(/,/g, '');
  const num = parseFloat(rawNum);
  if (isNaN(num)) {
    return { isNumeric: false, text: trimmed, originalText: trimmed };
  }

  return {
    isNumeric: true,
    prefix: match[1],
    targetNumber: num,
    hasCommas: match[2].includes(','),
    suffix: match[3],
    originalText: trimmed
  };
}

export default function Projects({ folio = '04' }: { folio?: string } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const headerHairlineRef = useRef<HTMLDivElement>(null);

  // Keep ScrollTrigger synchronized with Firestore project updates
  useScrollRefresh([projects, loading]);

  useEffect(() => {
    const q = query(collection(db, "projects"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Project[];

      // Sort by createdAt descending
      const sortedProjects = projectsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      const featured = sortedProjects.filter(p => p.featured);
      setProjects(featured.length > 0 ? featured : sortedProjects);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error in Projects component:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const { contextSafe } = useGSAP(() => {
    if (loading || projects.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced } = context.conditions as { isReduced: boolean };

      // Reduced motion: all elements display statically without movement
      if (isReduced) {
        if (headerHairlineRef.current) gsap.set(headerHairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        gsap.set(".project-card", { autoAlpha: 1, y: 0 });
        gsap.set(".project-image-frame", { clipPath: "none" });
        gsap.set(".project-parallax-img", { yPercent: 0, scale: 1 });
        gsap.set(".project-tag", { autoAlpha: 1, y: 0 });
        return;
      }

      // 1. Header hairline rule draws with scrub
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

      // 2. Each project card animations
      const cards = gsap.utils.toArray<HTMLElement>(".project-card");

      cards.forEach((card) => {
        const imgFrame = card.querySelector<HTMLElement>(".project-image-frame");
        const imgEl = card.querySelector<HTMLElement>(".project-parallax-img");
        const titleEl = card.querySelector<HTMLElement>(".project-title");
        const tags = card.querySelectorAll<HTMLElement>(".project-tag");
        const counterSpans = card.querySelectorAll<HTMLElement>(".stat-counter");

        // Card entrance
        gsap.fromTo(card,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );

        // Image clip-path wipe entrance
        if (imgFrame) {
          gsap.fromTo(imgFrame,
            { clipPath: "inset(0% 100% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.8,
              ease: "power3.inOut",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none"
              }
            }
          );
        }

        // Image scroll-scrubbed parallax inside overflow-hidden frame
        if (imgEl) {
          gsap.fromTo(imgEl,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true
              }
            }
          );
        }

        // Title with SplitText lines
        if (titleEl) {
          const split = SplitText.create(titleEl, { type: "lines", mask: "lines" });
          if (split.lines && split.lines.length > 0) {
            gsap.from(split.lines, {
              yPercent: 110,
              autoAlpha: 0,
              duration: 0.5,
              stagger: 0.05,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 82%",
                toggleActions: "play none none none"
              }
            });
          }
        }

        // Tags stagger
        if (tags.length > 0) {
          gsap.from(tags, {
            autoAlpha: 0,
            y: 8,
            stagger: 0.035,
            duration: 0.35,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              toggleActions: "play none none none"
            }
          });
        }

        // Count-up animation for numeric stats
        counterSpans.forEach((span) => {
          const targetStr = span.getAttribute('data-target');
          const hasCommas = span.getAttribute('data-commas') === 'true';
          if (!targetStr) return;
          const targetNum = parseFloat(targetStr);
          if (isNaN(targetNum)) return;

          const counterObj = { val: 0 };
          gsap.to(counterObj, {
            val: targetNum,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              toggleActions: "play none none none"
            },
            onUpdate: () => {
              const current = Math.floor(counterObj.val);
              span.textContent = hasCommas ? current.toLocaleString('en-US') : current.toString();
            }
          });
        });
      });
    });
  }, { scope: sectionRef, dependencies: [projects, loading], revertOnUpdate: true });

  // Hover handlers for cards (fine pointer only)
  const handleCardMouseEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const card = e.currentTarget;
    const imgEl = card.querySelector<HTMLElement>(".project-parallax-img");
    const arrow = card.querySelector<HTMLElement>(".project-hover-arrow");

    if (imgEl) {
      gsap.to(imgEl, { scale: 1.03, duration: 0.4, ease: "power2.out" });
    }
    if (arrow) {
      gsap.to(arrow, { x: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    }
  });

  const handleCardMouseLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const card = e.currentTarget;
    const imgEl = card.querySelector<HTMLElement>(".project-parallax-img");
    const arrow = card.querySelector<HTMLElement>(".project-hover-arrow");

    if (imgEl) {
      gsap.to(imgEl, { scale: 1.0, duration: 0.4, ease: "power2.out" });
    }
    if (arrow) {
      gsap.to(arrow, { x: -6, autoAlpha: 0, duration: 0.3, ease: "power2.out" });
    }
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Excel': return <BarChart3 className="w-4 h-4 text-[#FF4F00]" />;
      case 'Python': return <Code2 className="w-4 h-4 text-[#FF4F00]" />;
      case 'SQL': return <Database className="w-4 h-4 text-[#FF4F00]" />;
      default: return <Layers className="w-4 h-4 text-[#FF4F00]" />;
    }
  };

  if (loading) {
    return (
      <section id="projects" className="relative z-10 bg-[#FFFFFF] py-24 border-t border-[rgba(10,10,10,0.16)]">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
              04 / PROJECTS
            </span>
            <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
              — LOADING ARCHIVE
            </span>
          </div>
          <div className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
            <div className="h-96 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] animate-pulse" />
            <div className="h-96 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative">
        {/* Section Header with Folio 04 */}
        <div className="flex flex-col items-start mb-12 w-full">
          <div className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                {folio} / PROJECTS
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — FEATURED WORK & CASE STUDIES
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-wider hidden sm:block">
              {projects.length} CASE STUDIES
            </div>
          </div>

          {/* Hairline rule that draws with scrub on entrance */}
          <div
            ref={headerHairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
          />

          {/* Left-Aligned Swiss Headline */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
            Featured <span className="text-[#FF4F00]">Projects</span>
          </h2>
          <p className="text-base text-[#0A0A0A]/70 max-w-2xl leading-relaxed">
            A selection of production analytics dashboards, predictive machine learning models, and complex database architectures.
          </p>
        </div>

        {/* Oversized background folio watermark */}
        <div className="absolute top-10 right-6 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.03] select-none pointer-events-none font-sans z-0">
          {folio}
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-8">
            {projects.map((project) => {
              const parsedStats = project.stats
                ? project.stats.split('|').map(parseStatPart)
                : [];

              return (
                <div
                  key={project.id}
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                  className="project-card relative overflow-hidden bg-[#FFFFFF] border border-[rgba(10,10,10,0.16)] hover:border-[#0A0A0A]/40 transition-colors flex flex-col h-full"
                >
                  {/* Image Preview Frame with clip-path wipe & scrubbed parallax */}
                  {project.imageUrl && (
                    <div className="project-image-frame relative h-56 sm:h-64 overflow-hidden border-b border-[rgba(10,10,10,0.16)] bg-[#F7F7F8] will-change-transform">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="project-parallax-img absolute inset-0 w-full h-[120%] -top-[10%] object-cover grayscale contrast-105 will-change-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF]/90 backdrop-blur-sm border border-[rgba(10,10,10,0.16)] text-[10px] font-mono font-bold uppercase tracking-wider text-[#0A0A0A]">
                          <span className="w-1.5 h-1.5 bg-[#FF4F00]" />
                          {project.platform}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    {/* Header Row: Platform Icon, Title with sliding arrow, and Action Links */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {!project.imageUrl && (
                          <div className="w-8 h-8 border border-[rgba(10,10,10,0.16)] bg-[#F7F7F8] flex items-center justify-center shrink-0 mt-0.5">
                            {getPlatformIcon(project.platform)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="project-title text-xl md:text-2xl font-bold tracking-tight text-[#0A0A0A]">
                              {project.title}
                            </h3>
                            <ArrowUpRight className="project-hover-arrow w-4 h-4 text-[#FF4F00] shrink-0 opacity-0 -translate-x-1.5 will-change-transform" />
                          </div>
                          {!project.imageUrl && (
                            <p className="text-[10px] font-mono font-bold text-[#0A0A0A]/50 mt-1 uppercase tracking-widest">
                              {project.platform}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] hover:text-[#FF4F00] hover:border-[#FF4F00] transition-colors"
                            aria-label="View on GitHub"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] hover:text-[#FF4F00] hover:border-[#FF4F00] transition-colors"
                            aria-label="View Live Project"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm md:text-base text-[#0A0A0A]/70 mb-6 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Stats Box with count-up animation for numeric stats */}
                    {parsedStats.length > 0 && (
                      <div className="mb-6 p-4 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)]">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#FF4F00] uppercase tracking-widest mb-2.5">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Key Insights & Stats</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {parsedStats.map((stat, i) => (
                            <span
                              key={i}
                              className="inline-block px-2.5 py-1 text-xs font-mono bg-[#FFFFFF] border border-[rgba(10,10,10,0.12)] text-[#0A0A0A]/85"
                            >
                              {stat.isNumeric && stat.targetNumber !== undefined ? (
                                <>
                                  <span>{stat.prefix}</span>
                                  <span
                                    className="stat-counter font-bold text-[#0A0A0A]"
                                    data-target={stat.targetNumber}
                                    data-commas={stat.hasCommas ? "true" : "false"}
                                  >
                                    0
                                  </span>
                                  <span>{stat.suffix}</span>
                                </>
                              ) : (
                                <span>{stat.originalText}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tech Tag Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-[rgba(10,10,10,0.08)]">
                      {project.tools?.map((tag, i) => (
                        <span
                          key={i}
                          className="project-tag px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#F7F7F8] text-[#0A0A0A]/70 border border-[rgba(10,10,10,0.12)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] max-w-2xl mx-auto mt-8">
            <Layers className="w-8 h-8 text-[#0A0A0A]/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">No projects found</h3>
            <p className="text-xs font-mono text-[#0A0A0A]/60">Projects collection is currently empty.</p>
          </div>
        )}
      </div>
    </section>
  );
}
