import { useRef, useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  ExternalLink,
  CheckCircle2,
  Building,
  Calendar,
  FileText,
  Briefcase,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useSectionDoc } from '../hooks/useSectionDoc';
import {
  educationDefaults,
  certificationsDefaults,
  EducationItem,
  CertificationItem,
  mergeCertificationsWithDefaults,
} from '../content/educationDefaults';
import { useScrollRefresh } from '../hooks/useScrollRefresh';
import { safeHref, safeAssetHref } from '../lib/url';

type CredentialFilter = 'all' | 'Google' | 'Specialized' | 'Internship';

function parseDateLocal(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    return new Date(year, month, day);
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? null : new Date(parsed);
}

function deriveCertDateSpan(certs: { date: string }[]): string {
  const dates = certs
    .map((c) => parseDateLocal(c.date))
    .filter((d): d is Date => d !== null);

  if (dates.length === 0) return 'Sep 2023 – Feb 2024';

  const timestamps = dates.map((d) => d.getTime());
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

  const [activeFilter, setActiveFilter] = useState<CredentialFilter>('all');
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [viewerMode, setViewerMode] = useState<'image' | 'pdf'>('image');

  const { data: eduDoc } = useSectionDoc<{ items: EducationItem[] }>('education', educationDefaults);
  const { data: certDoc } = useSectionDoc<{
    items: CertificationItem[];
    credentialSyncVersion?: number;
  }>('certifications', certificationsDefaults);

  const visibleEducation = (eduDoc.items || []).filter((item) => item.visible !== false);
  const mergedCertifications = mergeCertificationsWithDefaults(
    certDoc.items,
    certDoc.credentialSyncVersion
  );
  const visibleCertifications = mergedCertifications.filter((item) => item.visible !== false);

  const googleCerts = visibleCertifications.filter((c) => c.group === 'Google');
  const specializedCerts = visibleCertifications.filter((c) => c.group === 'Specialized');
  const internshipCerts = visibleCertifications.filter((c) => c.group === 'Internship');
  const googleProgress = Math.min(1, Math.max(0, googleCerts.length / 8));

  const totalCertifications = visibleCertifications.length;

  const institutionSet = new Set<string>();
  visibleEducation.forEach((e) => {
    if (e.institution) institutionSet.add(e.institution);
  });
  visibleCertifications.forEach((c) => {
    if (c.issuer) institutionSet.add(c.issuer);
  });
  const totalInstitutions = institutionSet.size;

  const certTimeline = deriveCertDateSpan(visibleCertifications);

  useScrollRefresh([visibleEducation, visibleCertifications, activeFilter]);

  useEffect(() => {
    if (!selectedCert) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCert(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCert]);

  const openDocumentModal = (cert: CertificationItem) => {
    const hasPreview = Boolean(safeAssetHref(cert.previewUrl));
    setViewerMode(hasPreview ? 'image' : 'pdf');
    setSelectedCert(cert);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isFull: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { isReduced } = context.conditions as { isReduced: boolean };

          if (isReduced) {
            if (headerHairlineRef.current)
              gsap.set(headerHairlineRef.current, { scaleX: 1, autoAlpha: 1 });
            if (progressBarRef.current)
              gsap.set(progressBarRef.current, { scaleX: googleProgress });
            gsap.set('.education-item', { autoAlpha: 1, x: 0 });
            gsap.set('.certification-card', { autoAlpha: 1, y: 0 });
            return;
          }

          // 1. Header hairline scrub entrance
          if (headerHairlineRef.current && sectionRef.current) {
            gsap.fromTo(
              headerHairlineRef.current,
              { scaleX: 0, transformOrigin: 'left center' },
              {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: 'top 85%',
                  end: 'top 40%',
                  scrub: true,
                },
              }
            );
          }

          // 2. Count-up animation on derived numbers
          const counterSpans =
            sectionRef.current?.querySelectorAll<HTMLElement>('.derived-num-counter');
          counterSpans?.forEach((span) => {
            const target = parseFloat(span.getAttribute('data-target') || '0');
            if (!target) return;
            const countObj = { val: 0 };
            gsap.to(countObj, {
              val: target,
              duration: 1.0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: span,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              onUpdate: () => {
                span.textContent = Math.round(countObj.val).toString();
              },
            });
          });

          // 3. Progress bar animation
          if (progressBarRef.current) {
            gsap.fromTo(
              progressBarRef.current,
              { scaleX: 0, transformOrigin: 'left center' },
              {
                scaleX: googleProgress,
                duration: 0.9,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: progressBarRef.current,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }

          // 4. Education items slide-in from left
          gsap.set('.education-item', { autoAlpha: 0, x: -20 });
          ScrollTrigger.batch('.education-item', {
            interval: 0.1,
            start: 'top 85%',
            once: true,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                x: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            },
          });

          // 5. Certification cards via ScrollTrigger.batch
          gsap.set('.certification-card', { autoAlpha: 0, y: 20 });
          ScrollTrigger.batch('.certification-card', {
            interval: 0.1,
            start: 'top 85%',
            once: true,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            },
          });
        }
      );
    },
    {
      scope: sectionRef,
      dependencies: [visibleEducation, visibleCertifications, googleProgress],
      revertOnUpdate: true,
    }
  );

  const formatDate = (dateStr: string) => {
    const parsed = parseDateLocal(dateStr);
    if (!parsed) return dateStr || '';
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderCredentialActions = (cert: CertificationItem) => {
    const verifyHref = safeHref(cert.verifyUrl);
    const docHref = safeAssetHref(cert.documentUrl);
    const previewHref = safeAssetHref(cert.previewUrl);
    const hasDocument = Boolean(docHref || previewHref);

    return (
      <div className="pt-3 border-t border-[rgba(10,10,10,0.08)] flex flex-wrap items-center justify-between gap-2">
        {hasDocument ? (
          <button
            type="button"
            onClick={() => openDocumentModal(cert)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F7F8] hover:bg-[#0A0A0A] hover:text-white border border-[rgba(10,10,10,0.16)] text-[11px] font-mono font-bold text-[#0A0A0A] transition-colors cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>{cert.group === 'Internship' ? 'View Attestation' : 'View Certificate'}</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono text-[#0A0A0A]/40">Issued Credential</span>
        )}

        {verifyHref && (
          <a
            href={verifyHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#FF4F00] hover:text-[#0A0A0A] transition-colors"
          >
            <span>Verify Online</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  };

  const filterTabs: { id: CredentialFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Credentials', count: visibleCertifications.length },
    { id: 'Google', label: 'Google Track', count: googleCerts.length },
    { id: 'Specialized', label: 'Specialized', count: specializedCerts.length },
    { id: 'Internship', label: 'Internships', count: internshipCerts.length },
  ];

  const selectedDocHref = safeAssetHref(selectedCert?.documentUrl);
  const selectedPreviewHref = safeAssetHref(selectedCert?.previewUrl);
  const selectedVerifyHref = safeHref(selectedCert?.verifyUrl);

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
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
              {totalCertifications} CREDENTIALS ARCHIVED
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
            A verified progression of university degrees, technical specializations, and documented industrial internship credentials in data analysis and AI systems.
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
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A]/50 font-bold">
                Total Issued
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-[#0A0A0A] mb-1">
              <span className="derived-num-counter" data-target={totalCertifications}>
                {totalCertifications}
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/70 uppercase tracking-wider font-semibold">
              Certificates & Attestations
            </div>
          </div>

          <div className="p-5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.14)] text-left">
            <div className="flex items-center justify-between mb-2">
              <Building className="w-4 h-4 text-[#FF4F00]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A]/50 font-bold">
                Universities & Issuers
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-[#0A0A0A] mb-1">
              <span className="derived-num-counter" data-target={totalInstitutions}>
                {totalInstitutions}
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/70 uppercase tracking-wider font-semibold">
              Distinct Institutions
            </div>
          </div>

          <div className="p-5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.14)] text-left">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 text-[#FF4F00]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A]/50 font-bold">
                Credential Span
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-[#0A0A0A] mb-1 pt-1.5">
              {certTimeline}
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/70 uppercase tracking-wider font-semibold">
              Documented Timeline
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
                      <Building className="w-3.5 h-3.5 text-[#0A0A0A]/40 shrink-0" />
                      <span>{item.institution}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Credentials Column */}
          <div className="lg:col-span-7">
            {/* Swiss Filter Controls */}
            <div
              className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[rgba(10,10,10,0.12)]"
              role="tablist"
              aria-label="Filter credentials by category"
            >
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                        : 'bg-[#F7F7F8] text-[#0A0A0A]/75 border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`ml-1.5 ${
                        isActive ? 'text-[#FF4F00]' : 'text-[#0A0A0A]/45'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 1. Google Data Analytics Specialization */}
            {(activeFilter === 'all' || activeFilter === 'Google') && googleCerts.length > 0 && (
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
                      <span className="font-bold text-[#0A0A0A]">
                        Course Progress: {googleCerts.length}/8
                      </span>
                      <span className="text-[#0A0A0A]/50">
                        {Math.round((googleCerts.length / 8) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white border border-[rgba(10,10,10,0.12)] overflow-hidden">
                      <div
                        ref={progressBarRef}
                        className="h-full w-full bg-[#FF4F00] origin-left will-change-transform"
                        style={{ transform: `scaleX(${googleProgress})` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {googleCerts.map((cert, index) => {
                    const previewHref = safeAssetHref(cert.previewUrl);
                    return (
                      <div
                        key={cert.id || index}
                        className="certification-card p-5 bg-[#FFFFFF] border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A]/40 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          {previewHref && (
                            <button
                              type="button"
                              onClick={() => openDocumentModal(cert)}
                              className="w-full aspect-[16/10] mb-4 bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] overflow-hidden group block cursor-pointer"
                              title={`Preview ${cert.title}`}
                            >
                              <img
                                src={previewHref}
                                alt={`${cert.title} certificate preview`}
                                loading="lazy"
                                className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                              />
                            </button>
                          )}

                          <div className="flex items-center justify-between mb-2.5 text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A]/60">
                            <span className="font-bold text-[#0A0A0A]">
                              Course {String(index + 1).padStart(2, '0')}
                            </span>
                            <span>{formatDate(cert.date)}</span>
                          </div>

                          <h4 className="text-sm font-bold text-[#0A0A0A] mb-1.5 leading-snug">
                            {cert.title}
                          </h4>

                          <p className="text-xs font-mono text-[#0A0A0A]/65 mb-2">
                            {cert.issuer} · {cert.platform}
                          </p>

                          {cert.credentialId && (
                            <p className="text-[10px] font-mono text-[#0A0A0A]/45 mb-3">
                              ID: {cert.credentialId}
                            </p>
                          )}
                        </div>

                        {renderCredentialActions(cert)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Specialized Engineering Certifications */}
            {(activeFilter === 'all' || activeFilter === 'Specialized') &&
              specializedCerts.length > 0 && (
                <div className="mb-14">
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
                          <div className="flex items-center justify-between mb-2.5 text-[10px] font-mono uppercase tracking-wider">
                            <span className="font-bold text-[#FF4F00]">Specialized</span>
                            <span className="text-[#0A0A0A]/60">{formatDate(cert.date)}</span>
                          </div>

                          <h4 className="text-sm font-bold text-[#0A0A0A] mb-1.5 leading-snug">
                            {cert.title}
                          </h4>

                          <p className="text-xs font-mono text-[#0A0A0A]/65 mb-2">
                            {cert.issuer} · {cert.platform}
                          </p>

                          {cert.credentialId && (
                            <p className="text-[10px] font-mono text-[#0A0A0A]/45 mb-3">
                              ID: {cert.credentialId}
                            </p>
                          )}
                        </div>

                        {renderCredentialActions(cert)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* 3. Internship Credentials & Attestations */}
            {(activeFilter === 'all' || activeFilter === 'Internship') &&
              internshipCerts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[rgba(10,10,10,0.12)]">
                    <Briefcase className="w-5 h-5 text-[#FF4F00]" />
                    <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A]">
                      Internship Credentials & Attestations
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {internshipCerts.map((cert, index) => (
                      <div
                        key={cert.id || index}
                        className="certification-card p-5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] hover:border-[#0A0A0A]/50 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5 text-[10px] font-mono uppercase tracking-wider">
                            <span className="font-bold text-[#FF4F00]">
                              Internship Credential
                            </span>
                            <span className="text-[#0A0A0A]/60">{formatDate(cert.date)}</span>
                          </div>

                          <h4 className="text-sm font-bold text-[#0A0A0A] mb-1.5 leading-snug">
                            {cert.title}
                          </h4>

                          <p className="text-xs font-mono text-[#0A0A0A]/70 mb-2">
                            {cert.issuer} · {cert.platform}
                          </p>

                          {cert.summary && (
                            <p className="text-xs text-[#0A0A0A]/65 leading-relaxed mb-3">
                              {cert.summary}
                            </p>
                          )}

                          {cert.credentialId && (
                            <p className="text-[10px] font-mono text-[#0A0A0A]/50 mb-3">
                              Ref: {cert.credentialId}
                            </p>
                          )}
                        </div>

                        {renderCredentialActions(cert)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Swiss Document & Certificate Viewer Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0A0A]/75 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="certificate-modal-title"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-[#FFFFFF] border border-[#0A0A0A] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[rgba(10,10,10,0.14)] flex items-start justify-between gap-4 bg-[#FFFFFF]">
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF4F00] mb-1">
                  {selectedCert.group === 'Internship'
                    ? 'INTERNSHIP CREDENTIAL'
                    : selectedCert.group === 'Google'
                    ? 'GOOGLE DATA ANALYTICS'
                    : 'SPECIALIZED CERTIFICATION'}
                </div>
                <h3
                  id="certificate-modal-title"
                  className="text-lg sm:text-xl font-bold text-[#0A0A0A] leading-snug"
                >
                  {selectedCert.title}
                </h3>
                <div className="mt-1.5 text-xs font-mono text-[#0A0A0A]/65 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{selectedCert.issuer}</span>
                  <span>·</span>
                  <span>{selectedCert.platform}</span>
                  <span>·</span>
                  <span>Issued {formatDate(selectedCert.date)}</span>
                  {selectedCert.credentialId && (
                    <>
                      <span>·</span>
                      <span>ID: {selectedCert.credentialId}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F7F8] hover:bg-[#0A0A0A] hover:text-white border border-[rgba(10,10,10,0.2)] text-xs font-mono font-bold text-[#0A0A0A] transition-colors cursor-pointer"
                aria-label="Close certificate viewer"
              >
                <span>ESC</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Optional Image vs PDF Switcher when both are available */}
            {selectedPreviewHref && selectedDocHref && (
              <div className="px-5 sm:px-6 py-2.5 bg-[#F7F7F8] border-b border-[rgba(10,10,10,0.12)] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewerMode('image')}
                  className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                    viewerMode === 'image'
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'bg-white text-[#0A0A0A]/70 border-[rgba(10,10,10,0.16)] hover:text-[#0A0A0A]'
                  }`}
                >
                  Certificate Image
                </button>
                <button
                  type="button"
                  onClick={() => setViewerMode('pdf')}
                  className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                    viewerMode === 'pdf'
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'bg-white text-[#0A0A0A]/70 border-[rgba(10,10,10,0.16)] hover:text-[#0A0A0A]'
                  }`}
                >
                  Official PDF
                </button>
              </div>
            )}

            {/* Document Stage */}
            <div className="flex-1 overflow-auto bg-[#F7F7F8] p-4 sm:p-6 flex items-center justify-center">
              {viewerMode === 'image' && selectedPreviewHref ? (
                <img
                  src={selectedPreviewHref}
                  alt={selectedCert.title}
                  className="max-h-[64vh] w-auto object-contain border border-[rgba(10,10,10,0.16)] bg-white"
                />
              ) : selectedDocHref ? (
                <iframe
                  src={`${selectedDocHref}#view=FitH`}
                  title={selectedCert.title}
                  className="w-full h-[64vh] bg-white border border-[rgba(10,10,10,0.16)]"
                />
              ) : (
                <div className="py-16 text-center text-xs font-mono text-[#0A0A0A]/60">
                  Preview unavailable. Use external verification link below.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-[rgba(10,10,10,0.14)] bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedDocHref && (
                  <>
                    <a
                      href={selectedDocHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0A0A0A] hover:bg-[#FF4F00] text-white text-xs font-mono font-bold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Full PDF</span>
                    </a>
                    <a
                      href={selectedDocHref}
                      download
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F7F7F8] hover:bg-[#0A0A0A] hover:text-white border border-[rgba(10,10,10,0.18)] text-xs font-mono font-bold text-[#0A0A0A] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </>
                )}
              </div>

              {selectedVerifyHref && (
                <a
                  href={selectedVerifyHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF4F00] hover:text-[#0A0A0A] transition-colors"
                >
                  <span>Verify with Issuer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

