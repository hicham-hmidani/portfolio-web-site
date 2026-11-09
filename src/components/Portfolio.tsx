import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Mail, MapPin, ChevronRight, Database, BarChart, Code2, Menu, X, ArrowUp } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../lib/gsap';
import Skills from './Skills';
import Experience from './Experience';
import Projects from './Projects';
import PromptEngineering from './PromptEngineering';
import WorkWithMe from './WorkWithMe';
import FeaturedService from './FeaturedService';
import Blog from './Blog';
import Education from './Education';
import Contact from './Contact';
import { useSectionDoc } from '../hooks/useSectionDoc';
import { useScrollRefresh } from '../hooks/useScrollRefresh';
import { defaultLayoutData, PortfolioLayoutData, SECTION_METAS } from '../content/layoutDefaults';

export default function Portfolio() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('#about');

  const [hero, setHero] = useState<{
    name: string;
    titles: string[];
    bio: string;
    available: boolean;
    availableStatusText?: string;
    rate: string;
  }>({
    name: 'Hicham Hmidani',
    titles: ["Junior Data Analyst/Scientist", "AI Prompt Engineer", "Database Administrator-MI"],
    bio: "A diligent and detail-oriented Junior Data Analyst/Scientist, AI Prompt Engineer, and Database Administrator holding a Master's degree in Computer Science and Complex Systems Engineering. I have a solid foundation in statistical analysis, machine learning, prompt engineering, and domain name investing.",
    available: true,
    availableStatusText: 'AVAILABLE FOR FREELANCE',
    rate: "$10/hr"
  });

  const [contact, setContact] = useState({
    email: 'hmidanihicham8@gmail.com',
    phone: '+212 600000000',
    location: 'Ouarzazate, Morocco',
    socials: {
      linkedin: 'https://linkedin.com/in/hicham-hmidani-b55a5521b/',
      github: 'https://github.com/hicham-hmidani',
      promptbase: '',
      upwork: ''
    }
  });

  // DOM Refs for GSAP scoping & animations
  const rootRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const folioRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const titlesContainerRef = useRef<HTMLDivElement>(null);
  const titleItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statusBadgesRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const badge1Ref = useRef<HTMLDivElement>(null);
  const badge2Ref = useRef<HTMLDivElement>(null);
  const badge3Ref = useRef<HTMLDivElement>(null);
  const footerWordmarkRef = useRef<HTMLHeadingElement>(null);

  // Firestore subscriptions
  useEffect(() => {
    const unsubHero = onSnapshot(doc(db, 'portfolio_content', 'hero'), (docSnap) => {
      if (docSnap.exists()) setHero(prev => ({ ...prev, ...docSnap.data() }));
    });
    const unsubContact = onSnapshot(doc(db, 'portfolio_content', 'contact'), (docSnap) => {
      if (docSnap.exists()) setContact(docSnap.data() as any);
    });
    const unsubUpwork = onSnapshot(doc(db, 'marketplace_items', 'upwork_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hourlyRate) {
          setHero(prev => ({ ...prev, rate: `$${data.hourlyRate}/hr` }));
        }
      }
    });
    return () => {
      unsubHero();
      unsubContact();
      unsubUpwork();
    };
  }, []);

  // Live layout document from portfolio_content/layout
  const { data: layoutData } = useSectionDoc<PortfolioLayoutData>('layout', defaultLayoutData);

  // Normalize layout data ensuring all known sections exist if document is partial
  const allSectionIds = defaultLayoutData.sections.map(s => s.id);
  const rawSections = Array.isArray(layoutData?.sections) ? layoutData.sections : defaultLayoutData.sections;

  // Keep defined order, append any missing known IDs as visible: true
  const orderedSections = [...rawSections.filter(s => allSectionIds.includes(s.id))];
  allSectionIds.forEach(id => {
    if (!orderedSections.some(s => s.id === id)) {
      orderedSections.push({ id, visible: true });
    }
  });

  const visibleSections = orderedSections.filter(s => s.visible !== false);
  const contactFolio = String(visibleSections.length + 2).padStart(2, '0');

  // Derive nav links dynamically from the visible list so numbers never skip
  const navLinks = [
    { name: 'About', href: '#about', folio: '01' },
    ...visibleSections.map((sec, idx) => {
      const meta = SECTION_METAS[sec.id] || { name: sec.id, href: `#${sec.id}` };
      return {
        name: meta.name,
        href: meta.href,
        folio: String(idx + 2).padStart(2, '0')
      };
    }),
    { name: 'Contact', href: '#contact', folio: contactFolio }
  ];

  // Refresh ScrollTrigger calculations whenever layout or navLinks change
  useScrollRefresh([visibleSections, navLinks]);

  // GSAP Animations and ScrollTriggers
  const { contextSafe } = useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktopFine: "(pointer: fine) and (min-width: 768px)",
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced, isDesktopFine } = context.conditions as { isReduced: boolean; isDesktopFine: boolean };

      // Reduced motion: ensure all hero elements are visible immediately without movement
      if (isReduced) {
        if (hairlineRef.current) gsap.set(hairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        if (folioRef.current) gsap.set(folioRef.current, { autoAlpha: 1, y: 0 });
        if (nameRef.current) gsap.set(nameRef.current, { autoAlpha: 1, y: 0 });
        if (bioRef.current) gsap.set(bioRef.current, { autoAlpha: 1, y: 0 });
        if (ctaRef.current) gsap.set(ctaRef.current, { autoAlpha: 1, y: 0 });
        if (statusBadgesRef.current) gsap.set(statusBadgesRef.current, { autoAlpha: 1, y: 0 });
        if (socialsRef.current) gsap.set(socialsRef.current, { autoAlpha: 1, y: 0 });
        if (portraitRef.current) gsap.set(portraitRef.current, { autoAlpha: 1, scale: 1 });
        const validBadges = [badge1Ref.current, badge2Ref.current, badge3Ref.current].filter(Boolean);
        if (validBadges.length) gsap.set(validBadges, { autoAlpha: 1, y: 0 });
        if (footerWordmarkRef.current) gsap.set(footerWordmarkRef.current, { autoAlpha: 1, y: 0 });

        // Show first title statically
        const items = titleItemsRef.current.filter(Boolean) as HTMLElement[];
        if (items.length > 0) {
          gsap.set(items[0], { autoAlpha: 1, yPercent: 0 });
          if (items.length > 1) {
            gsap.set(items.slice(1), { autoAlpha: 0, yPercent: 0 });
          }
        }
        return;
      }

      // --- 1. Intro Timeline ---
      const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hairline rule draws itself
      if (hairlineRef.current) {
        introTl.from(hairlineRef.current, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.8,
          ease: "power2.out"
        }, 0);
      }

      // Folio numeral entrance
      if (folioRef.current) {
        introTl.from(folioRef.current, {
          autoAlpha: 0,
          y: -15,
          duration: 0.6
        }, 0.1);
      }

      // SplitText on the name (mask chars)
      if (nameRef.current) {
        const split = SplitText.create(nameRef.current, {
          type: "words, chars",
          mask: "chars"
        });
        if (split.chars && split.chars.length > 0) {
          introTl.from(split.chars, {
            yPercent: 110,
            autoAlpha: 0,
            stagger: 0.02,
            duration: 0.6
          }, 0.15);
        }
      }

      // Status badges
      if (statusBadgesRef.current) {
        introTl.from(statusBadgesRef.current, {
          autoAlpha: 0,
          y: 15,
          duration: 0.5
        }, 0.35);
      }

      // Bio text
      if (bioRef.current) {
        introTl.from(bioRef.current, {
          autoAlpha: 0,
          y: 15,
          duration: 0.5
        }, "-=0.25");
      }

      // CTAs
      if (ctaRef.current) {
        introTl.from(ctaRef.current, {
          autoAlpha: 0,
          y: 15,
          duration: 0.5
        }, "-=0.2");
      }

      // Social links & location
      if (socialsRef.current) {
        introTl.from(socialsRef.current, {
          autoAlpha: 0,
          y: 15,
          duration: 0.5
        }, "-=0.2");
      }

      // Portrait reveal
      if (portraitRef.current) {
        introTl.from(portraitRef.current, {
          autoAlpha: 0,
          scale: 0.96,
          duration: 0.7
        }, 0.25);
      }

      // Badges reveal
      const validBadges = [badge1Ref.current, badge2Ref.current, badge3Ref.current].filter(Boolean);
      if (validBadges.length > 0) {
        introTl.from(validBadges, {
          autoAlpha: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.5
        }, 0.45);
      }

      // --- 2. Looping rotating titles driven by refs ---
      const items = titleItemsRef.current.filter(Boolean) as HTMLElement[];
      if (items.length === 1) {
        gsap.set(items[0], { autoAlpha: 1, yPercent: 0 });
      } else if (items.length > 1) {
        gsap.set(items, { autoAlpha: 0, yPercent: 100 });
        gsap.set(items[0], { autoAlpha: 1, yPercent: 0 });

        const titlesTl = gsap.timeline({ repeat: -1 });
        const holdTime = 2.4;
        const transitionTime = 0.55;

        items.forEach((currentEl, idx) => {
          const nextIdx = (idx + 1) % items.length;
          const nextEl = items[nextIdx];

          titlesTl.to(currentEl, {
            yPercent: -100,
            autoAlpha: 0,
            duration: transitionTime,
            ease: "power2.inOut"
          }, `+=${holdTime}`);

          titlesTl.fromTo(nextEl,
            { yPercent: 100, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: transitionTime, ease: "power2.inOut" },
            "<"
          );
        });
      }

      // --- 3. Floating-badge motion loops with GSAP yoyo tweens (transform only) ---
      if (badge1Ref.current) {
        gsap.to(badge1Ref.current, {
          y: -10,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
      if (badge2Ref.current) {
        gsap.to(badge2Ref.current, {
          y: 10,
          duration: 2.7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.3
        });
      }
      if (badge3Ref.current) {
        gsap.to(badge3Ref.current, {
          y: -8,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.6
        });
      }

      // --- 4. Subtle pointer parallax on portrait using gsap.quickTo (fine pointer desktop only) ---
      if (isDesktopFine && portraitRef.current && heroSectionRef.current) {
        const xTo = gsap.quickTo(portraitRef.current, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(portraitRef.current, "y", { duration: 0.5, ease: "power3.out" });
        const sectionEl = heroSectionRef.current;

        const onMouseMove = (e: MouseEvent) => {
          const rect = sectionEl.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          xTo(relX * 16);
          yTo(relY * 16);
        };

        const onMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        sectionEl.addEventListener("mousemove", onMouseMove);
        sectionEl.addEventListener("mouseleave", onMouseLeave);

        return () => {
          sectionEl.removeEventListener("mousemove", onMouseMove);
          sectionEl.removeEventListener("mouseleave", onMouseLeave);
        };
      }
    });

    // --- 5. Header ScrollTrigger for scrolled state ---
    ScrollTrigger.create({
      start: "top -20px",
      onToggle: (self) => {
        setIsScrolled(self.isActive);
      }
    });

    // --- 6. ScrollTriggers for active nav highlighting (top to bottom) ---
    navLinks.forEach((link) => {
      const sectionEl = document.querySelector(link.href) as HTMLElement | null;
      if (sectionEl) {
        ScrollTrigger.create({
          trigger: sectionEl,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => setActiveNav(link.href),
          onEnterBack: () => setActiveNav(link.href),
        });
      }
    });

    // --- 7. Footer oversized wordmark revealed with SplitText on scroll ---
    if (footerWordmarkRef.current) {
      const wordmarkSplit = SplitText.create(footerWordmarkRef.current, {
        type: "chars",
        mask: "chars"
      });

      if (wordmarkSplit.chars && wordmarkSplit.chars.length > 0) {
        gsap.fromTo(wordmarkSplit.chars,
          { yPercent: 105, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.75,
            stagger: 0.025,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerWordmarkRef.current,
              start: "top 92%",
              toggleActions: "play none none none"
            }
          }
        );
      }
    }
  }, { scope: rootRef, dependencies: [hero.titles, hero.name, navLinks], revertOnUpdate: true });

  // Anchor clicks via ScrollToPlugin with header offset
  const handleNavClick = contextSafe((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveNav(href);
    gsap.to(window, {
      duration: 0.8,
      scrollTo: {
        y: href,
        offsetY: 76
      },
      ease: "power3.inOut"
    });
  });

  // Back to top click via ScrollToPlugin
  const handleBackToTop = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveNav('#about');
    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: 0
      },
      ease: "power3.inOut"
    });
  });

  return (
    <div ref={rootRef} className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans selection:bg-[#FF4F00]/20 overflow-x-hidden relative">
      {/* Sticky Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[rgba(10,10,10,0.16)] py-3.5'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, '#about')}
            className="flex items-center gap-3 text-lg font-bold tracking-tight text-[#0A0A0A] z-50 group"
          >
            <div className="w-7 h-7 bg-[#0A0A0A] text-white flex items-center justify-center text-xs font-mono font-bold group-hover:bg-[#FF4F00] transition-colors">
              H
            </div>
            <span>
              Hicham<span className="text-[#FF4F00]">.</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono uppercase tracking-wider">
            {navLinks.map((link) => {
              const isActive = activeNav === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-1 transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-[#FF4F00] font-semibold' : 'text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
                  }`}
                >
                  <span className="text-[10px] opacity-40">{link.folio}</span>
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4F00]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-[#0A0A0A] p-2 hover:text-[#FF4F00] z-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-[#FFFFFF] border-b border-[rgba(10,10,10,0.16)] py-6 px-6 flex flex-col gap-2 lg:hidden shadow-lg"
            >
              {navLinks.map((link) => {
                const isActive = activeNav === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-sm font-mono uppercase tracking-wider py-2.5 px-3 border-b border-[rgba(10,10,10,0.08)] flex items-center justify-between transition-colors ${
                      isActive ? 'text-[#FF4F00] font-bold bg-[#F7F7F8]' : 'text-[#0A0A0A]/70 hover:text-[#0A0A0A]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-xs text-[#0A0A0A]/40">{link.folio}</span>
                  </a>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main
        id="about"
        ref={heroSectionRef}
        className="relative z-10 container mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28 flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-16"
      >
        {/* Left-Aligned Text Content */}
        <div className="flex-1 w-full flex flex-col items-start">
          {/* Folio and Section Descriptor */}
          <div ref={folioRef} className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                01 / HERO
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — PORTFOLIO OVERVIEW
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/50 tracking-wider hidden sm:block">
              {contact.location || "OUARZAZATE, MOROCCO"}
            </div>
          </div>

          {/* Hairline Rule that draws itself */}
          <div
            ref={hairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-6 will-change-transform"
          />

          {/* Status Badges */}
          <div ref={statusBadgesRef} className="flex flex-wrap items-center gap-2.5 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] text-xs font-mono tracking-wide">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    hero.available ? 'bg-[#FF4F00]' : 'bg-red-400'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    hero.available ? 'bg-[#FF4F00]' : 'bg-red-500'
                  }`}
                />
              </span>
              {hero.availableStatusText || (hero.available ? 'AVAILABLE FOR FREELANCE' : 'CURRENTLY UNAVAILABLE')}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] text-xs font-mono tracking-wide">
              <span className="font-bold text-[#FF4F00]">{hero.rate}</span>
              <span className="text-[#0A0A0A]/60">ON UPWORK</span>
            </div>
          </div>

          {/* Hero Name Header */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0A0A0A] mb-3 leading-[1.05]">
            Hi, I'm{' '}
            <span ref={nameRef} className="inline-block text-[#0A0A0A]">
              {hero.name}
            </span>
          </h1>

          {/* Rotating Titles Container driven by refs & GSAP looping timeline */}
          <div
            ref={titlesContainerRef}
            className="relative h-9 sm:h-11 md:h-12 overflow-hidden mb-6 w-full max-w-2xl"
          >
            {hero.titles.map((title, i) => (
              <div
                key={`${title}-${i}`}
                ref={(el) => {
                  titleItemsRef.current[i] = el;
                }}
                className="absolute inset-0 flex items-center text-xl sm:text-2xl md:text-3xl font-medium text-[#0A0A0A]/60 whitespace-nowrap will-change-transform"
              >
                {title}
              </div>
            ))}
          </div>

          {/* Bio text */}
          <p
            ref={bioRef}
            className="text-base md:text-lg text-[#0A0A0A]/75 mb-8 max-w-2xl leading-relaxed"
          >
            {hero.bio}
          </p>

          {/* Call to Actions */}
          <div ref={ctaRef} className="flex flex-wrap items-center gap-4 mb-10">
            <a
              href="#projects"
              onClick={(e) => handleNavClick(e, '#projects')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF4F00] hover:bg-[#E04500] text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-none"
            >
              View My Work
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F7F7F8] text-[#0A0A0A] font-mono text-xs font-semibold uppercase tracking-wider border border-[rgba(10,10,10,0.16)] transition-colors"
            >
              Contact Me
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Socials & Location */}
          <div
            ref={socialsRef}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-[#0A0A0A]/70 pt-5 border-t border-[rgba(10,10,10,0.12)] w-full"
          >
            <div className="flex items-center gap-3">
              <a
                href={contact.socials.github || "https://github.com/hicham-hmidani"}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] hover:text-[#FF4F00] hover:border-[#FF4F00] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={contact.socials.linkedin || "https://linkedin.com/in/hicham-hmidani-b55a5521b/"}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] hover:text-[#FF4F00] hover:border-[#FF4F00] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[rgba(10,10,10,0.16)]" />
            <div className="flex items-center gap-2 text-xs font-mono text-[#0A0A0A]/70 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 text-[#FF4F00]" />
              {contact.location || "Ouarzazate, Morocco"}
            </div>
          </div>
        </div>

        {/* Visual / Portrait Content (Swiss layout, hairline composition) */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-none flex justify-center lg:justify-end mt-4 lg:mt-0">
          <div className="relative w-full max-w-[380px] aspect-[4/5] sm:aspect-square">
            {/* Swiss Composition Box with Corner Accent Markers */}
            <div className="absolute -inset-3 border border-[rgba(10,10,10,0.12)] pointer-events-none" />
            <div className="absolute -top-3 -left-3 w-1.5 h-1.5 bg-[#FF4F00]" />
            <div className="absolute -bottom-3 -right-3 w-1.5 h-1.5 bg-[#0A0A0A]" />

            {/* Oversized background folio watermark */}
            <div className="absolute -bottom-6 -left-8 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.04] select-none pointer-events-none font-sans z-0">
              01
            </div>

            {/* Portrait Image container with subtle pointer parallax */}
            <div
              ref={portraitRef}
              className="relative z-10 w-full h-full overflow-hidden border border-[rgba(10,10,10,0.16)] bg-[#F7F7F8] shadow-sm will-change-transform"
            >
              <img
                src="https://avatars.githubusercontent.com/u/112251991?v=4"
                alt={hero.name}
                className="w-full h-full object-cover grayscale contrast-105 hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Floating skill badge 1: Python & ML */}
            <div
              ref={badge1Ref}
              className="absolute z-20 top-6 -left-6 bg-white border border-[rgba(10,10,10,0.16)] p-3 shadow-sm flex items-center gap-3 will-change-transform"
            >
              <div className="p-2 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)]">
                <Code2 className="w-4 h-4 text-[#FF4F00]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0A0A0A] tracking-tight">Python & ML</div>
                <div className="text-[10px] font-mono text-[#0A0A0A]/50">Scikit-learn, TensorFlow</div>
              </div>
            </div>

            {/* Floating skill badge 2: Data Analytics */}
            <div
              ref={badge2Ref}
              className="absolute z-20 bottom-12 -right-6 bg-white border border-[rgba(10,10,10,0.16)] p-3 shadow-sm flex items-center gap-3 will-change-transform"
            >
              <div className="p-2 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)]">
                <BarChart className="w-4 h-4 text-[#FF4F00]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0A0A0A] tracking-tight">Data Analytics</div>
                <div className="text-[10px] font-mono text-[#0A0A0A]/50">Power BI, Tableau</div>
              </div>
            </div>

            {/* Floating skill badge 3: Databases */}
            <div
              ref={badge3Ref}
              className="absolute z-20 -bottom-4 left-6 bg-white border border-[rgba(10,10,10,0.16)] p-3 shadow-sm flex items-center gap-3 will-change-transform"
            >
              <div className="p-2 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)]">
                <Database className="w-4 h-4 text-[#FF4F00]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0A0A0A] tracking-tight">Databases</div>
                <div className="text-[10px] font-mono text-[#0A0A0A]/50">SQL, MongoDB, Oracle</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dynamically ordered & visible sections */}
      {visibleSections.map((sec, idx) => {
        const folioNum = String(idx + 2).padStart(2, '0');
        switch (sec.id) {
          case 'skills':
            return <Skills key="skills" folio={folioNum} />;
          case 'experience':
            return <Experience key="experience" folio={folioNum} />;
          case 'projects':
            return <Projects key="projects" folio={folioNum} />;
          case 'prompt-engineering':
            return <PromptEngineering key="prompt-engineering" folio={folioNum} />;
          case 'featured-service':
            return <FeaturedService key="featured-service" folio={folioNum} />;
          case 'blog':
            return <Blog key="blog" folio={folioNum} />;
          case 'education':
            return <Education key="education" folio={folioNum} />;
          case 'work-with-me':
            return <WorkWithMe key="work-with-me" folio={folioNum} />;
          default:
            return null;
        }
      })}

      <Contact folio={contactFolio} />

      <footer className="border-t border-[rgba(10,10,10,0.16)] bg-[#FFFFFF] pt-16 pb-12 overflow-hidden">
        <div className="container mx-auto px-6">
          {/* Top row: Swiss metadata and Back to Top link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-12 border-b border-[rgba(10,10,10,0.12)]">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#FF4F00] font-bold">
                END / {contactFolio}
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/50 uppercase tracking-wider">
                OUARZAZATE, MOROCCO (UTC+1)
              </span>
            </div>

            <a
              href="#about"
              onClick={handleBackToTop}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#0A0A0A] hover:text-[#FF4F00] transition-colors group"
            >
              <span>Back to top</span>
              <div className="p-1.5 border border-[rgba(10,10,10,0.16)] group-hover:border-[#FF4F00] group-hover:-translate-y-0.5 transition-all">
                <ArrowUp className="w-3.5 h-3.5 text-[#FF4F00]" />
              </div>
            </a>
          </div>

          {/* Oversized "Hicham Hmidani" wordmark revealed with SplitText on scroll */}
          <div className="pt-10 pb-8 overflow-hidden select-none">
            <h2
              ref={footerWordmarkRef}
              className="text-[13vw] font-bold tracking-tighter text-[#0A0A0A] leading-[0.88] whitespace-nowrap will-change-transform uppercase"
            >
              Hicham Hmidani
            </h2>
          </div>

          {/* Bottom row: copyright & license statement */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[rgba(10,10,10,0.08)] text-[11px] font-mono text-[#0A0A0A]/50">
            <p>© {new Date().getFullYear()} Hicham Hmidani. All rights reserved.</p>
            <p className="tracking-wide">DESIGN SYSTEM: SWISS / GSAP ENHANCED</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
