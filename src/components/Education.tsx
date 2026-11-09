import { useRef } from 'react';
import { GraduationCap, Award, ExternalLink, CheckCircle2, Building, Calendar, ArrowRight } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useSectionDoc } from '../hooks/useSectionDoc';
import { educationDefaults, certificationsDefaults, EducationItem, CertificationItem } from '../content/educationDefaults';
import { useScrollRefresh } from '../hooks/useScrollRefresh';

function deriveCertDateSpan(certs: { date: string }[]): string {
  const timestamps = certs
    .map(c => Date.parse(c.date))
    .filter(t => !isNaN(t));

  if (timestamps.length === 0) return "Nov 2023 – Feb 2024";

  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));

  const formatMonthYear = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return `${formatMonthYear(minDate)} – ${formatMonthYear(maxDate)}`;
}

export default function Education({ folio = '08' }: { folio?: string } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerHairlineRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const { data: eduDoc } = useSectionDoc<{ items: EducationItem[] }>('education', educationDefaults);
  const { data: certDoc } = useSectionDoc<{ items: CertificationItem[] }>('certifications', certificationsDefaults);

  const visibleEducation = (eduDoc.items || []).filter(item => item.visible !== false);
  const visibleCertifications = (certDoc.items || []).filter(item => item.visible !== false);

  const googleCerts = visibleCertifications.filter(c => c.group === 'Google');
  const specializedCerts = visibleCertifications.filter(c => c.group === 'Specialized');

  const totalCertifications = visibleCertifications.length;

  const institutionSet = new Set<string>();
  visibleEducation.forEach(e => institutionSet.add(e.institution));
  visibleCertifications.forEach(c => institutionSet.add(c.issuer));
  const totalInstitutions = institutionSet.size;

  const certTimeline = deriveCertDateSpan(visibleCertifications);

  useScrollRefresh([visibleEducation, visibleCertifications]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced } = context.conditions as { isReduced: boolean };

      if (isReduced) {
        if (headerHairlineRef.current) gsap.set(headerHairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        if (progressBarRef.current) gsap.set(progressBarRef.current, { scaleX: 0.5 });
        gsap.set(".education-item", { autoAlpha: 1, x: 0 });
        gsap.set(".certification-card", { autoAlpha: 1, y: 0 });
        return;
      }

      // 1. Header hairline scrub entrance
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

      // 2. Count-up animation on derived numbers
      const counterSpans = sectionRef.current?.querySelectorAll<HTMLElement>(".derived-num-counter");
      counterSpans?.forEach((span) => {
        const target = parseFloat(span.getAttribute("data-target") || "0");
        if (!target) return;
        const countObj = { val: 0 };
        gsap.to(countObj, {
          val: target,
          duration: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: span,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          onUpdate: () => {
            span.textContent = Math.round(countObj.val).toString();
          }
        });
      });

      // 3. Progress bar animation
      if (progressBarRef.current) {
        gsap.fromTo(progressBarRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 0.5,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: progressBarRef.current,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      }

      // 4. Education items slide-in from left
      gsap.set(".education-item", { autoAlpha: 0, x: -20 });
      ScrollTrigger.batch(".education-item", {
        interval: 0.1,
        start: "top 85%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });

      // 5. Certification cards via ScrollTrigger.batch
      gsap.set(".certification-card", { autoAlpha: 0, y: 20 });
      ScrollTrigger.batch(".certification-card", {
        interval: 0.1,
        start: "top 85%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    });
  }, { scope: sectionRef, dependencies: [visibleEducation, visibleCertifications], revertOnUpdate: true });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) return dateStr;
    return new Date(parsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative">
        {/* Section Header with Folio 07 */}
        <div className="flex flex-col items-start mb-12 w-full">
          <div className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                {folio} / EDUCATION
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — ACADEMIC PATH & CREDENTIALS
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-wider hidden sm:block">
              {totalCertifications} CERTIFICATIONS VERIFIED
            </div>
          </div>

          <div
            ref={headerHairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
          />

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
            Academic & <span className="text-[#FF4F00]">Credentials</span>
          </h2>
          <p className="text-base text-[#0A0A0A]/70 max-w-2xl leading-relaxed">
            A verified progression of university degrees, engineering specializations, and professional certifications in data analysis and AI systems.
          </p>
        </div>

        <div className="absolute top-10 right-6 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.03] select-none pointer-events-none font-sans z-0">
          {folio}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mb-16">
          <div className="p-5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.14)] text-left">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-4 h-4 text-[#FF4F00]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A]/50 font-bold">Total Issued</span>
            </div>
            <div className="text-3xl font-bold font-mono text-[#0A0A0A] mb-1">
              <span className="derived-num-counter" data-target={totalCertifications}>
                0
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/70 uppercase tracking-wider font-semibold">
              Professional Certifications
            </div>
          </div>

          <div className="p-5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.14)] text-left">
            <div className="flex items-center justify-between mb-2">
              <Building className="w-4 h-4 text-[#FF4F00]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A]/50 font-bold">Universities & Issuers</span>
            </div>
            <div className="text-3xl font-bold font-mono text-[#0A0A0A] mb-1">
              <span className="derived-num-counter" data-target={totalInstitutions}>
                0
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/70 uppercase tracking-wider font-semibold">
              Distinct Institutions
            </div>
          </div>

          <div className="p-5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.14)] text-left">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 text-[#FF4F00]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A]/50 font-bold">Completion Span</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#0A0A0A] mb-1 pt-1.5">
              {certTimeline}
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/70 uppercase tracking-wider font-semibold">
              Certifications Completed
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl">
          {/* Education Column */}
          <div className="education-column lg:col-span-5">
            <div className="flex items-center gap-2.5 mb-8 pb-3 border-b border-[rgba(10,10,10,0.12)]">
              <GraduationCap className="w-5 h-5 text-[#FF4F00]" />
              <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A]">
                Academic Path
              </h3>
            </div>

            <div className="space-y-6 relative">
              <div className="absolute left-[7px] top-4 bottom-4 w-px bg-[rgba(10,10,10,0.14)] pointer-events-none" />

              {visibleEducation.map((item, index) => (
                <div key={item.id || index} className="education-item relative pl-8">
                  <div className="absolute left-0 top-2 w-3.5 h-3.5 bg-white border-2 border-[#0A0A0A] z-10" />

                  <div className="p-5 bg-[#FFFFFF] border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A]/40 transition-colors">
                    <div className="text-xs font-mono font-bold text-[#FF4F00] uppercase mb-1">
                      {item.period}
                    </div>
                    <h4 className="text-base font-bold text-[#0A0A0A] mb-1 leading-snug">
                      {item.degree}
                    </h4>
                    <div className="text-xs text-[#0A0A0A]/75 mb-3">
                      {item.field}
                    </div>
                    <div className="text-[11px] font-mono text-[#0A0A0A]/50 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#0A0A0A]/40" />
                      <span>{item.institution}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Column */}
          <div className="lg:col-span-7">
            {/* Google Certs */}
            <div className="mb-14">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b border-[rgba(10,10,10,0.12)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-[#FF4F00]" />
                    <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A]">
                      Google Data Analytics
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-[#0A0A0A]/50 uppercase tracking-wide">
                    Professional Certificate Specialization
                  </p>
                </div>

                <div className="bg-[#F7F7F8] border border-[rgba(10,10,10,0.14)] p-3 min-w-[210px]">
                  <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                    <span className="font-bold text-[#0A0A0A]">Course Progress: {googleCerts.length}/8</span>
                    <span className="text-[#0A0A0A]/50">{Math.round((googleCerts.length / 8) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white border border-[rgba(10,10,10,0.12)] overflow-hidden">
                    <div
                      ref={progressBarRef}
                      className="h-full w-full bg-[#FF4F00] origin-left scale-x-0 will-change-transform"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {googleCerts.map((cert, index) => (
                  <div
                    key={cert.id || index}
                    className="certification-card p-5 bg-[#FFFFFF] border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A]/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] text-[#0A0A0A]">
                          Course {index + 1}
                        </span>
                        <span className="text-[10px] font-mono text-[#0A0A0A]/50">{formatDate(cert.date)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0A0A0A] mb-2 leading-snug">
                        {cert.title}
                      </h4>
                      <p className="text-xs font-mono text-[#0A0A0A]/60 mb-4">
                        {cert.issuer} • Via {cert.platform}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[rgba(10,10,10,0.08)] flex justify-end">
                      <a
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#FF4F00] hover:text-[#0A0A0A] transition-colors"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialized Certs */}
            <div>
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[rgba(10,10,10,0.12)]">
                <CheckCircle2 className="w-5 h-5 text-[#FF4F00]" />
                <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A]">
                  Specialized Engineering Certifications
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {specializedCerts.map((cert, index) => (
                  <div
                    key={cert.id || index}
                    className="certification-card p-5 bg-[#FFFFFF] border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A]/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FF4F00]/10 border border-[#FF4F00]/30 text-[#FF4F00]">
                          Credential
                        </span>
                        <span className="text-[10px] font-mono text-[#0A0A0A]/50">{formatDate(cert.date)}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#0A0A0A] mb-2 leading-snug">
                        {cert.title}
                      </h4>

                      <div className="text-xs font-mono text-[#0A0A0A]/60 mb-2">
                        {cert.issuer} • Via {cert.platform}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[rgba(10,10,10,0.08)] flex justify-end">
                      <a
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F7F8] hover:bg-[#FF4F00] hover:text-white border border-[rgba(10,10,10,0.14)] text-[11px] font-mono font-bold text-[#0A0A0A] transition-colors"
                      >
                        <span>Verify Certificate</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
