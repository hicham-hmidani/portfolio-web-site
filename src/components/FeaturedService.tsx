import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Clock, DollarSign, Star } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, useGSAP } from '../lib/gsap';

export default function FeaturedService({ folio = '06' }: { folio?: string } = {}) {
  const [service, setService] = useState({
    title: "Custom Professional Excel Dashboard with Advanced Analytics",
    description: "Need a powerful Excel dashboard? Get a fully custom, professional dashboard with advanced analytics tailored to your business data.",
    price: "100",
    deliveryTime: "3 Days",
    url: "https://www.upwork.com/"
  });

  const sectionRef = useRef<HTMLElement>(null);
  const headerHairlineRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "marketplace_items", "upwork_config"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setService({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          deliveryTime: data.deliveryTime || "",
          url: data.url || "https://www.upwork.com/"
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktopFine: "(pointer: fine) and (min-width: 768px)",
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced, isDesktopFine } = context.conditions as {
        isReduced: boolean;
        isDesktopFine: boolean;
      };

      if (isReduced) {
        if (headerHairlineRef.current) gsap.set(headerHairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        if (headingRef.current) gsap.set(headingRef.current, { autoAlpha: 1, y: 0 });
        if (detailsRef.current) gsap.set(detailsRef.current, { autoAlpha: 1, y: 0 });
        if (ctaRef.current) gsap.set(ctaRef.current, { autoAlpha: 1, y: 0 });
        return;
      }

      // Hairline scrub entrance
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

      // One timeline sequencing: heading -> rate/description -> CTA
      const serviceTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".service-card",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        defaults: { ease: "power3.out" }
      });

      if (headingRef.current) {
        serviceTl.fromTo(headingRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6 }
        );
      }

      if (detailsRef.current) {
        serviceTl.fromTo(detailsRef.current,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          "-=0.25"
        );
      }

      if (ctaRef.current) {
        serviceTl.fromTo(ctaRef.current,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          "-=0.2"
        );
      }

      // Magnetic CTA button on desktop with fine pointer using gsap.quickTo
      if (isDesktopFine && ctaRef.current) {
        const btn = ctaRef.current;
        const xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = e.clientX - centerX;
          const deltaY = e.clientY - centerY;
          // Magnetic pull of max 12px
          xTo(deltaX * 0.3);
          yTo(deltaY * 0.3);
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        btn.addEventListener("mousemove", handleMouseMove);
        btn.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          btn.removeEventListener("mousemove", handleMouseMove);
          btn.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    });
  }, { scope: sectionRef, dependencies: [service], revertOnUpdate: true });

  return (
    <section
      id="featured-service"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative">
        {/* Section Header with Folio 06 */}
        <div className="flex flex-col items-start mb-12 w-full">
          <div className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                {folio} / FEATURED SERVICE
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — UPWORK PROJECT CATALOG
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-wider hidden sm:block">
              INSTANT CONTRACT OFFER
            </div>
          </div>

          {/* Hairline rule that draws with scrub on entrance */}
          <div
            ref={headerHairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
          />

          {/* Left-Aligned Swiss Headline */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
            Contract <span className="text-[#FF4F00]">Service</span>
          </h2>
          <p className="text-base text-[#0A0A0A]/70 max-w-2xl leading-relaxed">
            Turnkey enterprise data visualization and bespoke analytics dashboard engineering with guaranteed milestones.
          </p>
        </div>

        {/* Oversized background folio watermark */}
        <div className="absolute top-10 right-6 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.03] select-none pointer-events-none font-sans z-0">
          {folio}
        </div>

        {/* Featured Service Card (Swiss light with hairline separation) */}
        <div className="service-card max-w-5xl mx-auto bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] p-8 md:p-12 relative">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center justify-between">
            <div className="flex-1">
              {/* Header block */}
              <div ref={headingRef}>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[rgba(10,10,10,0.14)] text-[#FF4F00] text-xs font-mono font-bold tracking-wider uppercase mb-5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Upwork Verified Catalog
                </div>

                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0A0A0A] mb-4 leading-tight">
                  {service.title}
                </h3>
              </div>

              {/* Description & Rate details block */}
              <div ref={detailsRef}>
                <p className="text-sm md:text-base text-[#0A0A0A]/75 mb-8 leading-relaxed max-w-2xl">
                  {service.description}
                </p>

                {/* Hairline-separated rate cards */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 p-3.5 bg-white border border-[rgba(10,10,10,0.14)]">
                    <div className="p-2 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)]">
                      <DollarSign className="w-4 h-4 text-[#FF4F00]" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-[#0A0A0A]/50 uppercase tracking-wider font-semibold">
                        Starting Price
                      </span>
                      <span className="font-mono font-bold text-sm text-[#0A0A0A]">
                        From ${service.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-white border border-[rgba(10,10,10,0.14)]">
                    <div className="p-2 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)]">
                      <Clock className="w-4 h-4 text-[#FF4F00]" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-[#0A0A0A]/50 uppercase tracking-wider font-semibold">
                        Delivery Time
                      </span>
                      <span className="font-mono font-bold text-sm text-[#0A0A0A]">
                        {service.deliveryTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Magnetic CTA button */}
            <div className="w-full lg:w-auto shrink-0 pt-4 lg:pt-0">
              <a
                ref={ctaRef}
                href={service.url}
                target="_blank"
                rel="noreferrer"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF4F00] hover:bg-[#E04500] text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors will-change-transform shadow-none"
              >
                <span>Order on Upwork</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
