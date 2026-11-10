import { useState, useEffect, useRef } from 'react';
import { ExternalLink, CheckCircle2, FolderOpen, Bot, LayoutGrid, Star, Eye, TrendingUp } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, ScrollTrigger, Flip, useGSAP } from '../lib/gsap';
import { useScrollRefresh } from '../hooks/useScrollRefresh';

interface Prompt {
  id: string;
  title: string;
  model: string;
  price: number;
  views: number;
  sales: number;
  url: string;
  featured: boolean;
}

const platforms = [
  { name: 'DALL-E' },
  { name: 'Leonardo AI' },
  { name: 'GPT' },
  { name: 'Midjourney' },
  { name: 'DeepSeek' },
  { name: 'ChatGPT Image' },
  { name: 'Hailuo' },
];

const categories = [
  'Coloring Books', 'Interior Design', 'Movie Posters', 'KDP/Amazon Publishing',
  'Food Photography', 'Wildlife', 'Anime', 'Mobile Wallpapers', 'Business/SaaS',
  'Gaming Setup', 'Vehicle Art', 'Notebook/Planner Covers', 'Product Photography'
];

export default function PromptEngineering({ folio = '05' }: { folio?: string } = {}) {
  const [featuredPrompts, setFeaturedPrompts] = useState<Prompt[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerHairlineRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<any>(null);

  // Synchronize ScrollTrigger when prompts update
  useScrollRefresh([featuredPrompts, selectedPlatform]);

  useEffect(() => {
    const q = query(
      collection(db, "marketplace_items"),
      where("platform", "==", "PromptBase"),
      where("featured", "==", true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeaturedPrompts(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Prompt[]);
    });
    return () => unsubscribe();
  }, []);

  // Filtered prompt list
  const displayedPrompts = selectedPlatform
    ? featuredPrompts.filter(p => p.model?.toLowerCase().includes(selectedPlatform.toLowerCase()))
    : featuredPrompts;

  const { contextSafe } = useGSAP(() => {
    // If we captured a Flip state before setting filter, animate it now
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        duration: 0.45,
        ease: "power2.out",
        fade: true,
        absolute: true
      });
      flipStateRef.current = null;
    }

    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced } = context.conditions as { isReduced: boolean };

      // Reduced motion fallback
      if (isReduced) {
        if (headerHairlineRef.current) gsap.set(headerHairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        gsap.set(".prompt-card", { autoAlpha: 1, y: 0 });
        gsap.set(".prompt-chip", { autoAlpha: 1, y: 0 });
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

      // 2. Featured prompt cards: ScrollTrigger.batch reveal with stagger
      if (displayedPrompts.length > 0) {
        gsap.set(".prompt-card", { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(".prompt-card", {
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
          }
        });
      }

      // 3. Stagger decorative / platform / category chips
      const chips = sectionRef.current?.querySelectorAll<HTMLElement>(".prompt-chip");
      if (chips && chips.length > 0) {
        gsap.fromTo(chips,
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.02,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".chips-container",
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      }
    });
  }, { scope: sectionRef, dependencies: [featuredPrompts, selectedPlatform], revertOnUpdate: true });

  // Interactive filter with Flip animation
  const handlePlatformClick = contextSafe((platformName: string) => {
    flipStateRef.current = Flip.getState(".prompt-card");
    setSelectedPlatform(prev => (prev === platformName ? null : platformName));
  });

  return (
    <section
      id="prompt-engineering"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative">
        {/* Section Header with Folio 05 */}
        <div className="flex flex-col items-start mb-12 w-full">
          <div className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                {folio} / AI PROMPTS
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — PROMPTBASE CREATOR PORTFOLIO
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-wider hidden sm:block">
              220+ PROMPTS APPROVED
            </div>
          </div>

          {/* Hairline rule that draws with scrub on entrance */}
          <div
            ref={headerHairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
          />

          {/* Left-Aligned Swiss Headline */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
            AI Prompt <span className="text-[#FF4F00]">Engineering</span>
          </h2>
          <p className="text-base text-[#0A0A0A]/70 max-w-2xl leading-relaxed">
            Architecting generative AI visual and logic systems across Leonardo.AI, DALL-E, Midjourney, and ChatGPT frameworks.
          </p>
        </div>

        {/* Oversized background folio watermark */}
        <div className="absolute top-10 right-6 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.03] select-none pointer-events-none font-sans z-0">
          {folio}
        </div>

        {/* Platform Filter / Capability Chips */}
        <div className="chips-container mb-10 pb-6 border-b border-[rgba(10,10,10,0.12)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#0A0A0A]/50 font-bold">
              Filter by Platform {selectedPlatform && <span className="text-[#FF4F00]">(Active: {selectedPlatform})</span>}
            </span>
            {selectedPlatform && (
              <button
                onClick={() => handlePlatformClick(selectedPlatform)}
                className="text-xs font-mono text-[#FF4F00] hover:underline cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {platforms.map(p => {
              const isSelected = selectedPlatform === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => handlePlatformClick(p.name)}
                  className={`prompt-chip px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FF4F00] text-white border-[#FF4F00]'
                      : 'bg-[#F7F7F8] border-[rgba(10,10,10,0.16)] text-[#0A0A0A]/80 hover:border-[#0A0A0A]'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Prompts Grid */}
        {displayedPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
            {displayedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="prompt-card bg-[#FFFFFF] border border-[rgba(10,10,10,0.16)] p-6 flex flex-col justify-between hover:border-[#0A0A0A]/40 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 border border-[rgba(10,10,10,0.16)] bg-[#F7F7F8] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#FF4F00]" />
                    </div>
                    <div className="flex items-center gap-1 text-[#FF4F00]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Featured</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0A0A0A] mb-2 leading-snug">
                    {prompt.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-2 py-0.5 bg-[#F7F7F8] text-[10px] font-mono text-[#0A0A0A]/70 border border-[rgba(10,10,10,0.12)] uppercase font-bold tracking-wider">
                      {prompt.model}
                    </span>
                    <span className="text-xs font-mono text-[#FF4F00] font-bold">
                      ${prompt.price}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4 py-3 mb-5 border-y border-[rgba(10,10,10,0.12)]">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-[#0A0A0A]/40" />
                      <div>
                        <p className="text-[10px] font-mono text-[#0A0A0A]/50 uppercase">Views</p>
                        <p className="text-xs font-mono font-bold text-[#0A0A0A]">{prompt.views}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-[#FF4F00]" />
                      <div>
                        <p className="text-[10px] font-mono text-[#0A0A0A]/50 uppercase">Sales</p>
                        <p className="text-xs font-mono font-bold text-[#0A0A0A]">{prompt.sales}</p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={prompt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F7F7F8] hover:bg-[#FF4F00] hover:text-white border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <span>View on PromptBase</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] max-w-2xl mx-auto mb-16">
            <Bot className="w-8 h-8 text-[#0A0A0A]/40 mx-auto mb-2" />
            <p className="text-xs font-mono text-[#0A0A0A]/70 uppercase">No prompts found for platform filter.</p>
          </div>
        )}

        {/* Creator Profile Summary & Metrics Block (Hairline-separated rows) */}
        <div className="bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] p-6 md:p-10 max-w-5xl mx-auto">
          {/* Creator Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[rgba(10,10,10,0.16)] bg-white p-6 border">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 border border-[rgba(10,10,10,0.16)] overflow-hidden shrink-0 bg-[#F7F7F8]">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/promptbase.appspot.com/o/DALLE_IMAGES%2FuoYVPMiJa6MWP84cKAnatb953q92%2F1732361119171.png?alt=media&token=612159c0-a0d0-403f-a8cb-2b1c247017ad"
                  alt="Hicham Hmidani PromptBase Profile"
                  className="w-full h-full object-cover grayscale contrast-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#0A0A0A]/50">PromptBase.com</span>
                  <span className="w-1 h-1 bg-[#0A0A0A]/30" />
                  <span className="text-xs font-mono font-bold text-[#FF4F00]">@camih8</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[#0A0A0A] mb-1">
                  Hicham Hmidani
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[#0A0A0A]/70">
                  <span>Rank: <strong className="text-[#0A0A0A]">#1899 globally</strong></span>
                  <span>Member since: <strong className="text-[#0A0A0A]">Dec 2023</strong></span>
                  <span className="text-[#FF4F00] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 220+ Approved
                  </span>
                </div>
              </div>
            </div>
            <a
              href="https://promptbase.com/profile/camih8"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#FF4F00] text-white font-mono text-xs uppercase tracking-wider transition-colors shrink-0"
            >
              <span>Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 4 Metric Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <div className="p-5 bg-white border border-[rgba(10,10,10,0.14)] text-center">
              <FolderOpen className="w-5 h-5 text-[#FF4F00] mx-auto mb-2" />
              <p className="text-2xl font-bold font-mono text-[#0A0A0A]">220+</p>
              <p className="text-[10px] font-mono uppercase text-[#0A0A0A]/60 tracking-wider">Prompts Published</p>
            </div>
            <div className="p-5 bg-white border border-[rgba(10,10,10,0.14)] text-center">
              <Bot className="w-5 h-5 text-[#FF4F00] mx-auto mb-2" />
              <p className="text-2xl font-bold font-mono text-[#0A0A0A]">7</p>
              <p className="text-[10px] font-mono uppercase text-[#0A0A0A]/60 tracking-wider">AI Platforms</p>
            </div>
            <div className="p-5 bg-white border border-[rgba(10,10,10,0.14)] text-center">
              <LayoutGrid className="w-5 h-5 text-[#FF4F00] mx-auto mb-2" />
              <p className="text-2xl font-bold font-mono text-[#0A0A0A]">13+</p>
              <p className="text-[10px] font-mono uppercase text-[#0A0A0A]/60 tracking-wider">Niche Categories</p>
            </div>
            <div className="p-5 bg-white border border-[rgba(10,10,10,0.14)] text-center">
              <Star className="w-5 h-5 text-[#FF4F00] mx-auto mb-2" />
              <p className="text-2xl font-bold font-mono text-[#0A0A0A]">100%</p>
              <p className="text-[10px] font-mono uppercase text-[#0A0A0A]/60 tracking-wider">Approval Rate</p>
            </div>
          </div>

          {/* Specialized Niche Categories Tags */}
          <div className="pt-6 border-t border-[rgba(10,10,10,0.14)]">
            <p className="text-xs font-mono uppercase text-[#0A0A0A]/50 font-bold mb-3">
              Specialized Niche Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <span
                  key={cat}
                  className="prompt-chip px-2.5 py-1 text-xs font-mono bg-white border border-[rgba(10,10,10,0.12)] text-[#0A0A0A]/80"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
