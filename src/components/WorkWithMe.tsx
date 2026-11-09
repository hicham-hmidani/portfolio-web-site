import { useRef, useState, useEffect } from 'react';
import { ExternalLink, Mail, Briefcase, Sparkles, DollarSign, Clock, TrendingUp, Layers, Send } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useSectionDoc } from '../hooks/useSectionDoc';
import { useScrollRefresh } from '../hooks/useScrollRefresh';
import { workWithMeDefaults, WorkWithMeData, WorkWithMeCard } from '../content/workWithMeDefaults';

export default function WorkWithMe({ folio = '09' }: { folio?: string } = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const vDividersRef = useRef<(HTMLDivElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // 1. Live Firestore section doc merged over defaults
  const { data: sectionData } = useSectionDoc<WorkWithMeData>('workwithme', workWithMeDefaults);

  // 2. Upwork hourly rate from marketplace_items/upwork_config
  const [hourlyRate, setHourlyRate] = useState<string>('$10/hr');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'marketplace_items', 'upwork_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hourlyRate) {
          setHourlyRate(`$${data.hourlyRate}/hr`);
        }
      }
    }, (err) => {
      console.warn('Error reading upwork_config:', err);
    });

    return () => unsub();
  }, []);

  const visibleCards = (sectionData.cards || []).filter(c => c.visible !== false);

  // GSAP scroll refresh when cards change
  useScrollRefresh([visibleCards, sectionData.heading, sectionData.intro, hourlyRate]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktopFine: "(pointer: fine) and (min-width: 1024px)",
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced, isDesktopFine } = context.conditions as {
        isReduced: boolean;
        isDesktopFine: boolean;
      };

      if (isReduced) {
        if (hairlineRef.current) gsap.set(hairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        const vDivs = vDividersRef.current.filter(Boolean);
        if (vDivs.length) gsap.set(vDivs, { scaleY: 1, autoAlpha: 1 });
        const allContent = gsap.utils.toArray<HTMLElement>('.service-column, .service-content, .service-tag, .magnetic-btn');
        if (allContent.length) gsap.set(allContent, { autoAlpha: 1, y: 0, x: 0 });
        return;
      }

      // Horizontal hairline self-draw on scroll
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 80%",
              end: "top 55%",
              scrub: true
            }
          }
        );
      }

      // Vertical hairlines that draw (scaleY, scroll-triggered)
      const vDividers = vDividersRef.current.filter(Boolean) as HTMLDivElement[];
      if (vDividers.length) {
        gsap.fromTo(vDividers,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            duration: 0.85,
            ease: "power2.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: ".columns-container",
              start: "top 75%",
              toggleActions: "play none none none"
            }
          }
        );
      }

      // Staggered column entrance with content and tags
      const columns = gsap.utils.toArray<HTMLElement>('.service-column');
      columns.forEach((col, idx) => {
        const colTl = gsap.timeline({
          scrollTrigger: {
            trigger: col,
            start: "top 80%",
            toggleActions: "play none none none"
          },
          defaults: { ease: "power3.out" }
        });

        // Column wrapper fade + rise
        colTl.fromTo(col,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.7, delay: idx * 0.12 }
        );

        // Content elements stagger inside column
        const contentEls = col.querySelectorAll<HTMLElement>('.col-content');
        if (contentEls.length) {
          colTl.fromTo(contentEls,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
            "-=0.4"
          );
        }

        // Tags stagger last
        const tags = col.querySelectorAll<HTMLElement>('.service-tag');
        if (tags.length) {
          colTl.fromTo(tags,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 },
            "-=0.2"
          );
        }
      });

      // Magnetic CTA buttons via quickTo, fine pointers only
      if (isDesktopFine) {
        const buttons = buttonRefs.current.filter(Boolean) as HTMLAnchorElement[];
        const cleanups: (() => void)[] = [];

        buttons.forEach((btn) => {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });

          const handleMouseMove = (e: MouseEvent) => {
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            xTo(deltaX * 0.28);
            yTo(deltaY * 0.28);
          };

          const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
          };

          btn.addEventListener("mousemove", handleMouseMove);
          btn.addEventListener("mouseleave", handleMouseLeave);

          cleanups.push(() => {
            btn.removeEventListener("mousemove", handleMouseMove);
            btn.removeEventListener("mouseleave", handleMouseLeave);
          });
        });

        return () => {
          cleanups.forEach(fn => fn());
        };
      }
    });
  }, { scope: rootRef, dependencies: [visibleCards, hourlyRate], revertOnUpdate: true });

  const getCardIcon = (index: number) => {
    switch (index % 3) {
      case 0:
        return <Briefcase className="w-5 h-5 text-[#FF4F00]" />;
      case 1:
        return <Sparkles className="w-5 h-5 text-[#FF4F00]" />;
      case 2:
      default:
        return <Mail className="w-5 h-5 text-[#FF4F00]" />;
    }
  };

  const getBulletIcon = (bulletText: string) => {
    if (bulletText.includes('{rate}') || bulletText.includes('/hr') || bulletText.includes('$')) {
      return <DollarSign className="w-3.5 h-3.5 text-[#FF4F00]" />;
    }
    if (bulletText.toLowerCase().includes('rank')) {
      return <TrendingUp className="w-3.5 h-3.5 text-[#FF4F00]" />;
    }
    if (bulletText.toLowerCase().includes('prompts')) {
      return <Layers className="w-3.5 h-3.5 text-[#FF4F00]" />;
    }
    if (bulletText.includes('@')) {
      return <Mail className="w-3.5 h-3.5 text-[#FF4F00]" />;
    }
    return <Clock className="w-3.5 h-3.5 text-[#FF4F00]" />;
  };

  const formatBulletText = (text: string) => {
    return text.replace(/{rate}/g, hourlyRate);
  };

  return (
    <section id="work-with-me" ref={rootRef} className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]">
      <div className="container mx-auto px-6">
        {/* Section Header with Folio 08 */}
        <div className="flex items-baseline justify-between w-full mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
              {folio} / ENGAGEMENT
            </span>
            <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
              — WORK WITH ME
            </span>
          </div>
          <div className="text-xs font-mono text-[#0A0A0A]/50 tracking-wider">
            CONTRACT & FREELANCE
          </div>
        </div>

        {/* Self-drawing hairline rule */}
        <div
          ref={hairlineRef}
          className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
        />

        <div className="mb-14 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-4">
            {sectionData.heading || workWithMeDefaults.heading}
          </h2>
          <p className="text-sm md:text-base text-[#0A0A0A]/70 leading-relaxed font-sans">
            {sectionData.intro || workWithMeDefaults.intro}
          </p>
        </div>

        {/* Service columns separated by vertical hairlines that draw (scaleY) */}
        <div className={`columns-container relative border border-[rgba(10,10,10,0.16)] bg-[#FFFFFF] grid grid-cols-1 ${
          visibleCards.length === 1 ? 'lg:grid-cols-1' : visibleCards.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
        }`}>
          {visibleCards.map((card: WorkWithMeCard, idx: number) => {
            const isEmail = card.ctaUrl.startsWith('mailto:');
            return (
              <div
                key={card.id || idx}
                className={`service-column flex flex-col justify-between p-8 sm:p-10 relative bg-[#FFFFFF] ${
                  idx > 0 ? 'border-t lg:border-t-0 border-[rgba(10,10,10,0.16)]' : ''
                }`}
              >
                <div>
                  <div className="col-content flex items-start justify-between mb-8">
                    <div className="w-12 h-12 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] flex items-center justify-center shrink-0">
                      {getCardIcon(idx)}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#0A0A0A]/40">
                      SERVICE / 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="col-content text-2xl font-bold text-[#0A0A0A] mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="col-content text-[#0A0A0A]/70 text-sm mb-8 leading-relaxed">
                    {card.blurb}
                  </p>

                  {card.bullets && card.bullets.length > 0 && (
                    <div className="col-content space-y-3 mb-8 pt-6 border-t border-[rgba(10,10,10,0.12)]">
                      {card.bullets.map((bullet, bIdx) => {
                        const formatted = formatBulletText(bullet);
                        const hasRate = bullet.includes('{rate}') || formatted.includes(hourlyRate);
                        return (
                          <div key={bIdx} className="flex items-center gap-2.5 text-xs font-mono text-[#0A0A0A]/80">
                            {getBulletIcon(bullet)}
                            <span className={hasRate ? "font-bold text-[#0A0A0A]" : ""}>
                              {formatted}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {card.tags && card.tags.length > 0 && (
                    <div className="mb-8">
                      <div className="col-content text-[10px] font-mono text-[#0A0A0A]/40 uppercase tracking-widest mb-3">
                        Core Specialties
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {card.tags.map(tag => (
                          <span
                            key={tag}
                            className="service-tag px-2.5 py-1 text-[11px] font-mono bg-[#F7F7F8] text-[#0A0A0A] border border-[rgba(10,10,10,0.16)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <a
                    ref={(el) => { buttonRefs.current[idx] = el; }}
                    href={card.ctaUrl}
                    target={isEmail ? undefined : "_blank"}
                    rel={isEmail ? undefined : "noreferrer"}
                    className={`magnetic-btn w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 ${
                      isEmail
                        ? "bg-[#FF4F00] hover:bg-[#E04500] text-white"
                        : "bg-[#0A0A0A] hover:bg-[#FF4F00] text-white"
                    } font-mono text-xs uppercase tracking-wider font-semibold transition-colors duration-150 will-change-transform`}
                  >
                    <span>{card.ctaLabel}</span>
                    {isEmail ? <Send className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  </a>
                </div>
              </div>
            );
          })}

          {/* Vertical dividers for 3-col layout */}
          {visibleCards.length === 3 && (
            <>
              <div
                ref={(el) => { vDividersRef.current[0] = el; }}
                aria-hidden="true"
                className="hidden lg:block absolute left-1/3 top-0 bottom-0 w-px bg-[rgba(10,10,10,0.16)] will-change-transform pointer-events-none"
              />
              <div
                ref={(el) => { vDividersRef.current[1] = el; }}
                aria-hidden="true"
                className="hidden lg:block absolute left-2/3 top-0 bottom-0 w-px bg-[rgba(10,10,10,0.16)] will-change-transform pointer-events-none"
              />
            </>
          )}

          {/* Vertical divider for 2-col layout */}
          {visibleCards.length === 2 && (
            <div
              ref={(el) => { vDividersRef.current[0] = el; }}
              aria-hidden="true"
              className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-[rgba(10,10,10,0.16)] will-change-transform pointer-events-none"
            />
          )}
        </div>
      </div>
    </section>
  );
}
